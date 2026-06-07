import { createContext, use } from 'react';
import Plausible from 'plausible-tracker';

/**
 * Options for tracking events
 */
export const TRACKER_EVENTS: Record<string, { event: string; props?: Record<string, string> }> = {
    HistoryUpArrow: { event: 'History', props: { action: 'UpArrow' } },
    Help: { event: 'Help' },
    EasterEgg: { event: 'Easter Egg' },
    TabNav: { event: 'Tab' },
};

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
