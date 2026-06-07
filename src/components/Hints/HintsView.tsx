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
        // 4px vertical padding over a 16px line-height yields a ~24px tall
        // click target. minWidth/minHeight are a belt-and-suspenders guarantee
        // that the touch target meets WCAG 2.5.8 (Target Size, AA = 24x24 CSS px).
        padding: '4px 8px',
        minHeight: '24px',
        minWidth: '24px',
        font: 'inherit'
    };

    return (
        <>
            <button onClick={onToggle} data-testid="hints-toggle">{showHints ? 'Hide' : 'Show'} Hints</button>
            {showHints &&
                <table data-testid="hints-table">
                    <caption>Hints</caption>
                    <thead>
                        <tr>
                            <th scope="col">Command</th>
                            <th scope="col">Use</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <button
                                    onClick={handleHintClick}
                                    title='Click to copy command to input'
                                    style={hintButtonStyle}
                                    data-testid="hint-button"
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
                                    data-testid="hint-button"
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
                                    data-testid="hint-button"
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
