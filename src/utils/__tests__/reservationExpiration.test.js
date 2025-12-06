const store = require('../../../lib/server/store');

describe('isReservationExpired', () => {
  const now = new Date('2025-01-01T20:00:00Z');

  test('restaurant: past time today is expired', () => {
    const r = { type: 'restaurant', date: '2025-01-01', time: '10:00' };
    expect(store.isReservationExpired(r, now)).toBe(true);
  });

  test('restaurant: future time today is not expired', () => {
    const r = { type: 'restaurant', date: '2025-01-01', time: '15:00' };
    expect(store.isReservationExpired(r, now)).toBe(false);
  });

  test('room: checked_out true is expired', () => {
    const r = { type: 'room', check_out: '2025-01-02', checked_out: true };
    expect(store.isReservationExpired(r, now)).toBe(true);
  });

  test('room: check_out before today is expired', () => {
    const r = { type: 'room', check_out: '2024-12-31' };
    expect(store.isReservationExpired(r, now)).toBe(true);
  });

  test('event: end_time before now is expired', () => {
    const r = { type: 'event', date: '2025-01-01', end_time: '11:00' };
    expect(store.isReservationExpired(r, now)).toBe(true);
  });

  test('event: end_time after now is not expired', () => {
    const r = { type: 'event', date: '2025-01-01', end_time: '15:00' };
    expect(store.isReservationExpired(r, now)).toBe(false);
  });
});
