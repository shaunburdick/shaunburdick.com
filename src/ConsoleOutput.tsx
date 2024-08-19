import React from 'react';

export type ConsoleLine = (string | React.JSX.Element)[];
export interface CommandResult {
    timestamp: Date;
    command?: string;
    response: ConsoleLine[];
};

interface ConsoleOutputProps {
    ariaLive?: React.AriaAttributes['aria-live'],
    commandResult?: CommandResult
};

/**
 * Creates a representation of a Console output
 *
 * @return JSX representing a Console output
 */
function ConsoleOutput({ ariaLive, commandResult }: ConsoleOutputProps) {

    return (
        <div style={{ marginTop: '1.5em' }} aria-live={ariaLive}>
            {commandResult &&
                <>
                    {'command' in commandResult &&
                    <span title={commandResult.timestamp.toISOString()} aria-label='The command that was run'>
                        {<span aria-hidden>$</span>} {commandResult?.command}
                    </span>}
                    {commandResult.response.map((commandLine, lineIndex) => (
                        <span key={lineIndex}>
                            {'\n'}{commandLine.reduce((result, item) => <>{result}{' '}{item}</>)}
                        </span>
                    ))}
                </>}
        </div>
    );
}

export default ConsoleOutput;
