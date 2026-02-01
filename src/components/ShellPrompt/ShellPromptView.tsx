import React, { useRef, useEffect } from 'react';
import ConsoleOutput, { CommandResult } from '../ConsoleOutput/ConsoleOutput';
import Hints from '../../containers/Hints';
import './ShellPrompt.css';

/**
 * Props for the ShellPromptView component
 */
interface ShellPromptViewProps {
    /**
     * Array of command results to display in the console
     */
    consoleLines: CommandResult[];

    /**
     * The most recent command result to display with aria-live
     */
    lastCommand?: CommandResult;

    /**
     * Callback when a command is submitted
     *
     * @param command - The command string entered by the user
     */
    onSubmit: (command: string) => void;

    /**
     * Callback for keyboard events on the input
     */
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;

    /**
     * Callback when a hint is clicked
     */
    onHintClick: (hint: string) => void;

    /**
     * Ref to access the input element externally
     */
    inputRef: React.RefObject<HTMLInputElement | null>;

    /**
     * Value to set in the input (for command history navigation)
     */
    inputValue?: string;
}

/**
 * ShellPromptView component (presentational)
 * Renders an interactive shell prompt interface
 *
 * @param props - Component props
 * @returns Shell prompt view JSX
 */
function ShellPromptView({
    consoleLines,
    lastCommand,
    onSubmit,
    onKeyDown,
    onHintClick,
    inputRef,
    inputValue
}: ShellPromptViewProps) {
    const preBottomRef = useRef<HTMLSpanElement | null>(null);

    /**
     * Handle form submission
     */
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (inputRef.current) {
            const command = inputRef.current.value.trimEnd();
            onSubmit(command);
            inputRef.current.value = '';
        }
    };

    /**
     * Update input value when it changes (for history navigation)
     */
    useEffect(() => {
        if (inputValue !== undefined && inputRef.current !== null) {
            inputRef.current.value = inputValue;
        }
    }, [inputValue, inputRef]); // Include all dependencies

    /**
     * Scroll the console window to the bottom of the latest command
     * each time a new command line is added
     */
    useEffect(() => {
        // wait for a loop so content can load
        setTimeout(() => {
            // this causes timing issues with some tests, better safe to check the method exists
            if (preBottomRef.current?.scrollIntoView) {
                // jsDom doesn't support scrolling
                /* istanbul ignore next */
                preBottomRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }, [consoleLines]);

    return (
        <div className="shell" data-testid="shell-prompt">
            <pre className='prompt'
                data-testid="console-output"
                aria-label='A text-based console.'
                // *eslint-disable-next-line jsx-a11y/aria-props
                aria-description='This area is meant to depict an older styled computer console
                where commands can be typed and responses will be shown.'>
                {consoleLines.slice(0, -1).map((commandResult, commandIndex) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <ConsoleOutput key={commandIndex} commandResult={commandResult}/>
                ))}
                {/*
                  * aria-live works best when the element is always present and visible on the page
                  * To make the console outputs announce consistently, I take the last item from the
                  * consoleLines and update a persisted output. That way the element is not being redrawn
                  * on each update
                  */}
                <div style={{ marginTop: '1.5em' }} aria-live='polite'>
                    {lastCommand &&
                        <>
                            {'command' in lastCommand &&
                            <span title={lastCommand.timestamp.toISOString()} aria-label='The command that was run'>
                                {<span aria-hidden>$</span>} {lastCommand.command}
                            </span>}
                            {lastCommand.response.map((commandLine, lineIndex) => (
                                // eslint-disable-next-line react/no-array-index-key
                                <span key={lineIndex}>
                                    {'\n'}{commandLine.reduce((result, item) => <>{result}{' '}{item}</>)}
                                </span>
                            ))}
                        </>}
                </div>
                <span ref={preBottomRef} />
            </pre>
            <form onSubmit={handleSubmit} data-testid="command-form">
                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                    <span aria-hidden>$ </span>
                    <input
                        id='console-input'
                        data-testid="console-input"
                        placeholder='Type `help` for assistance.'
                        style={{ width: '100%', marginLeft: '1em' }}
                        ref={inputRef}
                        onKeyDown={onKeyDown}
                        autoCorrect='off'
                        autoCapitalize='none'
                        spellCheck={false}
                        aria-label='An input to enter commands.'
                    />
                </div>
            </form>
            <Hints hintClick={onHintClick} />
        </div>
    );
}

export default ShellPromptView;
