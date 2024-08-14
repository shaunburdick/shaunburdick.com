import React, { useState, useRef, useEffect, useContext } from 'react';
import { TrackerContext } from './Tracker';

function ShellPrompt() {

    const tracker = useContext(TrackerContext);

    const LS_KEY_LAST_LOGIN = 'lastLogin';
    const LS_KEY_COMMAND_HISTORY = 'commandHistory';

    const LAST_LOGIN = localStorage.getItem(LS_KEY_LAST_LOGIN) || 'never';

    type ConsoleLine = Array<string | React.JSX.Element>;
    interface CommandResult {
        timestamp: Date;
        command?: string;
        response: ConsoleLine[];
    }

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

    const COMMANDS = new Map<string, Command>();

    COMMANDS.set('clear', {
        description: 'Clears the screen',
        run: () => {
            // use setTimeout to clear screen after this loop is finished
            setTimeout(() => setConsoleLines([]));
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
        tracker.trackEvent('execCommand', { props: { commandName, args: args.join(' ') } });

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
                    // write lines
                    setConsoleLines([...consoleLines, newCommandResult]);
                    // reset command pointer
                    setCommandPointer(0);
                }
                break;
            case 'Tab':
                event.preventDefault();
                // add tab completion?
                break;
            case 'ArrowUp':
                event.preventDefault();
                tracker.trackEvent('historyUpArrow');
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

    // focus on input on load
    useEffect(() => {
        inputRef.current?.focus();
    });

    // update input on history toggle
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

    // Scroll the pre to the bottom after each command
    useEffect(() => {
        // wait for a loop so content can load
        setTimeout(() => preBottomRef.current?.scrollIntoView({ behavior: 'smooth' }));
    }, [consoleLines]);

    // set last login
    localStorage.setItem(LS_KEY_LAST_LOGIN, (new Date()).toISOString());

    return (
        <div className="shell">
            <pre style={{ maxHeight: '80vh', minHeight: '20vh' }}
                aria-label='A text-based console.'
                // *eslint-disable-next-line jsx-a11y/aria-props
                aria-description='This area is meant to depict an older styled computer console
                where commands can be typed and responses will be shown.'
                aria-live='polite'
                role='log'>
                {consoleLines.map((commandResult, commandIndex) => (
                    <span key={commandIndex}>
                        {commandResult.command &&
                        <span title={commandResult.timestamp.toISOString()} aria-label='The command that was run'>
                            {'\n\n'}{<span aria-hidden>$</span>} {commandResult.command}
                        </span>}
                        {commandResult.response.map((commandLine, lineIndex) => (
                            <span key={lineIndex}>
                                {'\n'}{commandLine.reduce((result, item) => <>{result}{' '}{item}</>)}
                            </span>
                        ))}
                    </span>
                ))}
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
        </div>
    );
}

export default ShellPrompt;
