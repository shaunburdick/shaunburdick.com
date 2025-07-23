import { useState } from 'react';
import { TRACKER_EVENTS, useTracker } from '../../hooks/useTracker';

/**
 * Props for the Hints component
 */
interface HintsProps {
    /**
     * Callback function when a hint is clicked
     *
     * @param hint - The hint text that was clicked
     */
    hintClick?: (hint: string) => void
}

/**
 * Terminal-style Hints component
 * Displays a toggleable table of command hints that can be clicked to populate the console input
 *
 * @param props - Component props
 * @param props.hintClick - Optional callback for when a hint is clicked
 * @returns Terminal-styled React component with command hints
 */
function Hints({ hintClick }: HintsProps) {

    const tracker = useTracker();

    const [showHints, setShowHints] = useState<boolean>(false);

    /**
     * Toggle the visibility of hints and track the event
     *
     * @param ack - Whether to show or hide hints
     */
    const toggleHints = (ack: boolean) => {
        tracker.trackEvent(TRACKER_EVENTS.ToggleHints, { props: { ack } });
        setShowHints(ack);
    };

    /**
     * Handle click on a hint link
     *
     * @param event - The click event
     */
    const onHintClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if (hintClick) {
            hintClick(event.currentTarget.text);
        }
    };

    return (
        <>
            <button onClick={() => toggleHints(!showHints)}>{showHints ? 'Hide' : 'Show'} Hints</button>
            {showHints &&
                <table>
                    <caption>Hints</caption>
                    <thead>
                        <tr>
                            <th>Command</th>
                            <th>Use</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <a onClick={onHintClick} href='#' title='Click to copy command to input'>whois shaun</a>
                            </td>
                            <td>Show information on Shaun</td>
                        </tr>
                        <tr>
                            <td>
                                <a onClick={onHintClick} href='#' title='Click to copy command to input'>version</a>
                            </td>
                            <td>Show app version and build info</td>
                        </tr>
                        <tr>
                            <td>
                                <a onClick={onHintClick} href='#' title='Click to copy command to input'>rm -rf /</a>
                            </td>
                            <td>Delete all files</td>
                        </tr>
                    </tbody>
                </table>
            }
        </>
    );
}

export default Hints;
