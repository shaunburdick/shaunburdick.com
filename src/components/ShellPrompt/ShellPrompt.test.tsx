import React, { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AchievementProvider } from '../Achievements/Achievements';
import ShellPrompt, { LS_KEY_COMMAND_HISTORY } from './ShellPrompt';

// Helper function to wrap component with providers
const renderWithProviders = (component: React.ReactElement) => {
    return render(
        <AchievementProvider>
            {component}
        </AchievementProvider>
    );
};

const CONSOLE_INPUT_SELECTOR = '#console-input';

describe('ShellPrompt', () => {
    test('Shows the console', () => {
        act(() => renderWithProviders(<ShellPrompt />));
        expect(document.body.querySelector('.shell')).toBeInTheDocument();
    });

    test('Rest command history if invalid', () => {
        localStorage.setItem(LS_KEY_COMMAND_HISTORY, '"');

        act(() => renderWithProviders(<ShellPrompt />));
        expect(localStorage.getItem(LS_KEY_COMMAND_HISTORY)).toBe('[]');
    });

    describe('Commands', () => {
        describe('history', () => {
            test('should save your history', async () => {
                userEvent.setup();
                act(() => renderWithProviders(<ShellPrompt />));

                await userEvent.keyboard('command1{Enter}');
                await userEvent.keyboard('command2{Enter}');
                await userEvent.keyboard('command3{Enter}');

                const consoleCommands = document.body.querySelectorAll('pre > div');
                expect(consoleCommands.length).toBe(4); // +1 for welcome message
                expect(localStorage.getItem(LS_KEY_COMMAND_HISTORY))
                    .toEqual(JSON.stringify(['command1', 'command2', 'command3']));

                // test the up arrow history
                const input = document.body.querySelector('#console-input') as HTMLInputElement;
                expect(input).toBeInTheDocument();

                // it should start empty
                expect(input?.value).toEqual('');

                await userEvent.keyboard('{ArrowUp}');
                expect(input?.value).toEqual('command3');

                await userEvent.keyboard('{ArrowUp}');
                expect(input?.value).toEqual('command2');

                await userEvent.keyboard('{ArrowDown}');
                expect(input?.value).toEqual('command3');

                await userEvent.keyboard('{ArrowDown}{ArrowDown}'); // Todo: Fix this bug, should just be one
                expect(input?.value).toEqual('');
            });
        });

        describe('clear', () => {
            test('should clear the screen', async () => {
                userEvent.setup();
                act(() => renderWithProviders(<ShellPrompt />));

                await userEvent.keyboard('clear{Enter}');

                const consoleCommands = document.body.querySelectorAll('pre > div');
                expect(consoleCommands.length).toBe(1);
                expect(consoleCommands[0]).toBeEmptyDOMElement();
            });
        });

        test('Empty command should show an empty result', async () => {
            userEvent.setup();
            act(() => renderWithProviders(<ShellPrompt />));

            await userEvent.keyboard('{Enter}');

            const latestCommand = document.body.querySelector('[aria-live="polite"]');
            const commandSpan = latestCommand?.querySelector('[aria-hidden]');
            expect(commandSpan).toBeInTheDocument();
            expect(commandSpan?.parentElement?.textContent).toBe('$ ');
        });
    });

    describe('Hints', () => {
        test('Clicking hint should update input with value', () => {
            act(() => renderWithProviders(<ShellPrompt />));

            const button = screen.getByText('Show Hints');
            fireEvent.click(button);

            const link = screen.getByText('whois shaun');
            fireEvent.click(link);

            const input = document.body.querySelector(CONSOLE_INPUT_SELECTOR) as HTMLInputElement;
            expect(input).toBeInTheDocument();
            expect(input?.value).toEqual('whois shaun');
        });
    });

    describe('Keyboard', () => {
        describe('tab completions', () => {
            test('should prevent loss of focus on the input if there is content', async () => {
                userEvent.setup();
                act(() => renderWithProviders(<ShellPrompt />));

                const cmdInput = document.querySelector(CONSOLE_INPUT_SELECTOR);
                expect(cmdInput).not.toBeNull();

                // Should be focused on input
                expect(document.activeElement).toEqual(cmdInput);

                // type a command and try to tab out
                await userEvent.keyboard('command1{Tab}');

                // Should be focused on input
                expect(document.activeElement).toEqual(cmdInput);

                // clear input
                (cmdInput as HTMLInputElement).value = '';

                await userEvent.keyboard('{Tab}');

                // Should not be focused on input
                expect(document.activeElement).not.toEqual(cmdInput);
            });
        });

        describe('escape', () => {
            test('should clear the input', async () => {
                userEvent.setup();
                act(() => renderWithProviders(<ShellPrompt />));

                const cmdInput = document.querySelector(CONSOLE_INPUT_SELECTOR);
                expect(cmdInput).not.toBeNull();

                // type a command
                await userEvent.keyboard('command1');
                expect((cmdInput as HTMLInputElement).value).toEqual('command1');

                await userEvent.keyboard('{Escape}');

                // Should be empty
                expect((cmdInput as HTMLInputElement).value).toEqual('');
            });
        });
    });
});
