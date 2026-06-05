# Rea Language Documentation

Public documentation for the Rea interactive story language and the reast platform.
Deployed to [docs.rea.st](https://docs.rea.st) via GitHub Pages.

## Development

```bash
npm install
npm run dev      # Start dev server (hot reload)
npm run build    # Build static site
npm run preview  # Preview production build
```

## Deployment (GitHub Pages)

The site auto-deploys on every push to `main` via GitHub Actions.

### One-time setup in GitHub

1. Go to **Repository Settings → Pages**
2. Under "Build and deployment", set **Source** to **GitHub Actions**
3. Go to **Repository Settings → Pages → Custom domain**
4. Enter `docs.rea.st`
5. Enable **Enforce HTTPS**

### DNS configuration

Add a CNAME record for `docs.rea.st` pointing to `atiris.github.io`:

```txt
docs.rea.st.  CNAME  atiris.github.io.
```

After DNS propagates (usually 1-30 minutes), the site will be live at
`https://docs.rea.st`.

## Structure

```txt
spec/         — Rea language specification (canonical, English)
engine/       — Engine documentation and guides (English)
platform/     — Public platform docs (synced from reast-platform, English)
docs/         — General docs (glossary, playground, architecture, English)
sk/           — Slovak translations (mirrors the above structure)
public/       — Static assets (CNAME, images)
.vitepress/   — VitePress configuration (i18n, theme, grammar)
.github/      — CI workflows (deploy, sync)
```

## Versioning (documentation snapshots)

The documentation is versioned. The **live source tree is always the latest
version** and is served from the site root (`/`). Older releases are kept as
**frozen, read-only static snapshots** under `public/v<version>/`, reachable at
`/v<version>/`. The footer "Documentation version" switcher lists every
published version (configured in `docVersions` in `.vitepress/config.ts`) so
readers can jump between them.

### Why snapshots instead of git branches?

A full copy of the _built_ site into a versioned folder is the correct,
low-maintenance approach here:

- The reader gets the exact site as it was at that release — no risk of broken
  links or drift from later refactors.
- It needs no extra hosting, build matrix, or branch juggling: everything under
  `public/` is copied verbatim into the next build, so the snapshot ships with
  every deploy.
- You never edit old versions; you only ever edit the live tree. That keeps the
  authoring workflow simple (one source of truth) while history stays available.

Copying the raw _source_ (Markdown) per version would mean maintaining several
parallel trees and re-building each on every change — more work and more ways to
break. Snapshotting the built output avoids all of that.

### How to release a new version

When you are ready to freeze the current version and start a new one:

```bash
# 1. From modules/docs, freeze the CURRENT version (reads version from package.json,
#    builds, and writes public/v<version>/):
node scripts/snapshot-version.mjs

# 2. Bump the version in package.json (e.g. 0.2.0 → 0.3.0).

# 3. Add the just-frozen version to the docVersions array in
#    .vitepress/config.ts, e.g.:
#       const docVersions = [
#         { label: `v${currentVersion} (latest)`, link: '/', current: true },
#         { label: 'v0.2.0 (archived)', link: '/v0.2.0/' },
#         { label: 'v0.1.0 (archived)', link: '/v0.1.0/' },
#       ];

# 4. Commit. The new (current) version is served from /, older versions
#    from /v<version>/, and the footer switcher links them all.
```

## Internationalization (i18n)

The documentation supports multiple languages using VitePress built-in i18n.

### Architecture

- **Root** (`/`) = English (default, fallback)
- **`/sk/`** = Slovak translation
- Future languages follow the same pattern: `/de/`, `/cs/`, etc.

The language switcher appears automatically in the navigation bar. VitePress
falls back to English when a translated page doesn't exist.

### Language persistence

A cookie (`reast_docs_lang`) stores the user's language preference. The
platform sets this cookie before redirecting users to docs, ensuring they
see documentation in their platform language. The cookie persists across
browsing sessions until the user switches language manually.

### Adding a new language

1. **Create the locale directory** — e.g., `cs/` for Czech
2. **Mirror the English structure** — create translated files at the same
   relative paths:

   ```txt
   cs/
   ├── index.md
   ├── spec/
   │   ├── 01-basics.md
   │   └── ...
   ├── engine/
   │   ├── index.md
   │   └── ...
   ├── platform/
   │   └── ...
   └── docs/
       └── ...
   ```

3. **Register the locale** in `.vitepress/config.ts`:

   ```ts
   locales: {
     // ... existing locales ...
     cs: {
       label: 'Čeština',
       lang: 'cs',
       title: 'Jazyk Rea',
       description: '...',
       themeConfig: {
         nav: csNav,
         sidebar: { '/cs/spec/': csSidebar, ... },
       },
     },
   }
   ```

4. **Define nav and sidebar arrays** for the new locale (translated labels,
   paths prefixed with `/cs/`)
5. **Translate content** — start with high-traffic pages:
   - `index.md` (home)
   - `spec/01-basics.md` (language basics)
   - `engine/getting-started.md`
   - `platform/index.md`
6. **Build and verify** — `npm run build` must pass without dead links

### Translation guidelines

- **File names stay English** — only content is translated
- **Code examples stay unchanged** — Rea syntax is language-independent
- **Links use locale prefix** — `/sk/spec/01-basics` not `/spec/01-basics`
- **Technical terms** may keep English in parentheses on first use:
  e.g., "párové príkazy (paired commands)"
- **Keep structure in sync** — when English content changes, update all
  translations. Use `git diff` against the last translated commit to find
  what changed.

### Updating translations after English changes

```bash
# See what changed in English since the last translation update:
git log --oneline --since="2026-05-01" -- spec/ engine/ platform/ docs/

# For each changed file, update the corresponding sk/ file:
# Compare the English diff and apply equivalent changes to the Slovak version.
```

### Platform integration

The platform (`apps/web`) sets the `reast_docs_lang` cookie when linking to
docs. The value matches the platform's active locale (e.g., `sk`, `en`).
On arrival at docs.rea.st, the language picker reflects this choice. If the
user navigates away from the platform-set language, their manual choice
takes precedence until the next platform redirect.

## License

Content is licensed under [CC-BY-SA-4.0](https://creativecommons.org/licenses/by-sa/4.0/).
