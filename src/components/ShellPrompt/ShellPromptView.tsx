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
     * Current value of the input (controlled value)
     */
    inputValue: string;

    /**
     * Callback when the input value changes
     */
    onInputChange: (value: string) => void;
}

/**
 * Props for the CommandOutputLastCommand component
 */
interface LastCommandOutputProps {
    /** The command result to display */
    commandResult: CommandResult;
}

/**
 * Renders the last command with its response in an aria-live region
 *
 * @param props - Component props
 * @returns Last command output JSX
 */
function LastCommandOutput({ commandResult }: LastCommandOutputProps) {
    const responseLines: React.JSX.Element[] = [];
    for (const commandLine of commandResult.response) {
        const key = `line-${responseLines.length}`;
        responseLines.push(
            <span key={key}>
                {'\n'}{commandLine.reduce((result, item) => <>{result}{' '}{item}</>)}
            </span>
        );
    }

    return (
        <div style={{ marginTop: '1.5em' }} aria-live='polite'>
            {'command' in commandResult &&
                <span title={commandResult.timestamp.toISOString()} aria-label='The command that was run'>
                    {<span aria-hidden>$</span>} {commandResult.command}
                </span>}
            {responseLines}
        </div>
    );
}

/**
 * Props for the ShellForm component
 */
interface ShellFormProps {
    /** Ref to the input element */
    inputRef: React.RefObject<HTMLInputElement | null>;
    /** Callback when form is submitted */
    onSubmit: (command: string) => void;
    /** Callback for keyboard events on the input */
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    /** Current value of the controlled input */
    value: string;
    /** Callback when the input value changes */
    onChange: (value: string) => void;
}

/**
 * Renders the shell command input form
 *
 * @param props - Component props
 * @returns Shell form JSX
 */
function ShellForm({ inputRef, onSubmit, onKeyDown, value, onChange }: ShellFormProps) {
    /**
     * Handle form submission
     */
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const command = value.trimEnd();
        onSubmit(command);
    };

    return (
        <form onSubmit={handleSubmit} data-testid="command-form">
            <div style={{ display: 'flex', alignItems: 'stretch' }}>
                <span aria-hidden>$ </span>
                <input
                    id='console-input'
                    data-testid="console-input"
                    placeholder='Type `help` for assistance.'
                    style={{ width: '100%', marginLeft: '1em' }}
                    ref={inputRef}
                    value={value}
                    onChange={(event) => {
                        onChange(event.target.value);
                    }}
                    onKeyDown={onKeyDown}
                    autoCorrect='off'
                    autoCapitalize='none'
                    spellCheck={false}
                    aria-label='An input to enter commands.'
                />
            </div>
        </form>
    );
}

/**
 * Custom hook that scrolls the console to the bottom when consoleLines changes
 *
 * @param consoleLines - Array of command results to track for scrolling
 */
function useScrollToBottom(consoleLines: CommandResult[]) {
    const preBottomRef = useRef<HTMLSpanElement | null>(null);

    useEffect(() => {
        const timerId = setTimeout(() => {
            if (preBottomRef.current?.scrollIntoView) {
                preBottomRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        });

        return () => clearTimeout(timerId);
    }, [consoleLines]);

    return preBottomRef;
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
    inputValue,
    onInputChange
}: ShellPromptViewProps) {
    const consoleOutputs: React.JSX.Element[] = [];
    for (const commandResult of consoleLines.slice(0, -1)) {
        const key = `cmd-${consoleOutputs.length}`;
        consoleOutputs.push(<ConsoleOutput key={key} commandResult={commandResult}/>);
    }

    const preBottomRef = useScrollToBottom(consoleLines);

    return (
        <div className="shell" data-testid="shell-prompt">
            <pre className='prompt'
                data-testid="console-output"
                aria-label='A text-based console.'
                aria-description='This area is meant to depict an older styled computer console
                where commands can be typed and responses will be shown.'>
                {consoleOutputs}
                {lastCommand && <LastCommandOutput commandResult={lastCommand} />}
                <span ref={preBottomRef} />
            </pre>
            <ShellForm
                inputRef={inputRef}
                onSubmit={onSubmit}
                onKeyDown={onKeyDown}
                value={inputValue}
                onChange={onInputChange}
            />
            <Hints hintClick={onHintClick} />
        </div>
    );
}

export default ShellPromptView;
