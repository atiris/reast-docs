# The `.reast` Package Format

A `.reast` file is a standard **ZIP archive** that bundles one or more Rea
stories together with their media and metadata. It is the distributable,
self-contained unit a player loads to render an interactive story offline.

This page documents the on-disk layout and the `manifest.json` schema so that
third parties can author packagers, validators, or alternative players without
reading the engine source.

## Archive layouts

A reader accepts exactly two layouts:

### Packaged

A `manifest.json` at the archive root carries all metadata and an ordered list
of story parts. Story files live under `story/`; media (covers, images, audio,
video) lives under `assets/`, referenced by its archive-relative path.

```text
my-story.reast              (ZIP container)
├── manifest.json           metadata + ordered parts + capabilities
├── reast.json              optional session settings / preset variables
├── story/
│   ├── 0001-part-one.rea   the entry part (first in manifest.parts)
│   └── 0002-part-two.rea   additional parts (in manifest order)
├── extensions/             optional Rea extension modules (.rext)
│   ├── inventory.rext
│   └── dice_tables.rext
└── assets/
    ├── cover.webp
    ├── scene.webp
    └── theme.mp3
```

Extension modules (`.rext`) are declaration-only Rea code an author `{use}`s
from a story — see [Extending](extending). By convention they live under
`extensions/`. Their presence never activates them (only `{use}` binds one), and
**a `.rext` can never be the entry story**.

### Flat

No `manifest.json`. All `.rea` and media files sit at the archive root. The
entry story is the **alphabetically-first** `*.rea` file. A flat package carries
no metadata (no title, author, tags, genre, cover, links, …) — use the packaged
layout when any of that is needed.

```text
quick.reast                 (ZIP container)
├── story.rea               the entry story (alphabetically first .rea)
├── cover.webp
└── theme.mp3
```

Each language translation is a **separate** `.reast` archive — translations are
never bundled together. There is no `lib/` or `plugins/` directory; reusable
logic goes in `.rext` extension modules under `extensions/` (see
[Extending](extending)), and sensor-dependent features load conditionally based
on the manifest `sensors` array.

### Importing from a public GitHub repository

A package can also live unzipped in a public GitHub repository: the repository
root acts as the package root (`manifest.json`, `story/`, optional
`README.md`). The platform accepts a repository URL and loads it as if it were
a `.reast` file:

```text
https://github.com/<owner>/<repo>            → default branch
https://github.com/<owner>/<repo>/tree/<ref> → a specific branch, tag or commit
```

The loader downloads the repository's ZIP archive from
`https://api.github.com/repos/<owner>/<repo>/zipball[/<ref>]`, removes the
single wrapper directory GitHub adds to every entry, and feeds the resulting
files through the normal package pipeline. Only `github.com` URLs over HTTPS
are accepted — the host allow-list prevents the loader from being redirected to
arbitrary internal endpoints (SSRF) — and the archive is still subject to the
extractor's size, entry-count and path-traversal limits. Ordinary Git tags and
branches become a natural versioning mechanism for GitHub-hosted stories, with
`README.md` rendered on the repository page.

Rules a compliant reader enforces:

- The container is a ZIP file. Decompression is bounded for safety: **max 50 MB
  uncompressed, max 500 entries**, and any entry whose path escapes the archive
  root (path traversal) is rejected.
- The **entry story** is the first entry in `manifest.parts` (packaged), or the
  alphabetically-first `*.rea` file (flat). A `.rext` extension module is never
  eligible as the entry. In a packaged archive the parts load in the order
  listed in `manifest.parts`.
- Media files are referenced from the story by their archive-relative path and
  mapped to in-memory blob URLs at load time — no media is fetched from the
  network.
- `reast.json`, when present, is optional session settings (preset variables) —
  never the manifest.

## `manifest.json`

The manifest is a single JSON object with **one canonical shape** — there is no
"short form" of any field. `id` is always present (generated when the project is
created), `author` is always an array of objects, and `parts` is always an array
of `{ file, name }` objects. The reference loader will normalize looser hand-
written input (e.g. a bare-string part) into this shape at load time, but every
tool that emits a manifest writes the canonical form. Beyond identity, every
field is optional except where a capability depends on it; an unknown field is
preserved and ignored.

