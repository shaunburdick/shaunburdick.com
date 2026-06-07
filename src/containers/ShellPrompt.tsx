import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { CommandResult, ConsoleLine } from '../components/ConsoleOutput/ConsoleOutput';
import ShellPromptView from '../components/ShellPrompt/ShellPromptView';
import { TRACKER_EVENTS, useTracker } from '../hooks/useTracker';
import { useEvent, useLocalStorage } from '../hooks';
import { USERS } from '../Users';
import { commandsWithContext } from '../Command';
import { useNotification } from './NotificationProvider';
import { useAchievements } from './AchievementProvider';

export const LS_KEY_LAST_LOGIN = 'lastLogin';
export const LS_KEY_COMMAND_HISTORY = 'commandHistory';

const DEFAULT_COMMAND_POINTER = 0;
const MAX_COMMAND_HISTORY_SIZE = 20;
const DEFAULT_ENVIRONMENT = new Map([
    ['SHELL', '/bin/blah'],
    ['USER', 'you']
]);

/**
 * Context object passed to command handler functions
 */
interface CommandHandlerContext {
    commandHistory: string[];
    environment: Map<string, string>;
    workingDir: string;
    COMMANDS: ReturnType<typeof commandsWithContext>;
    commandUpdateEvent: ReturnType<typeof useEvent>;
    achievements: ReturnType<typeof useAchievements>;
    setConsoleLines: React.Dispatch<React.SetStateAction<CommandResult[]>>;
    setCommandHistory: (value: string[] | ((prev: string[]) => string[])) => void;
    setCommandPointer: (value: number) => void;
    setLastCommand: React.Dispatch<React.SetStateAction<CommandResult | undefined>>;
    setInputValue: (value: string) => void;
}

/**
 * Options for the execCommand function
 */
interface ExecCommandOptions {
    /** The command name to execute */
    commandName: string;
    /** Command execution context */
    context: CommandHandlerContext;
    /** Arguments to pass to the command */
    args: string[];
}

/**
 * Options for the handleSubmit function
 */
interface HandleSubmitOptions {
    /** The raw input string from the terminal */
    input: string;
    /** Command execution context */
    context: CommandHandlerContext;
    /** Current console lines for appending */
    consoleLines: CommandResult[];
}

/**
 * Executes a command and returns its output lines
 */
function execCommand({ commandName, context, args }: ExecCommandOptions): ConsoleLine[] {
    if (context.commandHistory.length === 0) {
        context.achievements.unlockAchievement('first_command');
    }

    const command = context.COMMANDS.get(commandName.toLowerCase());
    const result = command
        ? command.run(...args)
        : [
            ['Unknown Command: ', commandName],
            ['Type `help` for assistance']
        ];

    context.commandUpdateEvent.dispatch({
        command: { name: commandName.toLowerCase(), args },
        result
    });

    return result;
}

/**
 * Handles command submission from the terminal input
 */
function handleSubmit({ input, context, consoleLines }: HandleSubmitOptions): void {
    const newCommandResult: CommandResult = {
        timestamp: new Date(),
        command: input,
        response: [['']]
    };

    const updatedHistory = [...context.commandHistory, input].slice(-MAX_COMMAND_HISTORY_SIZE);
    context.setCommandHistory(updatedHistory);

    if (newCommandResult.command) {
        const [command, ...args] = newCommandResult.command.split(' ');
        newCommandResult.response = typeof command === 'string' && command.length > 0
            ? execCommand({ commandName: command, context, args })
            : [['']];
    }

    context.setLastCommand(newCommandResult);
    context.setConsoleLines([...consoleLines, newCommandResult]);
    context.setCommandPointer(0);
    context.setInputValue('');
}

/**
 * Options for the useCommandCenter hook
 */
