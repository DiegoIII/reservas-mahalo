import { formatUserDisplayName } from './userDisplay';

describe('formatUserDisplayName', () => {
  it('usa el nombre cuando está disponible', () => {
    expect(formatUserDisplayName({ name: 'Juan Pérez', email: 'jp@example.com' })).toBe('Juan Pérez');
  });
  it('usa el email completo cuando no hay nombre', () => {
    expect(formatUserDisplayName({ email: 'jp@example.com' })).toBe('jp@example.com');
  });
  it('retorna "Usuario" cuando falta todo', () => {
    expect(formatUserDisplayName({})).toBe('Usuario');
  });
});
