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
of story parts. Story files live under `story/`; media is referenced by its
archive-relative path (conventionally under `media/`).

```text
my-story.reast              (ZIP container)
├── manifest.json           metadata + ordered parts + capabilities
├── reast.json              optional session settings / preset variables
├── story/
│   ├── part-00001.rea      the entry part (first in manifest.parts)
│   └── part-00002.rea      additional parts (in manifest order)
└── media/
    ├── cover.jpg
    ├── scene.png
    └── theme.mp3
```

### Flat

No `manifest.json`. All `.rea` and media files sit at the archive root. The
entry story is the **alphabetically-first** `*.rea` file. A flat package carries
no metadata (no title, author, tags, genre, cover, links, …) — use the packaged
layout when any of that is needed.

```text
quick.reast                 (ZIP container)
├── story.rea               the entry story (alphabetically first .rea)
├── cover.jpg
└── theme.mp3
```

Rules a compliant reader enforces:

- The container is a ZIP file. Decompression is bounded for safety: **max 50 MB
  uncompressed, max 500 entries**, and any entry whose path escapes the archive
  root (path traversal) is rejected.
- The **entry story** is the first entry in `manifest.parts` (packaged), or the
  alphabetically-first `*.rea` file (flat). In a packaged archive the parts load
  in the order listed in `manifest.parts`.
- Media files are referenced from the story by their archive-relative path and
  mapped to in-memory blob URLs at load time — no media is fetched from the
  network.
- `reast.json`, when present, is optional session settings (preset variables) —
  never the manifest.

## `manifest.json`

The manifest is a single JSON object. Every field is optional except where a
capability depends on it; an unknown field is preserved and ignored.

```json
{
  "rea": "1.0",
  "manifest": "1.0",
  "type": "story",
  "id": "the-lighthouse",
  "title": "The Lighthouse",
  "author": [{ "name": "Jane Doe", "id": "jane", "initials": "JD" }],
  "version": "1.2.0",
  "language": "en",
  "direction": "ltr",
  "date": "2026-05-30",
  "description": "A branching mystery on a storm-bound island.",
  "cover": "media/cover.jpg",
  "genre": "mystery",
  "tags": ["branching", "mystery"],
  "license": "CC-BY-4.0",
  "parts": [{ "file": "story/part-00001.rea", "name": "Part One" }],
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
  "integrity": { "story/part-00001.rea": "sha256-…" }
}
```

### Field reference

- `rea` — string — Rea language version the story is authored in (currently `"1.0"`).
- `manifest` — string — Manifest schema version (currently `"1.0"`).
- `type` — string — `"story"` (read by readers, the default) or `"instruction"` (see [Reast types](#reast-types) below).
- `id` — string — Stable story identifier.
- `title` — string — Display title.
- `author` — `{ name, id?, initials? }[]` — One or more authors.
- `version` — string — Author-defined version of this reast.
- `language` — string — BCP-47 primary language.
- `direction` — string — Text direction (`ltr` / `rtl`).
- `date` — string — Publication date.
- `description` — string — Short synopsis.
- `cover` — string — Archive-relative path to the cover image.
- `genre`, `tags` — string / string[] — Classification.
- `license` — string — Distribution licence (e.g. SPDX id).
- `parts` — `string[]` or `{ file, name? }[]` — Ordered story parts; the first is the entry and the array order is the play order.
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
- `offline` — boolean — Whether the story is fully playable offline.
- `preview` — boolean — Marks a preview/sample build.
- `integrity` — `Record<path, hash>` — Per-file SHA-256 hashes for tamper detection.

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
