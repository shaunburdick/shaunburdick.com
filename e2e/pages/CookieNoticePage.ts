import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Cookie Notice component
 *
 * Handles all cookie notice interactions for E2E tests
 * Best Practice: Use data-testid for reliable, maintainable selectors
 */
export class CookieNoticePage extends BasePage {
    public readonly cookieNotice: Locator;
    public readonly acceptButton: Locator;
    public readonly rejectButton: Locator;

    public constructor(page: Page) {
        super(page);

        // Use data-testid for stable selectors
        this.cookieNotice = page.getByTestId('cookie-notice');
        this.acceptButton = page.getByTestId('cookie-accept');
        this.rejectButton = page.getByTestId('cookie-reject');
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
