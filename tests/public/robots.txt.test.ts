/**
 * Tests for `public/robots.txt`.
 *
 * The site intentionally does not block any user-agent (including AI
 * crawlers). These tests guard that policy.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const REPO_ROOT = join(__dirname, '..', '..');
const ROBOTS_TXT_PATH = join(REPO_ROOT, 'public', 'robots.txt');

const readRobots = () => readFileSync(ROBOTS_TXT_PATH, 'utf8');

describe('public/robots.txt', () => {
    let content: string;

    beforeAll(() => {
        expect(existsSync(ROBOTS_TXT_PATH)).toBe(true);
        content = readRobots();
    });

    test('starts with a robots.txt spec reference comment', () => {
        expect(content).toMatch(/^# https:\/\/www\.robotstxt\.org\/robotstxt\.html/);
    });

    test('allows all user-agents (no global Disallow)', () => {
        expect(content).toMatch(/^User-agent:\s*\*\s*$/m);
        // The policy is "fully open" — no `Disallow: /` blanket rule.
        expect(content).not.toMatch(/^Disallow:\s*\/\s*$/m);
    });

    test('does not block any common AI crawler', () => {
        // For each bot, find the `User-agent: <bot>` line (if any) and
        // verify the next directive isn't `Disallow: /`. Uses string
        // operations only — no dynamic RegExp construction.
        const aiCrawlers = [
            'GPTBot',
            'ClaudeBot',
            'CCBot',
            'Google-Extended',
            'PerplexityBot',
            'anthropic-ai',
        ];
        for (const bot of aiCrawlers) {
            const header = `User-agent: ${bot}`;
            const idx = content.indexOf(header);
            if (idx === -1) {
                // The bot isn't mentioned at all — it falls under the
                // wildcard `User-agent: *` rule above, which is open.
                expect(content).toMatch(/^User-agent:\s*\*\s*$/m);
            } else {
                // Inspect the next ~200 chars after the header for a
                // `Disallow: /` directive (a "block everything" rule).
                const slice = content.slice(idx, idx + 200);
                expect(slice).not.toMatch(/Disallow:\s*\/\s*$/m);
            }
        }
    });

    test('does not reference llms.txt (the file was intentionally removed)', () => {
        // Guard against accidentally re-adding a reference if llms.txt is
        // ever reintroduced — the meta tags in index.html are the canonical
        // AI-discoverability surface for this site.
        expect(content).not.toMatch(/llms\.txt/);
    });
});
