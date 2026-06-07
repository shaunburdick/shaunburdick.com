# Tasks: AI & Crawler Discoverability (`002-ai-discoverability`)

- [x] T-001: Create feature branch `002-ai-discoverability`
- [x] T-002: Update `public/robots.txt` with AI-crawler-welcome comment
- [x] T-003: Update `public/index.html` meta tags (canonical, author,
      `og:url` https, profile names, `og:site_name`, `og:locale`,
      `og:image:alt`, `twitter:image:alt`)
- [x] T-004: Add rich `<noscript>` fallback block to `public/index.html`
      (bio, location, expertise, links)
- [x] T-005: Add `tests/public/robots.txt.test.ts` and
      `tests/public/index.html.test.ts` covering the changes above
- [x] T-006: Run `npm run lint` — must pass with zero errors and zero warnings
- [x] T-007: Run `npm run test:unit` — must pass with ≥90% coverage
- [x] T-008: Run `npm run build` — must complete
- [x] T-009: Update spec with completion notes; commit

## Completion Notes

- **Lint:** 0 errors, 0 warnings
- **Unit tests:** 12 suites, 87 tests, all passing
- **Coverage:** 99.5% statements, 94.3% branches (well above 90% threshold)
- **Build:** succeeds with no postbuild step
- **Static files served from `public/`:** updated `robots.txt`, updated
  `index.html` (with rich `<noscript>` and all new meta tags). No `llms.txt`,
  no prerender artifact.

## Commit History

The branch contains three commits on top of `main`:

| Commit  | Purpose                                                                                                            |
| ------- | ------------------------------------------------------------------------------------------------------------------ |
| `55f2bdf` | `feat: improve AI and crawler discoverability` — meta tags, `<noscript>`, robots.txt comment, prerender (later dropped) |
| `fb71fa7` | `refactor: drop llms.txt from AI discoverability improvements` — see plan.md "Decisions" for the 2026 evidence       |
| `3ea04a9` | `refactor: drop prerender from AI discoverability improvements` — runtime Chromium risk vs. marginal value          |

Branch is local only (not pushed, no PR). User squashes on merge, so the
three-commit history is preserved for code review and discarded on landing.
