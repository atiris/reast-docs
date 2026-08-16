# Reference: Grammar, Errors & Edge Cases

> [Introduction](/spec/) · [Feature index](features) · [Cheatsheet](REA-CHEATSHEET)
>
> Identifiers, conformance levels and the versioning rules on this page are **stable** — frozen with the 1.0 release, because an implementer has to be able to trust them. The built-in function library and the extension tiers are **experimental**. Each section carries its own badge.

---

## 28. File Format & Packaging

### Single files: `.rea`

<Feature id="rea-file" />

A `.rea` file is a UTF-8 plain text file holding one story's prose and syntax. It carries no metadata of its own — all of that lives in the package manifest.

### Packages: `.reast`

<Feature id="reast-package" />

A `.reast` file is a ZIP archive (like EPUB) that bundles one or more parts with their media and metadata, in either a manifest-driven or a flat layout. The on-disk archive layout, the full `manifest.json` schema, GitHub-repository import, the reader tab bar, session settings (`reast.json`), progressive loading, delta updates, package signing, minification, and multi-part reading state are documented in full in the engine's [`.reast` package format reference](/engine/package-format) — this section covers only the language-level rules that follow from that format.

For the language-level rules specific to `.rext` extension modules (which constructs are legal inside one, and why `{use}` is required to bind them), see [When rules differ in `.rext` files](rext-differences).


## 29. Identifiers & Naming

<Feature id="identifiers" />

### Naming conventions

| Element       | Convention    | Example                        |
| ------------- | ------------- | ------------------------------ |
| Variables     | `domain.name` | `story.player.gold`, `part.quest.has_key` |
| Functions     | `snake_case`  | `calculate_damage`, `greet`    |
| Anchors       | `snake_case`  | `#the_clearing`                |
| Commands      | `snake_case`  | `{voice}`, `{wait}`            |
| Card IDs      | `snake_case`  | `[@dark_elf]`, `[$magic_ring]` |
| Metadata keys | `snake_case`  | `title`, `draft_date`          |

### Variable naming rules

