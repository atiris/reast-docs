# Rea Language Specification — Part 5: Tooling & Reference (Sections 28–32)

> [Back to main specification](/)
>
> **Implementation status:** `.reast` package format (28) with ZIP extraction and `manifest.json` manifest is implemented. The editor has a working CodeMirror 6-based implementation with syntax highlighting. Platform features like keyboard navigation, dark theme, PWA support, and accessibility basics (32) are implemented in the web app. File System Access API import/export is implemented in the editor. See [REA-CHEATSHEET.md](REA-CHEATSHEET.md) for detailed status.

---

## 28. File Format & Packaging

### Single files: `.rea`

A `.rea` file is a UTF-8 plain text file. It contains a single story (reast) with optional metadata.

### Packages: `.reast`

A `.reast` file is a ZIP archive (like EPUB). A reader accepts two layouts.

**Packaged** — a `manifest.json` at the root carries all metadata and the
ordered `parts` list; story files live under `story/`, media (covers, images,
audio, video) under `assets/`:

```txt
story.reast/
├── manifest.json               (package manifest — metadata, ordered parts)
├── reast.json                  (optional — session settings / variables)
├── README.md                   (optional — for GitHub versioning)
├── META-REA/
│   ├── checksum.sha256
│   ├── signature.sig           (optional, Ed25519)
│   └── author.pub             (optional, author public key)
├── story/
│   ├── 0001-the-silence.rea    (entry part — first in manifest.parts)
│   ├── 0002-the-lantern.rea    (second part)
│   └── 0003-epilogue.rea       (...)
└── assets/
    ├── cover.webp
    ├── forest.webp
    └── theme.ogg
```

**Flat** — no `manifest.json`. All `.rea` and media files sit at the archive
root; the entry is the alphabetically-first `*.rea`. A flat package carries no
metadata, so use the packaged layout when title, author, tags, cover, links, or
ordered parts are needed:

```txt
quick.reast/
├── story.rea                   (entry — alphabetically first .rea)
└── cover.jpg
```

The entry part is the first entry in `manifest.parts` (packaged) or the
alphabetically-first `*.rea` (flat); packaged parts load in `manifest.parts`
order. `reast.json`, when present, is optional session settings — never the
manifest.