interface UseCommandCenterOptions {
    commandHistory: string[];
    commandPointer: number;
    consoleLines: CommandResult[];
    commandUpdateEvent: ReturnType<typeof useEvent>;
    achievements: ReturnType<typeof useAchievements>;
    notifications: ReturnType<typeof useNotification>;
    setCommandPointer: (value: number) => void;
    setInputValue: (value: string) => void;
    setConsoleLines: React.Dispatch<React.SetStateAction<CommandResult[]>>;
    setCommandHistory: (value: string[] | ((prev: string[]) => string[])) => void;
    setLastCommand: React.Dispatch<React.SetStateAction<CommandResult | undefined>>;
    inputRef: React.RefObject<HTMLInputElement | null>;
    tracker: ReturnType<typeof useTracker>;
}

/**
 * Parameters for the onArrowUp handler
 */
interface ArrowUpParams {
    event: React.KeyboardEvent<HTMLInputElement>;
    commandPointer: number;
    commandHistory: string[];
    setCommandPointer: (value: number) => void;
    setInputValue: (value: string) => void;
    tracker: ReturnType<typeof useTracker>;
}

/**
 * Parameters for the onArrowDown handler
 */
interface ArrowDownParams {
    event: React.KeyboardEvent<HTMLInputElement>;
    commandPointer: number;
    commandHistory: string[];
    setCommandPointer: (value: number) => void;
    setInputValue: (value: string) => void;
}

/**
 * Parameters for the onEscape handler
 */
interface EscapeParams {
    event: React.KeyboardEvent<HTMLInputElement>;
    setCommandPointer: (value: number) => void;
    setInputValue: (value: string) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
}

/**
 * Handles ArrowUp key for command history navigation
 */
function onArrowUp({
    event, commandPointer, commandHistory,
    setCommandPointer, setInputValue, tracker
}: ArrowUpParams): void {
    event.preventDefault();
    tracker.trackEvent(TRACKER_EVENTS.HistoryUpArrow);
    if (commandPointer < commandHistory.length) {
        const newPointer = commandPointer + 1;
        setCommandPointer(newPointer);
        setInputValue(commandHistory[commandHistory.length - newPointer]);
    }
}

/**
 * Handles ArrowDown key for command history navigation
 */
function onArrowDown({
    event, commandPointer, commandHistory,
    setCommandPointer, setInputValue
}: ArrowDownParams): void {
    event.preventDefault();
    if (commandPointer > DEFAULT_COMMAND_POINTER) {
        const newPointer = commandPointer - 1;
        setCommandPointer(newPointer);
        setInputValue(newPointer === 0 ? '' : commandHistory[commandHistory.length - newPointer]);
    }
}

/**
 * Handles Escape key to clear the command input
 */
function onEscape({ event, setCommandPointer, setInputValue, inputRef }: EscapeParams): void {
    event.preventDefault();
    setCommandPointer(DEFAULT_COMMAND_POINTER);
    if (inputRef.current) {
        inputRef.current.value = '';
    }
    setInputValue('');
}

/**
 * Creates COMMANDS, command context, and callback handlers for the shell
 */
function useCommandCenter({
    commandHistory, commandPointer, consoleLines,
    commandUpdateEvent, achievements, notifications,
    setCommandPointer, setInputValue,
    setConsoleLines, setCommandHistory, setLastCommand,
    inputRef, tracker
}: UseCommandCenterOptions) {
    const COMMANDS = commandsWithContext({
        commandHistory, environment: DEFAULT_ENVIRONMENT,
        setConsoleLines, setLastCommand,
        workingDir: '/', users: USERS,
        notifications, achievements
    });
    const commandContext = useMemo((): CommandHandlerContext => ({
        commandHistory, environment: DEFAULT_ENVIRONMENT,
        workingDir: '/', COMMANDS, commandUpdateEvent,
        achievements, setConsoleLines, setCommandHistory,
        setCommandPointer, setLastCommand, setInputValue
    }), [commandHistory, COMMANDS, commandUpdateEvent, achievements,
        setConsoleLines, setCommandHistory, setCommandPointer,
        setLastCommand, setInputValue]);

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Tab') {
            if (inputRef.current?.value) {
                event.preventDefault();
            } return;
        }
        if (event.key === 'ArrowUp') {
            onArrowUp({ event, commandPointer, commandHistory, setCommandPointer, setInputValue, tracker }); return;
        }
        if (event.key === 'ArrowDown') {
            onArrowDown({ event, commandPointer, commandHistory, setCommandPointer, setInputValue }); return;
        }
        if (event.key === 'Escape') {
            onEscape({ event, setCommandPointer, setInputValue, inputRef });
        }
    };
    const onCommandSubmit = useCallback(
        (input: string) => handleSubmit({ input, context: commandContext, consoleLines }),
        [commandContext, consoleLines]
    );
    const onHintClick = (hint: string) => {
        setInputValue(hint);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return { onKeyDown, onCommandSubmit, onHintClick };
}

