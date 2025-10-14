import './App.css';

import ShellPrompt from './components/ShellPrompt/ShellPrompt';
import CookieNotice from './components/CookieNotice/CookieNotice';
import { TRACKER_EVENTS, useTracker } from './hooks/useTracker';
import { Notifications, useNotification } from './components/Notification/Notification';
import { useEvent } from './hooks';

/**
 * Main application component
 * Sets up event tracking, event listeners, and renders the main terminal interface
 *
 * @returns The main application component with terminal-style UI
 */
function App() {

    const tracker = useTracker();
    const notifications = useNotification();

    /**
     * Listen for achievement events and display notifications
     */
    useEvent('onAchievement', (achievement) => {
        notifications.add({ title: `Achievement Unlocked: ${achievement.title}`, body: achievement.description }, 5000);
        tracker.trackEvent(TRACKER_EVENTS.AchievementUnlocked, {
            props: {
                achievement: achievement.id
            }
        });
    });

    /**
     * Track command execution events
     */
    useEvent('onCommand', ({ command }) => {
        tracker.trackEvent(TRACKER_EVENTS.ExecCommand,
            { props: { commandName: command.name, args: command.args.join(' ') } });
    });


    tracker.trackPageview();
    tracker.enableAutoOutboundTracking();

    return (
        <>
            <h1 id='page-desc'>Shaun Burdick&apos;s Console</h1>
            <div aria-describedby='page-desc'>
                <ShellPrompt />
                <CookieNotice />
                <Notifications />
            </div>
        </>
    );
}

export default App;
