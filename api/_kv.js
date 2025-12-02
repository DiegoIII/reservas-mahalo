const URL = process.env.KV_REST_API_URL || '';
const TOKEN = process.env.KV_REST_TOKEN || '';

async function kvGet(key) {
  if (!URL || !TOKEN) return null;
  try {
    const r = await fetch(`${URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    if (!r.ok) return null;
    const data = await r.json().catch(() => null);
    const v = data && Object.prototype.hasOwnProperty.call(data, 'result') ? data.result : null;
    return v;
  } catch (_) {
    return null;
  }
}

async function kvSet(key, value) {
  if (!URL || !TOKEN) return false;
  try {
    const r = await fetch(`${URL}/set/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ value })
    });
    return r.ok;
  } catch (_) {
    return false;
  }
}

async function getArray(key) {
  const v = await kvGet(key);
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

async function setArray(key, arr) {
  return kvSet(key, Array.isArray(arr) ? arr : []);
}

module.exports = { kvGet, kvSet, getArray, setArray };

