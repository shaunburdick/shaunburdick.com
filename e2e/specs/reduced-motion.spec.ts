import { test, expect } from '../fixtures/base';
import { TerminalPage } from '../pages';

/**
 * E2E tests for the `prefers-reduced-motion` media query handling on the
 * terminal prompt animation.
 *
 * The prompt runs a 15s infinite background-position animation by default
 * (see `src/components/ShellPrompt/ShellPrompt.css`). For visitors with
 * the `reduce` motion preference set, the animation is suppressed via
 * `@media (prefers-reduced-motion: reduce) { animation: none; }`.
 *
 * These tests verify the actual computed style in a real browser for both
 * the reduced-motion case (the fix) and the default case (regression
 * guard so the animation is not accidentally disabled for everyone).
 *
 * Refs WCAG 2.3.3 (Animation from Interactions) and code-review a11y-3.
 */
test.describe('Reduced Motion', () => {
    test.describe('when prefers-reduced-motion is "reduce"', () => {
        test.use({ contextOptions: { reducedMotion: 'reduce' } });

        test('disables the prompt background animation', async ({ page }) => {
            const terminal = new TerminalPage(page);
            await terminal.waitForReady();

            const animationName = await terminal.consoleOutput.evaluate(
                (el) => getComputedStyle(el).animationName
            );

            expect(animationName).toBe('none');
        });
    });

    test.describe('when prefers-reduced-motion is "no-preference"', () => {
        test.use({ contextOptions: { reducedMotion: 'no-preference' } });

        test('keeps the prompt background animation running', async ({ page }) => {
            const terminal = new TerminalPage(page);
            await terminal.waitForReady();

            const animationName = await terminal.consoleOutput.evaluate(
                (el) => getComputedStyle(el).animationName
            );

            // The keyframe is named `move-it` in ShellPrompt.css
            expect(animationName).toBe('move-it');
        });
    });
});
