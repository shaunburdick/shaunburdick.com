import React, { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Hints from '../../containers/Hints';

const SHOW_HINTS_TEXT = 'Show Hints';
const WHOIS_SHAUN_TEXT = 'whois shaun';

describe('Hints', () => {
    test('Display a button to toggle hints, with the table hidden initially', () => {
        act(() => render(<Hints />));

        expect(screen.getByText(SHOW_HINTS_TEXT)).toBeInTheDocument();
        expect(document.body.querySelector('table')).not.toBeInTheDocument();
    });

    test('Display a table of hints and fire event when hint is clicked', (done) => {
        const hintClick = (text: string) => {
            expect(text).toEqual(WHOIS_SHAUN_TEXT);

            done();
        };

        act(() => render(<Hints hintClick={hintClick} />));

        const button = screen.getByText(SHOW_HINTS_TEXT);

        expect(button).toBeInTheDocument();
        expect(document.body.querySelector('table')).not.toBeInTheDocument();

        // click the show button
        fireEvent.click(button);
        expect(document.body.querySelector('table')).toBeInTheDocument();

        expect(button.textContent).toEqual('Hide Hints');

        const link = screen.getByText(WHOIS_SHAUN_TEXT);
        fireEvent.click(link);
    });

    test('handles hint click when hintClick callback is undefined', () => {
        // Test hintClick is optional
        act(() => render(<Hints />));

        const button = screen.getByText(SHOW_HINTS_TEXT);
        fireEvent.click(button);

        const link = screen.getByText(WHOIS_SHAUN_TEXT);

        // Should not throw error when hintClick is undefined
        expect(() => fireEvent.click(link)).not.toThrow();
    });

    test('handles hint click with empty textContent fallback', () => {
        // Test textContent || '' fallback
        const hintClick = jest.fn();

        act(() => render(<Hints hintClick={hintClick} />));

        const button = screen.getByText(SHOW_HINTS_TEXT);
        fireEvent.click(button);

        const link = screen.getByText(WHOIS_SHAUN_TEXT);

        // Mock textContent to be null to test the fallback
        Object.defineProperty(link, 'textContent', {
            value: null,
            writable: true
        });

        fireEvent.click(link);

        // Should call hintClick with empty string when textContent is null
        expect(hintClick).toHaveBeenCalledWith('');
    });
});

