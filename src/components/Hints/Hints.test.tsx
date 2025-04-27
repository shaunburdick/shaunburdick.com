import React, { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Hints from './Hints';

describe('Hints', () => {
    test('Display a button to toggle hints, with the table hidden initially', () => {
        act(() => render(<Hints />));

        expect(screen.getByText('Show Hints')).toBeInTheDocument();
        expect(document.body.querySelector('table')).not.toBeInTheDocument();
    });

    test('Display a table of hints and fire event when hint is clicked', (done) => {
        const hintClick = (text: string) => {
            expect(text).toEqual('whois shaun');

            done();
        };

        act(() => render(<Hints hintClick={hintClick} />));

        const button = screen.getByText('Show Hints');

        expect(button).toBeInTheDocument();
        expect(document.body.querySelector('table')).not.toBeInTheDocument();

        // click the show button
        fireEvent.click(button);
        expect(document.body.querySelector('table')).toBeInTheDocument();

        expect(button.textContent).toEqual('Hide Hints');

        const link = screen.getByText('whois shaun');
        fireEvent.click(link);
    });
});