Each language translation is a **separate** `.reast` archive — not bundled together. Device capabilities (GPS, camera, gyroscope) are declared in the manifest `sensors` array; the reader loads only the capabilities the device supports. There is no `lib/` or `plugins/` directory — reusable logic goes in `.rext` extension modules under `extensions/` (see [Extension modules](#extension-modules-rext)), and sensor-dependent features are conditionally loaded by the reader based on the `sensors` declaration.

### Importing from a public GitHub repository

A package can live unzipped in a public GitHub repository: the repository root acts as the package root (`manifest.json`, `story/`, optional `README.md`). The platform accepts a repository URL and loads it as if it were a `.reast` file:

```txt
https://github.com/<owner>/<repo>            → default branch
https://github.com/<owner>/<repo>/tree/<ref> → a specific branch, tag or commit
```

The loader downloads the repository's ZIP archive from `https://api.github.com/repos/<owner>/<repo>/zipball[/<ref>]`, removes the single wrapper directory GitHub adds to every entry, and feeds the resulting files through the normal package pipeline. Only `github.com` URLs over HTTPS are accepted — the host allow-list prevents the loader from being redirected to arbitrary internal endpoints (SSRF), and the archive is still subject to the extractor's size, entry-count and path-traversal limits. This makes ordinary Git tags and branches a natural versioning mechanism for GitHub-hosted stories, with `README.md` rendered on the repository page.

### The `manifest.json` manifest

The manifest is the single source of all story metadata, permissions, and platform configuration. A `.rea` file contains only story content — all metadata lives here. The manifest is `manifest.json`. It has **one canonical shape** — no field has a "short form": `id` is always present (generated when the project is created), `author` is always an array of objects, and `parts` is always an array of `{ file, name }` objects. The reference loader normalizes looser hand-written input (e.g. a bare-string part) into this shape on load, but every tool that emits a manifest writes the canonical form.

```json
{
  "id": "019e03f6-f9ec-7000-801c-fd76eb1968dd",
  "rea": "1.0",
  "manifest": "1.0",
  "type": "story",
  "title": "The Last Lantern",
  "author": [{ "name": "Elena Voss", "id": "elena-voss" }],
  "version": "1.0.0",
  "language": "en",
  "genre": "fantasy",
  "intro": "Morning came in silence — no birds, no wind, no distant voices.",
  "description": "A story about finding light in darkness.",
  "cover": "assets/cover.webp",
  "tags": ["fantasy", "adventure"],
  "parts": [
    { "file": "story/0001-the-silence.rea", "name": "The Silence" },
    { "file": "story/0002-the-lantern.rea", "name": "The Lantern" }
  ],
  "assets": ["assets/cover.webp", { "file": "assets/theme.mp3", "name": "Main theme" }],
  "readers": [1, 2, 3, 4, 5],
  "age": { "min": 12 },
  "sensors": ["gps", "camera"],
  "signed": true
}
```

**Manifest keys:**

| Key                | Type     | Description                                                                                                                   |
| ------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `id`               | string   | UUID. Always present — generated when the project is created                                                                  |
| `rea`              | string   | Rea language version the story is authored in (currently `"1.0"`)                                                             |
| `manifest`         | string   | Manifest schema version (currently `"1.0"`)                                                                                   |
| `type`             | string   | `"story"` (read by readers, default) or `"instruction"` (moderator guide — see [Instruction reasts](#instruction-reasts))     |
| `title`            | string   | Story title                                                                                                                   |
| `author`           | object[] | Author entries: `[{ "name": "Elena Voss", "id": "elena-voss" }]` — `name` is free text; optional `id` is the author's rea.st slug (links to their profile page) |
| `language`         | string   | BCP 47 language code (`en`, `sk`, `ja`, etc.)                                                                                 |
| `direction`        | string   | Text direction: `"ltr"` (default), `"rtl"`. Inferred from `language` if omitted                                               |
| `version`          | string   | Semantic version of the story                                                                                                 |
| `date`             | string   | Publication date in ISO 8601 format (`"2025-06-15"`)                                                                          |
| `description`      | string   | Short synopsis                                                                                                                |
| `intro`            | string   | Short intro text shown on the story's envelope / cover                                                                        |
| `cover`            | string   | Path to the cover (envelope) image, e.g. `assets/cover.webp`                                                                  |
| `genre`            | string   | Primary genre (`fantasy`, `mystery`, `horror`, `sci-fi`, `romance`, `educational`, etc.)                                      |
| `tags`             | string[] | Tags for discovery: `["fantasy", "adventure"]`                                                                                |
| `license`          | string   | License identifier                                                                                                            |
| `parts`            | object[] | Ordered `{ file, name }` parts; first is the entry, array order is play order                                                 |
| `assets`           | array    | Media under `assets/`: each entry a bare path (`"assets/gate.webp"`) or `{ "file": "assets/theme.mp3", "name": "Main theme" }` — the loader normalizes a bare string to `{ file }`; a missing `name` means no display name |
| `instruction`      | string   | For a `story`: the linked `instruction` reast (id/slug)                                                                       |
| `stories`          | string[] | For an `instruction`: the `story` reasts it covers                                                                            |
| `readers`          | number[] | Supported reader counts: `[1]` (solo), `[1, 2, 4]` (tested for 1, 2, or 4), `[]` (any count), `[0]` (no player config needed) |
| `age`              | object   | Age restriction: `{ "min": 12 }` or `{ "min": 12, "max": 18 }`                                                                |
| `content_warnings` | string[] | Warnings: `["violence", "language", "fear", "substances", "sexual_themes"]`                                                   |
| `series`           | string   | Series identifier (for multi-story arcs)                                                                                      |
| `series_name`      | string   | Series display name                                                                                                           |
| `season`           | number   | Optional season number                                                                                                        |
| `season_name`      | string   | Optional season display name                                                                                                  |
| `entry`            | number   | Position within the season or series                                                                                          |
| `duration`         | number   | Estimated reading time in minutes                                                                                             |
| `sensors`          | string[] | Sensors used: `["gps", "camera", "nfc", "accelerometer", "microphone"]`                                                       |
| `accessibility`    | string[] | Features: `["screen_reader", "voice_mode", "high_contrast", "reduced_motion"]`                                                |
| `solo_mode`        | string   | Solo-mode role handling: `"all_roles"` (default), `"single_role"`                                                             |
| `allowed_urls`     | object[] | Permitted external APIs (see [External API access](04-utilities.md#external-api-access))                                      |
| `extensions`       | string[] | Ordered `.rext` load order — metadata only; never activates a module (see [Extension modules](#extension-modules-rext))       |
| `requires`         | string[] | Host-extension namespaces the story depends on; an embedder without them refuses the load (see [Extension modules](#extension-modules-rext)) |
| `offline`          | boolean  | `true` (default) or `false` — whether the story works without network                                                         |
| `storage`          | string   | Storage hint: `"none"`, `"local"` (default), `"cloud"`                                                                        |
| `reader`           | object   | Reader presentation settings — see [Reader tab bar](#reader-tab-bar)                                                          |
| `signed`           | boolean  | Whether the package is cryptographically signed                                                                               |

Custom keys are allowed and stored but ignored by the platform. For single-file stories, the platform auto-wraps the `.rea` file into a minimal `.reast` package with a generated `manifest.json`.

### Reader tab bar

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

**Sections** (semantic thumb-distance order — `actions` is closest to the
priority thumb, `help` furthest):

| Section     | Purpose                                                                                 |
| ----------- | --------------------------------------------------------------------------------------- |
| `actions`   | Dynamic interaction hub — play an action card, scan a QR code, capture a photo or audio |
| `character` | Reader vitals (HP/energy), RPG stats, and trait cards                                   |
| `pocket`    | Inventory — coins, items, and ability cards                                             |
| `map`       | Map (image or live map) with the reader's location, navigation, and running time        |
| `help`      | In-story help and hints                                                                 |

**Tab-bar keys:**

| Key            | Type    | Description                                                                              |
| -------------- | ------- | ---------------------------------------------------------------------------------------- |
| `enabled`      | boolean | Master switch for the whole bar. Defaults to `false`                                     |
| `priorityHand` | string  | `"reader"` (default — follow the reader's handedness setting), `"left"`, or `"right"`    |
| `<section>`    | object  | Per-section config: `enabled`, optional `label`/`icon`, plus section-specific attributes |

Each section object accepts `enabled`, an optional `label` and `icon` override,
and free-form section-specific attributes (e.g. `map.image`, or the `qrScan` /
`photo` / `audio` affordances on `actions`). `priorityHand` only decides which
screen edge counts as "closest"; the section order is always fixed by thumb
distance.

### The `reast.json` settings file

`reast.json` is a separate, optional file containing **session preparation settings** — variables and configuration for running the story in a specific context (e.g., number of players, difficulty level, chosen scenario variant).

```json
{
  "players": 4,
  "difficulty": "hard",
  "scenario": "night-forest",
  "custom_npc_names": ["Aria", "Theron", "Kael"]
}
```

The platform reads `reast.json` at session start and injects its values into the story's variable space. Authors define which settings are expected in their story's `@config` directives.

### Progressive loading

Large stories load part-by-part rather than all at once. The manifest declares a loading strategy:

```json
{
  "loading": "progressive",
  "parts": ["0001-the-silence.rea", "0002-the-lantern.rea", "0003-epilogue.rea"],
  "preload": ["0001-the-silence.rea"],
  "locked": ["0003-epilogue.rea"]
}
```

With progressive loading:

- Parts listed in `preload` are downloaded immediately
- Other parts download when the reader is 80% through the current part
- Parts listed in `locked` download only after the lock condition is satisfied

### Delta updates

When a story is updated, readers download only the changed files rather than the full package. The manifest includes content hashes:

```json
{
  "files": {
    "0001-the-silence.rea": { "hash": "sha256:abc123...", "size": 45012 },
    "0002-the-lantern.rea": { "hash": "sha256:def456...", "size": 12300 }
  }
}
```

### Package signing

Authors can cryptographically sign packages to prove authorship and integrity:

1. Author generates an Ed25519 key pair (once, stored securely)
2. `META-REA/checksum.sha256` contains SHA-256 hashes of all files
3. `META-REA/signature.sig` is the Ed25519 signature of the checksum file
4. `META-REA/author.pub` contains the public key (or links to a platform-verified identity)

The reader app verifies the signature before loading, warning on mismatches.

### Minification & Compression

Before packaging into `.reast`, story files can be minified and compressed for distribution:

**Minification** (lossless transformation of `.rea` source):

- Strip all comments (`{//}` and `{comment begin}...{end comment}`)
- Remove unnecessary whitespace (leading indentation, blank lines between commands)
- Shorten variable names (`player.health` → `p.h`) via a name mapping table
- Collapse multi-line commands onto single lines where possible

The minifier produces a `names.json` mapping inside `META-REA/` for debugging:

```json
{
  "p.h": "player.health",
  "p.g": "player.gold",
  "e.s": "enemy.strength"
}
```

**Compression**: the `.reast` ZIP archive uses standard deflate compression (same as EPUB). Individual large files (media assets) may already be compressed formats (JPEG, OGG) — the ZIP archive stores these without additional compression to avoid double-compression overhead.

**Build pipeline:**

1. **Author** writes `.rea` files in readable, commented form
2. **Build tool** minifies `.rea` files (optional, configurable)
3. **Build tool** packages everything into `.reast` ZIP archive
4. **Platform** decompresses and loads at runtime

Minification is optional — unminified `.reast` packages are valid. The manifest indicates whether minification was applied:

```json
{
  "build": {
    "minified": true,
    "names_map": "META-REA/names.json"
  }
}
```

### Identifiers

Story identifiers use **UUID v7** (RFC 9562) — a standard 128-bit identifier that is time-sortable, globally unique, and opaque. No type information is encoded within the ID itself.

```txt
019e03f6-f9ec-7000-801c-fd76eb1968dd
```

**Design principle:** An identifier has one job — uniquely identifying a resource. Entity type (reast, series, collection) is stored as separate metadata:

- In the manifest: `"type": "reast"` field
- In the database: a dedicated column
- In API routes: `/stories/{id}` vs `/series/{id}`

This separation ensures:

- Adding new entity types never requires a new ID format
- Systems never parse the ID to determine routing — they use explicit metadata
- IDs are compatible with every standard UUID library and database UUID column
- No risk of collision between type namespaces (unlike prefix-based schemes)

UUID v7 provides natural chronological sorting (timestamp in most-significant bits) which benefits database indexing and gives approximate creation time without a separate column.

### Extension modules (`.rext`)

A `.rext` file is a Rea **extension module** — declaration-only Rea code
(functions, top-level `{set}` constants, `{use}` and comments; no prose). By
convention extensions live under `extensions/` in the archive:

```txt
story.reast/
├── manifest.json
├── story/
│   └── 0001-intro.rea
└── extensions/
    ├── inventory.rext
    └── dice_tables.rext
```

A `.rext` can **never** be chosen as the entry story: the entry resolver
considers only `.rea` files — `manifest.parts[0].file` for a packaged archive,
the alphabetically-first `*.rea` for a flat one. Every `.rext` in the archive is
nevertheless compiled and validated at load, before any prose runs, so a broken
extension fails at publish time rather than on the reader's device. Presence of a
`.rext` in the archive never activates it; only a `{use}` binds it (see
[Extensibility](#31-extensibility)).

Two optional manifest keys concern extensions:

- **`extensions`** — an ordered array of archive-relative `.rext` paths, e.g.
  `"extensions": ["extensions/inventory.rext", "extensions/dice_tables.rext"]`.
  It is **metadata only**: it fixes load (and hook-registration) order when hook
  order matters. Absent, load order is lexicographic by path. A listed path that
  is not in the archive fails the load. The key never activates a module — it
  only orders the ones that are compiled anyway.
- **`requires`** — namespaces of host-supplied (JavaScript) extensions the story
  depends on, e.g. `"requires": ["host"]`. An embedder that has not registered
  such a namespace refuses to load the story rather than answering wrong
  mid-chapter (see [Tier 2 — Host extensions](#31-extensibility)).

### Numbered story files

Naming story parts `001-intro.rea`, `002-forest.rea`, … is **recommended, not
required**. It buys a deterministic, human-readable entry for flat archives (the
entry is the alphabetically-first `*.rea`) and future-proofs a project for flat
multi-part ordering. It does **not** solve extension naming — that is what
`.rext` is for — and it does not by itself order a packaged story's parts: in a
packaged archive, part order comes from the manifest's `parts` array, not from
filenames. Ordering multiple flat parts by filename does not exist today; a flat
archive resolves only its single entry file.

### Collaborative authoring

Rea's text-based, line-oriented format is designed for team workflows:

- **Version control friendly** — `.rea` files are plain UTF-8 text; standard `git diff` and merge tools work without special drivers
- **One part per file** — the flat `part-NNNNN.rea` structure in `.reast` packages lets multiple authors work on separate parts simultaneously with minimal merge conflicts
- **No binary state** — story logic lives in text, not in opaque project files (unlike Twine's JSON-based storage)

### Instruction reasts

A `story` reast can be accompanied by a separate **instruction reast** — a
companion reast (`type: "instruction"`) that explains how to prepare and run the
story for the person who moderates or facilitates it (the "DM" or "reastmaster").
An instruction reast is a normal reast in its own right: it has its own
`manifest.json`, parts, and media, and reads like any other reast. It is never
shown in catalog lists; it is reached only from the story it accompanies.

#### Linking

The two reasts reference each other through the manifest:

- The `story` declares its single instruction reast with `instruction` (the
  instruction's id/slug).
- The `instruction` declares the `story` reasts it covers with `stories`.

A story has at most one instruction reast, while one instruction may cover
several stories of a series (so multiple stories can share the same instruction).

```json
// story manifest.json
{ "type": "story", "id": "the-keepers-trial", "instruction": "the-keepers-trial-guide" }

// instruction manifest.json
{ "type": "instruction", "id": "the-keepers-trial-guide", "stories": ["the-keepers-trial"] }
```

#### Reader behaviour

- **Hidden from lists:** instruction reasts never appear in the catalog or any
  story list. The platform records the link on the story, not as a separate
  catalog entry.
- **Reached from the story:** when a story has an instruction reast, the reader
  marks it and offers an "Open instruction reast" action that opens the
  instruction reast as its own story.
- **No spoilers:** the instruction may reference story content (character names,
  branch outcomes, puzzle solutions) that readers should not see. Keeping it a
  separate, unlisted reast opened on demand prevents accidental exposure.

#### Content guidelines for an instruction reast

An instruction reast's parts follow standard Rea syntax. Recommended structure:

```rea
# Before the session

Overview of what the moderator needs to prepare.

# Materials

List of materials to print or prepare:
- [!Printable map < assets/handout-map.webp]

# Session flow

Step-by-step guide for running the story session.

# Branch notes

Notes on story branches and their consequences.
```

---

## 29. Identifiers & Naming

### Naming conventions

| Element       | Convention    | Example                        |
| ------------- | ------------- | ------------------------------ |
| Variables     | `domain.name` | `player.gold`, `quest.has_key` |
| Functions     | `snake_case`  | `calculate_damage`, `greet`    |
| Anchors       | `snake_case`  | `#the_clearing`                |
| Commands      | `snake_case`  | `{voice}`, `{wait}`            |
| Card IDs      | `snake_case`  | `[@dark_elf]`, `[$magic_ring]` |
| Metadata keys | `snake_case`  | `title`, `draft_date`          |

### Variable naming rules

All persistent variables (story-scoped and global) **must** have at least one domain prefix separated by `.` (dot):

```rea
{set player.gold = 100}
{set quest.has_key = true}
{set tool.knife = "rusty"}
{set role.king.power = 9}
```

Domain prefixes organize variables into logical namespaces that make the story state self-documenting. Authors choose domain names freely — common patterns include character names, object categories, or story concepts.

**Exempt from domain requirement:** heading-scoped variables (simple name without dot), loop variables (`{for}`), and function parameters — these use simple names without dots.

### Identifier rules

Each segment of a dotted path (domain or name) follows these rules:

- May contain any Unicode character **except** space (` `) and dot (`.`)
- Must contain at least one non-digit character (to distinguish from numbers)
- Case-sensitive

This means non-English authors can use their native alphabet freely:

```rea
{set hráč.zlato = 100}
{set 道具.剣 = "katana"}
{set игрок.здоровье = 80}
```

**Simple identifiers** (functions, commands, anchors, card IDs) follow the same character rules but do not require a dot.

---

## 30. Built-in Functions

### String functions

| Function                 | Description                        |
| ------------------------ | ---------------------------------- |
| `length(str)`            | Number of characters               |
| `upper(str)`             | Uppercase conversion               |
| `lower(str)`             | Lowercase conversion               |
| `trim(str)`              | Remove leading/trailing whitespace |
| `contains(str, sub)`     | Check if contains substring        |
| `replace(str, old, new)` | Replace occurrences                |
| `split(str, delimiter)`  | Split into array                   |
| `join(array, delimiter)` | Join array into string             |

### Math functions

| Function                 | Description                         |
| ------------------------ | ----------------------------------- |
| `abs(n)`                 | Absolute value                      |
| `min(a, b)`              | Minimum of two values               |
| `max(a, b)`              | Maximum of two values               |
| `round(n)`               | Round to nearest integer            |
| `floor(n)`               | Round down                          |
| `ceil(n)`                | Round up                            |
| `random(min, max)`       | Random integer in range (inclusive) |
| `clamp(value, min, max)` | Constrain value to range            |

### Array functions

| Function                 | Description             |
| ------------------------ | ----------------------- |
| `length(arr)`            | Number of elements      |
| `append(arr, item)`      | Add to end              |
| `remove(arr, item)`      | Remove first occurrence |
| `contains(arr, item)`    | Check if contains item  |
| `shuffle(arr)`           | Randomize order         |
| `sort(arr)`              | Sort ascending          |
| `slice(arr, start, end)` | Extract sub-array       |

### Collection mutation

Arrays support method-like calls:

```rea
{set player.inventory = ["sword", "shield"]}
{append(player.inventory, "potion")}
{remove(player.inventory, "shield")}
```

### Query functions

| Function              | Description                                  |
| --------------------- | -------------------------------------------- |
| `visited(anchor)`     | Has reader visited this anchor?              |
| `visit_count(anchor)` | Number of times visited                      |
| `turns()`             | Total reader interactions so far             |
| `elapsed()`           | Time since story started (seconds)           |
| `choice_count()`      | Number of available choices at current point |
| `reader_count()`      | Number of active readers (cooperative)       |

### Randomness & dice functions

| Function         | Description                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `dice(notation)` | Roll dice using standard notation (e.g. `"2d6+3"`). See [Section 21](03-narrative-interaction.md#dice-and-randomization) |

**Randomness is seeded, and a reading is replayable.** `random()`, `shuffle()`
and everything built on them (including `std/dice`) draw from a generator the
runtime owns, not from the host's global random source. A story draws one seed
when it starts; the reading state carries that seed and the generator's current
position, so restoring a save continues the identical sequence and undoing a
choice reproduces the rolls that followed it. Restarting a story draws a new
seed — a re-read is a genuinely new playthrough.

> **Implementation status:** `dice(notation)` and `seed(n)` (see Testing
> functions) are specified but not implemented. Use `{use "std/dice"}` for dice,
> and the host's engine option to pin a seed.

### Device & world functions

| Function             | Description                                                 |
| -------------------- | ----------------------------------------------------------- |
| `world.has(feature)` | Check device capability (e.g. `"camera"`, `"gps"`, `"nfc"`) |

### Type constructor and conversion functions

| Function                        | Description                                                             |
| ------------------------------- | ----------------------------------------------------------------------- |
| `number(x)`                     | Convert to number. `number("42")` → `42`, `number("abc")` → `undefined` |
| `string(x)`                     | Convert to string. `string(42)` → `"42"`, `string(true)` → `"true"`     |
| `boolean(x)`                    | Convert to boolean. Falsy values → `false`, everything else → `true`    |
| `integer(x)`                    | Convert to integer (truncates). `integer(3.7)` → `3`                    |
| `datetime("ISO-8601-string")`   | Create datetime from ISO 8601 string (supports `*` wildcards)           |
| `duration("ISO-8601-duration")` | Create duration from ISO 8601 duration string                           |

Coordinate types use `@` literal syntax instead of constructor functions (see [Section 11](02-logic-data.md#11-variables--data-types)): `@lat;lng` for points, `@@lat;lng/radius` for circles, `@@p1@p2@p3` for polygons/routes. The separator is a semicolon, not a comma — a comma already separates the arguments a coordinate appears among.

### Text variation & localization functions

| Function                                          | Description                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `select(value, he="x", she="y", other="z")`       | Return text matching value (fallback with `other`)                                                |
| `plural(count, one="y", other="z", ...)`          | CLDR pluralization; category from `Intl.PluralRules` for the host locale                          |
| `ordinal(n)` / `ordinal(n, one=..., ...)`         | Ordinal; English suffix only for `en*` locales, else the locale-formatted number (see below)      |
| `formatNumber(value, locale?, style=..., ...)`    | Locale-aware number formatting (see [Section 22](04-utilities.md#22-pluralization--localization)) |
| `calendar(date, month=..., weekday=..., era=...)` | Fantasy calendar mapping (see [Section 22](04-utilities.md#22-pluralization--localization))       |

> **Implementation status:** `select`, `plural`, `ordinal` and `formatNumber` are
> implemented in `runtime/builtins/locale.ts`. `calendar()` is specified but not
> yet implemented. Plural and ordinal categories are resolved from CLDR via
> `Intl.PluralRules`, driven by the **host-supplied locale** — not a per-language
> table baked into the engine.

### Date & time functions

Date/time built-ins operate on ISO 8601 strings and millisecond timestamps. The
clock, locale and time zone are **host-supplied**; formatting delegates to
`Intl.DateTimeFormat` (CLDR data). Invalid input returns `''` or `0`.

| Function                        | Description                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------- |
| `now()`                         | Current timestamp in milliseconds (host clock)                                  |
| `today()`                       | Current calendar date as `YYYY-MM-DD` in the host time zone                     |
| `formatDate(value, style?)`     | Format a date; `style ∈ iso \| short \| medium \| long \| full` (default `medium`) |
| `formatTime(value, style?)`     | Format a time of day with the same styles                                       |
| `formatDateTime(value, style?)` | Format date and time together with the same styles                             |
| `parseDate(value)`              | Parse a date string to a millisecond timestamp (`0` if invalid)                 |
| `dateDiff(a, b, unit?)`         | Difference `a − b`; `unit ∈ ms \| s \| m \| h \| d` (default `ms`)              |
| `dayOfWeek(value)`              | Day of week in the host time zone (`0` = Sunday, `6` = Saturday)                |
| `dateAdd(value, amount, unit?)` | Add a duration (`unit ∈ ms \| s \| m \| h \| d \| M \| y`); returns an ISO string |

The `iso` style yields `YYYY-MM-DD` (date), `HH:mm:ss` (time) or a full ISO 8601
string (date-time). There is no author-facing date-token (`YYYY-MM-DD`) format
string — the `style` enum is the whole surface.

**`select()`** enables pronoun and gendered text variation without branching:

```rea
{set char.pronoun = "she"}
{select(char.pronoun, he="He draws his sword", she="She draws her sword", other="They draw their sword")}
```

**`plural()`** follows CLDR plural rules for the host-supplied locale:

```rea
You found {plural(gem_count, one="a gem", other="{} gems")}.
```

For detailed usage of all localization functions, see [Section 22](04-utilities.md#22-pluralization--localization).

### Testing functions

| Function     | Description                                               |
| ------------ | --------------------------------------------------------- |
| `seed(n)`    | Set random seed for deterministic shuffles and `random()` |
| `snapshot()` | Capture current state for comparison                      |

```rea
{seed(42)}
The coin landed on {~heads|tails}.
```

With the same seed, every random outcome is reproducible — essential for testing and debugging stories.

### Command state

Named commands expose state:

```rea
{if rich_check.executed.count > 0 begin}
  You've been checked for wealth before.
{end if}

{rich_check.executed.last_time}
```

---

## 31. Extensibility

Rea is extended in two tiers. **Tier 1 — Rea extensions** are portable, sandboxed
Rea code that travels inside the package (`.rext` files) plus a reserved
`std/*` standard library shipped with the language itself. **Tier 2 — Host
extensions** are JavaScript supplied by the embedder; they are outside the Rea
language proper and reachable only when the embedder provides them.

### Tier 1 — Rea extensions (author space, portable, sandboxed)

A Rea extension is a `.rext` file (see [Extension modules](#extension-modules-rext))
containing only **declarations**: `{function}`…`{end function}` blocks,
top-level `{set}` constants, `{use}` and comments. Any prose node — a paragraph,
heading, choice group, media, blockquote, dialogue or card definition — anywhere
in a `.rext` is a **load error**. That restriction is what makes an extension
reviewable by eye and mechanically checkable.

Top-level `{set}` values are the module's **private constants**. Its functions
read them, but they are not story variables: they never appear in exported
reading state, two modules may declare the same constant name without
colliding, and a module can never overwrite a variable the author declared. A
function parameter of the same name shadows the constant. A `{set}` *inside* a
function body follows ordinary Rea function scoping and does write a story
variable — so accumulate loop state by recursion, not by a counter.

Import an extension with `{use}`, giving it an alias; the written path omits the
`.rext` suffix. Then call its exported functions through the alias:

```rea
{use "extensions/inventory" as inv}

Your pack weighs {inv.total_weight()} kg.
```

Rules:

- **Package-local resolution only** — a `{use}` path resolves inside the package,
  never the filesystem, never the network.
- **The `{use}` graph must be acyclic** — a cycle fails the load, naming the cycle.
- **Duplicate export names are an error**, not first-wins.
- **A `{use}` of a missing path fails the load** (as does a `manifest.extensions`
  entry that is not in the archive).

Story (`.rea`) files may still declare `{function}`s, but those are **private and
document-scoped** — only extension files export. To share a function across
parts, put it in a `.rext` and `{use}` it.

### `std/*` — the standard library

`std/*` is a reserved namespace resolved from **inside the engine**, not from the
archive and not from the host. `{use "std/dice" as dice}` therefore works on any
host, offline, with no support from the embedder — it ships with the language,
rather than being injected by the platform. (Were it injected, a story would
render on rea.st and break in a third-party embed, forfeiting the portability the
extension system exists for.) An archive `.rext` resolving under `std/` is a load
error, and a host extension that declares the `std` namespace is rejected too.

`std/dice` exports:

| Function              | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| `d(sides)`            | Roll one die with the given number of sides                   |
| `roll(count, sides)`  | Sum of `count` dice of `sides` sides (bounded by call depth)  |
| `advantage(sides)`    | Roll two dice, keep the higher                                |
| `disadvantage(sides)` | Roll two dice, keep the lower                                 |

```rea
{use "std/dice" as dice}

You swing wildly for {dice.roll(2, 6)} damage.
```

### Tier 2 — Host extensions (JavaScript, supplied by the embedder)

Host extensions are JavaScript registered by the embedder **per player instance**
(per engine element), never globally. Two players on one page can hold different
host extensions. They contribute:

- **Functions** callable from Rea expressions as `{ns.fn()}`.
- **Command handlers** for namespaced commands `{ns.command args}`. A command
  **requires arguments**: a bare `{ns.name}` with no arguments is a dotted
  variable reference, not a command.
- **Node renderers** that substitute the built-in rendering of a node type.

Hard rule: a host extension that needs a device API **emits a bus event**,
exactly as a built-in sensor command does; engine code never calls a device API
on the extension's behalf.

Host extensions are outside the Rea language proper and are reachable only when
the embedder provides them. A story declares the host namespaces it needs with
[`manifest.requires`](#extension-modules-rext); an embedder that has not
registered a required namespace refuses to load the story rather than failing
mid-chapter.

### Custom card types

> **Implementation status:** Not implemented. Custom card **sets**
> (`{define cardset ...}`) are implemented and specified in
> [Section 17](03-narrative-interaction.md#17-cards-characters-items--actions);
> the custom card **type** syntax below is specified but not yet built.

Extensions may in future define new card types beyond the built-in `@`, `$`, `&`:

```rea
{define card_type location, prefix="📍" begin}
  name: Location
  fields: [name, description, image, coordinates]
{end define}

{define location tavern begin}
  name: The Rusty Anchor
  description: A dimly lit tavern near the docks.
  image: assets/tavern.webp
  coordinates: @48.1486;17.1077
{end define}

You arrive at [📍tavern].
```

### Encryption of extension code

**Extension code is never encrypted.** The loader rejects an encrypted `.rext`.
Encryption is content protection, not a security boundary — the sandbox
constrains an extension identically whether or not its source is encrypted — so
forbidding it costs nothing defensively and buys three things:

1. **Validated before prose runs.** An unlock code can arrive mid-story; code
   that only materialises after the reader is committed would fail at the worst
   possible moment. Plaintext extensions are compiled and checked at load.
2. **Auditable without a key** — by `reast validate`, the editor, and platform
   moderation.
3. **Runnable by a third-party embedder** that holds no key.

To keep a secret out of an extension while still checking it, keep the function
generic and plaintext and put the secret in an **encrypted `.rea` chapter** via
`{set}`, then verify *against* that variable rather than embedding it:

```rea
{// extensions/gate.rext — plaintext, generic, holds no secret}
{function unlocked(given, expected) begin}
  {return given = expected}
{end function}
```

```rea
{// an encrypted .rea chapter carries the secret}
{set crypt.passphrase = "moonlit-antler"}

{input name=attempt, placeholder="Speak the word"}
{if unlocked(attempt, crypt.passphrase) begin}
  The gate swings open.
{end if}
```

The caveat, stated plainly: an encrypted `.rea` is **not** a secret from a
determined reader. The key reaches the reader's device in order to render the
chapter, so `crypt.passphrase` is extractable. Encryption protects against
spoilers, casual peeking and grepping the archive — not against a motivated
attacker. Anything that must be genuinely unforgeable (a competition answer, a
paid unlock) has to be verified **server-side**, which is the platform's job, not
the engine's (see also [Content Protection](04-utilities.md#23-content-protection-lock)).

### Sandbox constraints

Rea extensions run in the same sandboxed environment as regular Rea code:

- No file system access beyond the package
- No network requests (only declared platform APIs)
- No arbitrary code execution — a story cannot embed JavaScript, Python or any
  other language; a Rea extension is sandboxed Rea, and a host extension is the
  embedder's own code, never injected by the story
- Memory and computation limits enforced by the runtime — for example, recursion
  depth bounds `std/dice`'s `roll` to 64 dice
- Extension code is never encrypted (see above), so it stays auditable

### Conformance levels

Rea defines three conformance levels so that implementers can build partial implementations without claiming full spec compliance. Each level builds on the previous:

| Level        | Sections                                  | Description                                                                                                                                                                                                                                     |
| ------------ | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Core**     | 1–7, 9–14, 16, 25–26, 28–29               | Minimal viable interactive fiction: text, formatting, headings, links, anchors, commands, variables, expressions, control flow, functions, choices, escaping, comments, file format, identifiers. Enough to write branching stories with state. |
| **Standard** | Core + 8, 15, 17–19, 22–24, 27, 30–31, 32 | Full single-reader experience: media, events, cards, voice, input/interaction, pluralization, lock, captions, error handling, built-in functions, extensibility, accessibility.                                                                 |
| **Platform** | Standard + 20–21                          | Multi-reader and real-world features: cooperative reading (parallel, vote, whisper, broadcast, race, exclusive, synchronize), real-world interactions (GPS, NFC, QR, camera, sensors). Requires network infrastructure and device APIs.         |

An implementation MUST declare which conformance level it supports. When a story uses features above the implementation's level, the runtime MUST apply graceful degradation (see [Section 27](04-utilities.md#27-error-handling)) — unknown commands are treated as print expressions, unsupported blocks are silently skipped.

A **Core** implementation is sufficient for text-based interactive fiction with choices and variables — competitive with Ink or ChoiceScript. A **Standard** implementation matches the full single-reader Reast experience. A **Platform** implementation requires server infrastructure for multi-reader synchronization and device APIs for real-world interaction.

### Spec versioning

Rea follows a **MAJOR.MINOR** version scheme (inspired by [YAML](https://yaml.org/spec/1.2.2/)):

- **MAJOR** — Breaking changes that may invalidate existing stories
- **MINOR** — Backward-compatible additions (new commands, attributes, functions)

Version 0.x is pre-release: any feature may change without notice. Version 1.0 marks the first stable release.

A Rea story declares which spec version it targets using the `rea` field in `manifest.json`:

```json
{
  "rea": "1.0",
  "title": "The Last Lantern",
  "author": [{ "name": "Elena Voss" }],
  "version": "2.1"
}
```

Here `"rea": "1.0"` = "this story uses Rea spec version 1.0", while `"version": "2.1"` = "this is version 2.1 of the story itself".

If the `rea` key is omitted, the platform assumes the latest supported version. Parsers MUST reject stories targeting a higher MAJOR version than they support. Parsers SHOULD accept stories targeting a lower MINOR version within the same MAJOR version, ignoring unknown features gracefully.

### Feature stability

Each feature in the spec has an implicit stability level:

| Level            | Meaning                                                                               |
| ---------------- | ------------------------------------------------------------------------------------- |
| **Stable**       | Will not change in MINOR versions. May only change in a new MAJOR version.            |
| **Experimental** | May be modified or removed in any version. Marked with "(Experimental)" in the spec.  |
| **Deprecated**   | Scheduled for removal. A deprecation notice includes the version and the replacement. |

During the 0.x pre-release period, all features are implicitly Experimental.

Features added after 1.0 SHOULD be annotated with their introduction version (e.g. "Since 1.1") so authors know which spec version they require.

### Deprecation process

When a feature is deprecated:

1. The spec marks it with "(Deprecated since X.Y)" and documents the replacement
2. Parsers MUST continue to support deprecated features for at least one MAJOR version
3. Parsers SHOULD emit a warning when a deprecated feature is used
4. The deprecated feature is removed in the next MAJOR version (or later)

### Backward compatibility

Parsers conforming to Rea MAJOR.MINOR MUST:

1. Accept any valid story written for MAJOR.0 through MAJOR.MINOR
2. Ignore unknown metadata keys (already specified in [Section 1](01-basics.md#1-document-structure))
3. Handle unknown commands gracefully — display a warning and skip the command block, rather than failing
4. Treat unknown inline formatting as literal text

This ensures forward compatibility: a story written for Rea 1.0 works on a Rea 1.3 parser. A story using Rea 1.3 features works on a Rea 1.0 parser with graceful degradation.

---

## 32. Accessibility

Rea targets **WCAG 2.2 Level AA** conformance. The platform handles the technical implementation; the spec defines what authors must and should provide.

### Built-in accessibility features

These work automatically, with no author action:

| Feature               | How it works                                                                            | WCAG criteria addressed |
| --------------------- | --------------------------------------------------------------------------------------- | ----------------------- |
| Screen reader output  | All narrative text is exposed to assistive technology in reading order                  | 1.3.1, 1.3.2, 4.1.2     |
| Keyboard navigation   | Choices, links, and interactive elements are focusable and activatable via keyboard     | 2.1.1, 2.1.2            |
| Focus management      | When new content appears (e.g. after a choice), focus moves to the new content          | 2.4.3, 2.4.7            |
| Focus not obscured    | Sticky UI elements (toolbars, cooperative panels) never fully obscure focused content   | 2.4.11                  |
| High contrast         | Platform enforces WCAG AA contrast ratios (4.5:1 text, 3:1 large text) in all themes    | 1.4.3, 1.4.11           |
| Reduced motion        | Animations and transitions respect `prefers-reduced-motion`                             | 2.3.3                   |
| Target size           | All interactive targets (choices, buttons, links) meet minimum 24×24 CSS pixel size     | 2.5.8                   |
| Dragging alternatives | Any drag-based interaction provides a single-pointer click alternative                  | 2.5.7                   |
| Status announcements  | New narrative content and state changes use ARIA live regions for screen reader users   | 4.1.3                   |
| Audio control         | Auto-playing audio provides visible pause/stop controls within 3 seconds                | 1.4.2                   |
| Timing adjustable     | Timed events (`{timer}`) offer extend, pause, or disable options before they start      | 2.2.1                   |
| Consistent help       | Help mechanisms appear in the same relative position across all platform pages          | 3.2.6                   |
| Redundant entry       | The platform auto-populates previously entered data within a reading session            | 3.3.7                   |
| Accessible auth       | Authentication supports password managers and does not require cognitive function tests | 3.3.8                   |
| Cooperative presence  | Reader presence indicators include non-visual cues (sound, vibration)                   | 1.3.3                   |

### Author responsibilities

Authors contribute to accessibility through existing syntax:

- **Alt text on images** — Required by the image syntax: `[!alt text < source]`. Images without alt text trigger a validation warning.
- **Voice/audio descriptions** — `{voice begin}` content is automatically available as an audio description for visual scenes.
- **Meaningful choice text** — Choices should describe the action, not just "Option A" or "Click here".
- **Captions on time-based media** — Use the `{caption ...}` command (see [Section 24](04-utilities.md#24-captions)) to provide text alternatives for audio and video.

### Interactive element accessibility paths

| Rea element           | Keyboard path                       | Screen reader behavior                                 |
| --------------------- | ----------------------------------- | ------------------------------------------------------ |
| Choice (standard)     | Tab to focus, Enter/Space to select | Announced as button with choice text                   |
| Choice (verb-target)  | Tab to focus, Enter/Space to select | Announced as button with verb and target description   |
| `{input}` text field  | Tab to focus, type to enter         | Announced as text input with label from preceding text |
| `{timer}` countdown   | Not focusable (decorative)          | Remaining time announced at intervals via live region  |
| Card (reveal/dismiss) | Tab to focus, Enter to toggle       | Announced as expandable region with summary text       |
| Link `[text > url]`   | Tab to focus, Enter to follow       | Announced as link with visible text                    |
| GPS waypoint prompt   | Focus moves to prompt automatically | Announced as alert with location instruction           |
| QR code scan prompt   | Focus moves to prompt automatically | Announced as alert with fallback manual-entry option   |

---

## Design Notes

For detailed provenance tables, brainstorm material, and community research, see [DESIGN-NOTES.md](https://github.com/atiris/reast/blob/dev/research/DESIGN-NOTES.md).

### What Rea intentionally omits

- **Lists as ordered enums** — Intentionally avoided. Rea uses arrays (with optional named items) and conditions for data management.
- **HTML passthrough** — No raw HTML injection. The rendering layer is platform-controlled for security and consistency.
- **CSS styling** — Visual presentation is the platform's responsibility. Authors write structure and content.
- **Programming language embedding** — No JavaScript, Python, or other language embedding. Functions in Rea are sandboxed and intentionally limited.
- **Numbered/bulleted lists** — Not included by design. Interactive stories don't use list formatting — choices fill this role naturally.
- **Table markup** — Not included. Data tables are not a storytelling construct. Use formatted text or commands if needed.

### Resolved design decisions

| Decision             | Resolution                                          | Rationale                                                                         |
| -------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------- |
| Link syntax          | `[text > url]`                                      | Unified bracket syntax, arrow shows direction                                     |
| Attribute separator  | Commas                                              | Universal separator for parameters and array items, unambiguous parsing           |
| Anchor separator     | `_` underscore                                      | Consistent with variable naming convention                                        |
| Function naming      | `snake_case`                                        | Matches all other Rea identifiers                                                 |
| Heading levels       | Unlimited `#` depth                                 | Platform renders up to N levels distinctly                                        |
| Variable domains     | `reader.*`, `story.*`, `world.*` etc.               | Clear namespacing, read-only platform data                                        |
| Variable naming      | `domain.name` required for all persistent variables | Self-documenting state; any Unicode except space and dot                          |
| Assignment syntax    | `{set domain.var = value}`                          | Explicit, unambiguous, beginner-friendly                                          |
| Equality operator    | `=` (single equals)                                 | Simpler for non-programmers. `{set}` prevents ambiguity.                          |
| Comment syntax       | `{//}` and `{comment begin}...{end comment}`        | Single-line `//` ignores everything; multi-line uses standard paired block        |
| Underline markup     | `{underline begin}text{end underline}`              | Command syntax — consistent with strike/mono                                      |
| Regex operator       | `matches` / `!matches` keyword                      | Self-documenting, `!` prefix for negation consistent with `!=`, `!in`             |
| String concatenation | `+` operator (dual arithmetic/concat)               | If either operand is a string, `+` concatenates; otherwise numeric addition       |
| Type conversion      | `number()`, `string()`, `boolean()`, `integer()`    | Explicit conversion functions; implicit coercion only in expressions              |
| Domain types         | `@` / `@@` literals, `datetime()`, `duration()`     | `@` for points, `@@` for areas; compact literal syntax for coordinates            |
| Select/plural args   | Named parameters `key="value"`                      | Unified with command attribute syntax, no special object pattern                  |
| Save/progress        | `{checkpoint}` command                              | Explicit save points; platform auto-saves at chapter boundaries and choices       |
| Array indexing       | 0-based                                             | Consistent with all mainstream languages (JS, Python, C). First item is index `0` |
