# GitHub Pages Deployment

The documentation site is deployed automatically to GitHub Pages at [docs.rea.st](https://docs.rea.st) on every push to `main`.

## Architecture

```text
modules/docs/           ← VitePress source
├── .github/workflows/
│   ├── deploy.yml      ← Builds + deploys to GitHub Pages
│   └── sync-docs.yml   ← Weekly sync of public platform docs
├── spec/               ← Rea language specification (public)
├── player/             ← Player embedding & API docs (public)
├── docs/               ← General documentation (public)
├── platform/           ← Synced subset of platform docs (public)
│   ├── design/         ← Visual identity, design system
│   └── security/       ← Trust model, privacy
└── .vitepress/config.ts
```

## Public vs Internal Documentation

| Scope                                     | Location                                 | Deployment                           |
| ----------------------------------------- | ---------------------------------------- | ------------------------------------ |
| Rea spec, player API, embedding guide     | `spec/`, `player/`, `docs/`              | GitHub Pages (public)                |
| Design system, security/privacy           | `platform/design/`, `platform/security/` | GitHub Pages (public, synced weekly) |
| Architecture, conventions, testing, infra | `modules/platform/docs/`                 | Local dev server only                |

Internal documentation (architecture, API internals, deployment guides, CLI docs) lives in `modules/platform/docs/` and is never published to the public site. It is served locally via `npm run dev` in the docs package.

## Workflow Details

### `deploy.yml` — Build & Deploy

- **Trigger:** Push to `main`, manual dispatch
- **Steps:** Checkout → Node 22 → `npm ci` → `vitepress build` → Upload artifact → Deploy to Pages
- **Output directory:** `dist/`
- **Custom domain:** Configure in GitHub repo settings → Pages → Custom domain → `docs.rea.st`

### `sync-docs.yml` — Platform Docs Sync

- **Trigger:** Weekly (Monday 6:00 UTC), manual dispatch
- **Purpose:** Copies user-facing platform docs (`design/`, `security/`) from the platform repo
- **Only public content is synced** — developer internals remain private

## Local Development

```bash
cd modules/docs
npm install
npm run dev        # VitePress dev server with hot reload
npm run build      # Production build to dist/
npm run preview    # Preview production build locally
```

## Custom Domain Setup

1. In GitHub repo settings → Pages → Custom domain: `docs.rea.st`
2. Add DNS records:
   - `CNAME docs.rea.st → atiris.github.io`
   - Or A records pointing to GitHub Pages IPs
3. Enable "Enforce HTTPS"
4. Add `CNAME` file to `public/` directory (VitePress copies it to dist root)

## API Reference (Optional)

The `build:full` script generates TypeDoc API reference from the player module:

```bash
npm run build:full  # Runs typedoc on player + vitepress build
```

This creates `/api-reference/` in the output. Requires the player module to be available at `../player`.
