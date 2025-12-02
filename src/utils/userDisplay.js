export function formatUserDisplayName(user) {
  const name = String(user?.name || '').trim();
  if (name) return name;
  const email = String(user?.email || '').trim();
  if (email) return email;
  return 'Usuario';
}
