import { useState } from 'react';
import { TRACKER_EVENTS, useTracker } from '../hooks/useTracker';
import HintsView from '../components/Hints/HintsView';

/**
 * Props for the Hints container component
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
 * Hints container component
 * Manages state and side effects for hints display
 *
 * @param props - Component props
 * @returns Hints container
 */
function Hints({ hintClick }: HintsProps) {
    const tracker = useTracker();
    const [showHints, setShowHints] = useState<boolean>(false);

    /**
     * Toggle the visibility of hints and track the event
     */
    const handleToggle = () => {
        const newState = !showHints;
        tracker.trackEvent(TRACKER_EVENTS.ToggleHints, { props: { ack: newState } });
        setShowHints(newState);
    };

    /**
     * Handle click on a hint
     *
     * @param hint - The hint text that was clicked
     */
    const handleHintClick = (hint: string) => {
        if (hintClick) {
            hintClick(hint);
        }
    };

    return (
        <HintsView
            showHints={showHints}
            onToggle={handleToggle}
            onHintClick={handleHintClick}
        />
    );
}

export default Hints;
