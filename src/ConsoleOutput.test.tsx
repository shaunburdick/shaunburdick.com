import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import ConsoleOutput, { CommandResult } from './ConsoleOutput';

describe('ConsoleOutput', () => {
    const testCommands: Record<string, CommandResult> = {
        basic: {
            timestamp: new Date(),
            command: 'test command',
            response: [
                ['test response']
            ]
        },
        noCommand: {
            timestamp: new Date(),
            response: [
                ['no command']
            ]
        },
        emptyCommand:  {
            timestamp: new Date(),
            command: '',
            response: []
        },
        multiLine: {
            timestamp: new Date(),
            command: 'multiline',
            response: [
                ['line 1'],
                ['line 2'],
                ['line 3']
            ]
        }
    };

    test('Display a command result', () => {
        act(() => render(<ConsoleOutput commandResult={testCommands.basic} />));

        expect(screen.getByText(`${testCommands.basic.command}`)).toBeInTheDocument();
        expect(screen.getByText(`${testCommands.basic.response[0][0]}`)).toBeInTheDocument();
    });

    test('Set an aria-live value', () => {
        act(() => render(<ConsoleOutput commandResult={testCommands.basic} ariaLive='polite' />));

        expect(screen.getByText(`${testCommands.basic.command}`)).toBeInTheDocument();
        expect(screen.getByText(`${testCommands.basic.response[0][0]}`)).toBeInTheDocument();
        expect(document.body.querySelector('div [aria-live=polite]')).toBeInTheDocument();
    });

    test('Show empty command if an empty command is sent', () => {
        act(() => render(<ConsoleOutput commandResult={testCommands.emptyCommand} />));

        const commandSpan = document.body.querySelector('[aria-hidden]');
        expect(commandSpan).toBeInTheDocument();
        expect(commandSpan?.parentElement?.textContent).toBe('$ ');
        expect(document.body.querySelector('[aria-label="The command that was run"]')).toBeInTheDocument();
    });

    test('Show no command if none is provided', () => {
        act(() => render(<ConsoleOutput commandResult={testCommands.noCommand} />));

        expect(screen.getByText(`${testCommands.noCommand.response[0][0]}`)).toBeInTheDocument();
        expect(document.body.querySelector('[aria-label="The command that was run"]')).not.toBeInTheDocument();
    });

    test('Show multiple lines of output', () => {
        act(() => render(<ConsoleOutput commandResult={testCommands.multiLine} />));

        expect(screen.getByText(`${testCommands.multiLine.command}`)).toBeInTheDocument();

        testCommands.multiLine.response.forEach(line => {
            expect(screen.getByText(`${line[0]}`)).toBeInTheDocument();
        });
    });
});

