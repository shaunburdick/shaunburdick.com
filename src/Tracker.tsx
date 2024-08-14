import Plausible from 'plausible-tracker';
import { createContext } from 'react';

export const TRACKER_EVENTS = Object.freeze({
    CookieAcknowledge: 'cookieAcknowledge',
    ExecCommand: 'execCommand',
    HistoryUpArrow: 'historyUpArrow',
    ToggleHints: 'toggleHints'
});

const tracker = Plausible({
    apiHost: 'https://analytics.public.burdick.dev'
});

export const TrackerContext = createContext(tracker);
