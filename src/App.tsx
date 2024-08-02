import './App.css';

import ShellPrompt from './ShellPrompt'
import CookieNotice from './CookieNotice';
import { useContext } from 'react';
import { TrackerContext } from './Tracker';

function App() {

  const tracker = useContext(TrackerContext);

  tracker.trackPageview();
  tracker.enableAutoOutboundTracking();

  return (
    <>
      <h1 id='page-desc'>Shaun Burdick's Console</h1>
      <div aria-describedby='page-desc'>
        <ShellPrompt />
        <CookieNotice />
      </div>
    </>
  );
}

export default App;
