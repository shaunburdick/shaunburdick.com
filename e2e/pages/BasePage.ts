import type { Page, Locator } from '@playwright/test';

/**
 * Base Page Object class providing common functionality for all page objects
 *
 * Best Practice: Use Page Object Model to:
 * - Centralize element selectors
 * - Provide reusable actions
 * - Make tests more maintainable
 * - Hide implementation details from tests
 */
export class BasePage {
    protected readonly page: Page;

    public constructor(page: Page) {
        this.page = page;
    }

    /**
     * Navigate to a specific path
     *
     * @param path - Relative path from baseURL
     */
    public async goto(path = '/'): Promise<void> {
        await this.page.goto(path);
    }

    /**
     * Wait for an element to be visible
     *
     * @param locator - Playwright locator
     * @param timeout - Maximum wait time in milliseconds
     */
    public async waitForVisible(locator: Locator, timeout = 10000): Promise<void> {
        await locator.waitFor({ state: 'visible', timeout });
    }

    /**
     * Wait for an element to be hidden
     *
     * @param locator - Playwright locator
     * @param timeout - Maximum wait time in milliseconds
     */
    public async waitForHidden(locator: Locator, timeout = 10000): Promise<void> {
        await locator.waitFor({ state: 'hidden', timeout });
    }

    /**
     * Get the page title
     *
     * @returns Promise resolving to page title
     */
    public async getTitle(): Promise<string> {
        return await this.page.title();
    }

    /**
     * Take a screenshot (useful for debugging)
     *
     * @param name - Screenshot file name
     */
    public async screenshot(name: string): Promise<void> {
        await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
    }
}
