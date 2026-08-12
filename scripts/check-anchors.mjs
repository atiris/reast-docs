#!/usr/bin/env node
/**
 * check-anchors.mjs — verify every in-page link resolves to a heading that
 * actually exists in the built site.
 *
 * Why this exists
 * ---------------
 * VitePress' own dead-link check validates the *page* half of a link and stops
 * there: `foo#no-such-heading` passes as long as `foo` exists. That is exactly
 * the half that breaks on a translated site. A Slovak heading slugifies to a
 * Slovak anchor, so every link written against the English anchor — including
 * the ones the feature registry generates by prefixing `/sk` — silently points
 * at nothing.
 *
 * The Slovak pages therefore carry explicit `{#english-anchor}` slugs on every
 * heading another page links to, and this script is what keeps them honest. It
 * checks two sources against the ids in `dist/`:
 *
 *   1. every `](…#anchor)` link in the markdown sources, and
 *   2. every `link:` in `.vitepress/data/features.ts`, once per locale — the
 *      registry stores one English link and the components prefix it, so a
 *      missing Slovak anchor only shows up when you check the prefixed form.
 *
 * Run it after a build: `npm run check:anchors` (the pre-commit hook does both).
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, relative, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

if (!existsSync(dist)) {
  console.error('[anchors] dist/ not found — run `npm run build` first.');
  process.exit(1);
}

/** Every file under `dir` matching `ext`, as paths relative to `dir`. */
function walk(dir, ext, base = dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full, ext, base));
    else if (entry.endsWith(ext)) out.push(relative(base, full).split('\\').join('/'));
  }
  return out;
}

/** Route → set of element ids, read from the rendered HTML. */
const idsByRoute = new Map();
for (const file of walk(dist, '.html')) {
  const route = ('/' + file).replace(/(index)?\.html$/, '').replace(/\/$/, '') || '/';
  const html = readFileSync(join(dist, file), 'utf8');
  idsByRoute.set(route, new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1])));
}

const problems = [];

/** Resolve a link written in `sourceFile` to the route it addresses. */
function routeOf(sourceFile, page) {
  if (page === '') return ('/' + sourceFile).replace(/\.md$/, '');
  const abs = page.startsWith('/') ? page : posix.normalize(posix.join('/' + posix.dirname(sourceFile), page));
  return abs.replace(/\.md$/, '').replace(/\/$/, '') || '/';
}

function check(source, link, route, anchor) {
  const ids = idsByRoute.get(route);
  if (!ids) problems.push(`${source}: no such page — ${link}`);
  else if (anchor && !ids.has(anchor)) problems.push(`${source}: no such anchor — ${link}`);
}

// 1. Markdown links.
for (const md of walk(root, '.md')) {
  const text = readFileSync(join(root, md), 'utf8');
  for (const [, link] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (link.startsWith('http') || !link.includes('#')) continue;
    const [page, anchor] = [link.slice(0, link.indexOf('#')), link.slice(link.indexOf('#') + 1)];
    if (!anchor) continue;
    check(md, link, routeOf(md, page), anchor);
  }
}

// 2. Feature-registry links, in every locale the site publishes them under.
const LOCALE_PREFIXES = ['', '/sk'];
const registry = readFileSync(join(root, '.vitepress/data/features.ts'), 'utf8');
for (const [, link] of registry.matchAll(/link: '(\/[^']+)'/g)) {
  for (const prefix of LOCALE_PREFIXES) {
    const full = prefix + link;
    const hash = full.indexOf('#');
    const page = (hash === -1 ? full : full.slice(0, hash)).replace(/\/$/, '') || '/';
    check('.vitepress/data/features.ts', full, page, hash === -1 ? '' : full.slice(hash + 1));
  }
}

if (problems.length) {
  console.error(`[anchors] ${problems.length} broken link(s):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

console.log(`[anchors] ok — every anchor in ${idsByRoute.size} pages resolves.`);
