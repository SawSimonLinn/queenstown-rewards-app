import { getLocationStatus, getTodayHoursLabel, getNextOpeningLabel } from '@/lib/schedule';
import type { RestaurantLocation } from '@/data/types';

// A fixed instant, expressed as a UTC ISO string, is used throughout so
// these tests are independent of the machine's local timezone. Each helper
// under test converts to America/Los_Angeles internally.

function makeLocation(overrides: Partial<RestaurantLocation> = {}): RestaurantLocation {
  return {
    id: 'test-location',
    name: 'Test Location',
    shortName: 'Test',
    neighbourhood: 'Test',
    addressLine1: '123 Test St',
    city: 'San Diego',
    state: 'CA',
    postalCode: '92101',
    coordinates: { latitude: 32.721771, longitude: -117.167105, precision: 'rooftop' },
    coordinatesVerifiedAt: '2026-09-03',
    timezone: 'America/Los_Angeles',
    weeklyHours: {
      sunday: { periods: [{ label: 'Brunch', open: '09:00', close: '14:00' }] },
      monday: { periods: [{ open: '11:00', close: '20:00' }] },
      tuesday: { periods: [{ open: '11:00', close: '20:00' }] },
      wednesday: { periods: [{ open: '11:00', close: '20:00' }] },
      thursday: { periods: [{ open: '11:00', close: '20:00' }] },
      friday: { periods: [{ open: '11:00', close: '21:00' }] },
      saturday: { periods: [{ open: '10:00', close: '21:00' }] },
    },
    currentlyParticipating: true,
    description: 'Test',
    features: [],
    lastVerifiedAt: '2026-09-03',
    informationStatus: 'verified',
    ...overrides,
  };
}

// 2026-09-08 is a Tuesday. 18:00 UTC-7 (PDT) = 01:00 UTC the next day.
const TUESDAY_1PM_PACIFIC = new Date('2026-09-08T20:00:00Z'); // 13:00 PDT
const TUESDAY_745PM_PACIFIC = new Date('2026-09-09T02:45:00Z'); // 19:45 PDT — within 60 min of 20:00 close
const TUESDAY_10PM_PACIFIC = new Date('2026-09-09T05:00:00Z'); // 22:00 PDT — after close

describe('getLocationStatus', () => {
  it('is open mid-afternoon within a period', () => {
    expect(getLocationStatus(makeLocation(), TUESDAY_1PM_PACIFIC)).toBe('open');
  });

  it('is closing-soon within 60 minutes of a known close time', () => {
    expect(getLocationStatus(makeLocation(), TUESDAY_745PM_PACIFIC)).toBe('closing-soon');
  });

  it('is closed after the close time', () => {
    expect(getLocationStatus(makeLocation(), TUESDAY_10PM_PACIFIC)).toBe('closed');
  });

  it('never computes closing-soon for an open-ended ("to close") period', () => {
    const location = makeLocation({
      weeklyHours: {
        ...makeLocation().weeklyHours,
        tuesday: { periods: [{ label: 'Dinner', open: '11:00', close: null }] },
      },
    });
    expect(getLocationStatus(location, TUESDAY_10PM_PACIFIC)).toBe('open');
  });

  it('is unconfirmed when hoursUnconfirmed is set, regardless of time', () => {
    const location = makeLocation({ hoursUnconfirmed: true });
    expect(getLocationStatus(location, TUESDAY_1PM_PACIFIC)).toBe('unconfirmed');
  });
});

describe('getTodayHoursLabel', () => {
  it('formats a simple period', () => {
    expect(getTodayHoursLabel(makeLocation(), TUESDAY_1PM_PACIFIC)).toBe('11:00 AM – 8:00 PM');
  });

  it('shows an awaiting-confirmation message when hours are unconfirmed', () => {
    const location = makeLocation({ hoursUnconfirmed: true });
    expect(getTodayHoursLabel(location, TUESDAY_1PM_PACIFIC)).toBe('Hours awaiting confirmation');
  });

  it('never renders a null close time as a real hour', () => {
    const location = makeLocation({
      weeklyHours: {
        ...makeLocation().weeklyHours,
        tuesday: { periods: [{ label: 'Dinner', open: '15:00', close: null }] },
      },
    });
    expect(getTodayHoursLabel(location, TUESDAY_1PM_PACIFIC)).toBe('Dinner: 3:00 PM – close');
  });
});

describe('getNextOpeningLabel', () => {
  it('returns null when hours are unconfirmed', () => {
    expect(getNextOpeningLabel(makeLocation({ hoursUnconfirmed: true }))).toBeNull();
  });

  it('finds the next opening after closing time today', () => {
    const label = getNextOpeningLabel(makeLocation(), TUESDAY_10PM_PACIFIC);
    expect(label).toMatch(/^Opens (tomorrow|Wednesday) at/);
  });
});
