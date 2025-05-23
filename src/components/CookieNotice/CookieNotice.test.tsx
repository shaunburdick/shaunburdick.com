import React, { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AchievementProvider } from '../Achievements/Achievements';
import CookieNotice, { LS_COOKIE_ACKNOWLEDGE } from './CookieNotice';

describe('CookieNotice', () => {
    // Helper function to wrap component with providers
    const renderWithProviders = (component: React.ReactElement) => {
        return render(
            <AchievementProvider>
                {component}
            </AchievementProvider>
        );
    };

    beforeEach(() => {
        localStorage.clear();
    });

    test('Display the cookie notice', () => {
        act(() => renderWithProviders(<CookieNotice />));

        expect(document.body.querySelector('[aria-label="Cookie Notice"]')).toBeInTheDocument();
    });

    test('Hide cookie notice once clicked', () => {
        act(() => renderWithProviders(<CookieNotice />));

        const button = screen.getByText('Yes');

        expect(button).toBeInTheDocument();
        expect(document.body.querySelector('[aria-label="Cookie Notice"]')).toBeInTheDocument();

        // click the show button
        fireEvent.click(button);
        expect(document.body.querySelector('[aria-label="Cookie Notice"]')).not.toBeInTheDocument();
        expect(localStorage.getItem(LS_COOKIE_ACKNOWLEDGE)).toEqual('true');
    });

    test('Hide cookie notice if they have already accepted', () => {
        localStorage.setItem(LS_COOKIE_ACKNOWLEDGE, 'true');

        act(() => renderWithProviders(<CookieNotice />));

        expect(document.body.querySelector('[aria-label="Cookie Notice"]')).not.toBeInTheDocument();
    });

    test('Show cookie joke if you click no', () => {
        const { location } = window;
        const getHrefSpy = jest.fn(() => 'example.com');
        const setHrefSpy = jest.fn(href => href);

        // @ts-expect-error - clear out the locations object and redefine
        delete window.location;
        // @ts-expect-error - set an empty object to fill
        window.location = {};

        Object.defineProperty(window.location, 'href', {
            get: getHrefSpy,
            set: setHrefSpy,
        });

        act(() => renderWithProviders(<CookieNotice />));

        const button = screen.getByText('No');

        expect(button).toBeInTheDocument();
        expect(document.body.querySelector('[aria-label="Cookie Notice"]')).toBeInTheDocument();

        // click the show button
        fireEvent.click(button);

        expect(setHrefSpy).toHaveBeenCalledTimes(1);
        expect(setHrefSpy).toHaveBeenCalledWith(
            'https://www.oreo.com/',
        );

        // notice should stay on the screen
        expect(document.body.querySelector('[aria-label="Cookie Notice"]')).toBeInTheDocument();

        Object.defineProperty(window, 'location', {
            value: location,
            writable: true,
        });
    });
});

