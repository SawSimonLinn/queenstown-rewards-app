import type { DayHours, OpeningHours } from '@/types';

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateRange(startIso: string, endIso: string): string {
  return `${formatDate(startIso)} – ${formatDate(endIso)}`;
}

const DAY_ORDER: { key: keyof OpeningHours; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

function formatDayHours(hours: DayHours | null): string {
  return hours ? `${hours.open} – ${hours.close}` : 'Closed';
}

export function formatOpeningHours(openingHours: OpeningHours): { day: string; hours: string }[] {
  return DAY_ORDER.map(({ key, label }) => ({
    day: label,
    hours: formatDayHours(openingHours[key]),
  }));
}
