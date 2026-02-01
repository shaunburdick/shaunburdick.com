import { test, expect } from '../fixtures/base';
import { CookieNoticePage, NotificationPage } from '../pages';

/**
 * E2E tests for Cookie Notice component
 *
 * Tests cookie acceptance flow:
 * - Cookie notice displays on first visit
 * - Accept button works correctly
 * - Reject button redirects (easter egg)
 * - Cookie preference persists across page loads
 */
test.describe('Cookie Notice', () => {
    test('should display cookie notice on first visit', async ({ page }) => {
        const cookies = new CookieNoticePage(page);

        // Cookie notice should be visible
        await expect(cookies.cookieNotice).toBeVisible();

        // Should show accept and reject buttons
        await expect(cookies.acceptButton).toBeVisible();
        await expect(cookies.rejectButton).toBeVisible();

        // Should contain cookie message text
        const noticeText = await cookies.cookieNotice.textContent();
        expect(noticeText).toContain('cookies');
        expect(noticeText).toContain('acknowledge');
    });

    test('should hide cookie notice after accepting', async ({ page }) => {
        const cookies = new CookieNoticePage(page);

        // Initially visible
        await expect(cookies.cookieNotice).toBeVisible();

        // Accept cookies
        await cookies.accept();

        // Should hide
        await cookies.waitForHidden();
        await expect(cookies.cookieNotice).toBeHidden();
    });

    test('should persist cookie preference across page reloads', async ({ page }) => {
        const cookies = new CookieNoticePage(page);

        // Accept cookies
        await cookies.accept();
        await cookies.waitForHidden();

        // Reload page
        await page.reload();

        // Wait a moment for page to load
        await page.waitForTimeout(500);

        // Cookie notice should NOT reappear
        const isVisible = await cookies.isVisible();
        expect(isVisible).toBe(false);
    });

    test('should store cookie acknowledgment in localStorage', async ({ page }) => {
        const cookies = new CookieNoticePage(page);

        // Accept cookies
        await cookies.accept();

        // Check localStorage
        const cookieAck = await page.evaluate(() => {
            return localStorage.getItem('cookieAcknowledge');
        });

        expect(cookieAck).toBe('true');
    });

    test('should trigger Accept Cookies achievement when accepting', async ({ page }) => {
        const cookies = new CookieNoticePage(page);
        const notifications = new NotificationPage(page);

        // Accept cookies
        await cookies.accept();

        // Should trigger achievement notification
        await notifications.waitForNotification('Accept Cookies', 5000);

        const hasAchievement = await notifications.hasNotificationWithText('Accept Cookies');
        expect(hasAchievement).toBe(true);
    });

    test('should have accessible ARIA labels', async ({ page }) => {
        const cookies = new CookieNoticePage(page);

        // Check cookie notice is visible with proper structure
        await expect(cookies.cookieNotice).toBeVisible();

        // Check that the content inside has proper labeling
        const preElement = page.locator('[aria-label="Cookie Notice"]');
        await expect(preElement).toBeVisible();

        // Buttons should be keyboard accessible
        await expect(cookies.acceptButton).toBeVisible();
        await expect(cookies.acceptButton).toBeEnabled();
        await expect(cookies.rejectButton).toBeVisible();
        await expect(cookies.rejectButton).toBeEnabled();
    });

    // Note: Testing the reject button (which redirects to oreo.com) would cause
    // the test to navigate away from the site, so we skip that in E2E tests.
    // That behavior is tested in unit tests instead.
});
