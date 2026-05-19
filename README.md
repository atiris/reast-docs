# REA Language Documentation

Public documentation for the REA interactive story language and the reast platform.
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
spec/         — REA language specification (canonical)
player/       — Player documentation and guides
platform/     — Public platform docs (synced from reast-platform)
docs/         — General docs (glossary, playground, architecture)
public/       — Static assets (CNAME, images)
.vitepress/   — VitePress configuration
.github/      — CI workflows (deploy, sync)
```

## License

Content is licensed under [CC-BY-SA-4.0](https://creativecommons.org/licenses/by-sa/4.0/).
