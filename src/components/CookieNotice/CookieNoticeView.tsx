/**
 * Props for CookieNoticeView component
 */
interface CookieNoticeViewProps {
    /**
     * Whether to show the cookie notice
     */
    show: boolean;

    /**
     * Callback when user accepts cookies
     */
    onAccept: () => void;

    /**
     * Callback when user rejects cookies
     */
    onReject: () => void;
}

/**
 * CookieNotice view component (presentational)
 * Renders the cookie acknowledgment notice
 *
 * @param props - Component props
 * @returns Cookie notice JSX
 */
function CookieNoticeView({ show, onAccept, onReject }: CookieNoticeViewProps) {
    if (!show) {
        return null;
    }

    return (
        <div
            style={{ position: 'fixed', bottom: 0, maxWidth: '750px', paddingRight: '2em' }}
            data-testid="cookie-notice"
        >
            <pre aria-label="Cookie Notice">
                This site uses cookies to feed its developer in an effort to get them to write code.
                So far it seems to be working.
                <br />
                <br />
                Do you acknowledge that this site uses cookies?
                <div style={{ textAlign: 'right' }}>
                    <button onClick={onAccept} data-testid="cookie-accept">Yes</button>
                    &nbsp;
                    <button onClick={onReject} data-testid="cookie-reject">No</button>
                </div>
            </pre>
        </div>
    );
}

export default CookieNoticeView;
