# Documentation Aggregation System — Design

## Overview

The `docs.rea.st` documentation site aggregates content from two source types into a unified VitePress-based site served from the `reast-docs` repository. **Native content** (REA language specification and player documentation) lives directly in the reast-docs repo. **Synced content** (platform documentation) is pulled from the reast-platform repository during CI builds.

## Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                     docs.rea.st                         │
│                  (reast-docs repo)                      │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  /spec/      │  │  /player/    │  │  /platform/   │  │
│  │  /guides/    │  │  embedding   │  │  /deployment/ │  │
│  │  REA lang    │  │  theming     │  │  architecture │  │
│  │  (native)    │  │  API ref     │  │  security     │  │
│  │              │  │  (native)    │  │  (synced)     │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
│                                                         │
│           VitePress + search + navigation               │
└─────────────────────────────────────────────────────────┘
        │                   │                 ▲
        │ native            │ native          │ synced
        │                   │                 │
   reast-docs          reast-docs        reast-platform
                                          docs/ (public)
```

## Content Sources

### 1. REA Language Docs (native in reast-docs)

Already in the repository under `spec/`. This is the primary content.

- `/spec/` — REA language specification (5 chapters + cheatsheet)
- `/guides/` — Tutorials and how-to guides (future)

### 2. Player Docs (native in reast-docs)

Player documentation lives natively in reast-docs because the player (web component, CDN bundle, embedding API) is a core part of the REA ecosystem — its docs belong alongside the language spec, not hidden in the engine repo's source tree.

- `/player/getting-started` — Quick CDN setup
- `/player/embedding` — npm, framework integration
- `/player/theming` — CSS custom properties
- `/player/api` — Attributes, events, JS API

### 3. Platform Docs (synced from reast-platform — public only)

Source: `reast-platform/docs/` (public documentation only)

Synced to: `reast-docs/platform/`

- `/platform/architecture/` — System architecture
- `/platform/deployment/` — Deployment guides
- `/platform/security/` — Security documentation
- `/platform/design/` — Design system

**Internal platform documentation** (implementation details, internal APIs, admin guides) is NOT synced to reast-docs. It stays in reast-platform and is served only to authenticated administrators through the platform's own admin panel.

## Documentation Visibility

| Content                  | Location            | Visibility                 |
| ------------------------ | ------------------- | -------------------------- |
| REA language spec        | reast-docs (native) | Public                     |
| Player docs              | reast-docs (native) | Public                     |
| Platform docs (public)   | reast-docs (synced) | Public                     |
| Platform docs (internal) | reast-platform only | Admin-only (authenticated) |

## Sync Mechanism

A GitHub Actions workflow in the `reast-docs` repo pulls **public** markdown from the reast-platform repository on each push. Player and REA spec docs are native — they are edited directly in reast-docs and do not need syncing.

The workflow:

1. Checks out `reast-platform` at its latest tag/main
2. Copies selected public `docs/` directories from platform → `platform/` in docs
3. Adjusts relative links (image paths, cross-references)
4. Commits if changes detected
5. **Internal platform docs are excluded** from sync (they are not copied)

```yaml
# .github/workflows/sync-docs.yml
name: Sync documentation
on:
  workflow_dispatch:
  schedule:
    - cron: '0 6 * * 1' # Weekly Monday 6 AM

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Checkout platform docs
        uses: actions/checkout@v4
        with:
          repository: atiris/reast-platform
          path: _platform
          sparse-checkout: docs
      - name: Sync public platform docs
        run: |
          rsync -a --delete \
            --include='architecture/***' \
            --include='deployment/***' \
            --include='security/***' \
            --include='design/***' \
            --exclude='*' \
            _platform/docs/ platform/
          rm -rf _platform
      - name: Commit if changed
        run: |
          git add -A
          if ! git diff --cached --quiet; then
            git config user.name "docs-sync[bot]"
            git config user.email "docs-sync@rea.st"
            git commit -m "docs: sync public platform docs"
            git push
          fi
```

## VitePress Configuration

Updated `config.ts` with unified navigation:

```typescript
export default defineConfig({
  title: 'Reast Documentation',
  description: 'REA language, player, and platform documentation',

  themeConfig: {
    nav: [
      { text: 'Language', link: '/spec/' },
      { text: 'Player', link: '/player/' },
      { text: 'Platform', link: '/platform/' },
    ],

    sidebar: {
      '/spec/': [
        {
          text: 'REA Specification',
          items: [
            { text: 'Basics', link: '/spec/01-basics' },
            { text: 'Logic & Data', link: '/spec/02-logic-data' },
            { text: 'Narrative & Interaction', link: '/spec/03-narrative-interaction' },
            { text: 'Utilities', link: '/spec/04-utilities' },
            { text: 'Reference', link: '/spec/05-reference' },
            { text: 'Cheatsheet', link: '/spec/REA-CHEATSHEET' },
          ],
        },
      ],
      '/player/': [
        {
          text: 'Player',
          items: [
            { text: 'Getting Started', link: '/player/getting-started' },
            { text: 'Embedding', link: '/player/embedding' },
            { text: 'Theming', link: '/player/theming' },
            { text: 'API Reference', link: '/player/api' },
          ],
        },
      ],
      '/platform/': [
        {
          text: 'Platform',
          items: [
            { text: 'Architecture', link: '/platform/architecture/' },
            { text: 'Deployment', link: '/platform/deployment/' },
            { text: 'Security', link: '/platform/security/' },
            { text: 'Design System', link: '/platform/design/' },
          ],
        },
      ],
    },

    search: { provider: 'local' },

    socialLinks: [{ icon: 'github', link: 'https://github.com/atiris' }],
  },
});
```

## Search

VitePress's built-in local search (`minisearch`) indexes all markdown files. No external search service needed. The search covers all three documentation sections.

## Deployment

The docs site builds as static HTML and deploys to `docs.rea.st` via GitHub Pages or any static hosting. Build command:

```bash
cd reast-docs
npm run build
# Output: .vitepress/dist/
```

## Future Considerations

- **Versioning**: VitePress supports version switching. When the engine reaches v1.0, add version selectors.
- **TypeDoc integration**: Link to auto-generated API docs hosted separately (player's `docs-api/`).
- **Playground**: Embed a live `<reast-player>` on spec pages for try-it-now examples.
