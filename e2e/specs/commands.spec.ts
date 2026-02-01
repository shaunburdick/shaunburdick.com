import { test, expect } from '../fixtures/base';
import { TerminalPage } from '../pages';

/**
 * E2E tests for command execution in the terminal
 *
 * Tests various commands and their outputs:
 * - help command
 * - clear command
 * - history command
 * - Command history navigation with arrow keys
 * - Escape to clear input
 */
test.describe('Command Execution', () => {
    test('should execute help command and display available commands', async ({ page }) => {
        const terminal = new TerminalPage(page);

        await terminal.executeCommand('help');

        // Verify help output contains expected commands
        const output = await terminal.getAllOutput();
        expect(output).toContain('List of Commands');
        expect(output).toContain('help');
        expect(output).toContain('clear');
        expect(output).toContain('history');
        expect(output).toContain('whoami');
    });

    test('should execute clear command and clear console', async ({ page }) => {
        const terminal = new TerminalPage(page);

        // Execute some commands first
        await terminal.executeCommand('help');
        await terminal.executeCommand('whoami');

        // Verify there's output
        let output = await terminal.getAllOutput();
        expect(output.length).toBeGreaterThan(50);

        // Clear the console
        await terminal.clear();

        // Wait for clear to complete
        await page.waitForTimeout(300);

        // Verify console is mostly empty (should only have the clear command itself)
        output = await terminal.getAllOutput();
        expect(output.length).toBeLessThan(50);
    });

    test('should execute history command and show command history', async ({ page }) => {
        const terminal = new TerminalPage(page);

        // Execute several commands
        await terminal.executeCommand('help');
        await terminal.executeCommand('whoami');
        await terminal.executeCommand('pwd');

        // Check history
        await terminal.executeCommand('history');

        const output = await terminal.getAllOutput();
        expect(output).toContain('help');
        expect(output).toContain('whoami');
        expect(output).toContain('pwd');
    });

    test('should navigate command history with arrow keys', async ({ page }) => {
        const terminal = new TerminalPage(page);

        // Execute some commands
        await terminal.executeCommand('help');
        await terminal.executeCommand('whoami');
        await terminal.executeCommand('pwd');

        // Navigate history with up arrow
        await terminal.navigateHistory('up');
        let inputValue = await terminal.getInputValue();
        expect(inputValue).toBe('pwd');

        // Navigate up again
        await terminal.navigateHistory('up');
        inputValue = await terminal.getInputValue();
        expect(inputValue).toBe('whoami');

        // Navigate down
        await terminal.navigateHistory('down');
        inputValue = await terminal.getInputValue();
        expect(inputValue).toBe('pwd');
    });

    test('should clear input with Escape key', async ({ page }) => {
        const terminal = new TerminalPage(page);

        // Type something but don't submit
        await terminal.commandInput.fill('some random text');

        let inputValue = await terminal.getInputValue();
        expect(inputValue).toBe('some random text');

        // Press Escape
        await terminal.pressEscape();

        // Verify input is cleared
        inputValue = await terminal.getInputValue();
        expect(inputValue).toBe('');
    });

    test('should execute whoami command', async ({ page }) => {
        const terminal = new TerminalPage(page);

        await terminal.executeCommand('whoami');

        const output = await terminal.getAllOutput();
        expect(output).toContain('You\'re you, silly');
    });

    test('should execute pwd command', async ({ page }) => {
        const terminal = new TerminalPage(page);

        await terminal.executeCommand('pwd');

        const output = await terminal.getAllOutput();
        expect(output).toContain('$ pwd');
        expect(output).toContain('/');
    });

    test('should execute version command', async ({ page }) => {
        const terminal = new TerminalPage(page);

        await terminal.executeCommand('version');

        const output = await terminal.getAllOutput();
        // Should show version number (format: X.Y.Z)
        expect(output).toMatch(/\d+\.\d+\.\d+/);
    });

    test('should handle empty command gracefully', async ({ page }) => {
        const terminal = new TerminalPage(page);

        // Submit empty command
        await terminal.executeCommand('');

        // Should not crash or show error
        await expect(terminal.commandInput).toBeVisible();
        await expect(terminal.commandInput).toBeEditable();
    });

    test('should handle unknown command', async ({ page }) => {
        const terminal = new TerminalPage(page);

        await terminal.executeCommand('unknowncommand123');

        const output = await terminal.getLastOutput();
        expect(output).toMatch(/not found|unknown|invalid/i);
    });

    test('should maintain input focus after command execution', async ({ page }) => {
        const terminal = new TerminalPage(page);

        await terminal.executeCommand('help');

        // Verify input still has focus
        const isFocused = await terminal.isInputFocused();
        expect(isFocused).toBe(true);
    });
});
