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
 * Creates a clear command that resets the terminal display
 */
function createClearCommand(
    setConsoleLines: CommandContext['setConsoleLines'],
    setLastCommand: CommandContext['setLastCommand']
): Command {
    return {
        description: 'Clears the screen',
        run: () => {
            // use setTimeout to clear screen after this loop is finished
            setTimeout(() => {
                setConsoleLines([]);
                setLastCommand(undefined);
            });

            return [];
        }
    };
}

/**
 * Creates an env command that prints environment variables
 */
function createEnvCommand(environment: Map<string, string>): Command {
    return {
        description: 'Print Environment',
        run: () => {
            const response: ConsoleLine[] = [];

            for (const [key, value] of environment.entries()) {
                response.push([`${key}=${value}`]);
            }

            return response;
        }
    };
}

/**
 * Creates an export command that sets environment variables
 */
function createExportCommand(environment: Map<string, string>): Command {
    return {
        description: 'Set an environment variable',
        run: (key, value) => {
            if (key.includes('=')) {
                const splitIndex = key.indexOf('=');
                value = key.slice(splitIndex + 1);
                key = key.slice(0, splitIndex);
            }

            if (typeof value === 'undefined') {
                environment.delete(key);
                return [[`${key}=`]];
            } else {
                environment.set(key, value);
                return [[`${key}=${value}`]];
            }
        }
    };
}

/**
 * Creates a help command that lists available commands or describes a specific one
 */
function createHelpCommand(commands: Map<string, Command>): Command {
    return {
        description: 'Provides a list of commands. Usage: `help [command]`',
        run: (commandName?: string) => {
            if (commandName) {
                if (commands.get(commandName)?.secret) {
                    return [['I\'m not helping you. It\'s a secret!']];
                } else {
                    return [[commands.get(commandName)?.description || `Unknown command: ${commandName}`]];
                }
            } else {
                return [
                    ['List of Commands:'],
                    ...[...commands]
                        .filter(cmd => !cmd[1].secret)
                        .map(([name, info]) => [`${name}:`, info.description])
                ];
            }
        }
    };
}

/**
 * Creates a history command that shows previously executed commands
 */
function createHistoryCommand(commandHistory: string[]): Command {
    return {
        description: 'Show previous commands',
        run: () => commandHistory.map((command, index) => [`${index + 1}: ${command}`])
    };
}

/**
 * Creates an open command for opening URLs
 */
function createOpenCommand(): Command {
    return {
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
    };
}

/**
 * Creates a pwd command that returns the working directory
 */
function createPwdCommand(workingDir: string): Command & { description: string } {
    return {
        description: 'Return the working directory',
        run: () => [[workingDir]]
    };
}

/**
 * Creates the rm command (which rickrolls the user)
 */
function createRmCommand(achievements: AchievementContextType): Command {
    return {
        description: 'Remove directory entries',
        run: () => {
            window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
            achievements.unlockAchievement('rick_rolled');
            return [['rm never gonna give you up!']];
        }
    };
}

/**
 * Creates the secret command
 */
function createSecretCommand(achievements: AchievementContextType): Command {
    return {
        description: 'A secret command',
        secret: true,
        run: () => {
            achievements.unlockAchievement('secret_command');
            return [['You found it!']];
        }
    };
}

/**
 * Creates a users command that lists all registered users
 */
function createUsersCommand(users: Map<string, User>): Command {
    return {
        description: 'List users',
        run: () => [...users.keys()].sort().map(userName => [userName])
    };
}

/**
 * Creates a version command showing build information
 */
function createVersionCommand(): Command {
    return {
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
    };
}

/**
 * Creates a view-source command linking to the GitHub repository
 */
function createViewSourceCommand(): Command {
    return {
        description: 'View the source of this app',
        run: () => {
            window.open('https://github.com/shaunburdick/shaunburdick.com');
            return [['Opening GH Page...']];
        }
    };
}

/**
 * Creates a whoami command that tells the user about themselves
 */
function createWhoamiCommand(achievements: AchievementContextType): Command {
    return {
        description: 'Tell you a little about yourself',
        run: () => {
            // Add the "who_are_you" achievement
            achievements.unlockAchievement('who_are_you');

            return [
                ['You\'re you, silly'],
                ['Achievements:'],
                ...achievements.achievements.map(achievement => [`- ${achievement.title}: ${achievement.description}`]),
            ];
        }
    };
}

/**
 * Creates a whois command that looks up user information
 */
function createWhoisCommand(users: Map<string, User>, achievements: AchievementContextType): Command {
    return {
        description: 'Tell you a little about a user. Usage: `whois <username>`',
        run: (username: string) => {
            const user = users.get(username);
            if (user) {
                if (username === 'mario') {
                    achievements.unlockAchievement('old_spice_mario');
                }
                return displayUser(user);
            } else if (/miki|mikey|faktrl/.test(username)) {
                window.open('https://www.youtube.com/watch?v=YjyUIwKPAxA');
                return [[`Hello, ${username}`]];
            } else if (username === 'gamefront') {
                return [[<a key='gf-link' href='https://gamefront.com'>Gamefront</a>, 'is just FilesNetwork with a better skin']];
            } else {
                return [[`Unknown user: ${username || ''}`]];
            }
        }
    };
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
    const COMMANDS = new Map<string, Command>();

    COMMANDS.set('clear', createClearCommand(setConsoleLines, setLastCommand));
    COMMANDS.set('env', createEnvCommand(environment));
    COMMANDS.set('export', createExportCommand(environment));
    COMMANDS.set('history', createHistoryCommand(commandHistory));
    COMMANDS.set('open', createOpenCommand());
    COMMANDS.set('pwd', createPwdCommand(workingDir));
    COMMANDS.set('rm', createRmCommand(achievements));
    COMMANDS.set('secret', createSecretCommand(achievements));
    COMMANDS.set('users', createUsersCommand(users));
    COMMANDS.set('version', createVersionCommand());
    COMMANDS.set('view-source', createViewSourceCommand());
    COMMANDS.set('whoami', createWhoamiCommand(achievements));
    COMMANDS.set('whois', createWhoisCommand(users, achievements));

    // help command needs access to the full command map for lookups
    COMMANDS.set('help', createHelpCommand(COMMANDS));

    return COMMANDS;
};
