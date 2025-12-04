import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AdminDashboard from './AdminDashboard';

jest.mock('./PriceConfiguration', () => () => null);

describe('AdminDashboard restaurant time display', () => {
  const realFetch = global.fetch;
  afterEach(() => { global.fetch = realFetch; });

  test('shows restaurant reservation time from `time` field', async () => {
    const items = [
      { id: 1, type: 'restaurant', date: '2025-12-10', time: '14:00', guests: 2, location: 'restaurante', name: 'Ana', email: 'a@b.com' }
    ];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => items,
      headers: { get: (k) => (k === 'X-Total-Count' ? '1' : null) }
    });

    render(<AdminDashboard apiUrl="http://localhost:4000" />);
    await waitFor(() => expect(screen.getByText('14:00')).toBeInTheDocument());
  });
});
