import type { AvailabilityRule, BookedInterval, TimeSlot } from "./types";

export const DEFAULT_AVAILABILITY: AvailabilityRule[] = [
  ...[1, 2, 3, 4, 5].map((weekday) => ({
    weekday,
    start: "08:00",
    end: "19:00",
    slotMinutes: 30,
    isActive: true,
  })),
  { weekday: 6, start: "08:00", end: "13:00", slotMinutes: 30, isActive: true },
];

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function toHHMM(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Dia da semana (0=domingo) de uma data "YYYY-MM-DD", determinístico em UTC. */
export function weekdayOf(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

export function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(`${date}T00:00:00Z`));
}

export function generateSlots(rule: AvailabilityRule): string[] {
  const start = toMinutes(rule.start);
  const end = toMinutes(rule.end);
  const step = rule.slotMinutes > 0 ? rule.slotMinutes : 30;
  const slots: string[] = [];
  for (let t = start; t + step <= end; t += step) slots.push(toHHMM(t));
  return slots;
}

export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return toMinutes(aStart) < toMinutes(bEnd) && toMinutes(bStart) < toMinutes(aEnd);
}

export interface DayAvailabilityInput {
  rules: AvailabilityRule[];
  date: string;
  booked?: BookedInterval[];
  now?: { date: string; time: string };
}

export function buildDayAvailability({
  rules,
  date,
  booked = [],
  now,
}: DayAvailabilityInput): TimeSlot[] {
  if (!isValidDate(date)) return [];
  const weekday = weekdayOf(date);
  const active = rules.filter((r) => r.isActive && r.weekday === weekday);
  if (active.length === 0) return [];

  const seen = new Set<string>();
  const slots: TimeSlot[] = [];

  for (const rule of active) {
    const step = rule.slotMinutes > 0 ? rule.slotMinutes : 30;
    for (const start of generateSlots(rule)) {
      if (seen.has(start)) continue;
      seen.add(start);
      const end = toHHMM(toMinutes(start) + step);
      const isBooked = booked.some((b) => overlaps(start, end, b.start, b.end));
      const isPast = !!now && now.date === date && toMinutes(start) <= toMinutes(now.time);
      slots.push({ start, end, available: !isBooked && !isPast });
    }
  }

  return slots.sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
}

export function isSlotAvailable(slots: TimeSlot[], time: string, endTime?: string): boolean {
  const slot = slots.find((s) => s.start === time);
  if (!slot) return false;
  if (!slot.available) return false;
  if (endTime && slot.end !== endTime) return false;
  return true;
}
