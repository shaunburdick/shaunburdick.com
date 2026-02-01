import { useState, useRef, useEffect } from 'react';
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

/**
 * ShellPrompt container component
 * Manages state and business logic for the shell prompt
 *
 * @returns Shell prompt container
 */
function ShellPrompt() {
    const tracker = useTracker();
    const notifications = useNotification();
    const achievements = useAchievements();
    const commandUpdateEvent = useEvent('onCommand');
    const inputRef = useRef<HTMLInputElement | null>(null);

    const LAST_LOGIN = localStorage.getItem(LS_KEY_LAST_LOGIN) || 'never';

    const WELCOME_MESSAGE: CommandResult = {
        timestamp: new Date(),
        response: [
            ['****************************************'],
            ['Welcome to Shaun Burdick\'s Console!'],
            ['****************************************'],
            ['Your last login was:', LAST_LOGIN],
            ['Type `help` for assistance.'],
            [''],
        ]
    };

    const DEFAULT_ENVIRONMENT = new Map([
        ['SHELL', '/bin/blah'],
        ['USER', 'you']
    ]);

    const DEFAULT_COMMAND_POINTER = 0;

    const [consoleLines, setConsoleLines] = useState<CommandResult[]>([WELCOME_MESSAGE]);
    const [commandHistory, setCommandHistory] = useLocalStorage<string[]>(LS_KEY_COMMAND_HISTORY, []);
    const [commandPointer, setCommandPointer] = useState<number>(DEFAULT_COMMAND_POINTER);
    const [lastCommand, setLastCommand] = useState<CommandResult | undefined>(WELCOME_MESSAGE);
    const [inputValue, setInputValue] = useState<string | undefined>(undefined);

    // Environment and working directory are currently read-only
    // TODO: Implement setters if cd and export commands need to modify state
    const environment = DEFAULT_ENVIRONMENT;
    const workingDir = '/';

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

    const execCommand = (commandName: string, ...args: string[]): ConsoleLine[] => {
        // Add the "first_command" achievement
        if (commandHistory.length === 0) {
            achievements.unlockAchievement('first_command');
        }

        const command = COMMANDS.get(commandName.toLowerCase());
        let result: ConsoleLine[] = [];
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

    const handleSubmit = (input: string) => {
        const newCommandResult: CommandResult = {
            timestamp: new Date(),
            command: input,
            response: [['']]
        };

        // add to history (max 20 commands)
        const updatedHistory = [...commandHistory, input].slice(-20);
        setCommandHistory(updatedHistory);

        if (newCommandResult.command) {
            // execute command
            const [command, ...args] = newCommandResult.command.split(' ');
            newCommandResult.response = typeof command === 'string' && command.length > 0 ?
                execCommand(command, ...args as string[]) : [['']];
        }

        // set last command
        setLastCommand(newCommandResult);
        // write lines
        setConsoleLines([...consoleLines, newCommandResult]);
        // reset command pointer
        setCommandPointer(0);
        setInputValue('');
    };

    const handleArrowUpKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        tracker.trackEvent(TRACKER_EVENTS.HistoryUpArrow);
        if (commandPointer < commandHistory.length) {
            const newPointer = commandPointer + 1;
            setCommandPointer(newPointer);
            setInputValue(commandHistory[commandHistory.length - newPointer]);
        }
    };

    const handleArrowDownKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        if (commandPointer > DEFAULT_COMMAND_POINTER) {
            const newPointer = commandPointer - 1;
            setCommandPointer(newPointer);
            if (newPointer === 0) {
                setInputValue('');
            } else {
                setInputValue(commandHistory[commandHistory.length - newPointer]);
            }
        }
    };

    const handleEscapeKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        setCommandPointer(DEFAULT_COMMAND_POINTER);
        setInputValue('');
    };

    const handleTabKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // if input is empty, allow them to tab out
        if (inputRef.current?.value) {
            // add tab completion?
            event.preventDefault();
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        switch (event.key) {
            case 'Enter':
                // handled by form submit
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

    const handleHintClick = (hint: string) => {
        setInputValue(hint);
        inputRef.current?.focus();
    };

    // Set last login on component mount
    useEffect(() => {
        localStorage.setItem(LS_KEY_LAST_LOGIN, (new Date()).toISOString());
    }, []);

    // Auto-focus the input on component mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <ShellPromptView
            consoleLines={consoleLines}
            lastCommand={lastCommand}
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
            onHintClick={handleHintClick}
            inputRef={inputRef}
            inputValue={inputValue}
        />
    );
}

export default ShellPrompt;
