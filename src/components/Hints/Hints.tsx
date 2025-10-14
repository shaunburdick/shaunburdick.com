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
     * Handle click on a hint button
     *
     * @param event - The click event
     */
    const onHintClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (hintClick) {
            hintClick(event.currentTarget.textContent || '');
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
                                <button
                                    onClick={onHintClick}
                                    title='Click to copy command to input'
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'inherit',
                                        textDecoration: 'underline',
                                        cursor: 'pointer',
                                        padding: 0,
                                        font: 'inherit'
                                    }}
                                >
                                    whois shaun
                                </button>
                            </td>
                            <td>Show information on Shaun</td>
                        </tr>
                        <tr>
                            <td>
                                <button
                                    onClick={onHintClick}
                                    title='Click to copy command to input'
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'inherit',
                                        textDecoration: 'underline',
                                        cursor: 'pointer',
                                        padding: 0,
                                        font: 'inherit'
                                    }}
                                >
                                    version
                                </button>
                            </td>
                            <td>Show app version and build info</td>
                        </tr>
                        <tr>
                            <td>
                                <button
                                    onClick={onHintClick}
                                    title='Click to copy command to input'
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'inherit',
                                        textDecoration: 'underline',
                                        cursor: 'pointer',
                                        padding: 0,
                                        font: 'inherit'
                                    }}
                                >
                                    rm -rf /
                                </button>
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
