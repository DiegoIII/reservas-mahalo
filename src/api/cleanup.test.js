const store = require('../../api/_store');

describe('cleanupExpiredReservations', () => {
  test('removes expired reservations and keeps future ones', async () => {
    const pastDate = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
    const futureDate = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);

    const r1 = await store.addReservation({ type: 'restaurant', date: pastDate, time: '12:00', guests: 2, table_type: 'standard', location: 'area-restaurante', name: 'Test 1', email: 't1@example.com' });
    const r2 = await store.addReservation({ type: 'restaurant', date: futureDate, time: '14:00', guests: 2, table_type: 'standard', location: 'area-restaurante', name: 'Test 2', email: 't2@example.com' });
    const r3 = await store.addReservation({ type: 'room', date: futureDate, check_out: pastDate, guests: 1, location: 'room1', name: 'Test 3', email: 't3@example.com' });

    const result = await store.cleanupExpiredReservations();
    expect(result.deleted).toBeGreaterThanOrEqual(2);
    const ids = result.ids;
    expect(ids).toEqual(expect.arrayContaining([r1.id, r3.id]));

    const all = await store.getReservations();
    expect(all.find(x => x.id === r1.id)).toBeUndefined();
    expect(all.find(x => x.id === r3.id)).toBeUndefined();
    expect(all.find(x => x.id === r2.id)).toBeDefined();
  });
});

