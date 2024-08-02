import Plausible from 'plausible-tracker';
import { createContext } from 'react';

const tracker = Plausible({
  domain: 'shaunburdick.com',
  apiHost: 'https://analytics.public.burdick.dev'
});

export const TrackerContext = createContext(tracker);
