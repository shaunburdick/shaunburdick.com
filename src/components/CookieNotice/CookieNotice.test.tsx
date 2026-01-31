import React, { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AchievementProvider } from '../../containers/AchievementProvider';
import CookieNotice, { LS_COOKIE_ACKNOWLEDGE } from '../../containers/CookieNotice';

describe('CookieNotice', () => {
    // Helper function to wrap component with providers
    const renderWithProviders = (component: React.ReactElement) => {
        return render(
            <AchievementProvider>
                {component}
            </AchievementProvider>
        );
    };

    const COOKIE_NOTICE_SELECTOR = '[aria-label="Cookie Notice"]';

    beforeEach(() => {
        localStorage.clear();
    });

    test('Display the cookie notice', () => {
        act(() => renderWithProviders(<CookieNotice />));

        expect(document.body.querySelector(COOKIE_NOTICE_SELECTOR)).toBeInTheDocument();
    });

    test('Hide cookie notice once clicked', () => {
        act(() => renderWithProviders(<CookieNotice />));

        const button = screen.getByText('Yes');

        expect(button).toBeInTheDocument();
        expect(document.body.querySelector(COOKIE_NOTICE_SELECTOR)).toBeInTheDocument();

        // click the show button
        fireEvent.click(button);
        expect(document.body.querySelector(COOKIE_NOTICE_SELECTOR)).not.toBeInTheDocument();
        expect(localStorage.getItem(LS_COOKIE_ACKNOWLEDGE)).toEqual('true');
    });

    test('Hide cookie notice if they have already accepted', () => {
        localStorage.setItem(LS_COOKIE_ACKNOWLEDGE, 'true');

        act(() => renderWithProviders(<CookieNotice />));

        expect(document.body.querySelector(COOKIE_NOTICE_SELECTOR)).not.toBeInTheDocument();
    });

    test('Show cookie joke if you click no', () => {
        act(() => renderWithProviders(<CookieNotice />));

        const button = screen.getByText('No');

        expect(button).toBeInTheDocument();
        expect(document.body.querySelector(COOKIE_NOTICE_SELECTOR)).toBeInTheDocument();

        // Click the no button
        fireEvent.click(button);

        // Notice should stay on the screen (the joke is that rejecting cookies doesn't work)
        expect(document.body.querySelector(COOKIE_NOTICE_SELECTOR)).toBeInTheDocument();

        // localStorage should NOT be set when clicking no
        expect(localStorage.getItem(LS_COOKIE_ACKNOWLEDGE)).toBeNull();
    });
});

