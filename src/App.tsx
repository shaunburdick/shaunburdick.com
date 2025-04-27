import './App.css';

import { useContext } from 'react';
import ShellPrompt from './components/ShellPrompt/ShellPrompt';
import CookieNotice from './components/CookieNotice/CookieNotice';
import { TrackerContext } from './Tracker';
import { Notifications } from './components/Notification/Notification';

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
