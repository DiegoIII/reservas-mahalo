import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: () => null,
  Navigate: () => null,
  useNavigate: () => () => {},
  useLocation: () => ({ pathname: '/' })
}), { virtual: true });

describe('Autenticación segura', () => {
  const realFetch = global.fetch;
  afterEach(() => { global.fetch = realFetch; });

  test('rechaza contraseña incorrecta con mensaje genérico', async () => {
    global.fetch = jest.fn()
      // CSRF GET
      .mockResolvedValueOnce({ ok: true, json: async () => ({ csrf_token: 'tok' }) })
      // Login POST
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Credenciales inválidas' }), status: 401 });

    render(<App />);

    fireEvent.click(screen.getByText(/Iniciar Sesión/i));
    fireEvent.change(screen.getByLabelText(/Correo/i), { target: { value: 'user@example.com' } });
    const pwdInputs1 = screen.getAllByLabelText(/Contraseña/i);
    fireEvent.change(pwdInputs1[0], { target: { value: 'badpass' } });
    const loginButtons1 = screen.getAllByRole('button', { name: /Iniciar Sesión/i });
    fireEvent.click(loginButtons1[loginButtons1.length - 1]);

    await waitFor(() => {
      expect(screen.getByText(/Credenciales inválidas/i)).toBeInTheDocument();
    });
  });

  test('acepta contraseña correcta', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ csrf_token: 'tok' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ email: 'user@example.com', name: 'User' }) });

    render(<App />);

    fireEvent.click(screen.getByText(/Iniciar Sesión/i));
    fireEvent.change(screen.getByLabelText(/Correo/i), { target: { value: 'user@example.com' } });
    const pwdInputs2 = screen.getAllByLabelText(/Contraseña/i);
    fireEvent.change(pwdInputs2[0], { target: { value: 'goodpass' } });
    const loginButtons2 = screen.getAllByRole('button', { name: /Iniciar Sesión/i });
    fireEvent.click(loginButtons2[loginButtons2.length - 1]);

    await waitFor(() => {
      expect(screen.queryByText(/Credenciales inválidas/i)).not.toBeInTheDocument();
    });
  });
});
