import { createContext, use } from 'react';
import Plausible from 'plausible-tracker';

/**
 * Event names for Plausible analytics tracking
 */
export const TRACKER_EVENTS = {
    HistoryUpArrow: 'History',
    Help: 'Help',
    EasterEgg: 'Easter Egg',
    TabNav: 'Tab',
    AchievementUnlocked: 'AchievementUnlocked',
    CookieAcknowledge: 'CookieAcknowledge',
    ExecCommand: 'ExecCommand',
    ToggleHints: 'ToggleHints',
} as const;

const tracker = Plausible({
    domain: 'shaunburdick.com',
    apiHost: 'https://plausible.io'
});

/**
 * React context for making the tracker available throughout the app
 */
export const TrackerContext = createContext(tracker);

/**
 * Custom hook to access the tracker instance
 *
 * @returns Plausible tracker instance for tracking events and pageviews
 */
export const useTracker = () => use(TrackerContext);
