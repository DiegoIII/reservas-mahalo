import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RestaurantReservation from './RestaurantReservation';
import useAlert from '../../hooks/useAlert';

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

function mockNowParts({ year = '2025', month = '11', day = '20', hour = '16', minute = '00' } = {}) {
  const parts = [
    { type: 'year', value: year },
    { type: 'literal', value: '-' },
    { type: 'month', value: month },
    { type: 'literal', value: '-' },
    { type: 'day', value: day },
    { type: 'literal', value: ', ' },
    { type: 'hour', value: hour },
    { type: 'literal', value: ':' },
    { type: 'minute', value: minute }
  ];
  jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
    formatToParts: () => parts,
    format: () => ''
  }));
}

describe('RestaurantReservation time validation', () => {
  beforeEach(() => {
    mockNowParts();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('disables past time options for today', () => {
    render(<RestaurantReservation user={null} apiUrl="http://localhost:4000" />);
    const dateInput = screen.getByLabelText(/Fecha \*/i);
    fireEvent.change(dateInput, { target: { value: '2025-11-20' } });

    const timeSelect = screen.getByLabelText(/Hora \*/i);
    fireEvent.mouseDown(timeSelect);
    const pastOption = screen.getByRole('option', { name: /12:00 hrs/i });
    expect(pastOption).toBeDisabled();
    const futureOption = screen.getByRole('option', { name: /17:00 hrs/i });
    expect(futureOption).not.toBeDisabled();
  });

  test('shows error on submit when selecting a past time', () => {
    render(<RestaurantReservation user={null} apiUrl="http://localhost:4000" />);
    fireEvent.change(screen.getByLabelText(/Fecha \*/i), { target: { value: '2025-11-20' } });
    fireEvent.change(screen.getByLabelText(/Hora \*/i), { target: { value: '12:00' } });
    fireEvent.click(screen.getByText('Daypass Simple'));
    fireEvent.click(screen.getByText('Restaurante Principal'));
    fireEvent.change(screen.getByLabelText(/Nombre Completo \*/i), { target: { value: 'Carlos Test' } });
    fireEvent.change(screen.getByLabelText(/Email \*/i), { target: { value: 'carlos@test.com' } });

    fireEvent.click(screen.getByRole('button', { name: /Confirmar Reserva/i }));

    const alertHook = useAlert();
    expect(alertHook.showError).toHaveBeenCalledWith(
      'No se pueden hacer reservas para horarios pasados. Por favor seleccione una hora futura',
      'Horario inválido'
    );
  });
});
