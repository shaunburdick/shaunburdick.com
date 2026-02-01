import { CommandResult, ConsoleLine } from './components/ConsoleOutput/ConsoleOutput';
import { displayUser, User } from './Users';
import { NotificationContextType } from './containers/NotificationProvider';
import { AchievementContextType } from './containers/AchievementProvider';

/**
 * Interface for a terminal command
 */
export interface Command {
    /** Help text description of the command */
    description: string;

    /** Whether the command should be hidden from help listings */
    secret?: boolean;

    /** Function that executes the command with any arguments */
    run: (...args: string[]) => ConsoleLine[];
}

/**
 * Context required for commands to access system state
 */
export interface CommandContext {
    /** List of previously executed commands */
    commandHistory: string[];

    /** Map of environment variables */
    environment: Map<string, string>;

    /** Function to update the displayed console lines */
    setConsoleLines: React.Dispatch<React.SetStateAction<CommandResult[]>>;

    /** Function to update the last executed command */
    setLastCommand: React.Dispatch<React.SetStateAction<CommandResult | undefined>>;

    /** Map of registered users in the system */
    users: Map<string, User>;

    /** Current working directory */
    workingDir: string;

    /** Interface for displaying notifications */
    notifications: NotificationContextType;

    /** Interface for handling achievements */
    achievements: AchievementContextType
}

/**
 * Creates a map of available commands with access to system context
 *
 * @param context - The command context containing system state
 * @returns Map of command names to command implementations
 */
export const commandsWithContext = ({
    commandHistory,
    environment,
    setConsoleLines,
    setLastCommand,
    users,
    workingDir,
    achievements
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

            for (const [k, v] of environment.entries()) {
                response.push([`${k}=${v}`]);
            }

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
                return [[`${key}=${value}`]];
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
            achievements.unlockAchievement('rick_rolled');
            return [['rm never gonna give you up!']];
        }
    });

    COMMANDS.set('secret', {
        description: 'A secret command',
        secret: true,
        run: () => {
            achievements.unlockAchievement('secret_command');
            return [['You found it!']];
        }
    });

    COMMANDS.set('users', {
        description: 'List users',
        run: () => [...users.keys()].sort().map(userName => [userName])
    });

    COMMANDS.set('version', {
        description: 'Show application version and build information',
        run: () => {
            const version = process.env.REACT_APP_VERSION || 'unknown';
            const commitHash = process.env.REACT_APP_COMMIT_HASH || 'unknown';
            const buildDate = process.env.REACT_APP_BUILD_DATE || 'unknown';

            return [
                ['Application Version Information:'],
                [''],
                [`Version: ${version}`],
                [`Commit: ${commitHash}`],
                [`Build Date: ${buildDate}`],
                [''],
                ['Source: ', <a key='gh-repo' href="https://github.com/shaunburdick/shaunburdick.com">GitHub Repository</a>]
            ];
        }
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
        run: () => {
            // Add the "who_are_you" achievement
            achievements.unlockAchievement('who_are_you');

            return [
                ['You\'re you, silly'],
                ['Achievements:'],
                ...achievements.achievements.map(a => [`- ${a.title}: ${a.description}`]),
            ];
        }
    });

    COMMANDS.set('whois', {
        description: 'Tell you a little about a user. Usage: `whois <username>`',
        run: (username: string) => {
            const user = users.get(username);
            if (user) {
                if (username === 'mario') {
                    achievements.unlockAchievement('old_spice_mario');
                }
                return displayUser(user);
            } else if(/miki|mikey|faktrl/.test(username)) {
                window.open('https://www.youtube.com/watch?v=YjyUIwKPAxA');
                return [[`Hello, ${username}`]];
            } else if (username === 'gamefront') {
                return [[<a key='gf-link' href='https://gamefront.com'>Gamefront</a>, 'is just FilesNetwork with a better skin']];
            } else {
                return [[`Unknown user: ${username || ''}`]];
            }
        }
    });

    return COMMANDS;
};
