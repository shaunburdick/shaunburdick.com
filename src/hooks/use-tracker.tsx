import { createContext, use } from 'react';
import Plausible from 'plausible-tracker';

/**
 * Event names for Plausible analytics tracking
 */
export const TRACKER_EVENTS = {
    historyUpArrow: 'History',
    help: 'Help',
    easterEgg: 'Easter Egg',
    tabNav: 'Tab',
    achievementUnlocked: 'AchievementUnlocked',
    cookieAcknowledge: 'CookieAcknowledge',
    execCommand: 'ExecCommand',
    toggleHints: 'ToggleHints',
} as const;

const tracker = Plausible({
    domain: 'shaunburdick.com',
    apiHost: 'https://analytics.public.burdick.dev'
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
export function useTracker(): typeof tracker {
    return use(TrackerContext);
}
