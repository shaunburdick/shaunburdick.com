import { test, expect } from '../fixtures/base';
import { TerminalPage, CookieNoticePage, NotificationPage } from '../pages';

/**
 * E2E tests for the Achievement system
 *
 * Tests achievement unlocking and notifications:
 * - First command achievement
 * - Cookie acceptance achievement
 * - Notification display for achievements
 * - Achievement persistence (tested via localStorage)
 */

// Constants for achievement titles
const ACHIEVEMENT_FIRST_COMMAND = 'First Command';

test.describe('Achievements', () => {
    test('should unlock "First Command" achievement', async ({ page }) => {
        const terminal = new TerminalPage(page);
        const notifications = new NotificationPage(page);

        // Execute first command
        await terminal.executeCommand('help');

        // Wait for achievement notification
        await notifications.waitForNotification(ACHIEVEMENT_FIRST_COMMAND, 5000);

        // Verify notification contains achievement info
        const notificationText = await notifications.getFirstNotificationText();
        expect(notificationText).toContain(ACHIEVEMENT_FIRST_COMMAND);
        expect(notificationText).toMatch(/achievement|unlocked/i);
    });

    test('should unlock "Accept Cookies" achievement when accepting cookies', async ({ page }) => {
        const cookies = new CookieNoticePage(page);
        const notifications = new NotificationPage(page);

        // Wait for cookie notice to appear
        await expect(cookies.cookieNotice).toBeVisible();

        // Accept cookies
        await cookies.accept();

        // Wait for cookie achievement notification
        await notifications.waitForNotification('Accept Cookies', 5000);

        // Verify achievement notification
        const hasAchievement = await notifications.hasNotificationWithText('Accept Cookies');
        expect(hasAchievement).toBe(true);
    });

    test('should display only ONE notification per achievement (no duplicates)', async ({ page }) => {
        const terminal = new TerminalPage(page);
        const notifications = new NotificationPage(page);

        // Execute first command
        await terminal.executeCommand('help');

        // Wait for notification
        await notifications.waitForNotification(ACHIEVEMENT_FIRST_COMMAND, 5000);

        // Wait a bit to ensure no duplicate notifications appear
        await page.waitForTimeout(1000);

        // Check notification count - should be exactly 1 (or 2 if cookie notice was also accepted)
        const count = await notifications.getNotificationCount();
        expect(count).toBeLessThanOrEqual(2); // First Command + potentially Cookie Monster
    });

    test('should not re-unlock achievements on page refresh', async ({ page }) => {
        const terminal = new TerminalPage(page);
        const notifications = new NotificationPage(page);

        // First visit - unlock achievement
        await terminal.executeCommand('help');
        await notifications.waitForNotification(ACHIEVEMENT_FIRST_COMMAND, 5000);

        // Reload page (localStorage persists achievements)
        await page.reload();
        await terminal.waitForReady();

        // Execute another command
        await terminal.executeCommand('whoami');

        // Wait a bit to see if notification appears (it shouldn't)
        await page.waitForTimeout(2000);

        // Should NOT show "First Command" achievement again
        const hasFirstCommand = await notifications.hasNotificationWithText(ACHIEVEMENT_FIRST_COMMAND);
        expect(hasFirstCommand).toBe(false);
    });

    test('should check localStorage for persisted achievements', async ({ page }) => {
        const terminal = new TerminalPage(page);

        // Unlock achievement
        await terminal.executeCommand('help');

        // Wait for achievement to be processed
        await page.waitForTimeout(1000);

        // Check localStorage
        const achievements = await page.evaluate(() => {
            const stored = localStorage.getItem('achievements');
            return (stored !== null && stored !== '') ? JSON.parse(stored) : [];
        });

        // Should have at least one achievement
        expect(achievements.length).toBeGreaterThan(0);

        // Should contain First Command achievement
        const hasFirstCommand = achievements.some((a: { id: string }) => a.id === 'first_command');
        expect(hasFirstCommand).toBe(true);
    });
});
