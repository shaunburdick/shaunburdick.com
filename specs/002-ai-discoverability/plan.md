# Plan: AI & Crawler Discoverability (`002-ai-discoverability`)

## Problem

A no-context crawler or LLM that fetches `https://shaunburdick.com/` learns almost nothing
about Shaun Burdick. The static HTML contains only a meta description, a `<title>`, and
an empty `<div id="root"></div>`. The actual bio, expertise, location, and links are
inside the React JS bundle — only visible after JavaScript runs.

A no-JS HTTP fetch sees:

```html
<title>Shaun Burdick</title>
<meta name="description" content="...20+ years..."/>
...
<div id="root"></div>
<noscript>You need to enable JavaScript to run this app.</noscript>
```

The bio, links, and structured identity are gone. This hurts:

- AI assistants citing Shaun's profile (ChatGPT browsing, Perplexity, Claude with web)
- SEO crawlers that don't run JS (Bingbot in some modes, archive crawlers)
- AIs that summarize or compare profiles
- Future-proofing against JS-disabled readers (some reading-mode apps, link previews)

## Goal

If a crawler or AI hits `shaunburdick.com` with no prior context, it should learn the
important identity data Shaun wants known:

- Name, role, location, experience
- Areas of expertise
- Verified social/contact links (LinkedIn, GitHub, calendar, email)
- That this is a personal site with a terminal-style interactive console

## Approach

Two coordinated changes:

### 1. `public/robots.txt` update

Add a comment welcoming AI crawlers and confirming full access. No `Disallow` rules
change — stays fully open to all crawlers including AI bots. Add a note that no
sitemap is published by design.

### 2. `public/index.html` improvements (meta tags + `<noscript>`)

Static HTML changes that any client can read without executing the React bundle:

- Fix `og:url` / `twitter:url` from `http://` to `https://`
- Add `<link rel="canonical" href="https://shaunburdick.com/">`
- Add `<meta name="author" content="Shaun Burdick">`
- Add `<meta name="profile:first_name">` / `<meta name="profile:last_name">`
  (Google+ legacy profile tags, still consumed by some crawlers)
- Add `<meta property="og:site_name">` and `<meta property="og:locale">`
- Add `<meta property="og:image:alt">` / `<meta property="twitter:image:alt">`
- Add a rich `<noscript>` block at the end of `<body>` containing Shaun's bio,
  location (Syracuse, NY), areas of expertise, and key links (LinkedIn, GitHub,
  zcal.co). Visible to no-JS clients, link previewers, and any crawler that
  doesn't execute the JS bundle.

These cost ~30 lines, are non-breaking, and improve both AI consumption and
social sharing.

### Out of Scope

- Pre-rendering the `/calendar/` redirect page (per user: not to be discovered)
- A `sitemap.xml` (per user: discovery surface is intentionally minimal)
- JSON-LD `Person` schema in HTML (deferred; can be added in a follow-up PR
  if/when a specific consumer is identified that benefits)
- Server-side rendering (would require a larger refactor; not warranted for the
  value on a personal portfolio)
- `public/llms.txt` — considered, dropped (see Decisions below)
- Postbuild prerender — considered, dropped (see Decisions below)

## Architecture

```
public/ directory (copied verbatim by CopyWebpackPlugin):
  robots.txt                ← updated with AI-welcome comment
  index.html                ← updated meta tags + <noscript> fallback
  favicon.svg, manifest.json, img/, calendar/
```

No build-time dependency on Chromium. No `postbuild` step. The output of
`npm run build` is exactly what webpack emits.

## Acceptance Criteria

1. `curl https://shaunburdick.com/robots.txt` allows all agents and contains an
   AI-crawler-welcome comment, with no `Disallow: /` rule for any bot.
2. `curl https://shaunburdick.com/` returns HTML containing:
   - `<link rel="canonical" href="https://shaunburdick.com/">`
   - `<meta name="author" content="Shaun Burdick">`
   - `<meta property="og:url" content="https://shaunburdick.com/">` (https, not http)
   - A `<noscript>` block mentioning Syracuse, NY, the six areas of expertise,
     and the verified social/contact links
3. `npm run lint` passes with zero errors and zero warnings
4. `npm run test:unit` passes with ≥90% coverage maintained
5. `npm run build` completes successfully with no postbuild step

## Verification Steps

```bash
npm run lint
npm run test:unit
npm run build
curl -s https://shaunburdick.com/robots.txt
curl -s https://shaunburdick.com/ | grep -A 30 '<noscript>'
```

## Decisions made during implementation

### `public/llms.txt` — planned, dropped

Originally proposed as the primary deliverable, following the
[llms.txt spec](https://llmstxt.org/). After implementation, 2026 evidence showed
the format is effectively unused by AI systems:

- **OtterlyAI** (90 days, 62,100 AI bot visits): 84 hits to `/llms.txt` = 0.1%
- **Limy** (May 2026, 515M LLM events): 408 hits = "statistically negligible"
- **SE Ranking** (Nov 2025, 300K domains): no correlation with AI citations; ML
  model got **more** accurate when the llms.txt variable was removed
- **Google (Mueller/Illyes)**: explicit "no AI system currently uses llms.txt" —
  compared to the dead keywords meta tag
- **Chrome Lighthouse** (May 2026): added llms.txt check, but only flags
  *server errors* fetching it, not absence
- **Attrifast 10-site controlled test** (May 2026): Perplexity +10pp, Claude
  +3.6pp (noisy), ChatGPT 0pp, Gemini -3pp

The one valid use case is **developer documentation consumed by IDE agents**
(Cursor, Claude Code, Continue, Cline). Anthropic, Stripe, Vercel, Cloudflare,
and Mintlify all ship `llms.txt` for that reason. shaunburdick.com is a
personal portfolio, not docs; the rich `<noscript>` block in `index.html` is
the better-targeted solution for this site, and the meta tags in the same
file cover the AI-summary use case.

### `scripts/prerender.js` postbuild — planned, dropped

Originally proposed to launch headless Chromium after `webpack build` to capture
the React-rendered HTML (welcome banner, `<h1>`, etc.) in `build/index.html`,
so no-JS crawlers would see the post-mount content.

Reasons to drop:

- Adds a runtime dependency on Chromium launching successfully in CI; if the
  binary, sandbox, or glibc ever misaligns, the build fails.
- Modern AI crawlers (Google, GPTBot, ClaudeBot, PerplexityBot) all execute
  JavaScript, so the static fallback provides minimal additional value.
- The `<noscript>` block in `index.html` already covers the no-JS case with
  richer, intentionally-curated content (full bio + expertise + links, not
  just the welcome banner).
- Playwright chromium remains installed for E2E tests in `deploy.yml`; this
  change simply removes a separate build-time launch path that didn't carry
  its weight.
