import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('Shows an h1 title', () => {
    act(() => render(<App />));
    const title = screen.getByText('Welcome to Shaun Burdick\'s Console!');
    expect(title).toBeInTheDocument();
});
