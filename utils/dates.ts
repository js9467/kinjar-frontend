// utils/dates.ts

/**
 * Returns true when the month and day match.
 * Accepts ISO strings or Date objects for `a`, and tolerates `undefined`.
 * Any unparsable/undefined input returns false.
 */
export function sameMonthDay(a: string | Date | undefined, b: Date): boolean {
  if (!a) return false;
  const d = typeof a === "string" ? new Date(a) : a;
  if (Number.isNaN(d.getTime())) return false;
  return d.getMonth() === b.getMonth() && d.getDate() === b.getDate();
}

/** Safe date parsing helper (returns undefined if invalid). */
export function toDateSafe(v: string | Date | undefined): Date | undefined {
  if (!v) return undefined;
  const d = typeof v === "string" ? new Date(v) : v;
  return Number.isNaN(d.getTime()) ? undefined : d;
}
