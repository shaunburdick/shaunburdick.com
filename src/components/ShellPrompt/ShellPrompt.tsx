import React, { useState, useRef, useEffect } from 'react';
import Hints from '../Hints/Hints';
import ConsoleOutput, { CommandResult, ConsoleLine } from '../ConsoleOutput/ConsoleOutput';
import { TRACKER_EVENTS, useTracker } from '../../hooks/useTracker';
import { USERS } from '../../Users';
import { commandsWithContext } from '../../Command';
import './ShellPrompt.css';
import { useNotification } from '../Notification/Notification';
import { useEvent } from '../../hooks';
import { useAchievements } from '../Achievements/Achievements';

export const LS_KEY_LAST_LOGIN = 'lastLogin';
export const LS_KEY_COMMAND_HISTORY = 'commandHistory';

/**
 * Creates an interactive shell prompt that allows users to run commands
 * The commands attempt to replicate a common bash shell interface
 * with fun little quirks
 *
 * @return JSX representing a Shell Prompt
 */
function ShellPrompt() {
    const tracker = useTracker();
    const notifications = useNotification();
    const achievements = useAchievements();
    const commandUpdateEvent = useEvent('onCommand');
    const LAST_LOGIN = localStorage.getItem(LS_KEY_LAST_LOGIN) || 'never';

    const WELCOME_MESSAGE: CommandResult = {
        timestamp: new Date(),
        response: [
            ['****************************************'],
            ['Welcome to Shaun Burdick\'s Console!'],
            ['****************************************'],
            ['Your last login was:', <span key={LAST_LOGIN} aria-label='Last Login Timestamp'>{LAST_LOGIN}</span>],
            ['Type `help` for assistance.'],
            [''],
        ]
    };

    const DEFAULT_ENVIRONMENT = new Map([
        ['SHELL', '/bin/blah'],
        ['USER', 'you']
    ]);

    const DEFAULT_COMMAND_POINTER = 0;
    let defaultCommandHistory = [];
    try {
        const storedCommandHistory = localStorage.getItem(LS_KEY_COMMAND_HISTORY);
        defaultCommandHistory = storedCommandHistory !== null ? JSON.parse(storedCommandHistory) : [];
    } catch {
        localStorage.setItem(LS_KEY_COMMAND_HISTORY, '[]');
    }

    const [consoleLines, setConsoleLines] = useState<CommandResult[]>([WELCOME_MESSAGE]);
    const [commandHistory, setCommandHistory] = useState<string[]>(defaultCommandHistory);
    const [commandPointer, setCommandPointer] = useState<number>(DEFAULT_COMMAND_POINTER);
    const [lastCommand, setLastCommand] = useState<CommandResult | undefined>(WELCOME_MESSAGE);
    const [environment/* , setEnvironment*/] = useState<Map<string,string>>(DEFAULT_ENVIRONMENT);
    const [workingDir/* , setWorkingDir*/] = useState<string>('/');
    const inputRef = useRef<HTMLInputElement | null>(null);
    const preBottomRef = useRef<HTMLSpanElement | null>(null);

    const COMMANDS = commandsWithContext({
        commandHistory,
        environment,
        setConsoleLines,
        setLastCommand,
        workingDir,
        users: USERS,
        notifications,
        achievements
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
    };

    const execCommand = (commandName: string, ...args: string[]): ConsoleLine[] => {
        // Add the "first_command" achievement
        if (commandHistory.length === 0) {
            achievements.unlockAchievement('first_command');
        }

        const command = COMMANDS.get(commandName.toLowerCase());
        let result = [];
        if (command) {
            result = command.run(...args);
        } else {
            result = [
                ['Unknown Command: ', commandName],
                ['Type `help` for assistance']
            ];
        }

        commandUpdateEvent.dispatch({
            command: { name: commandName.toLowerCase(), args },
            result
        });

        return result;
    };

    const handleEnterKey = () => {
        if (inputRef.current) {
            const input = inputRef.current.value.trimEnd();
            const newCommandResult: CommandResult = {
                timestamp: new Date(),
                command: input,
                response: [['']]
            };

            // add to history
            setCommandHistory([...commandHistory, input]);            if (newCommandResult.command) {
                // execute command
                const [command, ...args] = newCommandResult.command.split(' ');
                newCommandResult.response = typeof command === 'string' && command.length > 0 ?
                    execCommand(command, ...args as string[]) : [['']];
            }

            // clear input
            inputRef.current.value = '';
            // set last command
            setLastCommand(newCommandResult);
            // write lines
            setConsoleLines([...consoleLines, newCommandResult]);
            // reset command pointer
            setCommandPointer(0);
        }
    };

    const handleTabKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // if input is empty, allow them to tab out
        if (inputRef.current?.value) {
            // add tab completion?
            event.preventDefault();
        }
    };

    const handleArrowUpKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        tracker.trackEvent(TRACKER_EVENTS.HistoryUpArrow);
        if (commandPointer < commandHistory.length) {
            setCommandPointer(commandPointer + 1);
        }
    };

    const handleArrowDownKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        if (commandPointer > DEFAULT_COMMAND_POINTER) {
            setCommandPointer(commandPointer - 1);
        } else {
            if (inputRef.current !== null) {
                inputRef.current.value = '';
            }
        }
    };

    const handleEscapeKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        setCommandPointer(DEFAULT_COMMAND_POINTER);
        if (inputRef.current !== null) {
            inputRef.current.value = '';
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        switch (event.key) {
            case 'Enter':
                handleEnterKey();
                break;
            case 'Tab':
                handleTabKey(event);
                break;
            case 'ArrowUp':
                handleArrowUpKey(event);
                break;
            case 'ArrowDown':
                handleArrowDownKey(event);
                break;
            case 'Escape':
                handleEscapeKey(event);
                break;
            default:
            // do nothing
        }
    };

    /**
     * Set the command input to the value specified
     * Used with the Hints component, when a user clicks a hint it is copied into the input
     *
     * @param command The command value to specify
     */
    const hintClick = (command: string) => {
        if (inputRef.current !== null) {
            inputRef.current.value = command;
            inputRef.current.focus();
        }
    };

    /**
     * When the page loads, set the command input as the current focus
     */
    useEffect(() => {
        inputRef.current?.focus();
    });

    /**
     * Set the command input value to the command history value when the pointer changes
     * This is used for the up/down arrow history function
     */
    useEffect(() => {
        if (
            commandPointer > DEFAULT_COMMAND_POINTER
            && commandPointer <= commandHistory.length
            && inputRef.current !== null
        ) {
            inputRef.current.value = commandHistory[commandHistory.length - commandPointer];
        }
        // update history with max last 20 commands
        // eslint-disable-next-line react-you-might-not-need-an-effect/no-chain-state-updates
        localStorage.setItem(LS_KEY_COMMAND_HISTORY, JSON.stringify(commandHistory.slice(-20)));
    }, [commandPointer, commandHistory]);

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

    // set last login
    localStorage.setItem(LS_KEY_LAST_LOGIN, (new Date()).toISOString());

    return (
        <div className="shell">
            <pre className='prompt'
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
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                    <span aria-hidden>$ </span>
                    <input
                        id='console-input'
                        placeholder='Type `help` for assistance.'
                        style={{ width: '100%', marginLeft: '1em' }}
                        ref={inputRef}
                        onKeyDown={handleKeyDown}
                        autoCorrect='off'
                        autoCapitalize='none'
                        spellCheck={false}
                        aria-label='An input to enter commands.'
                    />
                </div>
            </form>
            <Hints hintClick={hintClick} />
        </div>
    );
}

export default ShellPrompt;
