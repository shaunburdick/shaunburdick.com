import React, { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import CookieNotice, { LS_COOKIE_ACKNOWLEDGE } from './CookieNotice';

describe('CookieNotice', () => {
    test('Display the cookie notice', () => {
        act(() => render(<CookieNotice />));

        expect(document.body.querySelector('[aria-label="Cookie Notice"]')).toBeInTheDocument();
    });

    test('Hide cookie notice once clicked', () => {
        act(() => render(<CookieNotice />));

        const button = screen.getByText('Yes');

        expect(button).toBeInTheDocument();
        expect(document.body.querySelector('[aria-label="Cookie Notice"]')).toBeInTheDocument();

        // click the show button
        fireEvent.click(button);
        expect(document.body.querySelector('[aria-label="Cookie Notice"]')).not.toBeInTheDocument();
        expect(localStorage.getItem(LS_COOKIE_ACKNOWLEDGE)).toEqual('false');
    });

    test('Hide cookie notice if they have already accepted', () => {
        localStorage.setItem(LS_COOKIE_ACKNOWLEDGE, 'false');

        act(() => render(<CookieNotice />));

        expect(document.body.querySelector('[aria-label="Cookie Notice"]')).not.toBeInTheDocument();
    });
});
