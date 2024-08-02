import Plausible from 'plausible-tracker';
import { createContext } from 'react';

const tracker = Plausible({
  apiHost: 'https://analytics.public.burdick.dev'
});

export const TrackerContext = createContext(tracker);
