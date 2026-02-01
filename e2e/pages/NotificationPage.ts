import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for Notification (Toast) messages
 *
 * Handles verification of achievement notifications and other toasts
 */
export class NotificationPage extends BasePage {
    public constructor(page: Page) {
        super(page);
    }

    /**
     * Get all visible notification elements
     *
     * @returns Locator for all visible notifications
     */
    public getNotifications(): Locator {
        return this.page.getByTestId('notification');
    }

    /**
     * Check if any notifications are visible
     *
     * @returns Promise resolving to true if notifications exist
     */
    public async hasNotifications(): Promise<boolean> {
        const count = await this.getNotifications().count();
        return count > 0;
    }

    /**
     * Wait for a notification with specific text to appear
     *
     * @param text - Text to search for in notification
     * @param timeout - Maximum wait time in milliseconds
     * @returns Promise that resolves when notification appears
     */
    public async waitForNotification(text: string, timeout = 5000): Promise<void> {
        await this.page.waitForSelector(`[role="alert"].notification:has-text("${text}")`, {
            state: 'visible',
            timeout
        });
    }

    /**
     * Get the text content of the first visible notification
     *
     * @returns Promise resolving to notification text
     */
    public async getFirstNotificationText(): Promise<string> {
        const notification = this.getNotifications().first();
        const text = await notification.textContent();
        return text ?? '';
    }

    /**
     * Get count of visible notifications
     *
     * @returns Promise resolving to notification count
     */
    public async getNotificationCount(): Promise<number> {
        return await this.getNotifications().count();
    }

    /**
     * Check if a specific notification text is visible
     *
     * @param text - Text to search for
     * @returns Promise resolving to true if notification with text exists
     */
    public async hasNotificationWithText(text: string): Promise<boolean> {
        const notification = this.page.locator(`[role="alert"].notification:has-text("${text}")`);
        return await notification.isVisible();
    }

    /**
     * Wait for all notifications to disappear
     *
     * @param timeout - Maximum wait time in milliseconds
     * @returns Promise that resolves when all notifications are gone
     */
    public async waitForAllNotificationsToDisappear(timeout = 10000): Promise<void> {
        await this.page.waitForSelector('[role="alert"].notification', {
            state: 'hidden',
            timeout
        });
    }
}
