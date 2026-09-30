import './App.css';

import ShellPrompt from './containers/ShellPrompt';
import CookieNotice from './containers/CookieNotice';
import { TRACKER_EVENTS, useTracker } from './hooks/use-tracker';
import { Notifications, useNotification } from './containers/NotificationProvider';
import { useEvent } from './hooks';

/**
 * Main application component
 * Sets up event tracking, event listeners, and renders the main terminal interface
 *
 * @returns The main application component with terminal-style UI
 */
export default function App(): React.JSX.Element {

    const tracker = useTracker();
    const notifications = useNotification();

    // Notification auto-dismiss timeout in milliseconds
    const NOTIFICATION_DURATION = 5000;

    /**
     * Listen for achievement events and display notifications
     */
    useEvent('onAchievement', (achievement) => {
        notifications.add(
            { title: `Achievement Unlocked: ${achievement.title}`, body: achievement.description },
            NOTIFICATION_DURATION
        );
        tracker.trackEvent(TRACKER_EVENTS.achievementUnlocked, {
            props: {
                achievement: achievement.id
            }
        });
    });

    /**
     * Track command execution events
     */
    useEvent('onCommand', ({ command }) => {
        tracker.trackEvent(TRACKER_EVENTS.execCommand,
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
