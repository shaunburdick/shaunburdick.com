import { useState } from 'react';
import CookieNoticeView from '../components/CookieNotice/CookieNoticeView';
import { TRACKER_EVENTS, useTracker } from '../hooks/useTracker';
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

    const initialShowCookie = (localStorage.getItem(LS_COOKIE_ACKNOWLEDGE) || 'false') !== 'true';
    const [showCookieMessage, setShowCookieMessage] = useState<boolean>(initialShowCookie);

    /**
     * Handle the user accepting cookies
     */
    const handleAccept = () => {
        tracker.trackEvent(TRACKER_EVENTS.CookieAcknowledge, { props: { ack: true } });
        setShowCookieMessage(false);
        localStorage.setItem(LS_COOKIE_ACKNOWLEDGE, 'true');
        unlockAchievement('accept_cookies');
    };

    /**
     * Handle the user rejecting cookies (easter egg)
     */
    const handleReject = () => {
        tracker.trackEvent(TRACKER_EVENTS.CookieAcknowledge, { props: { ack: false } });
        window.location.href = 'https://www.oreo.com/';
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
