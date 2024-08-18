import React, { useState, useRef, useEffect, useContext } from 'react';
import { TRACKER_EVENTS, TrackerContext } from './Tracker';
import Hints from './Hints';
import ConsoleOutput, { CommandResult, ConsoleLine } from './ConsoleOutput';

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
    const tracker = useContext(TrackerContext);

    const LAST_LOGIN = localStorage.getItem(LS_KEY_LAST_LOGIN) || 'never';

    const WELCOME_MESSAGE: CommandResult = {
        timestamp: new Date(),
        response: [
            ['****************************************'],
            ['Welcome to Shaun Burdick\'s Console!'],
            ['****************************************'],
            ['Your last login was:', <span aria-label='Last Login Timestamp'>{LAST_LOGIN}</span>],
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
    const [environment, setEnvironment] = useState<Map<string,string>>(DEFAULT_ENVIRONMENT);
    const [workingDir/* , setWorkingDir*/] = useState<string>('/');
    const inputRef = useRef<HTMLInputElement | null>(null);
    const preBottomRef = useRef<HTMLSpanElement | null>(null);

    interface User {
        name: string;
        image?: string;
        occupation?: string[],
        location?: string,
        expertise?: string[],
        links?: {
            url: string;
            text: string;
        }[]
    }

    /**
     * A map of users known on the system
     */
    const USERS = new Map<string, User>();

    USERS.set('shaun', {
        name: 'Shaun Burdick',
        image: 'shaun.png',
        occupation: [ 'Father', 'Husband', 'Leader', 'Engineer' ],
        location: 'Syracuse, NY',
        expertise: [
            'Engineering Leader',
            'Web Architecture and Design',
            'Large scale data collection',
            'API Design and Implementation',
            'Agile/Scrum team management',
            'Project Management'
        ],
        links: [
            { url: 'https://www.linkedin.com/in/shaunburdick/', text: 'LinkedIn' },
            { url: 'https://github.com/shaunburdick/', text: 'GitHub' },
            { url: `mailto://${atob('c2l0ZS1jb250YWN0QHNoYXVuYnVyZGljay5jb20=')}`, text: 'Email' }
        ]
    });

    interface Command {
        description: string;
        secret?: boolean;
        run: (...args: string[]) => ConsoleLine[];
    }

    /**
     * A map of commands available to run
     */
    const COMMANDS = new Map<string, Command>();

    COMMANDS.set('clear', {
        description: 'Clears the screen',
        run: () => {
            // use setTimeout to clear screen after this loop is finished
            setTimeout(() => {
                setConsoleLines([]);
                setLastCommand(undefined);
            });

            return [];
        }
    });

    COMMANDS.set('env', {
        description: 'Print Environment',
        run: () => {
            const response: ConsoleLine[] = [];

            environment.forEach((k, v) => {
                response.push([`${k}=${v}`]);
            });

            return response;
        }
    });

    COMMANDS.set('export', {
        description: 'Set an environment variable',
        run: (key, value) => {
            setEnvironment({ ...environment, [key]: value });
            return [[`${key}=${value}`]];
        }
    });

    COMMANDS.set('help', {
        description: 'Provides a list of commands. Usage: `help [command]`',
        run: (command?: string) => {
            if (command) {
                if (COMMANDS.get(command)?.secret) {
                    return [['I\'m not helping you. It\'s a secret!']];
                } else {
                    return [[COMMANDS.get(command)?.description || `Unknown command: ${command}`]];
                }
            } else {
                return [
                    ['List of Commands:'],
                    ...[...COMMANDS]
                        .filter(cmd => !cmd[1].secret)
                        .map(([commandName, commandInfo]) => [`${commandName}:`, commandInfo.description])
                ];
            }
        }
    });

    COMMANDS.set('history', {
        description: 'Show previous commands',
        run: () => commandHistory.map((command, index) => [`${index + 1}: ${command}`])
    });

    COMMANDS.set('open', {
        description: 'Open a file or URL',
        run: (target) => {
            try {
                const url = new URL(target);
                if (['http:', 'https:'].includes(url.protocol)) {
                    window.open(target);
                    return [[`Opening ${target}...`]];
                } else {
                    return [[`Unknown protocol: ${url.protocol}`]];
                }
            } catch {
                return [[`Cannot open: ${target}`]];
            }
        }
    });

    COMMANDS.set('pwd', {
        description: 'Return the working directory',
        run: () => [[workingDir]]
    });

    COMMANDS.set('rm', {
        description: 'Remove directory entries',
        run: () => {
            window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
            return [['rm never gonna give you up!']];
        }
    });

    COMMANDS.set('secret', {
        description: 'A secret command',
        secret: true,
        run: () => [['You found it!']]
    });

    COMMANDS.set('users', {
        description: 'List users',
        run: () => [...USERS.keys()].map(userName => [userName])
    });

    COMMANDS.set('view-source', {
        description: 'View the source of this app',
        run: () => {
            window.open('https://github.com/shaunburdick/shaunburdick.com');
            return [['Opening GH Page...']];
        }
    });

    COMMANDS.set('whoami', {
        description: 'Tell you a little about yourself',
        run: () => [
            ['You\'re you, silly']
        ]
    });

    COMMANDS.set('whois', {
        description: 'Tell you a little about a user. Usage: `whois <username>`',
        run: (username: string) => {
            const user = USERS.get(username);
            if (user) {
                const response: ConsoleLine[] = [];

                if (user.image) {
                    response.push([<img src={user.image} alt={user.name} width={'50%'}/>]);
                }
                response.push(['Name: ', user.name]);
                if (user.occupation) {
                    response.push(['Occupation: ', JSON.stringify(user.occupation)]);
                }
                if (user.location) {
                    response.push(['Location: ', user.location]);
                }
                if (user.expertise) {
                    response.push(['Expertise: ', JSON.stringify(user.expertise, null, 2)]);
                }
                if (user.links) {
                    response.push(['Links: ', ...user.links.map(link => <a href={link.url}>{link.text}</a>)]);
                }

                return response;
            } else if(/miki|mikey|faktrl/.test(username)) {
                window.open('https://www.youtube.com/watch?v=YjyUIwKPAxA');
                return [[`Hello, ${username}`]];
            } else if (username === 'gamefront') {
                return [[<a href='https://gamefront.com'>Gamefront</a>, 'is just FilesNetwork with a better skin']];
            } else {
                return [[`Unknown user: ${username || ''}`]];
            }
        }
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
    };

    const execCommand = (commandName: string, ...args: string[]): ConsoleLine[] => {
        // record command
        tracker.trackEvent(TRACKER_EVENTS.ExecCommand, { props: { commandName, args: args.join(' ') } });

        const command = COMMANDS.get(commandName.toLowerCase());
        if (command) {
            return command.run(...args);
        } else {
            return [
                ['Unknown Command: ', commandName],
                ['Type `help` for assistance']
            ];
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        switch (event.key) {
            case 'Enter':
                if (inputRef.current) {
                    const input = inputRef.current.value.trimEnd();
                    const newCommandResult: CommandResult = {
                        timestamp: new Date(),
                        command: input,
                        response: [['']]
                    };

                    // add to history
                    setCommandHistory([...commandHistory, input]);

                    if (newCommandResult.command) {
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
                break;
            case 'Tab':
                // if input is empty, allow them to tab out
                if (inputRef.current?.value) {
                    // add tab completion?
                    event.preventDefault();
                }
                break;
            case 'ArrowUp':
                event.preventDefault();
                tracker.trackEvent(TRACKER_EVENTS.HistoryUpArrow);
                if (commandPointer < commandHistory.length) {
                    setCommandPointer(commandPointer + 1);
                }
                break;
            case 'ArrowDown':
                event.preventDefault();
                if (commandPointer > DEFAULT_COMMAND_POINTER) {
                    setCommandPointer(commandPointer - 1);
                } else {
                    if (inputRef.current !== null) {
                        inputRef.current.value = '';
                    }
                }
                break;
            case 'Escape':
                event.preventDefault();
                setCommandPointer(DEFAULT_COMMAND_POINTER);
                if (inputRef.current !== null) {
                    inputRef.current.value = '';
                }
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
                preBottomRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }, [consoleLines]);

    // set last login
    localStorage.setItem(LS_KEY_LAST_LOGIN, (new Date()).toISOString());

    return (
        <div className="shell">
            <pre style={{ maxHeight: '80vh', minHeight: '20vh' }}
                aria-label='A text-based console.'
                // *eslint-disable-next-line jsx-a11y/aria-props
                aria-description='This area is meant to depict an older styled computer console
                where commands can be typed and responses will be shown.'>
                {consoleLines.slice(0, -1).map((commandResult, commandIndex) => (
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
                            {lastCommand.command &&
                            <span title={lastCommand.timestamp.toISOString()} aria-label='The command that was run'>
                                {<span aria-hidden>$</span>} {lastCommand?.command}
                            </span>}
                            {lastCommand.response.map((commandLine, lineIndex) => (
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
                        aria-label='An input to enter commands.'
                        // *eslint-disable-next-line jsx-a11y/aria-props
                        aria-description='When a command is entered, it will be run by the console interpreter
                        and the above output will be updated with the result'
                    />
                </div>
            </form>
            <Hints hintClick={hintClick} />
        </div>
    );
}

export default ShellPrompt;
