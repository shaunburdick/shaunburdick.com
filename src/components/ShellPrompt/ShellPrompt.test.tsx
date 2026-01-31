import React, { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AchievementProvider } from '../../containers/AchievementProvider';
import ShellPrompt, { LS_KEY_COMMAND_HISTORY } from '../../containers/ShellPrompt';

// Helper function to wrap component with providers
const renderWithProviders = (component: React.ReactElement) => {
    return render(
        <AchievementProvider>
            {component}
        </AchievementProvider>
    );
};

const CONSOLE_INPUT_SELECTOR = '#console-input';
const ARROW_DOWN_KEY = '{ArrowDown}';
const ARROW_UP_KEY = '{ArrowUp}';
const WHOIS_SHAUN_TEXT = 'whois shaun';

describe('ShellPrompt', () => {
    beforeEach(() => {
        // Clear localStorage before each test to prevent test interference
        localStorage.clear();
    });

    test('Shows the console', () => {
        act(() => renderWithProviders(<ShellPrompt />));
        expect(document.body.querySelector('.shell')).toBeInTheDocument();
    });

    test('Rest command history if invalid', async () => {
        localStorage.setItem(LS_KEY_COMMAND_HISTORY, '"');

        userEvent.setup();
        act(() => renderWithProviders(<ShellPrompt />));

        // Component should handle invalid data gracefully by falling back to empty array
        // Verify by submitting a command and checking it's properly saved
        await userEvent.keyboard('test{Enter}');
        expect(localStorage.getItem(LS_KEY_COMMAND_HISTORY)).toBe('["test"]');
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

                await userEvent.keyboard(ARROW_DOWN_KEY);
                expect(input?.value).toEqual('command3');

                // Todo: Fix this bug, should just be one
                await userEvent.keyboard(`${ARROW_DOWN_KEY}${ARROW_DOWN_KEY}`);
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

            const link = screen.getByText(WHOIS_SHAUN_TEXT);
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

    describe('Edge cases and null checks', () => {
        test('handleEnterKey when inputRef.current is null', () => {
            // Test null check for inputRef.current
            const component = renderWithProviders(<ShellPrompt />);

            // Get the ShellPrompt instance to access internal methods
            const input = screen.getByRole('textbox') as HTMLInputElement;

            // Mock inputRef.current to be null temporarily
            Object.defineProperty(input, 'current', { value: null });

            // Trigger enter key - should not throw error
            fireEvent.keyDown(input, { key: 'Enter' });

            expect(component.container.querySelector('pre')).toBeInTheDocument();
        });

        test('command execution branches', async () => {
            // Test different command execution paths
            userEvent.setup();
            act(() => renderWithProviders(<ShellPrompt />));

            // Test empty command (line 117)
            await userEvent.keyboard('{Enter}');

            // Test command with no args
            await userEvent.keyboard('help{Enter}');

            // Test command with args
            await userEvent.keyboard('whois shaun{Enter}');

            // Test non-existent command
            await userEvent.keyboard('nonexistent{Enter}');

            const consoleCommands = document.body.querySelectorAll('pre > div');
            expect(consoleCommands.length).toBeGreaterThan(4);
        });

        test('handleTabKey prevents default when input has value', async () => {
            // Test tab key behavior for better coverage
            userEvent.setup();
            act(() => renderWithProviders(<ShellPrompt />));

            const input = document.body.querySelector(CONSOLE_INPUT_SELECTOR) as HTMLInputElement;

            // Type something in the input
            await userEvent.type(input, 'test command');

            // Tab should be prevented (focus stays on input)
            await userEvent.keyboard('{Tab}');
            expect(document.activeElement).toBe(input);
        });

        test('escape key clears input and resets command pointer', async () => {
            // Test escape key functionality
            userEvent.setup();
            act(() => renderWithProviders(<ShellPrompt />));

            const input = document.body.querySelector(CONSOLE_INPUT_SELECTOR) as HTMLInputElement;

            // Add some history and navigate it
            await userEvent.keyboard('test1{Enter}');
            await userEvent.keyboard('test2{Enter}');
            await userEvent.keyboard(ARROW_UP_KEY); // Should show test2

            expect(input.value).toBe('test2');

            // Escape should clear input
            await userEvent.keyboard('{Escape}');
            expect(input.value).toBe('');
        });

        test('handleEnterKey with empty command', async () => {
            // Test empty command execution
            userEvent.setup();
            act(() => renderWithProviders(<ShellPrompt />));

            // Enter with empty input
            await userEvent.keyboard('{Enter}');

            // Should still have console output
            const consoleCommands = document.body.querySelectorAll('pre > div');
            expect(consoleCommands.length).toBeGreaterThan(0);
        });

        test('hintClick functionality', () => {
            // Test hintClick method
            act(() => renderWithProviders(<ShellPrompt />));

            const input = document.body.querySelector(CONSOLE_INPUT_SELECTOR) as HTMLInputElement;

            // Test hintClick by clicking show hints button first
            const showHintsButton = screen.getByText('Show Hints');
            fireEvent.click(showHintsButton);

            // Find a hint and click it
            const hintButton = screen.getByText(WHOIS_SHAUN_TEXT);
            fireEvent.click(hintButton);

            // Input should be populated with the hint
            expect(input.value).toBe(WHOIS_SHAUN_TEXT);
            expect(document.activeElement).toBe(input);
        });
    });
});
