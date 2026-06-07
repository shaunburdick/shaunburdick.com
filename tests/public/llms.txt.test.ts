/**
 * Tests for `public/llms.txt`.
 *
 * Verifies the file exists at the project root, is valid markdown, and
 * contains the curated identity sections an AI crawler would consume.
 * The test intentionally does NOT assert exact prose — only structural
 * elements that future content edits must preserve.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const REPO_ROOT = join(__dirname, '..', '..');
const LLMS_TXT_PATH = join(REPO_ROOT, 'public', 'llms.txt');

const readLlms = () => readFileSync(LLMS_TXT_PATH, 'utf8');

describe('public/llms.txt', () => {
    test('file exists at public/llms.txt', () => {
        expect(existsSync(LLMS_TXT_PATH)).toBe(true);
    });

    describe('content', () => {
        let content: string;

        beforeAll(() => {
            content = readLlms();
        });

        test('starts with H1 containing the author name', () => {
            expect(content).toMatch(/^# Shaun Burdick\s*$/m);
        });

        test('contains a blockquote summary', () => {
            // The spec mandates > as a blockquote marker on its own line.
            expect(content).toMatch(/^> /m);
            // And the summary should mention the author's name.
            expect(content).toMatch(/^> .*Shaun Burdick/m);
        });

        test('has an About section with role, location, experience', () => {
            expect(content).toMatch(/^## About\s*$/m);
            expect(content).toMatch(/Role.*Engineering Leader/);
            expect(content).toMatch(/Location.*Syracuse, NY/);
            expect(content).toMatch(/Experience/);
        });

        test('has an Expertise section listing six areas', () => {
            expect(content).toMatch(/^## Expertise\s*$/m);
            const expertiseSection = content.split(/^## /m)[2] ?? '';
            const bulletCount = (expertiseSection.match(/^- /gm) ?? []).length;
            expect(bulletCount).toBeGreaterThanOrEqual(6);
        });

        test('has a Links section with LinkedIn, GitHub, Calendar', () => {
            expect(content).toMatch(/^## Links\s*$/m);
            expect(content).toMatch(/linkedin\.com\/in\/shaunburdick/);
            expect(content).toMatch(/github\.com\/shaunburdick/);
            expect(content).toMatch(/zcal\.co\/shaunburdick/);
        });

        test('does not leak a plaintext email address', () => {
            // The site intentionally obfuscates the email (random prefix +
            // atob). The llms.txt must not undo that by inlining it.
            expect(content).not.toMatch(/[\w.-]+@shaunburdick\.com/);
        });
    });
});
