import { useState } from 'react';
import CookieNoticeView from '../components/CookieNotice/CookieNoticeView';
import { TRACKER_EVENTS, useTracker } from '../hooks/use-tracker';
import { useAchievements } from './AchievementProvider';

/**
 * Local storage key for cookie acknowledgment state
 */
export const LS_COOKIE_ACKNOWLEDGE = 'cookieAcknowledge';

/**
 * CookieNotice container component
 * Manages cookie acknowledgment state and side effects
 *
 * @returns Cookie notice container
 */
function CookieNotice() {
    const tracker = useTracker();
    const { unlockAchievement } = useAchievements();

    const [showCookieMessage, setShowCookieMessage] = useState<boolean>(() => {
        return (localStorage.getItem(LS_COOKIE_ACKNOWLEDGE) ?? 'false') !== 'true';
    });

    /**
     * Handle the user accepting cookies
     */
    const handleAccept = () => {
        tracker.trackEvent(TRACKER_EVENTS.cookieAcknowledge, { props: { ack: true } });
        setShowCookieMessage(false);
        localStorage.setItem(LS_COOKIE_ACKNOWLEDGE, 'true');
        unlockAchievement('accept_cookies');
    };

    /**
     * Handle the user rejecting cookies (easter egg)
     */
    const handleReject = () => {
        tracker.trackEvent(TRACKER_EVENTS.cookieAcknowledge, { props: { ack: false } });
        location.assign('https://www.oreo.com/');
    };

    return (
        <CookieNoticeView
            show={showCookieMessage}
            onAccept={handleAccept}
            onReject={handleReject}
        />
    );
}

export default CookieNotice;
