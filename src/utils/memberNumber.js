export function generateMemberNumber(digits = 6) {
  const n = Math.max(4, Math.min(10, Number.isInteger(digits) ? digits : 6));
  const candidate = String(Math.floor(Math.random() * Math.pow(10, n))).padStart(n, '0');
  return candidate;
}
