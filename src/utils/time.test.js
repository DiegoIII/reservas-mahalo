import { nowInTimeZone, isPastSameDayReservation } from './time';

function mockNowParts({ year = '2025', month = '11', day = '20', hour = '16', minute = '00' } = {}) {
  const parts = [
    { type: 'year', value: year },
    { type: 'literal', value: '-' },
    { type: 'month', value: month },
    { type: 'literal', value: '-' },
    { type: 'day', value: day },
    { type: 'literal', value: ', ' },
    { type: 'hour', value: hour },
    { type: 'literal', value: ':' },
    { type: 'minute', value: minute }
  ];
  jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
    formatToParts: () => parts,
    format: () => ''
  }));
}

describe('time utils', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('nowInTimeZone returns expected date and time', () => {
    mockNowParts({ year: '2025', month: '11', day: '20', hour: '16', minute: '00' });
    const { date, time } = nowInTimeZone('America/Mexico_City');
    expect(date).toBe('2025-11-20');
    expect(time).toBe('16:00');
  });

  test('detects past time on same day', () => {
    mockNowParts({ year: '2025', month: '11', day: '20', hour: '16', minute: '00' });
    expect(isPastSameDayReservation('2025-11-20', '12:00')).toBe(true);
    expect(isPastSameDayReservation('2025-11-20', '16:30')).toBe(false);
  });

  test('different day is not considered past', () => {
    mockNowParts({ year: '2025', month: '11', day: '20', hour: '16', minute: '00' });
    expect(isPastSameDayReservation('2025-11-21', '12:00')).toBe(false);
  });

  test('handles leading zeros and midnight edge cases', () => {
    mockNowParts({ year: '2025', month: '11', day: '20', hour: '00', minute: '05' });
    expect(isPastSameDayReservation('2025-11-20', '00:00')).toBe(true);
    expect(isPastSameDayReservation('2025-11-20', '08:30')).toBe(false);
    expect(isPastSameDayReservation('2025-11-20', '8:00')).toBe(true);
  });
});