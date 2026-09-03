// Timezone-aware schedule utilities for RestaurantLocation records
// (src/data/locations.ts). Every calculation here uses the restaurant's
// timezone (always 'America/Los_Angeles' today) via the Intl API, never the
// device's local timezone — a customer checking hours from out of state must
// see San Diego's open/closed status, not their own.

import {
  DAYS_OF_WEEK,
  type DayOfWeek,
  type RestaurantLocation,
  type ServicePeriod,
  type TimeString,
} from '@/data/types';

export type LocationStatus = 'open' | 'closing-soon' | 'closed' | 'unconfirmed';

const CLOSING_SOON_WINDOW_MINUTES = 60;

/** Minutes since midnight, in the restaurant's timezone, for the given instant. */
function getZonedParts(timezone: string, at: Date): { weekday: DayOfWeek; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(at);

  const weekdayShort = parts.find((part) => part.type === 'weekday')?.value ?? 'Sun';
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0');

  const weekdayMap: Record<string, DayOfWeek> = {
    Sun: 'sunday',
    Mon: 'monday',
    Tue: 'tuesday',
    Wed: 'wednesday',
    Thu: 'thursday',
    Fri: 'friday',
    Sat: 'saturday',
  };

  return { weekday: weekdayMap[weekdayShort] ?? 'sunday', minutes: hour * 60 + minute };
}

function parseTimeToMinutes(time: TimeString): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function formatTime(time: TimeString): string {
  const minutes = parseTimeToMinutes(time);
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return minute === 0
    ? `${hour12}:00 ${period}`
    : `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
}

export function formatPeriod(period: ServicePeriod): string {
  const open = formatTime(period.open);
  const close = period.close ? formatTime(period.close) : 'close';
  const range = `${open} – ${close}`;
  return period.label ? `${period.label}: ${range}` : range;
}

/** Today's schedule label for a location, e.g. "11:00 AM – 2:00 PM, 3:00 PM – close". */
export function getTodayHoursLabel(location: RestaurantLocation, at: Date = new Date()): string {
  if (location.hoursUnconfirmed) return 'Hours awaiting confirmation';

  const { weekday } = getZonedParts(location.timezone, at);
  const schedule = location.weeklyHours[weekday];
  if (!schedule || schedule.periods.length === 0) return 'Closed today';

  return schedule.periods.map((period) => formatPeriod(period)).join(', ');
}

export function getWeeklyScheduleLabels(
  location: RestaurantLocation
): { day: DayOfWeek; label: string; hours: string }[] {
  const DAY_LABEL: Record<DayOfWeek, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  };
  const orderedDays: DayOfWeek[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  return orderedDays.map((day) => {
    const schedule = location.weeklyHours[day];
    const hours =
      location.hoursUnconfirmed || !schedule || schedule.periods.length === 0
        ? location.hoursUnconfirmed
          ? 'Awaiting confirmation'
          : 'Closed'
        : schedule.periods.map((period) => formatPeriod(period)).join(', ');
    return { day, label: DAY_LABEL[day], hours };
  });
}

/**
 * Whether `minutes` (since midnight) falls within a period. A period with a
 * `null` close ("to close") is treated as open through the end of that
 * calendar day — we never invent an exact closing time.
 */
function isWithinPeriod(period: ServicePeriod, minutes: number): boolean {
  const open = parseTimeToMinutes(period.open);
  if (period.close === null) return minutes >= open;
  const close = parseTimeToMinutes(period.close);
  return minutes >= open && minutes < close;
}

export function getLocationStatus(
  location: RestaurantLocation,
  at: Date = new Date()
): LocationStatus {
  if (location.hoursUnconfirmed) return 'unconfirmed';

  const { weekday, minutes } = getZonedParts(location.timezone, at);
  const schedule = location.weeklyHours[weekday];
  if (!schedule) return 'closed';

  const activePeriod = schedule.periods.find((period) => isWithinPeriod(period, minutes));
  if (!activePeriod) return 'closed';

  if (activePeriod.close !== null) {
    const close = parseTimeToMinutes(activePeriod.close);
    if (close - minutes <= CLOSING_SOON_WINDOW_MINUTES) return 'closing-soon';
  }

  return 'open';
}

/** For a closed location, when it next opens — e.g. "Opens today at 3:00 PM" / "Opens Tuesday at 11:00 AM". */
export function getNextOpeningLabel(
  location: RestaurantLocation,
  at: Date = new Date()
): string | null {
  if (location.hoursUnconfirmed) return null;

  const { weekday, minutes } = getZonedParts(location.timezone, at);
  const startIndex = DAYS_OF_WEEK.indexOf(weekday);

  for (let offset = 0; offset <= 7; offset += 1) {
    const day = DAYS_OF_WEEK[(startIndex + offset) % 7];
    const schedule = location.weeklyHours[day];
    if (!schedule) continue;

    const upcoming = schedule.periods
      .map((period) => parseTimeToMinutes(period.open))
      .filter((openMinutes) => offset > 0 || openMinutes > minutes)
      .sort((a, b) => a - b)[0];

    if (upcoming === undefined) continue;

    const dayLabel = offset === 0 ? 'today' : offset === 1 ? 'tomorrow' : capitalize(day);
    return `Opens ${dayLabel} at ${formatTime(minutesToTimeString(upcoming))}`;
  }

  return null;
}

function minutesToTimeString(minutes: number): TimeString {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export const STATUS_COPY: Record<LocationStatus, string> = {
  open: 'Open now',
  'closing-soon': 'Closing soon',
  closed: 'Closed',
  unconfirmed: 'Hours unconfirmed',
};

/** Whether any day's schedule includes a labelled "Brunch" period. */
export function hasBrunchService(location: RestaurantLocation): boolean {
  return DAYS_OF_WEEK.some((day) =>
    location.weeklyHours[day]?.periods.some((period) => period.label === 'Brunch')
  );
}

/** Whether the location has a daily or day-specific happy hour window. */
export function hasHappyHourService(location: RestaurantLocation): boolean {
  return (location.specialServiceHours ?? []).some((service) =>
    service.label.toLowerCase().includes('happy hour')
  );
}
