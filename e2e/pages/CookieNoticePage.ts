import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Cookie Notice component
 *
 * Handles interactions with the cookie acknowledgment notice
 */
export class CookieNoticePage extends BasePage {
    public readonly cookieNotice: Locator;
    public readonly acceptButton: Locator;
    public readonly rejectButton: Locator;

    public constructor(page: Page) {
        super(page);

        this.cookieNotice = page.getByLabel(/cookie notice/i);
        this.acceptButton = page.getByRole('button', { name: /yes/i });
        this.rejectButton = page.getByRole('button', { name: /no/i });
    }

    /**
     * Check if cookie notice is visible
     *
     * @returns Promise resolving to true if notice is visible
     */
    public async isVisible(): Promise<boolean> {
        return await this.cookieNotice.isVisible();
    }

    /**
     * Accept cookies
     *
     * @returns Promise that resolves when accept button is clicked
     */
    public async accept(): Promise<void> {
        await this.acceptButton.click();
    }

    /**
     * Reject cookies (redirects to oreo.com as a joke)
     *
     * @returns Promise that resolves when reject button is clicked
     */
    public async reject(): Promise<void> {
        await this.rejectButton.click();
    }

    /**
     * Wait for cookie notice to disappear
     *
     * @returns Promise that resolves when notice is hidden
     */
    public async waitForHidden(): Promise<void> {
        await this.cookieNotice.waitFor({ state: 'hidden' });
    }
}
