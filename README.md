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
spec/            — Rea language specification (canonical, English)
engine/          — Engine documentation and guides (English)
platform/        — Public platform docs (synced from reast-platform, English)
sk/              — Slovak translations (mirrors the above structure)
public/          — Static assets (CNAME, images)
.vitepress/      — VitePress configuration (i18n, theme, grammar)
.vitepress/data/ — Feature status registry (see below)
.github/         — CI workflows (deploy, sync)
```

## Feature status badges

Every feature in the specification carries a maturity badge — `stable`,
`experimental`, `development`, `draft` or `cancelled` — plus the spec version it
became available in. All of it lives in one place:

- **`.vitepress/data/features.ts`** is the single source of truth. Each entry
  has an `id`, a group, the syntax, a status, an optional `since` version, a
  one-sentence note explaining *why* it has that status, and a link to the
  section documenting it.
- **`<Feature id="…" />`** in a markdown page renders that entry's badge under
  the heading. The component is registered globally, so no per-page script is
  needed. An unknown id renders a visible warning rather than nothing.
- **`spec/features.md`** renders the whole registry, grouped and filterable.

To change a status, edit the registry — never the page. To add a feature, add
the entry and drop a `<Feature>` under its heading.

Every entry carries both languages: `title`/`note` and `titleSk`/`noteSk`, all
four required by the `Feature` type, so a feature cannot be added in English
only. `link` is stored once in its English form and the components prefix it per
locale — which is why the translated headings need the explicit anchors
described under [Internationalization](#internationalization-i18n).

Two rules keep this honest:

- **A status describes what an author can rely on, not how much code exists.**
  A feature the engine parses but no reader surfaces is `development`, not
  released.
- **A version badge is only for `stable` and `experimental`** — the statuses
  that are actually published. Anything else has no version to name.

## Public documentation only

Everything in this repository is published at docs.rea.st and is world-readable.
Internal material — moderation and support runbooks, unreleased platform
internals, anything only an admin, moderator or support agent should see — does
not belong here in any form, including as a link to a private repository. That
documentation lives behind login on rea.st.

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

# 2. Bump the version in package.json (e.g. 1.0.0 → 1.1.0).

# 3. Add the just-frozen version to the docVersions array in
#    .vitepress/config.ts, e.g.:
#       const docVersions = [
#         { label: `v${currentVersion} (latest)`, link: '/', current: true },
#         { label: 'v1.0.0 (archived)', link: '/v1.0.0/' },
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

### Anchors are English in every language

A translated heading slugifies to a translated anchor, which would silently
break every link written against the English one — including the links the
feature registry builds by prefixing `/sk` to a stored English link. So a
translated heading that anything links to carries an explicit English anchor:

```md
## Skloňovanie podľa počtu a lokalizácia {#_22-pluralization-localization}
```

The payoff beyond working links is that a reader who switches language keeps
their position on the page. `npm run check:anchors` enforces this — it reads the
ids out of `dist/` and checks every markdown link and every registry link, in
each locale, against them. VitePress' own dead-link check only validates the
page half of a link, so this is the half that would otherwise rot unnoticed. The
pre-commit hook runs the build and then this check.

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
6. **Translate the feature registry** — `.vitepress/data/features.ts` currently
   holds English and Slovak in parallel fields (`titleSk`, `noteSk`). A third
   language is the point at which those fields should become a per-locale map
   rather than another suffixed pair
7. **Add the locale prefix** to `LOCALE_PREFIXES` in
   `scripts/check-anchors.mjs`, so the registry links are checked for it too
8. **Give every translated heading an explicit English anchor** — see
   [Anchors are English in every language](#anchors-are-english-in-every-language)
9. **Build and verify** — `npm run build` must pass without dead links, and
   `npm run check:anchors` without broken anchors

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
