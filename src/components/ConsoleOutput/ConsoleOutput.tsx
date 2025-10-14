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
 * Creates a representation of a Console output
 * Displays the command that was run and its response
 *
 * @param props - Component props
 * @param props.ariaLive - ARIA live region attribute for accessibility
 * @param props.commandResult - The command result to display
 * @returns JSX representing a Console output
 */
function ConsoleOutput({ ariaLive, commandResult }: ConsoleOutputProps) {

    return (
        <div style={{ marginTop: '1.5em' }} aria-live={ariaLive}>
            {commandResult &&
                <>
                    {'command' in commandResult &&
                    <span title={commandResult.timestamp.toISOString()} aria-label='The command that was run'>
                        {<span aria-hidden>$</span>} {commandResult.command}
                    </span>}
                    {commandResult.response.map((commandLine, lineIndex) => (
                        // It's a line number at this point, not a unique ID
                        // eslint-disable-next-line react/no-array-index-key
                        <span key={lineIndex}>
                            {'\n'}{commandLine.reduce((result, item) => <>{result}{' '}{item}</>)}
                        </span>
                    ))}
                </>}
        </div>
    );
}

export default ConsoleOutput;
