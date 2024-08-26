import { CommandResult, ConsoleLine } from './ConsoleOutput';
import { displayUser, User } from './Users';

export interface Command {
    description: string;
    secret?: boolean;
    run: (...args: string[]) => ConsoleLine[];
}

export interface CommandContext {
    commandHistory: string[];
    environment: Map<string, string>;
    setConsoleLines: React.Dispatch<React.SetStateAction<CommandResult[]>>;
    setLastCommand: React.Dispatch<React.SetStateAction<CommandResult | undefined>>;
    users: Map<string, User>;
    workingDir: string;
}

export const commandsWithContext = ({
    commandHistory,
    environment,
    setConsoleLines,
    setLastCommand,
    users,
    workingDir,
}: CommandContext): Map<string, Command> => {
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

            environment.forEach((v, k) => {
                response.push([`${k}=${v}`]);
            });

            return response;
        }
    });

    COMMANDS.set('export', {
        description: 'Set an environment variable',
        run: (key, value) => {
            if (key.includes('=')) {
                const split = key.indexOf('=');
                value = key.slice(split+1);
                key = key.slice(0, split);
            }

            if (typeof value === 'undefined') {
                environment.delete(key);
                return [[`${key}=`]];
            } else {
                environment.set(key, value);
                return [[`${key}=${value || ''}`]];
            }
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
        run: () => [...users.keys()].map(userName => [userName])
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
            const user = users.get(username);
            if (user) {
                return displayUser(user);
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

    return COMMANDS;
};
