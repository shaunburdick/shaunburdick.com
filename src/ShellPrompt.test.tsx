import React, { act } from 'react';
import { render } from '@testing-library/react';
import ShellPrompt from './ShellPrompt';

test('Shows the console', () => {
    act(() => render(<ShellPrompt />));
    expect(document.body.querySelector('.shell')).toBeInTheDocument();
});
