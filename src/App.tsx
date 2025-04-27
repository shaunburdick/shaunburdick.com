import './App.css';

import { useContext } from 'react';
import ShellPrompt from './components/ShellPrompt/ShellPrompt';
import CookieNotice from './components/CookieNotice/CookieNotice';
import { TRACKER_EVENTS, TrackerContext } from './Tracker';
import { Notifications, useNotification } from './components/Notification/Notification';
import { useEvent } from './hooks';

function App() {

    const tracker = useContext(TrackerContext);
    const notifications = useNotification();
    useEvent('onAchievement', (achievement) => {
        notifications.add(`Achievement Unlocked: ${achievement.title}`, 5000);
        tracker.trackEvent(TRACKER_EVENTS.AchievementUnlocked, {
            props: {
                achievement: achievement.id
            }
        });
    });

    useEvent('onCommand', ({ command }) => {
        tracker.trackEvent(TRACKER_EVENTS.ExecCommand,
            { props: { commandName: command.name, args: command.args.join(' ') } });
    });


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
