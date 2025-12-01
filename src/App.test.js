import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: () => null,
  Navigate: () => null,
  useNavigate: () => () => {},
  useLocation: () => ({ pathname: '/' })
}), { virtual: true });

test('renderiza el título principal', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /Mahalo Beach Club/i, level: 1 })).toBeInTheDocument();
});
