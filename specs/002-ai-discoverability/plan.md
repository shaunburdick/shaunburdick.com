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

Three coordinated changes:

### 1. `public/llms.txt` (primary deliverable)

A curated, human-and-LLM-readable markdown file at the site root following the
[llms.txt spec](https://llmstxt.org/). This is the authoritative, machine-friendly
identity document. Modern AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended)
check `/llms.txt` and consume it directly. It bypasses the JS-rendered DOM entirely.

Content: H1 with name, blockquote summary, structured sections (About, Expertise, Links,
Contact, About this site) with `[label](url): description` links per the spec.

### 2. `public/robots.txt` update

Add a comment pointing crawlers at the `llms.txt` file. No Disallow rules change —
stays fully open to all crawlers including AI bots.

### 3. `public/index.html` improvements (minor meta-tag cleanups)

- Fix `og:url` / `twitter:url` from `http://` to `https://`
- Add `<link rel="canonical">`
- Add `meta name="author"`
- Add `meta name="profile:first_name"` / `profile:last_name` (Google+ legacy, still
  consumed by some crawlers)
- Add `meta name="description"` keyword enrichment where missing
- Add `og:site_name`
- Add `og:locale`

These cost ~10 lines, are non-breaking, and improve both AI consumption and social
sharing.

### 4. Pre-render the home page (postbuild, optional but included)

After `webpack --mode production` builds `build/index.html`, run a small
`scripts/prerender.mjs` postbuild step that:

1. Boots a Playwright Chromium page pointed at the static `index.html` (`file://`)
2. Waits for `#root` to have children (React has mounted)
3. Extracts the rendered HTML
4. Writes the post-mount HTML back to `build/index.html`, preserving the `<script>` and
   `<link>` references that HtmlWebpackPlugin emitted

Result: a no-JS HTTP fetch of the deployed site sees:

```html
<h1>Shaun Burdick's Console</h1>
...
<div id="root">
  <h1 id="page-desc">Shaun Burdick's Console</h1>
  <div aria-describedby="page-desc">
    <div class="shell">
      <pre class="prompt">
        ****************************************
        Welcome to Shaun Burdick's Console!
        ****************************************
        Your last login was: never
        Type `help` for assistance.
      </pre>
      <form>...input with placeholder "Type `help` for assistance."...</form>
      ...
    </div>
  </div>
</div>
```

The h1 and the welcome banner are now in static HTML. The full bio is *not* pre-rendered
(it lives behind the `whois shaun` command in the SPA), so `llms.txt` is the only way
to surface that — confirming the design choice.

**Why Playwright over react-snap / @prerenderer/webpack-plugin:**

- Playwright is already a devDep (`@playwright/test ^1.58.1`) and CI installs
  `chromium` for tests — zero new dependencies
- react-snap 1.23.0 is from 2022, unmaintained
- @prerenderer/webpack-plugin 5.3.x works but adds a peer-dep on Puppeteer
- ~50 lines of own code, fully understood and debuggable

**CI/build behavior:** the prerender step is opt-in via `PRERENDER=1 npm run build`
defaulting to enabled. If the chromium binary is missing, the build skips the step
with a warning rather than failing (graceful degradation).

### Out of Scope

- Pre-rendering the `/calendar/` redirect page (per user: not to be discovered)
- A `sitemap.xml` (per user: discovery surface is intentionally minimal)
- JSON-LD `Person` schema in HTML (deferred; `llms.txt` covers the AI use case;
  can be added in a follow-up PR)
- Server-side rendering (would require a larger refactor; not warranted for the value)

## Architecture

```
build pipeline:
  webpack --mode production
    └─> emits build/index.html (pre-React, static template)
        └─> scripts/prerender.mjs
            ├─> launches Playwright Chromium
            ├─> loads build/index.html
            ├─> waits for #root to populate
            ├─> extracts rendered HTML
            └─> writes back to build/index.html (overwrites)

public/ directory (copied verbatim by CopyPlugin):
  llms.txt                  ← new, curated AI-readable bio
  robots.txt                ← updated with comment
  index.html                ← updated meta tags
  favicon.svg, manifest.json, img/, calendar/
```

## Acceptance Criteria

1. `curl https://shaunburdick.com/llms.txt` returns valid markdown containing:
   - `# Shaun Burdick` as H1
   - A blockquote summary
   - A `## About` section with name, role, location
   - A `## Expertise` section listing 6 areas
   - A `## Links` section with LinkedIn, GitHub, Calendar, Email
2. `curl https://shaunburdick.com/robots.txt` still allows all agents and contains a
   comment referencing `llms.txt`
3. `curl https://shaunburdick.com/` (after prerender) returns HTML containing
   `<h1 id="page-desc">` and the welcome banner text
4. `npm run build` completes without errors when chromium is available
5. `npm run build` completes (skipping prerender with a warning) when chromium is missing
6. `npm run lint` passes
7. `npm run test:unit` passes with ≥90% coverage maintained

## Verification Steps

```bash
npm run lint
npm run test:unit
npm run build
cat build/index.html | grep -c '<h1 id="page-desc"'
cat build/llms.txt | head -20
```
