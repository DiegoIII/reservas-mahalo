const path = require('path');

describe('API DELETE /api/admin/reservations/[id]', () => {
  let handler;
  let store;

  const makeRes = () => {
    const res = { statusCode: 0, headers: {}, body: null };
    res.setHeader = (k, v) => { res.headers[k] = v; };
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { res.body = data; };
    res.end = () => {};
    return res;
  };

  beforeEach(() => {
    jest.resetModules();
    store = require(path.join(process.cwd(), 'api/_store.js'));
    handler = require(path.join(process.cwd(), 'api/admin/reservations/[id].js'));
  });

  test('elimina una reserva existente y responde 200', async () => {
    const allBefore = await store.getReservations();
    const existing = allBefore.find(r => Number(r.id) === 1000);
    expect(existing).toBeTruthy();

    const req = { method: 'DELETE', query: { id: '1000' }, headers: { origin: 'http://localhost:3000' } };
    const res = makeRes();
    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true, id: 1000 });

    const allAfter = await store.getReservations();
    expect(allAfter.find(r => Number(r.id) === 1000)).toBeFalsy();
  });

  test('responde 404 cuando la reserva no existe', async () => {
    const req = { method: 'DELETE', query: { id: '999999' }, headers: { origin: 'http://localhost:3000' } };
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(404);
    expect(res.body && res.body.error).toMatch(/no encontrada/i);
  });
});

