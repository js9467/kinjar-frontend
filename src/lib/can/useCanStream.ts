'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CanFrame, CanRange, isFrameWithinRange, parseCanFrame } from './utils';

export type CanStreamStatus = 'disconnected' | 'connecting' | 'connected' | 'unsupported';

export interface UseCanStreamOptions {
  streamUrl?: string;
  maxBuffer?: number;
  staleTimeoutMs?: number;
  autoStart?: boolean;
}

export interface UseCanStreamResult {
  frames: CanFrame[];
  status: CanStreamStatus;
  totalReceived: number;
  droppedByFilter: number;
  range: CanRange;
  setRange: (updater: Partial<CanRange> | ((previous: CanRange) => CanRange)) => void;
  clearFrames: () => void;
  start: () => void;
  stop: () => void;
  isPaused: boolean;
  setPaused: (value: boolean | ((current: boolean) => boolean)) => void;
  lastHeartbeat: number | null;
  streamUrl: string;
}

type StreamConnection = EventSource | WebSocket;

const DEFAULT_STALE_TIMEOUT = 5000;
const DEFAULT_BUFFER_SIZE = 750;

export function useCanStream({
  streamUrl: explicitStreamUrl,
  maxBuffer = DEFAULT_BUFFER_SIZE,
  staleTimeoutMs = DEFAULT_STALE_TIMEOUT,
  autoStart = true,
}: UseCanStreamOptions = {}): UseCanStreamResult {
  const [frames, setFrames] = useState<CanFrame[]>([]);
  const [status, setStatus] = useState<CanStreamStatus>('disconnected');
  const statusRef = useRef<CanStreamStatus>('disconnected');

  const [range, setRangeState] = useState<CanRange>({ min: null, max: null });
  const numericRangeRef = useRef<CanRange>({ min: null, max: null });

  const [totalReceived, setTotalReceived] = useState(0);
  const totalReceivedRef = useRef(0);
  const [droppedByFilter, setDroppedByFilter] = useState(0);
  const droppedRef = useRef(0);

  const [lastHeartbeat, setLastHeartbeat] = useState<number | null>(null);
  const lastHeartbeatRef = useRef<number | null>(null);

  const [isPaused, setPausedState] = useState(false);
  const pausedRef = useRef(false);

  const connectionRef = useRef<StreamConnection | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const manualStopRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const recentFrameTrackerRef = useRef<Map<string, number>>(new Map());

  const connectRef = useRef<() => void>(() => {});

  const resolvedStreamUrl = useMemo(() => {
    if (explicitStreamUrl) {
      return explicitStreamUrl;
    }
    if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_CAN_STREAM_URL) {
      return process.env.NEXT_PUBLIC_CAN_STREAM_URL;
    }
    return '/api/can/stream';
  }, [explicitStreamUrl]);

  const updateStatus = useCallback((next: CanStreamStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const updateLastHeartbeat = useCallback((value: number | null) => {
    lastHeartbeatRef.current = value;
    setLastHeartbeat(value);
  }, []);

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const stopHeartbeatInterval = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const closeConnection = useCallback(() => {
    if (connectionRef.current) {
      connectionRef.current.close();
      connectionRef.current = null;
    }
  }, []);

  const setFramesState = useCallback((updater: CanFrame[] | ((previous: CanFrame[]) => CanFrame[])) => {
    setFrames((previous) =>
      typeof updater === 'function' ? (updater as (prev: CanFrame[]) => CanFrame[])(previous) : updater
    );
  }, []);

  const clearFrames = useCallback(() => {
    setFramesState([]);
    totalReceivedRef.current = 0;
    setTotalReceived(0);
    droppedRef.current = 0;
    setDroppedByFilter(0);
    recentFrameTrackerRef.current.clear();
  }, [setFramesState]);

  const addFrame = useCallback(
    (frame: CanFrame) => {
      if (pausedRef.current) {
        return;
      }
      const signature = `${frame.id}-${frame.direction}-${frame.data}`;
      const lastTimestamp = recentFrameTrackerRef.current.get(signature);
      if (lastTimestamp && frame.timestamp <= lastTimestamp) {
        return;
      }
      recentFrameTrackerRef.current.set(signature, frame.timestamp);
      if (recentFrameTrackerRef.current.size > maxBuffer * 4) {
        const cutoff = Date.now() - 60000;
        for (const [key, recordedTimestamp] of recentFrameTrackerRef.current) {
          if (recordedTimestamp < cutoff) {
            recentFrameTrackerRef.current.delete(key);
          }
        }
      }
      if (!isFrameWithinRange(frame, numericRangeRef.current)) {
        droppedRef.current += 1;
        setDroppedByFilter(droppedRef.current);
        return;
      }
      totalReceivedRef.current += 1;
      setTotalReceived(totalReceivedRef.current);
      setFramesState((current) => {
        const next = [...current, frame];
        if (next.length > maxBuffer) {
          next.splice(0, next.length - maxBuffer);
        }
        return next;
      });
    },
    [maxBuffer, setFramesState]
  );

  const handleConnectionLost = useCallback(
    (markDisconnected = true) => {
      closeConnection();
      stopHeartbeatInterval();
      updateLastHeartbeat(null);
      if (markDisconnected) {
        updateStatus('disconnected');
        clearFrames();
      }
      if (manualStopRef.current) {
        return;
      }
      if (reconnectTimeoutRef.current) {
        return;
      }
      const attempt = reconnectAttemptsRef.current + 1;
      reconnectAttemptsRef.current = attempt;
      const delay = Math.min(15000, 1000 * 2 ** attempt);
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null;
        connectRef.current();
      }, delay);
    },
    [clearFrames, closeConnection, stopHeartbeatInterval, updateLastHeartbeat, updateStatus]
  );

  const startHeartbeatMonitor = useCallback(() => {
    stopHeartbeatInterval();
    heartbeatIntervalRef.current = setInterval(() => {
      if (manualStopRef.current) {
        return;
      }
      if (statusRef.current !== 'connected') {
        return;
      }
      const last = lastHeartbeatRef.current;
      if (!last) {
        return;
      }
      if (Date.now() - last > staleTimeoutMs) {
        handleConnectionLost();
      }
    }, Math.max(1000, Math.min(3000, Math.floor(staleTimeoutMs / 2))));
  }, [handleConnectionLost, staleTimeoutMs, stopHeartbeatInterval]);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (manualStopRef.current) {
      return;
    }

    clearReconnectTimeout();
    closeConnection();
    updateStatus('connecting');

    const absoluteUrl = resolvedStreamUrl.startsWith('http')
      ? resolvedStreamUrl
      : `${window.location.origin}${resolvedStreamUrl.startsWith('/') ? '' : '/'}${resolvedStreamUrl}`;
    const isWebSocket = /^wss?:\/\//i.test(absoluteUrl);

    const handleMessage = (raw: string) => {
      const frame = parseCanFrame(raw);
      if (!frame) {
        return;
      }
      updateLastHeartbeat(Date.now());
      addFrame(frame);
    };

    const handleOpen = () => {
      reconnectAttemptsRef.current = 0;
      clearReconnectTimeout();
      updateStatus('connected');
      const now = Date.now();
      updateLastHeartbeat(now);
      startHeartbeatMonitor();
    };

    if (isWebSocket || typeof EventSource === 'undefined') {
      if (typeof WebSocket === 'undefined') {
        updateStatus('unsupported');
        return;
      }
      try {
        const socket = new WebSocket(isWebSocket ? absoluteUrl : absoluteUrl.replace(/^http/i, 'ws'));
        connectionRef.current = socket;
        socket.onopen = handleOpen;
        socket.onmessage = (event) => {
          const payload = typeof event.data === 'string' ? event.data : '';
          handleMessage(payload);
        };
        socket.onerror = () => handleConnectionLost();
        socket.onclose = () => handleConnectionLost();
      } catch (error) {
        handleConnectionLost();
      }
      return;
    }

    try {
      const source = new EventSource(absoluteUrl);
      connectionRef.current = source;
      source.onopen = handleOpen;
      source.onmessage = (event) => {
        handleMessage(event.data);
      };
      source.onerror = () => handleConnectionLost();
    } catch (error) {
      handleConnectionLost();
    }
  }, [
    addFrame,
    clearReconnectTimeout,
    closeConnection,
    handleConnectionLost,
    resolvedStreamUrl,
    startHeartbeatMonitor,
    updateLastHeartbeat,
    updateStatus,
  ]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const setRange = useCallback(
    (updater: Partial<CanRange> | ((previous: CanRange) => CanRange)) => {
      setRangeState((previous) => {
        const next =
          typeof updater === 'function'
            ? (updater as (current: CanRange) => CanRange)(previous)
            : { ...previous, ...updater };
        let { min, max } = next;
        if (min !== null && max !== null && min > max) {
          [min, max] = [max, min];
        }
        const normalized: CanRange = { min, max };
        numericRangeRef.current = normalized;
        setFramesState((current) => current.filter((frame) => isFrameWithinRange(frame, normalized)));
        return normalized;
      });
    },
    [setFramesState]
  );

  const updatePaused = useCallback((value: boolean | ((current: boolean) => boolean)) => {
    setPausedState((previous) => {
      const next = typeof value === 'function' ? (value as (current: boolean) => boolean)(previous) : value;
      pausedRef.current = next;
      return next;
    });
  }, []);

  const start = useCallback(() => {
    manualStopRef.current = false;
    reconnectAttemptsRef.current = 0;
    clearReconnectTimeout();
    connect();
  }, [clearReconnectTimeout, connect]);

  const stop = useCallback(() => {
    manualStopRef.current = true;
    clearReconnectTimeout();
    stopHeartbeatInterval();
    closeConnection();
    updateLastHeartbeat(null);
    updateStatus('disconnected');
    clearFrames();
    recentFrameTrackerRef.current.clear();
  }, [
    clearFrames,
    clearReconnectTimeout,
    closeConnection,
    stopHeartbeatInterval,
    updateLastHeartbeat,
    updateStatus,
  ]);

  useEffect(() => {
    if (!autoStart) {
      return undefined;
    }
    manualStopRef.current = false;
    connect();
    return () => {
      manualStopRef.current = true;
      clearReconnectTimeout();
      stopHeartbeatInterval();
      closeConnection();
    };
  }, [autoStart, clearReconnectTimeout, closeConnection, connect, stopHeartbeatInterval]);

  return {
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
    setPaused: updatePaused,
    lastHeartbeat,
    streamUrl: resolvedStreamUrl,
  };
}

