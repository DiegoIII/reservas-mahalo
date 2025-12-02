import { fetchWithRetry } from './fetchWithRetry';

describe('fetchWithRetry', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('reintenta ante errores de red y devuelve ok al tercer intento', async () => {
    const okResp = new Response(JSON.stringify({ ok: true }), { status: 201 });
    global.fetch = jest.fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(okResp);
    const resp = await fetchWithRetry('/api/test', { method: 'POST' }, 3, 1);
    expect(resp.ok).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('no reintenta en 4xx y devuelve la respuesta', async () => {
    const badResp = new Response(null, { status: 400 });
    global.fetch = jest.fn().mockResolvedValueOnce(badResp);
    const resp = await fetchWithRetry('/api/test', { method: 'POST' }, 3, 1);
    expect(resp.status).toBe(400);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('reintenta en 5xx y devuelve última respuesta', async () => {
    const errResp = new Response(null, { status: 500 });
    global.fetch = jest.fn().mockResolvedValue(errResp);
    const resp = await fetchWithRetry('/api/test', {}, 2, 1);
    expect(resp.status).toBe(500);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
