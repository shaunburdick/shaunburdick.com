import React from 'react';

/**
 * Represents a single line of console output
 * Can contain both strings and React elements
 */
export type ConsoleLine = (string | React.JSX.Element)[];

/**
 * Represents a command execution result to be displayed in the console
 */
export interface CommandResult {
    /**
     * Timestamp when the command was executed
     */
    timestamp: Date;

    /**
     * The command that was executed (optional)
     */
    command?: string;

    /**
     * The response lines from running the command
     */
    response: ConsoleLine[];
}

/**
 * Props for the ConsoleOutput component
 */
interface ConsoleOutputProps {
    /**
     * ARIA live region attribute for accessibility announcements
     */
    ariaLive?: React.AriaAttributes['aria-live'],

    /**
     * The command result to display
     */
    commandResult?: CommandResult
}

/**
 * Join the cells of a single console line with single spaces.
 *
 * Implemented as a loop rather than `Array#reduce` and without a `.map()` of
 * children, so no array-index keys are needed. Cells that are JSX (links,
 * avatars) are kept as elements rather than being stringified.
 *
 * @param cells - Cells making up one console line
 * @returns The joined line as a single child, or null for an empty line
 */
export function joinConsoleLine(cells: ConsoleLine): React.ReactNode {
    let joined: React.ReactNode = null;

    for (const cell of cells) {
        joined = joined === null
            ? cell
            : <>{joined}{' '}{cell}</>;
    }

    return joined;
}

/**
 * Creates a representation of a Console output
 * Displays the command that was run and its response
 *
 * @param props - Component props
 * @param props.ariaLive - ARIA live region attribute for accessibility
 * @param props.commandResult - The command result to display
 * @returns JSX representing a Console output
 */
function ConsoleOutput({ ariaLive, commandResult }: ConsoleOutputProps) {
    let responseSpans: React.JSX.Element[] | undefined;

    if (commandResult !== undefined) {
        const spans: React.JSX.Element[] = [];
        for (const commandLine of commandResult.response) {
            const key = `line-${spans.length}`;
            spans.push(
                <span key={key}>
                    {'\n'}{joinConsoleLine(commandLine)}
                </span>
            );
        }
        responseSpans = spans;
    }

    return (
        <div style={{ marginTop: '1.5em' }} aria-live={ariaLive}>
            {commandResult !== undefined &&
                <>
                    {'command' in commandResult &&
                    <span title={commandResult.timestamp.toISOString()} aria-label='The command that was run'>
                        {<span aria-hidden>$</span>} {commandResult.command}
                    </span>}
                    {responseSpans}
                </>}
        </div>
    );
}

export default ConsoleOutput;
