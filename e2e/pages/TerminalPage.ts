import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Terminal (ShellPrompt) component
 *
 * Encapsulates all interactions with the terminal interface:
 * - Entering commands
 * - Reading output
 * - Checking command history
 * - Interacting with hints
 *
 * Best Practice: Use data-testid for reliable, maintainable selectors
 * that won't break when UI text or ARIA labels change
 */
export class TerminalPage extends BasePage {
    // Locators using data-testid for reliability
    public readonly commandInput: Locator;
    public readonly consoleOutput: Locator;
    public readonly hintsButton: Locator;
    public readonly hintsTable: Locator;

    public constructor(page: Page) {
        super(page);

        // Use data-testid for stable, fast selectors
        this.commandInput = page.getByTestId('console-input');
        this.consoleOutput = page.getByTestId('console-output');
        this.hintsButton = page.getByTestId('hints-toggle');
        this.hintsTable = page.getByTestId('hints-table');
    }

    /**
     * Type and execute a command in the terminal
     *
     * @param command - The command to execute
     * @returns Promise that resolves when command is submitted
     */
    public async executeCommand(command: string): Promise<void> {
        await this.commandInput.fill(command);
        await this.commandInput.press('Enter');

        // Wait a bit for command to process and render
        await this.page.waitForTimeout(100);
    }

    /**
     * Get the last line of console output
     *
     * @returns Promise resolving to the last output line text
     */
    public async getLastOutput(): Promise<string> {
    // Wait for any new content to render
        await this.page.waitForTimeout(200);

        // Get the last div with aria-live inside the console output pre element
        const liveRegion = this.consoleOutput.locator('[aria-live="polite"]').last();
        const text = await liveRegion.textContent();
        return text ?? '';
    }

    /**
     * Get all console output text
     *
     * @returns Promise resolving to full console text
     */
    public async getAllOutput(): Promise<string> {
        const text = await this.consoleOutput.textContent();
        return text ?? '';
    }

    /**
     * Check if a specific text appears in the console output
     *
     * @param text - Text to search for
     * @returns Promise resolving to true if text is found
     */
    public async hasOutput(text: string): Promise<boolean> {
        const output = await this.getAllOutput();
        return output.includes(text);
    }

    /**
     * Clear the terminal by executing the clear command
     *
     * @returns Promise that resolves when terminal is cleared
     */
    public async clear(): Promise<void> {
        await this.executeCommand('clear');
    }

    /**
     * Get the current value in the command input
     *
     * @returns Promise resolving to input value
     */
    public async getInputValue(): Promise<string> {
        return await this.commandInput.inputValue();
    }

    /**
     * Navigate command history with arrow keys
     *
     * @param direction - 'up' or 'down'
     * @returns Promise that resolves when key is pressed
     */
    public async navigateHistory(direction: 'up' | 'down'): Promise<void> {
        const key = direction === 'up' ? 'ArrowUp' : 'ArrowDown';
        await this.commandInput.press(key);
    }

    /**
     * Press Escape key to clear input
     *
     * @returns Promise that resolves when Escape is pressed
     */
    public async pressEscape(): Promise<void> {
        await this.commandInput.press('Escape');
    }

    /**
     * Press Tab key for auto-completion
     *
     * @returns Promise that resolves when Tab is pressed
     */
    public async pressTab(): Promise<void> {
        await this.commandInput.press('Tab');
    }

    /**
     * Toggle the hints panel
     *
     * @returns Promise that resolves when hints button is clicked
     */
    public async toggleHints(): Promise<void> {
        await this.hintsButton.click();
    }

    /**
     * Check if hints table is visible
     *
     * @returns Promise resolving to true if hints are visible
     */
    public async areHintsVisible(): Promise<boolean> {
        return await this.hintsTable.isVisible();
    }

    /**
     * Click a specific hint in the hints table
     *
     * @param hintText - Text of the hint to click (for finding the right button)
     * @returns Promise that resolves when hint is clicked
     */
    public async clickHint(hintText: string): Promise<void> {
        // Get all hint buttons and find the one with matching text
        const hintButtons = this.page.getByTestId('hint-button');
        const count = await hintButtons.count();

        for (let i = 0; i < count; i++) {
            const button = hintButtons.nth(i);
            const text = await button.textContent();
            if ((text !== null) && (text.length > 0) && text.includes(hintText)) {
                await button.click();
                return;
            }
        }

        throw new Error(`Hint with text "${hintText}" not found`);
    }

    /**
     * Wait for terminal to be ready for input
     *
     * @returns Promise that resolves when terminal is ready
     */
    public async waitForReady(): Promise<void> {
        await this.commandInput.waitFor({ state: 'visible' });
        await this.waitForVisible(this.commandInput);
    }

    /**
     * Check if input has focus
     *
     * @returns Promise resolving to true if input is focused
     */
    public async isInputFocused(): Promise<boolean> {
        return await this.commandInput.evaluate(el => el === document.activeElement);
    }
}
