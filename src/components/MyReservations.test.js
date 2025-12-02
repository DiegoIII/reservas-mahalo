import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import MyReservations from './MyReservations';

describe('MyReservations', () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  test('filtra por email y muestra reservas', async () => {
    const apiUrl = 'http://localhost:3000';
    const user = { email: 'user@example.com' };
    const reservations = [
      { id: 1, type: 'restaurant', email: 'user@example.com', date: '2025-12-15', time: '12:00', guests: 2, table_type: 'mesa2', location: 'area-restauran' },
      { id: 2, type: 'room', email: 'other@example.com', date: '2025-12-15', check_out: '2025-12-16', guests: 2, location: 'room1' },
    ];
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => reservations });
    render(<MyReservations user={user} apiUrl={apiUrl} />);
    await waitFor(() => expect(screen.queryByText(/Cargando/)).not.toBeInTheDocument());
    expect(screen.getByText('Mis Reservas')).toBeInTheDocument();
    expect(screen.getByText(/Restaurante/)).toBeInTheDocument();
    expect(screen.getByText(/user@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/2025-12-15 12:00/)).toBeInTheDocument();
  });
});

