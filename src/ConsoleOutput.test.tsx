import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import ConsoleOutput, { CommandResult } from './ConsoleOutput';

describe('ConsoleOutput', () => {
    test('Display a command result', () => {
        const commandResult: CommandResult = {
            timestamp: new Date(),
            command: 'test command',
            response: [
                ['test response']
            ]
        };
        act(() => render(<ConsoleOutput commandResult={commandResult} />));
        expect(screen.getByText(`${commandResult.command}`)).toBeInTheDocument();
        expect(screen.getByText(`${commandResult.response[0][0]}`)).toBeInTheDocument();
    });
});

