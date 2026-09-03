import { formatDate, formatDateRange, formatOpeningHours } from '@/lib/format';

describe('formatDate', () => {
  it('formats an ISO date as a long-form date', () => {
    expect(formatDate('2026-09-15T00:00:00.000Z')).toContain('2026');
    expect(formatDate('2026-09-15T00:00:00.000Z')).toContain('September');
  });
});

describe('formatDateRange', () => {
  it('joins two formatted dates with an en dash', () => {
    const result = formatDateRange('2026-09-01T00:00:00.000Z', '2026-09-30T00:00:00.000Z');
    expect(result).toContain('–');
    expect(result).toContain('2026');
  });
});

describe('formatOpeningHours', () => {
  it('returns all 7 days in order', () => {
    const result = formatOpeningHours({
      monday: { open: '11:00', close: '21:00' },
      tuesday: null,
      wednesday: null,
      thursday: null,
      friday: null,
      saturday: null,
      sunday: null,
    });
    expect(result).toHaveLength(7);
    expect(result[0]).toEqual({ day: 'Monday', hours: '11:00 – 21:00' });
  });

  it('shows "Closed" for a null day', () => {
    const result = formatOpeningHours({
      monday: null,
      tuesday: null,
      wednesday: null,
      thursday: null,
      friday: null,
      saturday: null,
      sunday: null,
    });
    expect(result.every((day) => day.hours === 'Closed')).toBe(true);
  });
});
