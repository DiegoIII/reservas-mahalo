export async function fetchWithRetry(url, options = {}, attempts = 3, baseDelayMs = 200) {
  let lastErr = null;
  let lastResp = null;
  for (let i = 0; i < attempts; i++) {
    try {
      const resp = await fetch(url, options);
      lastResp = resp;
      if (resp.ok) return resp;
      const retriable = resp.status >= 500 || resp.status === 429;
      if (!retriable) return resp;
      lastErr = new Error(`HTTP ${resp.status}`);
    } catch (e) {
      lastErr = e;
    }
    if (i < attempts - 1) {
      const delay = baseDelayMs * Math.pow(2, i);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  if (lastResp) return lastResp;
  if (lastErr) throw lastErr;
  return new Response(null, { status: 500 });
}
