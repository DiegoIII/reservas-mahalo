import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminDashboard from './AdminDashboard';
import useAlert from '../../hooks/useAlert';

jest.mock('./PriceConfiguration', () => () => null);

jest.mock('../../hooks/useAlert', () => {
  const showError = jest.fn();
  const showSuccess = jest.fn();
  const hideAlert = jest.fn();
  return () => ({
    alertState: { isOpen: false, title: '', message: '', type: 'info' },
    showError,
    showSuccess,
    hideAlert,
    showAlert: jest.fn(),
    showWarning: jest.fn(),
    showInfo: jest.fn()
  });
});

describe('AdminDashboard delete reservation flow', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    global.fetch = jest.fn();
    jest.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  test('confirma y elimina una reserva, actualiza la lista y muestra éxito', async () => {
    const apiUrl = 'http://localhost:4000';

    const makeResponse = (data, headers = {}) => ({
      ok: true,
      json: async () => data,
      text: async () => JSON.stringify(data),
      headers: { get: (k) => headers[k] || null }
    });

    const initialList = [
      { id: 1000, type: 'restaurant', date: '2025-12-25', time: '13:00', guests: 4, location: 'principal', name: 'Carlos', email: 'carlos@test.com' }
    ];

    fetch
      .mockImplementationOnce(() => makeResponse(initialList, { 'X-Total-Count': '1' }))
      .mockImplementationOnce(() => makeResponse({ ok: true, id: 1000 }))
      .mockImplementationOnce(() => makeResponse([], { 'X-Total-Count': '0' }));

    render(<AdminDashboard apiUrl={apiUrl} />);

    const deleteBtn = await screen.findByRole('button', { name: /Eliminar/i });
    fireEvent.click(deleteBtn);

    const alertHook = useAlert();
    await waitFor(() => expect(alertHook.showSuccess).toHaveBeenCalledWith('Reserva eliminada correctamente', 'Eliminación exitosa'));

    expect(fetch).toHaveBeenCalledWith(`${apiUrl}/api/admin/reservations/1000`, { method: 'DELETE' });
    expect(fetch).toHaveBeenCalledWith(`${apiUrl}/api/admin/reservations?page=1&pageSize=20`);
  });
});
