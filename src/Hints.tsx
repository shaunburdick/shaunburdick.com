import { useContext, useState } from 'react';
import { TRACKER_EVENTS, TrackerContext } from './Tracker';

type HintsProps = {
    hintClick?: (hint: string) => void
};

function Hints({ hintClick }: HintsProps) {

    const tracker = useContext(TrackerContext);

    const [showHints, setShowHints] = useState<boolean>(false);

    const toggleHints = (ack: boolean) => {
        tracker.trackEvent(TRACKER_EVENTS.ToggleHints, { props: { ack } });
        setShowHints(ack);
    };

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
                            <td><a onClick={onHintClick} href='#' title='Click to copy command to input'>whois shaun</a></td>
                            <td>Show information on Shaun</td>
                        </tr>
                        <tr>
                            <td><a onClick={onHintClick} href='#' title='Click to copy command to input'>rm -rf /</a></td>
                            <td>Delete all files</td>
                        </tr>
                    </tbody>
                </table>
            }
        </>
    );
}

export default Hints;
