/**
 * Tests for `public/index.html`.
 *
 * Verifies the static HTML template has the identity, accessibility, and
 * AI/SEO meta tags that don't require a browser to inspect.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const REPO_ROOT = join(__dirname, '..', '..');
const INDEX_HTML_PATH = join(REPO_ROOT, 'public', 'index.html');

const readIndex = () => readFileSync(INDEX_HTML_PATH, 'utf8');

describe('public/index.html', () => {
    let content: string;

    beforeAll(() => {
        expect(existsSync(INDEX_HTML_PATH)).toBe(true);
        content = readIndex();
    });

    describe('primary meta', () => {
        test('has lang="en" on the html element', () => {
            expect(content).toMatch(/<html\s+lang=["']en["']/);
        });

        test('has a title containing the author name', () => {
            expect(content).toMatch(/<title>Shaun Burdick<\/title>/);
        });

        test('has a meta description with the full bio', () => {
            expect(content).toContain('Engineering Leader');
            expect(content).toContain('over 20 years');
            expect(content).toContain('innovation and collaboration');
        });

        test('has an author meta tag', () => {
            expect(content).toMatch(/<meta\s+name="author"\s+content="Shaun Burdick"/);
        });

        test('has profile:first_name and profile:last_name meta tags', () => {
            expect(content).toMatch(/<meta\s+name="profile:first_name"\s+content="Shaun"/);
            expect(content).toMatch(/<meta\s+name="profile:last_name"\s+content="Burdick"/);
        });

        test('has a canonical link pointing to https://shaunburdick.com/', () => {
            expect(content).toMatch(/<link\s+rel="canonical"\s+href="https:\/\/shaunburdick\.com\/"/);
        });
    });

    describe('Open Graph', () => {
        test('og:url uses https, not http', () => {
            expect(content).toMatch(/<meta\s+property="og:url"\s+content="https:\/\/shaunburdick\.com\//);
            expect(content).not.toMatch(/<meta\s+property="og:url"\s+content="http:\/\//);
        });

        test('has og:site_name, og:locale, og:type', () => {
            expect(content).toMatch(/<meta\s+property="og:site_name"/);
            expect(content).toMatch(/<meta\s+property="og:locale"/);
            expect(content).toMatch(/<meta\s+property="og:type"\s+content="website"/);
        });

        test('og:image has an alt attribute', () => {
            expect(content).toMatch(/<meta\s+property="og:image:alt"\s+content="Shaun Burdick"/);
        });
    });

    describe('Twitter card', () => {
        test('twitter:url uses https, not http', () => {
            expect(content).toMatch(/<meta\s+property="twitter:url"\s+content="https:\/\/shaunburdick\.com\//);
            expect(content).not.toMatch(/<meta\s+property="twitter:url"\s+content="http:\/\//);
        });

        test('twitter:image has an alt attribute', () => {
            expect(content).toMatch(/<meta\s+property="twitter:image:alt"\s+content="Shaun Burdick"/);
        });
    });

    describe('noscript fallback', () => {
        test('is present and human-readable for no-JS clients', () => {
            const noscript = content.match(/<noscript>([\s\S]*?)<\/noscript>/);
            expect(noscript).not.toBeNull();
            const inner = noscript?.[1] ?? '';
            expect(inner).toContain('Shaun Burdick');
            expect(inner).toContain('Syracuse, NY');
            expect(inner).toContain('linkedin.com/in/shaunburdick');
            expect(inner).toContain('github.com/shaunburdick');
        });

        test('does not link to a removed llms.txt (no dead 404s for no-JS clients)', () => {
            const noscript = content.match(/<noscript>([\s\S]*?)<\/noscript>/);
            expect(noscript).not.toBeNull();
            const inner = noscript?.[1] ?? '';
            expect(inner).not.toMatch(/href=["'][^"']*llms\.txt/);
        });
    });
});
