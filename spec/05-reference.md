# Rea Language Specification — Part 5: Tooling & Reference (Sections 28–32)

> [Back to main specification](/)
>
> **Implementation status:** `.reast` package format (28) with ZIP extraction and `reast.json` manifest is implemented. The editor has a working CodeMirror 6-based implementation with syntax highlighting. Platform features like keyboard navigation, dark theme, PWA support, and accessibility basics (32) are implemented in the web app. File System Access API import/export is implemented in the editor. See [REA-CHEATSHEET.md](REA-CHEATSHEET.md) for detailed status.

---

## 28. File Format & Packaging

### Single files: `.rea`

A `.rea` file is a UTF-8 plain text file. It contains a single story (reast) with optional metadata.

### Packages: `.reast`

A `.reast` file is a ZIP archive (like EPUB) containing:

```txt
story.reast/
├── META-REA/
│   ├── checksum.sha256
│   ├── signature.sig (optional, Ed25519)
│   └── author.pub (optional, author public key)
├── reast.json          (manifest)
├── part-00001.rea      (first part / intro)
├── part-00002.rea      (second part)
├── part-00003.rea      (...)
└── assets/
    ├── cover.jpg
    ├── forest.jpg
    └── theme.ogg
```

Each language translation is a **separate** `.reast` archive — not bundled together. Device capabilities (GPS, camera, gyroscope) are declared in the manifest `sensors` array; the reader loads only the capabilities the device supports. There is no separate `lib/` or `plugins/` directory — shared logic goes in parts, and sensor-dependent features are conditionally loaded by the reader based on the `sensors` declaration.

### The `reast.json` manifest

The manifest is the single source of all story metadata, permissions, and platform configuration. A `.rea` file contains only story content — all metadata lives here.

```json
{
  "id": "019e03f6-f9ec-7000-801c-fd76eb1968dd",
  "rea": "1.0",
  "title": "The Last Lantern",
  "author": [{ "name": "Elena Voss", "id": "019d8a2b-1234-7000-8000-abcdef012345" }],
  "version": "1.0.0",
  "language": "en",
  "genre": "fantasy",
  "description": "A story about finding light in darkness.",
  "cover": "media/cover.jpg",
  "tags": ["fantasy", "adventure"],
  "parts": ["part-00001.rea", "part-00002.rea"],
  "readers": [1, 2, 3, 4, 5],
  "age": { "min": 12 },
  "sensors": ["gps", "camera"],
  "signed": true
}
```

**Manifest keys:**

| Key                | Type     | Description                                                                                                                   |
| ------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `id`               | string   | UUID v7 unique identifier                                                                                                     |
| `rea`              | string   | Spec version this story targets (e.g. `"1.0"`). Defaults to latest supported                                                  |
| `title`            | string   | Story title                                                                                                                   |
| `author`           | object[] | Author entries: `[{ "name": "Elena Voss", "id": "..." }]`                                                                     |
| `language`         | string   | BCP 47 language code (`en`, `sk`, `ja`, etc.)                                                                                 |
| `direction`        | string   | Text direction: `"ltr"` (default), `"rtl"`. Inferred from `language` if omitted                                               |
| `version`          | string   | Semantic version of the story                                                                                                 |
| `date`             | string   | Publication date in ISO 8601 format (`"2025-06-15"`)                                                                          |
| `description`      | string   | Short synopsis                                                                                                                |
| `cover`            | string   | Path to cover image within the package                                                                                        |
| `genre`            | string   | Primary genre (`fantasy`, `mystery`, `horror`, `sci-fi`, `romance`, `educational`, etc.)                                      |
| `tags`             | string[] | Tags for discovery: `["fantasy", "adventure"]`                                                                                |
| `license`          | string   | License identifier                                                                                                            |
| `parts`            | string[] | Ordered list of `.rea` files in the package                                                                                   |
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
| `offline`          | boolean  | `true` (default) or `false` — whether the story works without network                                                         |
| `storage`          | string   | Storage hint: `"none"`, `"local"` (default), `"cloud"`                                                                        |
| `signed`           | boolean  | Whether the package is cryptographically signed                                                                               |

