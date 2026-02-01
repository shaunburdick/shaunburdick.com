import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for end-to-end testing
 *
 * Best practices implemented:
 * - Auto-start dev server before tests
 * - Test isolation with fresh context per test
 * - Retries on CI for flaky test mitigation
 * - Parallel execution for speed
 * - HTML reporter with trace on failure for debugging
 * - Base URL for relative navigation
 *
 * WSL2 Compatibility: Uses 127.0.0.1 instead of localhost for reliable
 * network connectivity in WSL2 environments. The webpack dev server is
 * configured with explicit host binding to 127.0.0.1:8080.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    // Look for test files in the "e2e" directory
    testDir: './e2e',

    // Maximum time one test can run for
    timeout: 30 * 1000,

    // Run tests in files in parallel
    fullyParallel: true,

    // Fail the build on CI if you accidentally left test.only in the source code
    forbidOnly: (typeof process.env.CI === 'string' && process.env.CI.length > 0),

    // Retry on CI only (flaky test mitigation)
    retries: (typeof process.env.CI === 'string' && process.env.CI.length > 0) ? 2 : 0,

    // Opt out of parallel tests on CI (to avoid resource contention)
    workers: (typeof process.env.CI === 'string' && process.env.CI.length > 0) ? 1 : undefined,

    // Reporter to use - HTML for local development, GitHub for CI
    reporter: (typeof process.env.CI === 'string' && process.env.CI.length > 0)
        ? 'github'
        : [
            ['html', { outputFolder: 'playwright-report' }],
            ['list']
        ],

    // Shared settings for all the projects below
    use: {
    // Base URL to use in actions like `await page.goto('/')`
        baseURL: 'http://127.0.0.1:8080',

        // Collect trace when retrying the failed test (debugging aid)
        trace: 'on-first-retry',

        // Screenshot on failure
        screenshot: 'only-on-failure',

        // Video on first retry
        video: 'retain-on-failure',

        // Emulate consistent viewport
        viewport: { width: 1280, height: 720 },
    },

    // Configure projects for major browsers
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                // Use data-testid attributes as primary locator strategy
                testIdAttribute: 'data-testid',
            },
        },

        // Uncomment to test on other browsers:
        // {
        //   name: 'firefox',
        //   use: { ...devices['Desktop Firefox'] },
        // },
        // {
        //   name: 'webkit',
        //   use: { ...devices['Desktop Safari'] },
        // },

    // Test on mobile viewports
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
    ],

    // Run your local dev server before starting the tests
    webServer: [
        {
            // Development server (for tests against dev build)
            // Uses --no-open flag to prevent auto-opening browser tabs
            command: 'npm run start:no-open',
            url: 'http://127.0.0.1:8080',
            name: 'Dev Server',
            timeout: 120 * 1000,
            reuseExistingServer: !(typeof process.env.CI === 'string' && process.env.CI.length > 0),
            stdout: 'pipe',
            stderr: 'pipe',
        },
    // Uncomment to also test against production build:
    // {
    //   // Production build server
    //   command: 'npm run build && npx serve -s build -l 3000',
    //   url: 'http://localhost:3000',
    //   name: 'Production Server',
    //   timeout: 120 * 1000,
    //   reuseExistingServer: !process.env.CI,
    //   stdout: 'ignore',
    //   stderr: 'pipe',
    // },
    ],
});
