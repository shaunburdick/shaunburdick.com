/**
 * Postbuild prerender step.
 *
 * Boots a headless Chromium via Playwright, loads the freshly built
 * `build/index.html`, waits for React to mount, and overwrites the file
 * with the post-render HTML so crawlers and no-JS HTTP clients see the
 * `<h1>` and welcome banner without executing the JS bundle.
 *
 * Behavior:
 * - Runs automatically as the `postbuild` npm lifecycle after `npm run build`.
 * - If Chromium cannot be launched (binary missing, sandbox issue, etc.) the
 *   step logs a warning and exits 0 — the build still succeeds, just without
 *   the prerender upgrade. This keeps CI green on minimal runners.
 * - Fails (exit 1) only if Chromium launches but rendering fails.
 *
 * Reuses the Playwright dependency already declared in package.json
 * (`@playwright/test`), so no new dependencies are introduced.
 */

import { access, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { chromium } from '@playwright/test';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..');
const BUILD_DIR = resolve(REPO_ROOT, 'build');
const INDEX_HTML = resolve(BUILD_DIR, 'index.html');

/** Maximum time to wait for React to populate #root (ms). */
const MOUNT_TIMEOUT_MS = 15_000;

/** Quiet window after mount to let welcome-banner effects settle (ms). */
const POST_MOUNT_QUIET_MS = 500;

/** Default logger: writes a single line to stdout. */
const defaultLog = (message) => {
    process.stdout.write(`${message}\n`);
};

/** Default warner: writes a single line to stderr. */
const defaultWarn = (message) => {
    process.stderr.write(`${message}\n`);
};

/**
 * @returns {Promise<boolean>} true when the prerender step ran and updated
 *   the file; false when the step was skipped (no build output, etc.).
 */
export async function prerender({
    buildDir = BUILD_DIR,
    indexHtmlPath = INDEX_HTML,
    mountTimeoutMs = MOUNT_TIMEOUT_MS,
    postMountQuietMs = POST_MOUNT_QUIET_MS,
    log = defaultLog,
    warn = defaultWarn,
} = {}) {
    // Skip silently if the build output is missing — the user may be running
    // this script in isolation. Webpack will produce the file before postbuild.
    try {
        await access(indexHtmlPath);
    } catch {
        log('[prerender] No build/index.html found; nothing to do.');
        return false;
    }

    let browser;
    try {
        browser = await chromium.launch();
    } catch (err) {
        warn(`[prerender] Could not launch Chromium: ${err.message}`);
        warn('[prerender] Skipping prerender. Build output is JS-only.');
        return false;
    }

    try {
        const page = await browser.newPage();
        const fileUrl = `file://${indexHtmlPath}`;

        await page.goto(fileUrl, { waitUntil: 'load', timeout: mountTimeoutMs });

        // Wait for React to mount: #root is empty in the static template and
        // populated by ReactDOM.createRoot().render() in src/index.tsx.
        await page.waitForFunction(
            () => {
                const root = document.getElementById('root');
                return root !== null && root.children.length > 0;
            },
            { timeout: mountTimeoutMs }
        );

        // Give effects (welcome banner render, hint buttons) a moment to flush.
        await page.waitForTimeout(postMountQuietMs);

        const renderedHtml = await page.content();
        await writeFile(indexHtmlPath, renderedHtml, 'utf8');

        log(`[prerender] Wrote post-render HTML to ${indexHtmlPath}`);
        log(`[prerender]   build dir: ${buildDir}`);
        return true;
    } finally {
        await browser.close();
    }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {
        try {
            const ran = await prerender();
            process.exit(ran ? 0 : 1);
        } catch (err) {
            defaultWarn(`[prerender] Failed: ${err.message}`);
            process.exit(1);
        }
    })();
}