```json
{
  "id": "019e03f6-f9ec-7000-801c-fd76eb1968dd",
  "rea": "1.0",
  "manifest": "1.0",
  "type": "story",
  "title": "The Lighthouse",
  "intro": "A storm has cut the island off. The lamp is dark, and the keeper is gone.",
  "cover": "assets/cover.webp",
  "author": [{ "name": "Jane Doe", "id": "jane" }],
  "version": "1.2.0",
  "language": "en",
  "direction": "ltr",
  "date": "2026-05-30",
  "description": "A branching mystery on a storm-bound island.",
  "genre": "mystery",
  "tags": ["branching", "mystery"],
  "license": "CC-BY-4.0",
  "parts": [{ "file": "story/0001-part-one.rea", "name": "Part One" }],
  "assets": ["assets/cover.webp", { "file": "assets/theme.mp3", "name": "Main theme" }],
  "instruction": "the-lighthouse-guide",
  "readers": [1],
  "age": { "min": 13 },
  "content_warnings": ["mild peril"],
  "series": "island-tales",
  "season": 1,
  "entry": 1,
  "duration": 25,
  "sensors": ["geolocation"],
  "accessibility": ["reduced-motion"],
  "allowed_urls": [{ "alias": "map", "url": "https://example.com/map" }],
  "offline": true,
  "preview": false,
  "integrity": { "story/0001-part-one.rea": "sha256-…" }
}
```

### Field reference

