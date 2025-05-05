import Plausible from 'plausible-tracker';
import { createContext, useContext } from 'react';

/**
 * Event types used for analytics tracking throughout the application
 */
export const TRACKER_EVENTS = Object.freeze({
    /** Fired when an achievement is unlocked */
    AchievementUnlocked: 'achievementUnlocked',

    /** Fired when user acknowledges cookie notice */
    CookieAcknowledge: 'cookieAcknowledge',

    /** Fired when a command is executed */
    ExecCommand: 'execCommand',

    /** Fired when user navigates command history with up arrow */
    HistoryUpArrow: 'historyUpArrow',

    /** Fired when user toggles hint display */
    ToggleHints: 'toggleHints'
});

/**
 * Initialize the Plausible analytics tracker
 */
const tracker = Plausible({
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
export const useTracker = () => useContext(TrackerContext);
