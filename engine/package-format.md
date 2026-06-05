# The `.reast` Package Format

A `.reast` file is a standard **ZIP archive** that bundles one or more Rea
stories together with their media and metadata. It is the distributable,
self-contained unit a player loads to render an interactive story offline.

This page documents the on-disk layout and the `manifest.json` schema so that
third parties can author packagers, validators, or alternative players without
reading the engine source.

## Archive layout

A modern (v2) package uses the following structure:

```text
my-story.reast              (ZIP container)
├── manifest.json           metadata + capabilities (required for v2)
├── reast.json              optional session settings / preset variables
├── story/
│   ├── main.rea            the entry Rea story file
│   └── chapter-2.rea       additional parts (optional)
├── media/
│   ├── cover.jpg
│   ├── scene.png
│   └── theme.mp3
└── moderator/              optional moderator-only content (never auto-loaded)
```

Rules a compliant reader enforces:

- The container is a ZIP file. Decompression is bounded for safety: **max 50 MB
  uncompressed, max 500 entries**, and any entry whose path escapes the archive
  root (path traversal) is rejected.
- The **entry story** is resolved in this order: the first entry in
  `manifest.parts`, then the first `*.rea` under `story/`, then `parts/`
  (legacy), then any root-level `*.rea`. Files under `moderator/` are never
  selected as the entry.
- Media files are referenced from the story by their archive-relative path and
  mapped to in-memory blob URLs at load time — no media is fetched from the
  network.

### Legacy (v1) layout

Older packages place the manifest in `reast.json` and the story parts under
`parts/`. Readers accept both: when `manifest.json` is absent, `reast.json` is
treated as the manifest; when `manifest.json` is present, `reast.json` is
treated as optional session settings instead.

## `manifest.json`

The manifest is a single JSON object. Every field is optional except where a
capability depends on it; an unknown field is preserved and ignored. The
`rea` field declares the schema version — supported values are `"1"`, `"1.0"`,
`"1.1"` and `"2.0"`.

```json
{
  "rea": "2.0",
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
  "parts": [{ "file": "story/main.rea", "name": "Part One" }],
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
  "integrity": { "story/main.rea": "sha256-…" }
}
```

### Field reference

- `rea` — string — Manifest schema version (`"1"`–`"2.0"`).
- `id` — string — Stable story identifier.
- `title` — string — Display title.
- `author` — `{ name, id?, initials? }[]` — One or more authors.
- `version` — string — Author-defined story version.
- `language` — string — BCP-47 primary language.
- `direction` — string — Text direction (`ltr` / `rtl`).
- `date` — string — Publication date.
- `description` — string — Short synopsis.
- `cover` — string — Archive-relative path to the cover image.
- `genre`, `tags` — string / string[] — Classification.
- `license` — string — Distribution licence (e.g. SPDX id).
- `parts` — `string[]` or `{ file, name }[]` — Ordered story parts; first is the entry.
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
