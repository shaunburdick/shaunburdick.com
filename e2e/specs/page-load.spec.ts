import { test, expect } from '../fixtures/base';
import { TerminalPage, CookieNoticePage } from '../pages';

/**
 * Basic E2E tests for terminal page load and rendering
 *
 * Tests the fundamental functionality of the terminal interface:
 * - Page loads successfully
 * - Terminal elements are visible
 * - Input is ready for commands
 */
test.describe('Terminal Page Load', () => {
    test('should load the homepage with terminal interface', async ({ page }) => {
        const terminal = new TerminalPage(page);

        // Verify page title
        await expect(page).toHaveTitle(/shaun burdick/i);

        // Verify terminal input is visible and ready
        await expect(terminal.commandInput).toBeVisible();
        await expect(terminal.commandInput).toBeEditable();
        await expect(terminal.commandInput).toHaveAttribute('placeholder', /help/i);

        // Verify console output area exists
        await expect(terminal.consoleOutput).toBeVisible();

        // Verify input has auto-focus for immediate use
        const isFocused = await terminal.isInputFocused();
        expect(isFocused).toBe(true);
    });

    test('should display hints button', async ({ page }) => {
        const terminal = new TerminalPage(page);

        // Verify hints button is visible
        await expect(terminal.hintsButton).toBeVisible();

        // Verify hints table is initially hidden
        await expect(terminal.hintsTable).toBeHidden();
    });

    test('should toggle hints table', async ({ page }) => {
        const terminal = new TerminalPage(page);
        const cookieNotice = new CookieNoticePage(page);

        // Accept cookies first to ensure cookie notice doesn't overlap hints button on mobile
        if (await cookieNotice.isVisible()) {
            await cookieNotice.accept();
            await cookieNotice.waitForHidden();
        }

        // Initially hidden
        await expect(terminal.hintsTable).toBeHidden();

        // Click to show
        await terminal.toggleHints();
        await expect(terminal.hintsTable).toBeVisible();

        // Click to hide
        await terminal.toggleHints();
        await expect(terminal.hintsTable).toBeHidden();
    });

    test('should have accessible ARIA labels', async ({ page }) => {
        const terminal = new TerminalPage(page);

        // Check console has proper ARIA labeling
        await expect(terminal.consoleOutput).toHaveAttribute('aria-label', /text-based console/i);

        // Check input has proper ARIA labeling
        await expect(terminal.commandInput).toHaveAttribute('aria-label', /enter commands/i);

        // Check aria-live region exists for screen reader support
        const liveRegion = page.locator('[aria-live="polite"]');
        await expect(liveRegion).toBeAttached();
    });
});