Custom keys are allowed and stored but ignored by the platform. For single-file stories, the platform auto-wraps the `.rea` file into a minimal `.reast` package with a generated `reast.json`.

````

### Progressive loading

Large stories load part-by-part rather than all at once. The manifest declares a loading strategy:

```json
{
  "loading": "progressive",
  "parts": ["part-00001.rea", "part-00002.rea", "part-00003.rea"],
  "preload": ["part-00001.rea"],
  "locked": ["part-00003.rea"]
}
````

With progressive loading:

- Parts listed in `preload` are downloaded immediately
- Other parts download when the reader is 80% through the current part
- Parts listed in `locked` download only after the lock condition is satisfied

### Delta updates

When a story is updated, readers download only the changed files rather than the full package. The manifest includes content hashes:

```json
{
  "files": {
    "part-00001.rea": { "hash": "sha256:abc123...", "size": 45012 },
    "part-00002.rea": { "hash": "sha256:def456...", "size": 12300 }
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

Minification is optional — unminified `.reast` packages are valid. The `reast.json` manifest indicates whether minification was applied:

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

### Including files

```rea
{include "part-00002.rea"}
{include "shared-utils.rea"}
```

### Collaborative authoring

Rea's text-based, line-oriented format is designed for team workflows:

- **Version control friendly** — `.rea` files are plain UTF-8 text; standard `git diff` and merge tools work without special drivers
- **One part per file** — the flat `part-NNNNN.rea` structure in `.reast` packages lets multiple authors work on separate parts simultaneously with minimal merge conflicts
- **No binary state** — story logic lives in text, not in opaque project files (unlike Twine's JSON-based storage)

### Moderator / DM instructions

A `.reast` package may include a **moderator instructions bundle** — content intended for the person who runs, moderates, or facilitates the story experience (the "DM" or "reastmaster"). This content is **not shown to regular readers** by default; the reader must explicitly request it.

#### Package structure

```txt
story.reast/
├── reast.json
├── part-00001.rea
├── moderator/
│   ├── instructions.rea     (main DM instructions in REA format)
│   └── assets/
│       ├── handout-map.pdf   (printable handout)
│       ├── setup-video.mp4   (setup tutorial)
│       └── npc-portraits.zip (supplementary material)
└── assets/
    └── ...
```

The `moderator/` directory sits alongside the regular story parts. Its `instructions.rea` file uses standard REA syntax (headings, paragraphs, media embeds, choice branches for conditional setup paths). Supplementary files (PDFs to print, videos to watch, images, archives) live in `moderator/assets/`.

#### Manifest declaration

The manifest declares the moderator bundle via a `moderator` key:

```json
{
  "moderator": {
    "instructions": "moderator/instructions.rea",
    "assets": [
      { "file": "moderator/assets/handout-map.pdf", "label": "Printable map" },
      { "file": "moderator/assets/setup-video.mp4", "label": "Setup tutorial" }
    ]
  }
}
```

- `instructions` — path to the main DM instructions file (parsed and rendered like any `.rea` file)
- `assets` — list of supplementary files with human-readable labels, offered for download/print

#### Reader behaviour

- **Default:** the moderator bundle is hidden. The reader app does not load, parse, or display it.
- **Explicit access:** the reader settings or story menu offers a "Moderator instructions" toggle. When enabled, a separate panel or view shows the DM instructions (rendered from `instructions.rea`) and lists the downloadable assets.
- **No spoilers:** the DM instructions may reference story content (character names, branch outcomes, puzzle solutions) that readers should not see. The separation into a distinct directory and explicit opt-in prevents accidental exposure.
- **Offline support:** when a reader downloads a `.reast` for offline use and has moderator mode enabled, the moderator bundle is included in the download. Otherwise it is excluded to save space.

#### Content guidelines for moderator instructions

The `instructions.rea` file follows standard REA syntax. Recommended structure:

```rea
# Setup

Overview of what the moderator needs to prepare before the session.

# Materials

List of materials to print or prepare:
- [!Printable map < handout-map.pdf]
- [>Setup video < setup-video.mp4]

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

Coordinate types use `@` literal syntax instead of constructor functions (see [Section 11](02-logic-data.md#11-variables--data-types)): `@lat,lng` for points, `@@lat,lng/radius` for circles, `@@p1@p2@p3` for polygons/routes.

### Text variation & localization functions

| Function                                          | Description                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `select(value, he="x", she="y", other="z")`       | Return text matching value (fallback with `other`)                                                |
| `plural(count, zero="x", one="y", other="z")`     | CLDR-aware pluralization by count                                                                 |
| `ordinal(n)`                                      | Ordinal suffix (`1st`, `2nd`, etc.)                                                               |
| `format(n, style=..., grouping=..., ...)`         | Locale-aware number formatting (see [Section 22](04-utilities.md#22-pluralization--localization)) |
| `calendar(date, month=..., weekday=..., era=...)` | Fantasy calendar mapping (see [Section 22](04-utilities.md#22-pluralization--localization))       |

**`select()`** enables pronoun and gendered text variation without branching:

```rea
{set char.pronoun = "she"}
{select(char.pronoun, he="He draws his sword", she="She draws her sword", other="They draw their sword")}
```

**`plural()`** follows CLDR plural rules for the story's language:

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

## 31. Extensibility (Plugins & Custom Commands)

Rea supports extensibility through plugins — reusable `.rea` files that define custom commands, functions, and story elements. Plugins enable community-driven feature growth without bloating the core language.

### Custom commands

Authors can define new commands in library files:

```rea
{// lib/compass.rea}
{function compass() begin}
  {if world.has("magnetometer") begin}
    You check your compass: pointing {world.heading}°
    {if world.heading >= 315 or world.heading < 45 begin}
      (North)
    {else if world.heading < 135}
      (East)
    {else if world.heading < 225}
      (South)
    {else}
      (West)
    {end if}
  {else}
    The compass spins uselessly.
  {end if}
{end function}
```

Use it in the story:

```rea
{include "compass.rea"}
{compass()}
```

### Plugin registration

Plugins declared in the manifest are loaded automatically:

```json
{
  "plugins": ["compass.rea", "inventory_ui.rea"]
}
```

### Custom card types

Plugins can define new card types beyond the built-in `@`, `$`, `&`:

```rea
{define card_type location, prefix="📍" begin}
  name: Location
  fields: [name, description, image, coordinates]
{end define}

{define location tavern begin}
  name: The Rusty Anchor
  description: A dimly lit tavern near the docks.
  image: media/tavern.jpg
  coordinates: @48.1486;17.1077
{end define}

You arrive at [📍tavern].
```

### Event hooks

Plugins can register hooks that fire before or after built-in events:

```rea
{hook before chapter_start begin}
  {// Auto-save before every chapter}
  {set reader.auto_save = snapshot()}
{end hook}

{hook after choice begin}
  {// Track analytics}
  {set story.choice_log = append(story.choice_log, event.choice_text)}
{end hook}
```

### Sandbox constraints

Plugins run in the same sandboxed environment as regular Rea code:

- No file system access beyond the package
- No network requests (only platform APIs)
- No arbitrary code execution (no JavaScript/Python embedding)
- Memory and computation limits enforced by the runtime

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

A Rea story declares which spec version it targets using the `rea` field in the `reast.json` manifest:

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

For detailed provenance tables, brainstorm material, and community research, see [DESIGN-NOTES.md](../research/DESIGN-NOTES.md).

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
