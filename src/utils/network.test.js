import { fetchWithRetry } from './network';

describe('fetchWithRetry', () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  test('success on first attempt', async () => {
    const okResp = { ok: true, json: async () => ({ ok: true }) };
    global.fetch = jest.fn().mockResolvedValue(okResp);
    const resp = await fetchWithRetry('/api/test');
    expect(resp).toBe(okResp);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('retry then success', async () => {
    const failResp = { ok: false, json: async () => ({ error: 'temp' }), status: 500 };
    const okResp = { ok: true, json: async () => ({ ok: true }) };
    global.fetch = jest.fn()
      .mockResolvedValueOnce(failResp)
      .mockResolvedValueOnce(okResp);
    const resp = await fetchWithRetry('/api/test', {}, { retries: 2, backoffMs: 1 });
    expect(resp).toBe(okResp);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('fails after retries', async () => {
    const failResp = { ok: false, json: async () => ({ error: 'temp' }), status: 500 };
    global.fetch = jest.fn().mockResolvedValue(failResp);
    await expect(fetchWithRetry('/api/test', {}, { retries: 1, backoffMs: 1 }))
      .rejects.toThrow('temp');
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});

