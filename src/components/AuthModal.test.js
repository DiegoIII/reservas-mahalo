import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthModal from './AuthModal';

describe('AuthModal login shows username', () => {
  test('renders Nombre de Usuario in login mode', () => {
    render(<AuthModal isOpen={true} onClose={() => {}} mode="login" form={{ username: '', password: '' }} onInputChange={() => {}} onSubmit={(e) => e.preventDefault()} />);
    expect(screen.getByLabelText(/Nombre de Usuario/i)).toBeInTheDocument();
  });
});

describe('AuthModal signup shows email', () => {
  test('renders Correo electrónico in signup mode', () => {
    render(<AuthModal isOpen={true} onClose={() => {}} mode="signup" form={{ name: '', email: '', password: '' }} onInputChange={() => {}} onSubmit={(e) => e.preventDefault()} />);
    expect(screen.getByLabelText(/Correo electrónico/i)).toBeInTheDocument();
  });
});
