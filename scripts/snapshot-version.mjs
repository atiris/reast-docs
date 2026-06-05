#!/usr/bin/env node
/**
 * snapshot-version.mjs — archive the current documentation as a frozen,
 * read-only version snapshot.
 *
 * What it does
 * ------------
 * 1. Reads the current version from package.json (e.g. 0.1.0).
 * 2. Builds the site (`vitepress build` → ./dist).
 * 3. Copies the freshly built site into `public/v<version>/`, excluding any
 *    previously archived `public/<ver>/` snapshots so versions never nest.
 *
 * Because everything under `public/` is copied verbatim into the next build's
 * output, the archived snapshot is then served as a static, read-only site at
 * `/v<version>/` — independent of any future edits to the live source tree.
 *
 * Typical release flow
 * --------------------
 *   1. Finish the docs for the version you are about to freeze.
 *   2. `node scripts/snapshot-version.mjs`        # freezes the CURRENT version
 *   3. Bump `version` in package.json to the next number.
 *   4. Add the just-frozen version to `docVersions` in `.vitepress/config.ts`.
 *   5. Continue editing — the live tree now represents the new version.
 *
 * Usage:
 *   node scripts/snapshot-version.mjs            # build + snapshot
 *   node scripts/snapshot-version.mjs --no-build # snapshot an existing ./dist
 */
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, rmSync, mkdirSync, cpSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const version = pkg.version;
const distDir = join(root, 'dist');
const snapshotDir = join(root, 'public', `v${version}`);

const skipBuild = process.argv.includes('--no-build');

if (!skipBuild) {
  console.log(`[snapshot] building docs for v${version} …`);
  execSync('npx vitepress build', { cwd: root, stdio: 'inherit' });
}

if (!existsSync(distDir)) {
  console.error('[snapshot] dist/ not found — run a build first (omit --no-build).');
  process.exit(1);
}

if (existsSync(snapshotDir)) {
  console.log(`[snapshot] replacing existing snapshot at public/v${version}/`);
  rmSync(snapshotDir, { recursive: true, force: true });
}
mkdirSync(snapshotDir, { recursive: true });

// Copy the built site, but never copy previously-archived version folders into
// the new snapshot (that would nest old versions inside the new one).
const archived = /^v\d+\.\d+\.\d+/;
for (const entry of readdirSync(distDir, { withFileTypes: true })) {
  if (entry.isDirectory() && archived.test(entry.name)) continue;
  cpSync(join(distDir, entry.name), join(snapshotDir, entry.name), { recursive: true });
}

console.log(`[snapshot] archived v${version} → public/v${version}/`);
console.log('[snapshot] next: bump package.json version and add the old version to');
console.log('[snapshot]       docVersions in .vitepress/config.ts, then keep editing.');
