const store = require('../../api/_store');

describe('store fallback (memory) reservations', () => {
  it('addReservation and getReservations return created item', async () => {
    const before = await store.getReservations();
    const r = await store.addReservation({ type: 'restaurant', date: '2025-12-31', email: 'test@example.com', name: 'Test', guests: 2, table_type: 'family', location: 'terraza' });
    expect(r).toHaveProperty('id');
    const after = await store.getReservations();
    const found = after.find(x => x.id === r.id);
    expect(found).toBeTruthy();
    expect(found.email).toBe('test@example.com');
  });
});
