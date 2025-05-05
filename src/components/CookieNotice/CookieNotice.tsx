import { useState } from 'react';
import { TRACKER_EVENTS, useTracker } from '../../hooks/useTracker';
import { useAchievements } from '../Achievements/Achievements';

/**
 * Local storage key for cookie acknowledgment state
 */
export const LS_COOKIE_ACKNOWLEDGE = 'cookieAcknowledge';

/**
 * Terminal-style cookie notice component
 * Displays a notification about cookie usage that the user can acknowledge
 * Contains an easter egg when clicking "No"
 *
 * @returns Terminal-styled React cookie notice component
 */
function CookieNotice() {

    const tracker = useTracker();
    const { unlockAchievement } = useAchievements();

    const initialShowCookie = (localStorage.getItem(LS_COOKIE_ACKNOWLEDGE) || 'false') !== 'true';
    const [showCookieMessage, setShowCookieMessage] = useState<boolean>(initialShowCookie);

    /**
     * Handle the user's response to cookie acknowledgment
     *
     * @param ack - Whether the user accepted cookies
     */
    const cookieAcknowledge = (ack: boolean) => {
        tracker.trackEvent(TRACKER_EVENTS.CookieAcknowledge, { props: { ack } });

        if (ack) {
            setShowCookieMessage(false);
            localStorage.setItem(LS_COOKIE_ACKNOWLEDGE, 'true');
            unlockAchievement('accept_cookies');
        } else {
            window.location.href = 'https://www.oreo.com/';
        }
    };

    return (
        <>
            {showCookieMessage &&
                <div style={{ position: 'fixed', bottom: 0, maxWidth: '750px', paddingRight: '2em' }}>
                    <pre aria-label="Cookie Notice">
                        This site uses cookies to feed its developer in an effort to get them to write code.
                        So far it seems to be working.
                        <br />
                        <br />
                        Do you acknowledge that this site uses cookies?
                        <div style={{ textAlign: 'right' }}>
                            <button onClick={() => cookieAcknowledge(true)}>Yes</button>
                            &nbsp;
                            <button onClick={() => cookieAcknowledge(false)}>No</button>
                        </div>
                    </pre>
                </div>
            }
        </>
    );
}

export default CookieNotice;