/**
 * Initial shell state with welcome message
 */
interface ShellInit {
    lastLogin: string;
    welcome: CommandResult[];
}

/**
 * Creates the initial shell state including the welcome message
 */
function createShellInit(): ShellInit {
    const login = localStorage.getItem(LS_KEY_LAST_LOGIN) || 'never';
    const welcome: CommandResult = {
        timestamp: new Date(),
        response: [
            ['****************************************'],
            ['Welcome to Shaun Burdick\'s Console!'],
            ['****************************************'],
            ['Your last login was:', login],
            ['Type `help` for assistance.'],
            [''],
        ]
    };

    return { lastLogin: login, welcome: [welcome] };
}

/**
 * Shell state and behaviors returned by useShellState
 */
interface ShellState {
    consoleLines: CommandResult[];
    lastCommand: CommandResult | undefined;
    inputValue: string;
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    onCommandSubmit: (input: string) => void;
    onHintClick: (hint: string) => void;
    onInputChange: (value: string) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
}

/**
 * Manages all shell state, commands, and event handlers
 */
function useShellState(): ShellState {
    const tracker = useTracker();
    const notifications = useNotification();
    const achievements = useAchievements();
    const commandUpdateEvent = useEvent('onCommand');
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [init] = useState(createShellInit);
    const [consoleLines, setConsoleLines] = useState<CommandResult[]>(init.welcome);
    const [commandHistory, setCommandHistory] = useLocalStorage<string[]>(LS_KEY_COMMAND_HISTORY, []);
    const [commandPointer, setCommandPointer] = useState<number>(DEFAULT_COMMAND_POINTER);
    const [lastCommand, setLastCommand] = useState<CommandResult | undefined>(init.welcome[0]);
    const [inputValue, setInputValue] = useState<string>('');

    const { onKeyDown, onCommandSubmit, onHintClick } = useCommandCenter({
        commandHistory,
        commandPointer,
        consoleLines,
        commandUpdateEvent,
        achievements,
        notifications,
        setCommandPointer,
        setInputValue,
        setConsoleLines,
        setCommandHistory,
        setLastCommand,
        inputRef,
        tracker
    });

    const onInputChange = useCallback((value: string) => {
        setInputValue(value);
    }, []);

    useEffect(() => {
        localStorage.setItem(LS_KEY_LAST_LOGIN, (new Date()).toISOString());
        inputRef.current?.focus();
    }, []);

    return {
        consoleLines,
        lastCommand,
        inputValue,
        onKeyDown,
        onCommandSubmit,
        onHintClick,
        onInputChange,
        inputRef
    };
}

/**
 * ShellPrompt container component
 * Manages state and business logic for the shell prompt
 *
 * @returns Shell prompt container
 */
function ShellPrompt() {
    const {
        consoleLines,
        lastCommand,
        inputValue,
        onKeyDown,
        onCommandSubmit,
        onHintClick,
        onInputChange,
        inputRef
    } = useShellState();

    return (
        <ShellPromptView
            consoleLines={consoleLines}
            lastCommand={lastCommand}
            onSubmit={onCommandSubmit}
            onKeyDown={onKeyDown}
            onHintClick={onHintClick}
            onInputChange={onInputChange}
            inputRef={inputRef}
            inputValue={inputValue}
        />
    );
}

export default ShellPrompt;