Every variable — every `{set}` target and every read — **must** carry a domain prefix: one of the four domains (`part.`, `story.`, `shared.`, `context.`), or a manifest rename. Persistence is entirely domain-driven; there is no separate persistent/non-persistent variable kind (see [Scoping](02-logic-data#scoping)):

```rea
{set story.player.gold = 100}
{set story.quest.has_key = true}
{set story.tool.knife = "rusty"}
{set story.role.king.power = 9}
```

Domain prefixes organize variables into logical namespaces that make the story state self-documenting. Authors choose the free-namespace segments after the domain freely — common patterns include character names, object categories, or story concepts.

**The one exception:** function parameters are bare, dotless, call-frame-scoped identifiers — not domain-prefixed (see [Custom Functions](/spec/functions#parameters)). Loop variables (`{for}`/`{while}`) are not exempt — they are ordinary domain-prefixed variables like any other `{set}` target.

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
{set story.player.inventory = ["sword", "shield"]}
{append(story.player.inventory, "potion")}
{remove(story.player.inventory, "shield")}
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

**Randomness is seeded, and a reading is replayable.** `random()`, `shuffle()` and everything built on them (including `std/dice`) draw from a generator the runtime owns, not from the host's global random source. A story draws one seed when it starts; the reading state carries that seed and the generator's current position, so restoring a save continues the identical sequence and undoing a choice reproduces the rolls that followed it. Restarting a story draws a new seed — a re-read is a genuinely new playthrough.

<Feature id="seeded-randomness" />

### Device & world functions

| Function        | Description                                                 |
| ---------------- | ------------------------------------------------------------- |
| `has(feature)`   | Check device capability (e.g. `"camera"`, `"gps"`, `"nfc"`) |

### Type constructor and conversion functions

| Function                        | Description                                                             |
| ------------------------------- | ----------------------------------------------------------------------- |
| `number(x)`                     | Convert to number. `number("42")` → `42`, `number("abc")` → `undefined` |
| `string(x)`                     | Convert to string. `string(42)` → `"42"`, `string(true)` → `"true"`     |
| `boolean(x)`                    | Convert to boolean. Falsy values → `false`, everything else → `true`    |
| `integer(x)`                    | Convert to integer (truncates). `integer(3.7)` → `3`                    |
| `datetime("ISO-8601-string")`   | Create datetime from ISO 8601 string (supports `*` wildcards)           |
| `duration("ISO-8601-duration")` | Create duration from ISO 8601 duration string                           |

Coordinate types use `@` literal syntax instead of constructor functions (see [Section 11](02-logic-data.md#_11-variables-data-types)): `@lat;lng` for points, `@@lat;lng/radius` for circles, `@@p1@p2@p3` for polygons/routes. The separator is a semicolon, not a comma — a comma already separates the arguments a coordinate appears among.

### Text variation & localization functions

| Function                                          | Description                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `select(value, he="x", she="y", other="z")`       | Return text matching value (fallback with `other`)                                                |
| `plural(count, one="y", other="z", ...)`          | CLDR pluralization; category from `Intl.PluralRules` for the host locale                          |
| `ordinal(n)` / `ordinal(n, one=..., ...)`         | Ordinal; English suffix only for `en*` locales, else the locale-formatted number (see below)      |
| `formatNumber(value, locale?, style=..., ...)`    | Locale-aware number formatting (see [Section 22](04-utilities.md#_22-pluralization-localization)) |
| `calendar(date, month=..., weekday=..., era=...)` | Fantasy calendar mapping (see [Section 22](04-utilities.md#_22-pluralization-localization))       |

> Plural and ordinal categories are resolved from CLDR via `Intl.PluralRules`,
> driven by the **host-supplied locale** — not a per-language table baked into
> the engine. `calendar()` is the one function here that is still in
> development; see the [feature index](features#localization).

### Date & time functions

<Feature id="date-functions" />

Date/time built-ins operate on ISO 8601 strings and millisecond timestamps. The clock, locale and time zone are **host-supplied**; formatting delegates to `Intl.DateTimeFormat` (CLDR data). Invalid input returns `''` or `0`.

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

The `iso` style yields `YYYY-MM-DD` (date), `HH:mm:ss` (time) or a full ISO 8601 string (date-time). There is no author-facing date-token (`YYYY-MM-DD`) format string — the `style` enum is the whole surface.

**`select()`** enables pronoun and gendered text variation without branching:

```rea
{set char.pronoun = "she"}
{select(char.pronoun, he="He draws his sword", she="She draws her sword", other="They draw their sword")}
```

**`plural()`** follows CLDR plural rules for the host-supplied locale:

```rea
You found {plural(gem_count, one="a gem", other="{} gems")}.
```

For detailed usage of all localization functions, see [Section 22](04-utilities.md#_22-pluralization-localization).

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

<Feature id="rext-extensions" />

Rea is extended in two tiers. **Tier 1 — Rea extensions** are portable, sandboxed Rea code that travels inside the package (`.rext` files) plus a reserved `std/*` standard library shipped with the language itself. **Tier 2 — Host extensions** are JavaScript supplied by the embedder; they are outside the Rea language proper and reachable only when the embedder provides them.

### Tier 1 — Rea extensions (author space, portable, sandboxed)

<Feature id="rext-file" />

A Rea extension is a `.rext` file (see [When rules differ in `.rext` files](rext-differences)) containing only **declarations**: `{function}`…`{end function}` blocks, top-level `{set}` constants, `{use}` and comments. Any prose node — a paragraph, heading, choice group, media, blockquote, dialogue or card definition — anywhere in a `.rext` is a **load error**. That restriction is what makes an extension reviewable by eye and mechanically checkable.

Top-level `{set}` values are the module's **private constants**. Its functions read them, but they are not story variables: they never appear in exported reading state, two modules may declare the same constant name without colliding, and a module can never overwrite a variable the author declared. A function parameter of the same name shadows the constant. A `{set}` *inside* a function body follows ordinary Rea function scoping and does write a story variable — so accumulate loop state by recursion, not by a counter.

Import an extension with `{use}`, giving it an alias; the written path omits the `.rext` suffix. Then call its exported functions through the alias:

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

Story (`.rea`) files may still declare `{function}`s, but those are **private and document-scoped** — only extension files export. To share a function across parts, put it in a `.rext` and `{use}` it.

### `std/*` — the standard library

<Feature id="std-library" />

`std/*` is a reserved namespace resolved from **inside the engine**, not from the archive and not from the host. `{use "std/dice" as dice}` therefore works on any host, offline, with no support from the embedder — it ships with the language, rather than being injected by the platform. (Were it injected, a story would render on rea.st and break in a third-party embed, forfeiting the portability the extension system exists for.) An archive `.rext` resolving under `std/` is a load error, and a host extension that declares the `std` namespace is rejected too.

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

<Feature id="host-extensions" />

Host extensions are JavaScript registered by the embedder **per player instance** (per engine element), never globally. Two players on one page can hold different host extensions. They contribute:

- **Functions** callable from Rea expressions as `{ns.fn()}`.
- **Command handlers** for namespaced commands `{ns.command args}`. A command
  **requires arguments**: a bare `{ns.name}` with no arguments is a dotted
  variable reference, not a command.
- **Node renderers** that substitute the built-in rendering of a node type.

Hard rule: a host extension that needs a device API **emits a bus event**, exactly as a built-in sensor command does; engine code never calls a device API on the extension's behalf.

Host extensions are outside the Rea language proper and are reachable only when the embedder provides them. A story declares the host namespaces it needs with [`manifest.requires`](/engine/package-format#field-reference); an embedder that has not registered a required namespace refuses to load the story rather than failing mid-chapter.

### Custom card types

<Feature id="custom-card-types" />

Custom card **sets** (`{define cardset …}`) are released and cover most of what authors reach for — see [Section 17](03-narrative-interaction.md#card-sets-categories). Beyond them, extensions may in future define new card *types* with their own bracket prefix, past the built-in `@`, `$` and `&`:

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

**Extension code is never encrypted.** The loader rejects an encrypted `.rext`. Encryption is content protection, not a security boundary — the sandbox constrains an extension identically whether or not its source is encrypted — so forbidding it costs nothing defensively and buys three things:

1. **Validated before prose runs.** An unlock code can arrive mid-story; code
   that only materialises after the reader is committed would fail at the worst
   possible moment. Plaintext extensions are compiled and checked at load.
2. **Auditable without a key** — by `reast validate`, the editor, and platform
   moderation.
3. **Runnable by a third-party embedder** that holds no key.

To keep a secret out of an extension while still checking it, keep the function generic and plaintext and put the secret in an **encrypted `.rea` chapter** via `{set}`, then verify *against* that variable rather than embedding it:

```rea
{comment extensions/gate.rext — plaintext, generic, holds no secret}
{function unlocked(given, expected) begin}
  {return given = expected}
{end function}
```

```rea
{comment an encrypted .rea chapter carries the secret}
{set crypt.passphrase = "moonlit-antler"}

{input name=attempt, placeholder="Speak the word"}
{if unlocked(attempt, crypt.passphrase) begin}
  The gate swings open.
{end if}
```

The caveat, stated plainly: an encrypted `.rea` is **not** a secret from a determined reader. The key reaches the reader's device in order to render the chapter, so `crypt.passphrase` is extractable. Encryption protects against spoilers, casual peeking and grepping the archive — not against a motivated attacker. Anything that must be genuinely unforgeable (a competition answer, a paid unlock) has to be verified **server-side**, which is the platform's job, not the engine's (see also [Content Protection](04-utilities.md#_23-content-protection-lock)).

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

<Feature id="conformance-levels" />

Rea defines three conformance levels so that implementers can build partial implementations without claiming full spec compliance. Each level builds on the previous:

| Level        | Sections                                  | Description                                                                                                                                                                                                                                     |
| ------------ | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Core**     | 1–7, 9–14, 16, 25–26, 28–29               | Minimal viable interactive fiction: text, formatting, headings, links, anchors, commands, variables, expressions, control flow, functions, choices, escaping, comments, file format, identifiers. Enough to write branching stories with state. |
| **Standard** | Core + 8, 15, 17–19, 22–24, 27, 30–31, 32 | Full single-reader experience: media, events, cards, voice, input/interaction, pluralization, lock, captions, error handling, built-in functions, extensibility, accessibility.                                                                 |
| **Platform** | Standard + 20–21                          | Multi-reader and real-world features: cooperative reading (parallel, vote, whisper, broadcast, race, exclusive, synchronize), real-world interactions (GPS, NFC, QR, camera, sensors). Requires network infrastructure and device APIs.         |

An implementation MUST declare which conformance level it supports. When a story uses features above the implementation's level, the feature does nothing and the reader sees nothing in its place — see [Records and the conformance split](#records-and-the-conformance-split) for what the author is told.

A **Core** implementation is sufficient for text-based interactive fiction with choices and variables — competitive with Ink or ChoiceScript. A **Standard** implementation matches the full single-reader Reast experience. A **Platform** implementation requires server infrastructure for multi-reader synchronization and device APIs for real-world interaction.

### Spec versioning

<Feature id="spec-versioning" />

Rea follows a **MAJOR.MINOR** version scheme (inspired by [YAML](https://yaml.org/spec/1.2.2/)):

- **MAJOR** — Breaking changes that may invalidate existing stories
- **MINOR** — Backward-compatible additions (new commands, attributes, functions)

**1.0 is the first release of the language.** Everything published under it is available to authors now, at the maturity its badge declares.

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

Every feature in this specification carries an explicit status badge under its own heading, and the whole set is listed on the [feature index](features). There are five:

| Status             | Available today? | Meaning                                                                                                                            |
| ------------------ | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **`stable`**       | Yes              | Frozen. May only change in a new MAJOR version. The prose core of the language is here.                                            |
| **`experimental`** | Yes              | Released and usable, but may still be refined within this MAJOR version. Most of Rea is at this level today.                       |
| **`development`**  | No               | Designed and being built. The documented syntax is what it will be, but the engine does not accept it yet.                         |
| **`draft`**        | No               | Specified and discussed so the shape of the idea is on record. No implementation has started; the design may still change entirely. |
| **`cancelled`**    | Never            | Considered and deliberately ruled out. Recorded so the decision stays visible instead of being re-argued.                          |

A **version badge** accompanies the status only for `stable` and `experimental` features — the two that are actually published — and names the spec version the feature became available in. A `development` or `draft` feature has no version yet, and a `cancelled` one never will.

An implementation MAY ship any subset of `development` and `draft` features; it MUST NOT claim a [conformance level](#conformance-levels) on the strength of them, because a story cannot depend on something no other implementation has. Features added after 1.0 carry their introduction version in the same badge (`since 1.1`), so an author always knows which spec version a story requires.

A status is not a promise about a date. `development` says work is under way, `draft` says the idea is written down and nothing more — neither implies when, or whether, it lands.

### Deprecation process

When a feature is deprecated:

1. The spec marks it with "(Deprecated since X.Y)" and documents the replacement
2. Parsers MUST continue to support deprecated features for at least one MAJOR version
3. Parsers SHOULD emit a warning when a deprecated feature is used
4. The deprecated feature is removed in the next MAJOR version (or later)

### Backward compatibility

Parsers conforming to Rea MAJOR.MINOR MUST:

1. Accept any valid story written for MAJOR.0 through MAJOR.MINOR
2. Ignore unknown metadata keys (already specified in [Section 1](01-basics.md#_1-document-structure))
3. Skip an unknown command whole — its block included — with **no reader-visible
   warning**, and record `parse/unknown-command` on the author channel
4. Treat unknown inline formatting as literal text

Rule 3 used to say "display a warning and skip the command block". A warning displayed *where* is the question the two-channel model of [Error Handling](error-handling.md) answers: never to the reader, always to the author, as a record. The reader sees the block skipped and nothing else.

This ensures forward compatibility: a story written for Rea 1.0 works on a Rea 1.3 parser. A story using Rea 1.3 features works on a Rea 1.0 parser with graceful degradation.

### Records and the conformance split

A [conformance level](#conformance-levels) governs what an implementation *runs*, not what it *reports*. A Core engine emits no records at all — the author channel is a tool-side concern, and a Core embedder that wires nothing up produces nothing. Standard and Platform tooling reports the whole registry.

Where a story uses a feature above the level the implementation claims, the feature does nothing and the author gets `meta/above-conformance-level` naming the feature and the level it needs. That record is `degraded`, not `error`: the implementation behaved correctly, and the author is being told which of their choices did not travel, not that they made a mistake.

---

## 32. Accessibility

<Feature id="accessibility" />

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
- **Captions on time-based media** — Use the `{caption ...}` command (see [Section 24](04-utilities.md#_24-captions)) to provide text alternatives for audio and video.

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

### What Rea intentionally omits

Each of these was considered and ruled out. They appear on the [feature index](features#omitted) as `cancelled`, so the decision stays visible rather than being rediscovered and re-argued.

- **Numbered & bulleted lists** — Not included by design. Interactive stories don't use list formatting, `*` and `-` are already the choice and gather markers, and choices fill the role naturally. Structured data belongs in an array.
- **Table markup** — Not included. A data table is not a storytelling construct, and supporting one would drag column alignment and cell spanning into a prose language.
- **HTML passthrough** — Permanently excluded. Raw markup injection would make every story an XSS surface and would let one author's markup break another host's rendering.
- **CSS styling** — Permanently excluded. Visual presentation is the platform's responsibility, so that a reader's own preferences — contrast, font size, dark mode — can never be overridden by a story.
- **Programming language embedding** — Permanently excluded. A story is untrusted content; embedding JavaScript, Python or anything else would destroy the sandbox. Sandboxed [`.rext` extensions](#_31-extensibility) and embedder-supplied host extensions cover the real need.
- **`try` / `catch`** — Ruled out with the [error model](error-handling.md). All recovery is implicit, because a reader must never be shown a failure and an author should never have to write one.

### Resolved design decisions

| Decision             | Resolution                                          | Rationale                                                                         |
| -------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------- |
| Link syntax          | `[text > url]`                                      | Unified bracket syntax, arrow shows direction                                     |
| Attribute separator  | Commas                                              | Universal separator for parameters and array items, unambiguous parsing           |
| Anchor separator     | `_` underscore                                      | Consistent with variable naming convention                                        |
| Function naming      | `snake_case`                                        | Matches all other Rea identifiers                                                 |
| Heading levels       | Unlimited `#` depth                                 | Platform renders up to N levels distinctly                                        |
| Variable domains     | `part.`, `story.`, `shared.`, `context.` — exactly four | Clear namespacing; `context.` is read-only platform data                      |
| Variable naming      | `domain.name` required for every variable            | Self-documenting state; any Unicode except space and dot                          |
| Assignment syntax    | `{set domain.var = value}`                          | Explicit, unambiguous, beginner-friendly                                          |
| Equality operator    | `=` (single equals)                                 | Simpler for non-programmers. `{set}` prevents ambiguity.                          |
| Comment syntax       | `{comment text}` and `{comment begin}...{end comment}`    | One syntax, single-line and paired; only the exact `{comment begin}` opens a block |
| Underline markup     | `{underline begin}text{end underline}`              | Command syntax — consistent with strike/mono                                      |
| Regex operator       | `matches` / `!matches` keyword                      | Self-documenting, `!` prefix for negation consistent with `!=`, `!in`             |
| String concatenation | `+` operator (dual arithmetic/concat)               | If either operand is a string, `+` concatenates; otherwise numeric addition       |
| Type conversion      | `number()`, `string()`, `boolean()`, `integer()`    | Explicit conversion functions; implicit coercion only in expressions              |
| Domain types         | `@` / `@@` literals, `datetime()`, `duration()`     | `@` for points, `@@` for areas; compact literal syntax for coordinates            |
| Select/plural args   | Named parameters `key="value"`                      | Unified with command attribute syntax, no special object pattern                  |
| Save/progress        | `{checkpoint}` command                              | Explicit save points; platform auto-saves at chapter boundaries and choices       |
| Array indexing       | 0-based                                             | Consistent with all mainstream languages (JS, Python, C). First item is index `0` |
