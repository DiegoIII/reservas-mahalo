const handler = require('../../../api/admin/restaurant');

function mockRes() {
  const res = {};
  res.headers = {};
  res.setHeader = (k, v) => { res.headers[k] = v; };
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn();
  return res;
}

describe('admin/restaurant API validation', () => {
  test('rejects missing time', async () => {
    const req = { method: 'POST', body: { email: 'a@b.com', name: 'Ana', party_size: 2, table_type: 'standard', date: '2025-12-10' }, headers: {} };
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/hora/i) }));
  });

  test('accepts valid payload with time', async () => {
    const req = { method: 'POST', body: { email: 'a@b.com', name: 'Ana', party_size: 2, table_type: 'standard', date: '2025-12-10', time: '14:00', location_area: 'restaurante' }, headers: {} };
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    const payload = res.json.mock.calls[0][0];
    expect(payload).toEqual(expect.objectContaining({ type: 'restaurant', time: '14:00' }));
  });
});

