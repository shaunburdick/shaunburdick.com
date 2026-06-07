/**
 * Tests for `scripts/prerender.js`.
 *
 * The full browser-based prerender is exercised by `npm run build` and
 * verified manually by inspecting `build/index.html`. The unit tests
 * here cover only the static, file-level invariants we can check
 * without launching Chromium:
 *
 *  - the file exists
 *  - it exports a `prerender` function
 *  - it has a code path that returns `false` when build/index.html is missing
 *  - it uses @playwright/test (the existing dev dep)
 *
 * The actual browser launch path is exercised by the `postbuild` npm
 * lifecycle hook and is not unit-tested; that path requires a chromium
 * binary which is installed in CI but not in every developer's env.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const REPO_ROOT = join(__dirname, '..', '..');
const PRERENDER_PATH = join(REPO_ROOT, 'scripts', 'prerender.js');

const readPrerender = () => readFileSync(PRERENDER_PATH, 'utf8');

describe('scripts/prerender.js', () => {
    test('file exists', () => {
        expect(existsSync(PRERENDER_PATH)).toBe(true);
    });

    test('exports a `prerender` function', () => {
        expect(readPrerender()).toMatch(/export\s+(async\s+)?function\s+prerender\s*\(/);
    });

    test('has a "missing build output" code path that returns false', () => {
        // The contract: if build/index.html doesn't exist, prerender() logs
        // a message and returns false (no throw).
        const source = readPrerender();
        // access() is awaited, a try/catch returns false.
        expect(source).toMatch(/await\s+access\s*\(/);
        expect(source).toMatch(/catch\s*\{[\s\S]*?return\s+false/);
    });

    test('imports Chromium from @playwright/test (reuses the existing dev dep)', () => {
        expect(readPrerender()).toContain("from '@playwright/test'");
    });

    test('reuses Playwright without introducing a new dev dependency', () => {
        // The dev dep set in package.json should not have grown.
        const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8'));
        const devDeps = Object.keys(pkg.devDependencies ?? {});
        // Spot-check the existing dependency is declared.
        expect(devDeps).toContain('@playwright/test');
        // Spot-check that no new prerender-specific deps slipped in.
        expect(devDeps).not.toContain('react-snap');
        expect(devDeps).not.toContain('prerenderer');
        expect(devDeps).not.toContain('puppeteer');
    });
});
