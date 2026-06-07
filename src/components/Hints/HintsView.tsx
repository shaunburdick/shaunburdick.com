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
 * Hint button style object extracted outside the component to reduce function length.
 * 4px vertical padding over a 16px line-height yields a ~24px tall click target.
 * minWidth/minHeight are a belt-and-suspenders guarantee that the touch target
 * meets WCAG 2.5.8 (Target Size, AA = 24x24 CSS px).
 */
const hintButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'inherit',
    textDecoration: 'underline',
    cursor: 'pointer',
    padding: '4px 8px',
    minHeight: '24px',
    minWidth: '24px',
    font: 'inherit'
};

/**
 * Hints table data for rendering hint rows
 */
const HINTS = [
    { command: 'whois shaun', description: 'Show information on Shaun' },
    { command: 'version', description: 'Show app version and build info' },
    { command: 'rm -rf /', description: 'Delete all files' },
];

/**
 * Props for the HintRow component
 */
interface HintRowProps {
    /** The hint text/command to display */
    command: string;

    /** Description of what the hint command does */
    description: string;

    /** Callback when hint button is clicked */
    onHintClick: (hint: string) => void;
}

/**
 * Single hint row component (extracted for function length compliance)
 *
 * @param props - Component props
 * @returns Hint row JSX
 */
function HintRow({ command, description, onHintClick }: HintRowProps) {
    return (
        <tr>
            <td>
                <button
                    type="button"
                    onClick={() => onHintClick(command)}
                    title='Click to copy command to input'
                    style={hintButtonStyle}
                    data-testid="hint-button"
                >
                    {command}
                </button>
            </td>
            <td>{description}</td>
        </tr>
    );
}

/**
 * HintsTable component (extracted for function length compliance)
 *
 * @param props - Component props
 * @returns Hints table JSX
 */
function HintsTable({ onHintClick }: { onHintClick: (hint: string) => void }) {
    return (
        <table data-testid="hints-table">
            <caption>Hints</caption>
            <thead>
                <tr>
                    <th scope="col">Command</th>
                    <th scope="col">Use</th>
                </tr>
            </thead>
            <tbody>
                {HINTS.map((hint) => (
                    <HintRow
                        key={hint.command}
                        command={hint.command}
                        description={hint.description}
                        onHintClick={onHintClick}
                    />
                ))}
            </tbody>
        </table>
    );
}

/**
 * HintsView component (presentational)
 * Renders a toggleable table of command hints
 *
 * @param props - Component props
 * @returns Hints view JSX
 */
function HintsView({ showHints, onToggle, onHintClick }: HintsViewProps) {
    return (
        <>
            <button type="button" onClick={onToggle} data-testid="hints-toggle">
                {showHints ? 'Hide' : 'Show'} Hints
            </button>
            {showHints &&
                <HintsTable onHintClick={onHintClick} />
            }
        </>
    );
}

export default HintsView;