- `rea` — string — Rea language version the story is authored in (currently `"1.0"`).
- `manifest` — string — Manifest schema version (currently `"1.0"`).
- `type` — string — `"story"` (read by readers, the default) or `"instruction"` (see [Reast types](#reast-types) below).
- `id` — string — Stable story identifier (UUID). Always present — generated when the project is created, independent of any later platform upload.
- `title` — string — Display title.
- `intro` — string — Short intro text shown on the story's envelope / cover.
- `cover` — string — Archive-relative path to the cover (envelope) image, conventionally `assets/cover.webp`.
- `author` — `{ name, id? }[]` — One or more authors. Always the object form; `name` (free text) is required, `id` is the author's rea.st slug — it links the manifest author to a profile page on the platform and is present only when the author is a registered account.
- `version` — string — Author-defined version of this reast.
- `language` — string — BCP-47 primary language.
- `direction` — string — Text direction (`ltr` / `rtl`).
- `date` — string — Publication date.
- `description` — string — Short synopsis.
- `genre`, `tags` — string / string[] — Classification.
- `license` — string — Distribution licence (e.g. SPDX id).
- `parts` — `{ file, name }[]` — Ordered story parts; the first is the entry and the array order is the play order. `file` is an archive-relative path (under `story/`); `name` is the part's display name.
- `assets` — `(string | { file, name? })[]` — Media carried under `assets/`. Each entry is an archive-relative path, either bare (`"assets/gate.webp"`) or as an object with an optional display `name` for authoring tools (`{ "file": "assets/theme.mp3", "name": "Main theme" }`). The loader normalizes a bare string to `{ file }`; a missing `name` means the asset has no display name.
- `instruction` — string — For a `story`: the linked `instruction` reast (id/slug).
- `stories` — string[] — For an `instruction`: the `story` reasts it covers.
- `readers` — number[] — Supported reader counts; a value > 1 marks a cooperative story.
- `age` — `{ min?, max? }` — Recommended reader age range.
- `content_warnings` — string[] — Sensitive-content notices.
- `series`, `season`, `entry` — string / number — Series grouping and ordering.
- `duration` — number — Estimated reading time in minutes.
- `sensors` — string[] — Device capabilities the story requests (e.g. `geolocation`).
- `accessibility` — string[] — Accessibility hints the story honours.
- `allowed_urls` — `{ alias, url, params? }[]` — Whitelisted external endpoints the story may call.
- `extensions` — string[] — Optional. `.rext` load **order only** — presence
  never activates a module; only a `{use}` in the story binds one. A listed
  entry missing from the archive fails the load. Absent, extensions load in
  lexicographic path order. See [Extending](extending).
- `requires` — string[] — Host-extension namespaces the story depends on (e.g.
  `["host"]`). An embedder that registered no extension for a required namespace
  refuses the load rather than answering wrong mid-story. See [Extending](extending).
- `offline` — boolean — Whether the story is fully playable offline.
- `preview` — boolean — Marks a preview/sample build.
- `integrity` — `Record<path, hash>` — Per-file SHA-256 hashes for tamper detection.
- `series_name`, `season_name` — string — Optional display names for the `series` / `season` grouping.
- `solo_mode` — string — Solo-mode role handling: `"all_roles"` (default) or `"single_role"`.
- `storage` — string — Storage hint: `"none"`, `"local"` (default), or `"cloud"`.
- `reader` — object — Reader presentation settings, e.g. the tab bar — see [Reader tab bar](#reader-tab-bar).
- `build` — object — Minification build metadata — see [Minification & compression](#minification-compression).
- `signed`, `signature` — boolean / string — Whether the package is cryptographically signed, and the signature payload — see [Integrity and signing](#integrity-and-signing).

## Reast types

Every packaged reast declares a `type`:

- **`story`** — the default; a reast read by readers.
- **`instruction`** — a companion reast that explains how to prepare and run one
  or more stories (for a moderator / game master). An instruction is never shown
  in catalog lists; it is reached only from the story it accompanies.

A `story` links to its single instruction reast with `instruction` (the
instruction's id/slug). An `instruction` lists the stories it covers with
`stories` — so several stories of a series may share one instruction, while each
story has at most one instruction. The two ends reference each other: the story
points at its instruction and the instruction points back at its stories.

```json
// story manifest.json
{ "type": "story", "id": "the-keepers-trial", "instruction": "the-keepers-trial-guide" }

// instruction manifest.json
{ "type": "instruction", "id": "the-keepers-trial-guide", "stories": ["the-keepers-trial"] }
```

An instruction reast never appears in the catalog or any story list — the
platform records the link on the story, not as a separate catalog entry. When a
story has one, the reader offers an "Open instruction reast" action that opens
it as its own story. Keeping it a separate, unlisted reast opened on demand
avoids exposing spoilers (character names, branch outcomes, puzzle solutions)
that an instruction may need to reference for the moderator.

## Reader tab bar

Mobile readers can show a thumb-reachable bottom tab bar with up to five
sections. The bar is **off by default**; authors opt in and enable individual
sections under `reader.tabBar` in the manifest:

```json
{
  "reader": {
    "tabBar": {
      "enabled": true,
      "priorityHand": "reader",
      "help": { "enabled": true },
      "map": { "enabled": true, "image": "assets/map.webp" },
      "pocket": { "enabled": true },
      "character": { "enabled": true },
      "actions": { "enabled": true, "qrScan": true, "photo": true, "audio": true }
    }
  }
}
```

Sections, in semantic thumb-distance order (`actions` closest to the priority
thumb, `help` furthest):

| Section     | Purpose                                                                                 |
| ----------- | ---------------------------------------------------------------------------------------- |
| `actions`   | Dynamic interaction hub — play an action card, scan a QR code, capture a photo or audio |
| `character` | Reader vitals (HP/energy), RPG stats, and trait cards                                   |
| `pocket`    | Inventory — coins, items, and ability cards                                             |
| `map`       | Map (image or live map) with the reader's location, navigation, and running time        |
| `help`      | In-story help and hints                                                                 |

`enabled` is the master switch for the whole bar (defaults to `false`).
`priorityHand` is `"reader"` (default — follow the reader's handedness
setting), `"left"`, or `"right"` — it only decides which screen edge counts as
"closest"; section order is always fixed by thumb distance. Each section object
accepts `enabled`, an optional `label`/`icon` override, and free-form
section-specific attributes (e.g. `map.image`, or the `qrScan`/`photo`/`audio`
affordances on `actions`).

## Session settings: `reast.json`

`reast.json`, when present, carries **session preparation settings** —
variables and configuration for running the story in a specific context (e.g.
number of players, difficulty, chosen scenario variant) — never manifest data:

```json
{
  "players": 4,
  "difficulty": "hard",
  "scenario": "night-forest",
  "custom_npc_names": ["Aria", "Theron", "Kael"]
}
```

The platform reads `reast.json` at session start and injects its values into
the story's variable space. Authors define which settings are expected through
their story's `@config` directives.

## Progressive loading

Large stories can load part-by-part rather than all at once. The manifest
declares the strategy:

```json
{
  "loading": "progressive",
  "parts": ["0001-the-silence.rea", "0002-the-lantern.rea", "0003-epilogue.rea"],
  "preload": ["0001-the-silence.rea"],
  "locked": ["0003-epilogue.rea"]
}
```

Parts listed in `preload` download immediately; others download once the
reader is 80% through the current part; parts listed in `locked` download only
after the lock condition is satisfied.

## Delta updates

When a story is updated, readers can download only the changed files rather
than the full package. The manifest carries per-file content hashes for this:

```json
{
  "files": {
    "0001-the-silence.rea": { "hash": "sha256:abc123...", "size": 45012 },
    "0002-the-lantern.rea": { "hash": "sha256:def456...", "size": 12300 }
  }
}
```

## Capabilities

A reader inspects the manifest to decide what the host platform must provide
before rendering:

- **Sensors** — entries in `sensors` (e.g. `geolocation`) must be granted by the
  user; the reader prompts or degrades gracefully if denied.
- **Cooperative** — any value greater than `1` in `readers` signals a
  multi-reader story that needs a synchronisation channel.
- **Offline** — `offline: true` asserts the package contains everything needed
  to read without a network connection.
- **External URLs** — only endpoints listed in `allowed_urls` may be contacted;
  everything else is blocked.

## Integrity and signing

When `integrity` is present, a reader recomputes the SHA-256 hash of each listed
file and refuses to load the package on mismatch. Packages may additionally
carry `signed` / `signature` fields for author-level provenance. Encrypted
packages are decrypted (AES) before extraction; the decryption key is supplied
out of band, never inside the archive.

An author signs a package by generating an Ed25519 key pair once and keeping it
secure. `META-REA/checksum.sha256` then carries the SHA-256 hashes of every
file, `META-REA/signature.sig` is the Ed25519 signature of that checksum file,
and `META-REA/author.pub` carries the public key (or links to a
platform-verified identity). A reader verifies the signature before loading and
warns on a mismatch.

**Extension code (`.rext`) is never encrypted** — it must stay auditable
without a key (validation, linting, moderation) and must never materialise
mid-story behind an unlock code (see [When rules differ in `.rext` files](../spec/rext-differences)).

## Minification & compression

Before packaging into `.reast`, story files can be minified and compressed for
distribution. **Minification** (a lossless transformation of `.rea` source)
strips all comments, removes unnecessary whitespace, shortens variable names
(`player.health` → `p.h`) via a name-mapping table, and collapses multi-line
commands onto single lines where possible. The mapping is written to
`META-REA/names.json` for debugging:

```json
{
  "p.h": "player.health",
  "p.g": "player.gold",
  "e.s": "enemy.strength"
}
```

The `.reast` ZIP archive itself uses standard deflate **compression** (same as
EPUB); already-compressed media formats (JPEG, OGG) are stored without
additional compression to avoid double-compression overhead. A build pipeline
is: author writes readable, commented `.rea` files → a build tool optionally
minifies them → the build tool packages everything into the `.reast` ZIP →
the platform decompresses and loads at runtime. Minification is optional —
unminified packages are valid — and the manifest's `build` field records
whether it was applied:

```json
{
  "build": {
    "minified": true,
    "names_map": "META-REA/names.json"
  }
}
```

## Numbered story files

Naming story parts `0001-intro.rea`, `0002-forest.rea`, … is **recommended,
not required**. It buys a deterministic, human-readable entry for flat
archives (the entry is the alphabetically-first `*.rea`) and future-proofs a
project for flat multi-part ordering. It does **not** solve extension naming —
that is what `.rext` is for — and it does not by itself order a packaged
story's parts: in a packaged archive, part order comes from the manifest's
`parts` array, not from filenames. Ordering multiple flat parts by filename
does not exist today; a flat archive resolves only its single entry file.

## Collaborative authoring

Rea's text-based, line-oriented format is designed for team workflows:

- **Version control friendly** — `.rea` files are plain UTF-8 text; standard
  `git diff` and merge tools work without special drivers.
- **One part per file** — the `story/NNNN-name.rea` structure lets multiple
  authors work on separate parts simultaneously with minimal merge conflicts.
- **No binary state** — story logic lives in text, not in opaque project files
  (unlike Twine's JSON-based storage).

## Multi-part traversal & reading state

A packaged story's `parts` are traversed on demand rather than concatenated.
The reader begins in the entry part and moves on through a **gate**
`[[ target ]]` (automatic, terminal) or a **cross-part link** `[text >
part.rea]` (reader taps) — see the language spec's *Multi-part stories*
section. A `target` is a part file (`story/####-name.rea` or a flat
`name.rea`), optionally suffixed `:scene` to resume at a `[#scene]` anchor in
the target part. Only the parts actually entered are loaded; a part's
top-level `{set}` commands run once as it is entered, so variables accumulate
along the path taken.

The **reading state** the platform persists between sessions captures
everything needed to reproduce that path:

| Field                 | Meaning                                                            |
| ---------------------- | ------------------------------------------------------------------ |
| `variables`            | All story/heading-scoped variables at the save point               |
| `choices`              | Selected option per resolved choice group                          |
| `visitedChoiceGroups`  | Choice groups the reader has passed (for non-sticky filtering)     |
| `rng`                  | PRNG seed + generator state, so rolls continue deterministically   |
| `currentPart`          | The part file the reader is currently in (absent for single-part)  |
| `visitedParts`         | Ordered files of the parts entered before the current one          |
| `renderedParagraph`    | Last block seen, so resume renders up to it without re-animation   |

On resume the platform replays the visited parts in order (rebuilding the
scroll-back), re-enters the current part, and restores variables and PRNG
state — the reader continues exactly where they left off. Single-part stories
leave `currentPart`/`visitedParts` empty and behave as before.
