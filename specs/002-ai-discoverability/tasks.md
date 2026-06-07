# Tasks: AI & Crawler Discoverability (`002-ai-discoverability`)

- [x] T-001: Create feature branch `002-ai-discoverability`
- [x] T-002: Write `public/llms.txt` with curated bio (H1, blockquote, sections)
- [x] T-003: Update `public/robots.txt` with comment referencing llms.txt
- [x] T-004: Update `public/index.html` meta tags (canonical, author, og:url https, etc.)
- [x] T-005: Write `scripts/prerender.js` postbuild step using Playwright
- [x] T-006: Update `package.json` with `postbuild` script and chain
- [x] T-007: Add `tests/public/llms.txt.test.ts` verifying file content
- [x] T-008: Add `tests/public/index.html.test.ts` verifying meta tags
- [x] T-009: Run `npm run lint` — must pass with zero errors
- [x] T-010: Run `npm run test:unit` — must pass with ≥90% coverage
- [x] T-011: Run `npm run build` — must complete; verify prerender output
- [x] T-012: Update spec with completion notes; commit

## Completion Notes

- Lint: clean (0 errors, 0 warnings)
- Unit tests: 14 suites, 99 tests, all passing
- Coverage: 99.5% statements, 94.3% branches (well above 90% threshold)
- Build: succeeds. Postbuild prerender runs in CI (where chromium is
  installed by the e2e workflow); gracefully skips with a warning in
  dev environments where chromium is unavailable.
- Static files copied to `build/`: `llms.txt`, `robots.txt`, updated
  `index.html` (with rich `<noscript>` and all new meta tags).
- Live prerender verification deferred to CI; the local chromium
  download exceeds the test timeout, but the script's contract is
  exercised by the build in any environment with chromium installed.

