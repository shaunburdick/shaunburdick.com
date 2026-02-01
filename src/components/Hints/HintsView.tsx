import React from 'react';

/**
 * Props for the HintsView component
 */
interface HintsViewProps {
    /**
     * Whether hints are currently shown
     */
    showHints: boolean;

    /**
     * Callback when toggle button is clicked
     */
    onToggle: () => void;

    /**
     * Callback when a hint is clicked
     *
     * @param hint - The hint text that was clicked
     */
    onHintClick: (hint: string) => void;
}

/**
 * HintsView component (presentational)
 * Renders a toggleable table of command hints
 *
 * @param props - Component props
 * @returns Hints view JSX
 */
function HintsView({ showHints, onToggle, onHintClick }: HintsViewProps) {
    /**
     * Handle click on a hint button
     *
     * @param event - The click event
     */
    const handleHintClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        onHintClick(event.currentTarget.textContent || '');
    };

    const hintButtonStyle = {
        background: 'none',
        border: 'none',
        color: 'inherit',
        textDecoration: 'underline',
        cursor: 'pointer',
        padding: 0,
        font: 'inherit'
    };

    return (
        <>
            <button onClick={onToggle}>{showHints ? 'Hide' : 'Show'} Hints</button>
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
                                    onClick={handleHintClick}
                                    title='Click to copy command to input'
                                    style={hintButtonStyle}
                                >
                                    whois shaun
                                </button>
                            </td>
                            <td>Show information on Shaun</td>
                        </tr>
                        <tr>
                            <td>
                                <button
                                    onClick={handleHintClick}
                                    title='Click to copy command to input'
                                    style={hintButtonStyle}
                                >
                                    version
                                </button>
                            </td>
                            <td>Show app version and build info</td>
                        </tr>
                        <tr>
                            <td>
                                <button
                                    onClick={handleHintClick}
                                    title='Click to copy command to input'
                                    style={hintButtonStyle}
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

export default HintsView;
