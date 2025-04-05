import './App.css';

import { useContext } from 'react';
import ShellPrompt from './ShellPrompt';
import CookieNotice from './CookieNotice';
import { TrackerContext } from './Tracker';
import { Notifications } from './Notification';

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
                <Notifications />
            </div>
        </>
    );
}

export default App;
