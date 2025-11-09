export type CanDirection = 'TX' | 'RX';

export interface CanFrame {
  id: number;
  idHex: string;
  data: string;
  direction: CanDirection;
  timestamp: number;
  sourceTimestamp?: string;
  raw: string;
}

export interface CanRange {
  min: number | null;
  max: number | null;
}

const EXTENDED_CAN_MAX = 0x1fffffff;

const HEX_CANDIDATE = /^[0-9a-f]+$/i;
const HEX_WITH_PREFIX = /^0x[0-9a-f]+$/i;
const TIME_COMPONENT = /^(\d{2}):(\d{2}):(\d{2})(?:[.:](\d+))?$/;

export function clampCanId(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  if (value > EXTENDED_CAN_MAX) {
    return EXTENDED_CAN_MAX;
  }
  return Math.trunc(value);
}

export function parseCanId(input: unknown): number | null {
  if (input === null || input === undefined) {
    return null;
  }
  if (typeof input === 'number' && Number.isFinite(input)) {
    return clampCanId(input);
  }
  if (typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  let working = trimmed;
  let radix = 10;

  if (HEX_WITH_PREFIX.test(working)) {
    working = working.slice(2);
    radix = 16;
  } else if (HEX_CANDIDATE.test(working) && /[a-f]/i.test(working)) {
    radix = 16;
  }

  const value = parseInt(working, radix);
  if (Number.isNaN(value)) {
    return null;
  }

  return clampCanId(value);
}

export function formatCanId(value: number | null, width = 3): string {
  if (value === null || value === undefined) {
    return '';
  }
  const paddedWidth = value > 0x7ff ? Math.max(width, 8) : width;
  const hex = value.toString(16).toUpperCase().padStart(paddedWidth, '0');
  return `0x${hex}`;
}

function parseTimestamp(value: unknown): number {
  if (value === null || value === undefined) {
    return Date.now();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value > 1e12) {
      return Math.trunc(value);
    }
    if (value > 1e9) {
      return Math.trunc(value * 1000);
    }
    return Math.trunc(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return Date.now();
    }

    const parsed = Date.parse(trimmed);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }

    const match = TIME_COMPONENT.exec(trimmed);
    if (match) {
      const [_, hours, minutes, seconds, fractional] = match;
      const now = new Date();
      const milliseconds = fractional
        ? Number.parseInt(fractional.padEnd(3, '0').slice(0, 3), 10)
        : 0;
      now.setHours(Number.parseInt(hours, 10));
      now.setMinutes(Number.parseInt(minutes, 10));
      now.setSeconds(Number.parseInt(seconds, 10));
      now.setMilliseconds(milliseconds);
      return now.getTime();
    }
  }

  return Date.now();
}

function normalizePayload(payload: unknown): string {
  if (payload === null || payload === undefined) {
    return '';
  }
  if (typeof payload === 'string') {
    return payload.replace(/[^0-9a-f]/gi, '').toUpperCase();
  }
  if (Array.isArray(payload)) {
    return payload
      .map((item) => {
        const numeric = Number(item);
        if (!Number.isFinite(numeric)) {
          return null;
        }
        const normalized = clampCanId(numeric) & 0xff;
        return normalized.toString(16).padStart(2, '0');
      })
      .filter((value): value is string => value !== null)
      .join('')
      .toUpperCase();
  }
  if (typeof payload === 'number' && Number.isFinite(payload)) {
    return clampCanId(payload).toString(16).toUpperCase();
  }
  if (typeof payload === 'object') {
    if ('data' in (payload as Record<string, unknown>)) {
      return normalizePayload((payload as Record<string, unknown>).data);
    }
    if ('bytes' in (payload as Record<string, unknown>)) {
      return normalizePayload((payload as Record<string, unknown>).bytes);
    }
  }
  return '';
}

function resolveDirection(value: unknown): CanDirection {
  if (typeof value === 'string') {
    const upper = value.trim().toUpperCase();
    if (upper === 'RX') {
      return 'RX';
    }
  }
  return 'TX';
}

export function parseCanFrame(raw: string): CanFrame | null {
  if (!raw) {
    return null;
  }
  const text = raw.trim();
  if (!text) {
    return null;
  }

  let base: unknown;
  if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
    try {
      base = JSON.parse(text);
    } catch {
      base = undefined;
    }
  }

  if (base && typeof base === 'object') {
    const container = base as Record<string, unknown>;
    const idCandidate =
      container.id ??
      container.can_id ??
      container.identifier ??
      container.frame_id ??
      container.arbitration_id;
    const parsedId = parseCanId(idCandidate as unknown);
    if (parsedId === null) {
      return null;
    }

    const dataCandidate =
      container.data ??
      container.payload ??
      container.bytes ??
      (Array.isArray(container.frame) ? container.frame : undefined);

    const timestampCandidate =
      container.timestamp ??
      container.ts ??
      container.time ??
      container.createdAt ??
      container.created_at ??
      container.capture_ts;

    return {
      id: parsedId,
      idHex: formatCanId(parsedId),
      data: normalizePayload(dataCandidate),
      direction: resolveDirection(container.direction ?? container.dir ?? container.channel),
      timestamp: parseTimestamp(timestampCandidate),
      sourceTimestamp: typeof timestampCandidate === 'string' ? timestampCandidate : undefined,
      raw: text,
    };
  }

  const segments = text.split(/\s+/);
  let idSegment: string | undefined;
  let dataSegment: string | undefined;
  let timestampSegment: string | undefined;
  let directionSegment: string | undefined;

  for (const segment of segments) {
    if (!idSegment && (HEX_WITH_PREFIX.test(segment) || (HEX_CANDIDATE.test(segment) && /[a-f]/i.test(segment)))) {
      idSegment = segment;
      continue;
    }
    if (!timestampSegment && TIME_COMPONENT.test(segment)) {
      timestampSegment = segment;
      continue;
    }
    if (!directionSegment && /^(?:TX|RX)$/i.test(segment)) {
      directionSegment = segment;
      continue;
    }
    if (!dataSegment && /^[0-9a-fA-F]+$/.test(segment) && segment.length % 2 === 0) {
      dataSegment = segment;
    }
  }

  const parsedId = parseCanId(idSegment ?? null);
  if (parsedId === null) {
    return null;
  }

  return {
    id: parsedId,
    idHex: formatCanId(parsedId),
    data: normalizePayload(dataSegment),
    direction: resolveDirection(directionSegment),
    timestamp: parseTimestamp(timestampSegment),
    sourceTimestamp: timestampSegment,
    raw: text,
  };
}

export function isFrameWithinRange(frame: CanFrame, range: CanRange): boolean {
  const { min, max } = range;
  if (min !== null && frame.id < min) {
    return false;
  }
  if (max !== null && frame.id > max) {
    return false;
  }
  return true;
}

export function formatBytes(hex: string): string {
  if (!hex) {
    return '';
  }
  return hex
    .replace(/[^0-9a-f]/gi, '')
    .toUpperCase()
    .match(/.{1,2}/g)
    ?.join(' ') ?? '';
}

