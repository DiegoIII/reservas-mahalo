export async function fetchWithRetry(url, options = {}, {
  retries = 3,
  backoffMs = 300,
} = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, options);
      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        throw new Error(errBody.error || `HTTP ${resp.status}`);
      }
      return resp;
    } catch (e) {
      lastErr = e;
      if (attempt === retries) break;
      await new Promise(r => setTimeout(r, backoffMs * Math.pow(2, attempt)));
    }
  }
  throw lastErr || new Error('Network error');
}

