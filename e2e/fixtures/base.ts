import { test as base } from '@playwright/test';

/**
 * Extended Playwright test fixture with custom setup/teardown
 *
 * This fixture ensures each test runs in complete isolation with:
 * - Clean localStorage (no saved achievements, history, or preferences)
 * - Fresh browser context
 * - Automatic navigation to home page
 *
 * Best Practice: Test isolation prevents cascading failures and makes
 * tests reproducible regardless of execution order.
 */
export const test = base.extend({
    // Override page fixture to add custom setup
    page: async ({ page }, runTest) => {
        // Navigate to home page first
        await page.goto('/');

        // Clear localStorage ONCE at the start for test isolation
        // (not using addInitScript which would clear on every navigation/reload)
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });

        // Reload to start fresh
        await page.reload();

        // Wait for app to be ready (terminal input should be visible)
        await page.getByRole('textbox', { name: 'An input to enter commands.' }).waitFor({
            state: 'visible',
            timeout: 10000
        });

        // Run the test with the configured page
        await runTest(page);

    // Cleanup (if needed) happens here after test
    },
});

export { expect } from '@playwright/test';
