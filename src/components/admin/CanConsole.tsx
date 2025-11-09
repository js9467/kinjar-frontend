'use client';

import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useCanStream } from '@/lib/can/useCanStream';
import { CanRange, formatBytes, formatCanId, parseCanId } from '@/lib/can/utils';

const PRESET_RANGES: Array<{ label: string; min: string; max: string }> = [
  { label: '0x27B - 0x280', min: '0x27B', max: '0x280' },
  { label: 'Engine (0x200-0x2FF)', min: '0x200', max: '0x2FF' },
  { label: 'All drivetrain (0x100-0x3FF)', min: '0x100', max: '0x3FF' },
];

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const millis = date.getMilliseconds().toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${millis}`;
}

function describeRange(range: CanRange): string {
  if (range.min === null && range.max === null) {
    return 'All IDs';
  }
  const minLabel = range.min === null ? 'Any' : formatCanId(range.min);
  const maxLabel = range.max === null ? 'Any' : formatCanId(range.max);
  return `${minLabel} → ${maxLabel}`;
}

export function CanConsole() {
  const {
    frames,
    status,
    totalReceived,
    droppedByFilter,
    range,
    setRange,
    clearFrames,
    start,
    stop,
    isPaused,
    setPaused,
    lastHeartbeat,
    streamUrl,
  } = useCanStream({ maxBuffer: 1200, staleTimeoutMs: 6000, autoStart: true });

  const [minInput, setMinInput] = useState(range.min !== null ? formatCanId(range.min) : '');
  const [maxInput, setMaxInput] = useState(range.max !== null ? formatCanId(range.max) : '');
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const logRef = useRef<HTMLDivElement | null>(null);
  const lastLengthRef = useRef<number>(frames.length);

  useEffect(() => {
    if (!autoScroll || isPaused) {
      lastLengthRef.current = frames.length;
      return;
    }
    if (frames.length <= lastLengthRef.current) {
      lastLengthRef.current = frames.length;
      return;
    }
    if (logRef.current) {
      logRef.current.scrollTo({ top: logRef.current.scrollHeight });
    }
    lastLengthRef.current = frames.length;
  }, [frames.length, autoScroll, isPaused]);

  const statusIndicator = useMemo(() => {
    switch (status) {
      case 'connected':
        return { label: 'Connected', tone: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' };
      case 'connecting':
        return { label: 'Connecting…', tone: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' };
      case 'unsupported':
        return { label: 'Streaming not supported in this browser', tone: 'text-red-600', badge: 'bg-red-100 text-red-700' };
      default:
        return { label: 'Disconnected', tone: 'text-slate-500', badge: 'bg-slate-100 text-slate-600' };
    }
  }, [status]);

  const handleApplyRange = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedMin = minInput.trim();
    const trimmedMax = maxInput.trim();

    const parsedMin = trimmedMin ? parseCanId(trimmedMin) : null;
    const parsedMax = trimmedMax ? parseCanId(trimmedMax) : null;

    if (trimmedMin && parsedMin === null) {
      setRangeError('Minimum ID is not a valid hexadecimal or decimal CAN identifier.');
      return;
    }
    if (trimmedMax && parsedMax === null) {
      setRangeError('Maximum ID is not a valid hexadecimal or decimal CAN identifier.');
      return;
    }

    let normalizedMin = parsedMin;
    let normalizedMax = parsedMax;
    if (normalizedMin !== null && normalizedMax !== null && normalizedMin > normalizedMax) {
      [normalizedMin, normalizedMax] = [normalizedMax, normalizedMin];
    }

    setRange({ min: normalizedMin, max: normalizedMax });
    setRangeError(null);
    setMinInput(normalizedMin !== null ? formatCanId(normalizedMin) : '');
    setMaxInput(normalizedMax !== null ? formatCanId(normalizedMax) : '');
  };

  const handleClearRange = () => {
    setRange({ min: null, max: null });
    setMinInput('');
    setMaxInput('');
    setRangeError(null);
  };

  const applyPreset = (min: string, max: string) => {
    const parsedMin = parseCanId(min);
    const parsedMax = parseCanId(max);
    if (parsedMin === null || parsedMax === null) {
      return;
    }
    const [normalizedMin, normalizedMax] = parsedMin <= parsedMax ? [parsedMin, parsedMax] : [parsedMax, parsedMin];
    setRange({ min: normalizedMin, max: normalizedMax });
    setMinInput(formatCanId(normalizedMin));
    setMaxInput(formatCanId(normalizedMax));
    setRangeError(null);
  };

  const handleTogglePause = () => {
    setPaused((current) => !current);
  };

  const handleToggleAutoScroll = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAutoScroll(event.target.checked);
  };

  const handleResetConnection = () => {
    stop();
    start();
  };

  const frameSummary = `${frames.length.toLocaleString()} shown / ${totalReceived.toLocaleString()} accepted`;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={clsx('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', statusIndicator.badge)}>
                {statusIndicator.label}
              </span>
              <button
                type="button"
                onClick={handleResetConnection}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                disabled={status === 'unsupported'}
              >
                Reconnect
              </button>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">CAN Bus Console</h1>
            <p className="text-sm text-slate-600">
              Live stream sourced from <span className="font-mono text-slate-700">{streamUrl}</span> with automatic reconnection when the
              controller drops offline.
            </p>
            <dl className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="font-medium text-slate-500">Active filter</dt>
                <dd className="font-mono text-slate-700">{describeRange(range)}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Frames</dt>
                <dd>{frameSummary}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Filtered out</dt>
                <dd>{droppedByFilter.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Last update</dt>
                <dd>{lastHeartbeat ? formatTimestamp(lastHeartbeat) : '—'}</dd>
              </div>
            </dl>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <button
              type="button"
              onClick={status === 'connected' ? stop : start}
              className={clsx(
                'inline-flex items-center justify-center rounded-full px-5 py-2 font-semibold shadow-sm transition',
                status === 'connected'
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              )}
            >
              {status === 'connected' ? 'Disconnect' : 'Connect'}
            </button>
            <button
              type="button"
              onClick={handleTogglePause}
              className={clsx(
                'inline-flex items-center justify-center rounded-full border px-5 py-2 font-semibold transition',
                isPaused ? 'border-emerald-500 text-emerald-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'
              )}
            >
              {isPaused ? 'Resume stream' : 'Pause stream'}
            </button>
            <button
              type="button"
              onClick={clearFrames}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2 font-semibold text-slate-600 transition hover:border-slate-300"
            >
              Clear log
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleApplyRange} className="grid gap-4 md:grid-cols-[repeat(3,minmax(0,1fr))] md:items-end">
          <div className="flex flex-col gap-2">
            <label htmlFor="can-range-min" className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Min CAN ID
            </label>
            <input
              id="can-range-min"
              value={minInput}
              onChange={(event) => setMinInput(event.target.value)}
              placeholder="e.g. 0x27B"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="can-range-max" className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Max CAN ID
            </label>
            <input
              id="can-range-max"
              value={maxInput}
              onChange={(event) => setMaxInput(event.target.value)}
              placeholder="e.g. 0x280"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="flex gap-2 md:justify-end">
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 md:flex-none"
            >
              Apply filter
            </button>
            <button
              type="button"
              onClick={handleClearRange}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
            >
              Show all
            </button>
          </div>
        </form>
        {rangeError ? <p className="mt-3 text-sm text-red-600">{rangeError}</p> : null}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="font-semibold uppercase tracking-wide text-slate-500">Presets:</span>
          {PRESET_RANGES.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.min, preset.max)}
              className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
            >
              {preset.label}
            </button>
          ))}
          <label className="ml-auto inline-flex items-center gap-2 text-xs font-medium text-slate-500">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={handleToggleAutoScroll}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Auto-scroll new frames
          </label>
        </div>

        <div
          ref={logRef}
          className="mt-6 h-[420px] overflow-y-auto rounded-2xl border border-slate-900/40 bg-slate-950/90 shadow-inner"
        >
          <table className="min-w-full border-collapse text-left">
            <thead className="sticky top-0 bg-slate-950/95 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-2 font-semibold">Time</th>
                <th className="px-4 py-2 font-semibold">ID</th>
                <th className="px-4 py-2 font-semibold">Data</th>
                <th className="px-4 py-2 font-semibold">Dir</th>
                <th className="px-4 py-2 font-semibold">Raw</th>
              </tr>
            </thead>
            <tbody>
              {frames.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-slate-400" colSpan={5}>
                    Waiting for CAN frames…
                  </td>
                </tr>
              ) : (
                frames.map((frame, index) => (
                  <tr
                    key={`${frame.timestamp}-${frame.id}-${index}`}
                    className="border-b border-slate-900/60 last:border-b-0"
                  >
                    <td className="whitespace-nowrap px-4 py-1 font-mono text-xs text-slate-300">
                      {formatTimestamp(frame.timestamp)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-1 font-mono text-xs text-indigo-200">
                      {formatCanId(frame.id)}
                    </td>
                    <td className="px-4 py-1 font-mono text-xs text-emerald-200">
                      {formatBytes(frame.data) || '—'}
                    </td>
                    <td className="px-4 py-1">
                      <span
                        className={clsx(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase',
                          frame.direction === 'RX'
                            ? 'bg-emerald-500/10 text-emerald-300'
                            : 'bg-slate-500/10 text-slate-300'
                        )}
                      >
                        {frame.direction}
                      </span>
                    </td>
                    <td className="px-4 py-1 font-mono text-[11px] text-slate-500">
                      {frame.raw}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default CanConsole;

