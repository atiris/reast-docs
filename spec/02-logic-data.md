# Logic & Data: Variables, Conditions & Expressions

> [Introduction](/spec/) · [Feature index](features) · [Cheatsheet](REA-CHEATSHEET)
>
> Most of this page is **experimental**: released and in daily use, but the syntax may still be refined within 1.x. Two features here are not available to authors yet — [coordinate literals](#coordinate-literals) (`draft`) and [state machines](#state-machines) (`development`). Each carries its own badge.

---

## 10. Commands

<Feature id="commands" />

Commands are the core mechanism for interactivity. They are enclosed in `{ }` curly braces.

Every command is **always either self-closing or paired** — never both. There is no "optional pairing".

### Self-closing commands

```rea
{command_name attribute=value}
```

### Paired commands

Use `begin` to open, close with `{end command_name}`:

```rea
{command_name attribute=value begin}
  Content affected by the command.
{end command_name}
```

The content inside a paired command is equivalent to a `content` attribute:

```rea
{format color="#00f" begin}formatted text{end format}
{format color="#00f", content="formatted text"}
```

Both forms produce identical results. The `content` attribute is set by the parser to the inner text of every paired block, giving the author a choice between inline or block style without requiring special parser rules.

### Print shorthand

<Feature id="print-shorthand" />

`{...}` prints automatically when the first token is a **domain name** (`part`, `story`, `shared`, `context`, or a manifest-renamed equivalent — see [Domains](#scoping)), a **literal** (`42`, `"text"`, `true`, `[1,2,3]`, a coordinate literal), or a **known function name** (a built-in, or an author-defined `{function}`):

```rea
Hello, {story.player.name}! You have {story.player.gold} gold.
```

Prose evaluates the **whole expression grammar** — a call, arithmetic, a ternary, an index, all of it:

```rea
You look {story.player.calm > 0 ? "settled" : "restless"}.
You have {upper(story.player.title)}, and {story.player.gold + 1} coins after the tip.
You have {plural(story.player.gold, one="{} coin", other="{} coins")}.
```

Prose **reads**; it never writes. `{set}` remains the only way to change state — an expression in prose that could write would make the rendered page a place where story state changes, which breaks replay, revert and cooperative sync at once. An assignment written into prose is reported (`eval/invalid-expression`) and prints nothing.

A brace you mean literally is escaped: `\{not a command\}` (see [Escaping & raw text](04-utilities#escaping-special-characters)).

**Every other first token is an error, not a print.** An unrecognized first token is never silently printed — that would put the author's markup on the reader's page, exactly what the reader channel exists to prevent. The diagnostic names what kind of mistake it is:

| First token is...                                                                        | Code                                                                                |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| A bare reserved word ([below](#reserved-bare-words)) outside a valid keyword position          | `parse/reserved-word-misuse`                                                         |
| A domain-shaped path whose domain segment doesn't match any of the four (or a rename)      | `link/unknown-domain`                                                                |
| A bare, undotted identifier that is not a function parameter in scope                      | `link/unknown-domain` — every read carries a domain, so a dotless name names nothing |
| A malformed/incomplete expression (unbalanced parens, trailing operator)                  | `eval/invalid-expression`                                                            |

`undefined` — whether from a never-set variable, a deleted one ([below](#deletion-via-undefined)), or a failed operation — always prints as **nothing**, never the literal text "undefined".

#### What the reader sees

Every printable value has a defined rendered form, so a reader never meets a debug shape. Values print in their **canonical, locale-independent** form; locale-dependent presentation is always an explicit call — `formatNumber()`, `formatDate()`, `plural()`, `select()`.

| Value                                             | Prints as                                              | Notes                                                                                        |
| ------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `undefined`, a deleted variable, a failed operation | *nothing*                                              | Never the text `undefined`                                                                    |
| `true` / `false`                                  | `true` / `false`                                       | Lowercase, never a translated word — translation is `select()`                                 |
| An integer                                        | `11`                                                   | No thousands separator; that is `formatNumber()`                                               |
| A float                                           | `0.3`                                                  | 15 significant digits, trailing zeros dropped, `.` as the decimal mark — `{0.1 + 0.2}` prints `0.3` |
| A long float                                      | `0.333333333333333`                                    | The same cap; shorten it yourself with `round(x, n)`                                            |
| `NaN`, `±Infinity`                                | *nothing*                                              | A non-finite result is as unprintable as `undefined`                                            |
| `-0`                                              | `0`                                                    |                                                                                                |
| A string                                          | its text, unquoted                                     | Printed verbatim and never re-parsed — `{…}` inside a value is text, not a command               |
| An empty array                                    | *nothing*                                              |                                                                                                |
| An array                                          | `sword, rope`                                          | Elements joined with `, `, each printed by this table; strings lose their quotes                 |
| A nested array                                    | `1, [2, 3]`                                            | Brackets on the inner level only, so element boundaries survive                                  |
| A point                                           | `48.148600, 17.107700`                                 | Six decimals (~11 cm); a comma decimal mark could not be read back                               |
| A path                                            | `path((48.148600, 17.107700), (48.150000, 17.110000))` | Composite geographic values print as valid Rea source                                            |
| An area                                           | `area((48.148600, 17.107700), …)`                      |                                                                                                |
| A circle                                          | `circle((48.148600, 17.107700), 250)`                  |                                                                                                |
| A buffer                                          | `buffer(path(…), 50)`                                  | A bare point argument takes parentheses                                                          |
| A union / a difference                            | `area(…) + circle(…)` / `area(…) - circle(…)`          |                                                                                                |
| A datetime                                        | `2026-08-17T20:15:00Z`                                 | The ISO source form; the reader's locale comes from `formatDateTime()`                           |
| A duration                                        | `PT90M`                                                | The ISO source form; a human phrase is a built-in's job                                          |
| A date held as a string or a millisecond number   | per the string / integer row                           | Date built-ins operate on ISO strings and timestamps                                             |
| Anything else — a regex, a host-supplied object   | *nothing*, plus `eval/invalid-expression`              | The backstop: an engine-authored shape never reaches a page                                      |

### Attributes

<Feature id="attributes" />

Commands and functions share a unified parameter syntax. Parameters are **comma-separated**.

**Named parameters** use `key=value`:

```rea
{voice speed=3, pitch=7, emotion="whisper" begin}
She leaned close and said the secret word.
{end voice}
```

String values with spaces are quoted:

```rea
{button action="show_map", title="The Kingdom of Arath"}
```

Boolean attributes can be specified without a value (presence means `true`):

```rea
{video src="intro.mp4", autoplay, loop, muted}
```

**Positional parameters** precede named parameters. In function calls, positional arguments come first:

```rea
{plural(story.player.gold, zero="no coins", one="{} coin", other="{} coins")}
{formatNumber(story.player.score, style="decimal", maximumFractionDigits=0)}
{max(a, b)}
```

`{}` inside a named parameter value inserts the first positional argument's value.

### Comma and attribute grammar

<Feature id="comma-grammar" />

A comma at the **top nesting level** — not inside `()`, `[]`, or a quoted string — separates attributes:

```rea
{image src="a.png", alt="Hello, world"}
```

is valid: the comma inside the quoted string is not a separator, because quotes (like `()` and `[]`) suspend top-level comma-splitting for their contents.

A top-level comma on a construct that takes no attributes is an error, surfaced as soon as it's typed:

```rea
{break, foo="x"}   {comment ERROR — {break} takes no attributes at all}
```

A bare word in attribute-value position is never a literal — it is always a variable reference:

```rea
{image src="a.png", alt=Hello, world}
```

is an error: `Hello` is parsed as a bare identifier reference, but `alt` requires a literal, and strings always require quotes (see [Data types](#data-types)). The trailing `, world` is a further bare positional token with no attribute to bind to, but the error is already caught at `Hello`.

**Accepted literal forms for an attribute value:**

| Form                      | Example                        | Notes                                                                 |
| ------------------------- | ------------------------------- | ---------------------------------------------------------------------- |
| Quoted string             | `"Hello, world"`                | The only string form — unquoted bare-word strings are never valid.     |
| Number                    | `42`, `3.14`, `-7`               |                                                                        |
| Boolean                   | `true`, `false`                 |                                                                        |
| `undefined`               | `undefined`                     |                                                                        |
| Variable reference        | `story.player.gold`             | A dotted, domain-prefixed path — not a bare word.                      |
| Parenthesized expression  | `(a + b) * 2`                   |                                                                        |

`name=` is the one attribute this rule doesn't apply to: it assigns a symbolic label for later reference (see [Command naming](#command-naming)), not a value to evaluate, so its bare identifier is neither a literal nor a variable read.

### Command naming

Commands can be named for later reference using `name=`:

```rea
{if story.player.gold > 100, name=rich_check begin}
  You flash your wealth.
{end if}
```

Named commands track execution state (see [Built-in Functions](05-reference.md#_30-built-in-functions)).

### Reserved keyword

`end` is a **reserved keyword** and cannot be used as a command name. It is recognized exclusively as the closer in paired commands: `{end command_name}`.

The broader list of reserved bare words that also apply to domain, function, and attribute names lives in [Reserved bare words](#reserved-bare-words).

### Common command attributes

| Attribute | Description                                                    |
| --------- | -------------------------------------------------------------- |
| `name`    | Assign a name for reference                                    |
| `repeat`  | `true` (default) or `false` — evaluate once only               |
| `once`    | Shorthand for `repeat=false` — display only on first encounter |

---

## 11. Variables & Data Types

### Declaring variables

<Feature id="set" />

Every variable reference and every `{set}` target must carry a **domain prefix**. A bare, dotless name in `{set}` position is an error (`parse/dotless-set`). The domain is the mandatory first segment; everything after it is the author's free, undeclared namespace, organized into logical categories. There is no separate "persistent" vs. "non-persistent" variable kind — the domain alone determines a variable's lifetime (see [Scoping](#scoping)):

```rea
{set story.player.name = "Aiden"}
{set story.player.gold = 100}
{set story.quest.has_key = true}
{set story.player.inventory = ["sword", "torch", "map"]}
```

Common free-namespace patterns, under whichever domain fits the variable's lifetime:

| Pattern              | Use case                  | Example                                     |
| --------------------- | -------------------------- | --------------------------------------------- |
| Character name        | Character state            | `story.player.gold`, `story.elena.location` |
| Object category        | Items, tools, environment  | `story.tool.knife`, `story.door.state`       |
| Story concept          | Flags, quests, progress    | `story.quest.has_key`, `story.flag.visited`  |
| Multi-level nesting     | Fine-grained organization  | `story.role.king.power`, `story.map.zone.3` |

### Scoping

<Feature id="scopes" />

Without a manifest domain remap ([below](#domain-renaming)), exactly these four domains exist:

| Domain     | Lifetime and purpose                                                                                                                                                       |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `part.`    | Local temporary state. Reset every time the reader's active **part** changes (a terminal gate, a cross-part link, or any other part-file transition) — including re-entering a previously-visited part; there is no restore. |
| `story.`   | Persists across the whole `.reast` package, across every part, for the lifetime of the reading session (and across sessions, via save/restore).                              |
| `shared.`  | Persists like `story.`, but every write also replicates to every connected reader in the cooperative session (`env/shared-write-conflict` — last write wins).                |
| `context.` | Read-only interaction with the world, the reader, the device, and the running session — see [Context domain](#context-domain).                                                |

```rea
{set story.player.gold = 50}
{set shared.player.name = "Aiden"}
{set part.scratch.attempts = 0}
```

`shared.` and `part.` are domains in their own right, not modifiers on `story.` — `shared.player.name` is "`player.name` under the `shared` domain," not "the story-domain `player.name`, shared."

**Heading-scope no longer exists.** There is no domain-free variable form — every `{set}` target and every variable read carries one of the four domain names above (or a manifest rename). An author who wants temporary, section-local state uses `part.` instead: it behaves like `story.` (persists across heading boundaries, loop bodies, `{if}` branches) except its reset trigger is a part change, not a heading boundary.

**Loop variables (`{for}` item/index, `{while}` counter) are not a special case.** They are ordinary domain-prefixed variables, chosen by the author like any `{set}` target — `part.item` is the typical choice for scratch state, but `story.item` or any other domain works exactly as well. The loop header performs the equivalent of `{set <path> = <value>}` on every iteration/entry; see [For Loop](#for-loop) and [While Loop](#while-loop). Nothing about the variable is auto-cleared when the loop ends — it keeps whatever value it last held, for as long as its domain says it should.

**Function parameters are the one dotless exception** — see [Custom Functions](/spec/functions#parameters) for why (recursion needs a fresh binding per call frame, which a shared domain path cannot provide).

### Reserved bare words

<Feature id="reserved-words" />

`begin`, `end`, `else`, `elseif`, `true`, `false`, `undefined` are reserved as:

- A **domain name** (first segment only): `{set begin.x = 1}` is an error, even though it's dotted — the domain segment is the one place a bare reserved word is genuinely ambiguous with the keyword.
- A **function name**: `{function true(...) ...}` is an error.
- An **attribute name**: `{image end="..."}` is an error.

They do not need reserving past the first segment of a path (`story.quest.true` is fine), and they do not need reserving as loop/lexical identifiers outside these three positions.

Other command keywords (`if`, `for`, `while`, `switch`, `case`, `default`, `on`, `state`, `function`, `return`, `break`, `continue`) are reserved as command names but **not** as domain names — `{set story.on.event_name = true}` is legal, because only the first group can appear as a bare, undotted attribute *value* (`true`/`false`/`undefined` are literals; `begin`/`end`/`else`/`elseif` are structural keywords), where the ambiguity actually arises.

### Domain renaming

<Feature id="domain-renaming" />

A manifest MAY remap the four domain names to author-chosen identifiers:

```json
{
  "domains": {
    "context": "周囲",
    "story": "物語"
  }
}
```

- Keys are always the canonical English names (`part`, `story`, `shared`, `context`) — only the in-story identifier is localized.
- A rename target must not collide with a reserved bare word ([above](#reserved-bare-words)) or with another domain's name (canonical or renamed). Both checks run at manifest-load time, before any `.rea` file is parsed.
- A rename target must be a valid Rea identifier under the Unicode rule ([below](#unicode-identifiers)).
- Omitting `domains`, or omitting individual keys, uses the canonical English name for the un-remapped domain(s) — partial remaps are allowed.
- An unrecognized key inside `domains` follows the existing `pkg/manifest-unknown-key` convention (info, no reader consequence) rather than a hard failure.

### Context domain

<Feature id="context-domain" />

`context.` is the platform's read-only window onto the reader, the device, the world, and the running session. Default capability → path table:

| Path                                               | Type     | Notes                                                                                    |
| ---------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `context.reader.name`                               | string   |                                                                                             |
| `context.reader.language`                           | string   |                                                                                             |
| `context.reader.age`                                | integer  |                                                                                             |
| `context.story.title`                               | string   | Platform metadata — not the reserved `story.meta.*` subtree ([below](#story-metadata)).   |
| `context.story.chapter`                             | string   |                                                                                             |
| `context.story.progress`                            | float    |                                                                                             |
| `context.time.now`                                  | datetime |                                                                                             |
| `context.time.date`                                 | string   |                                                                                             |
| `context.time.hour`                                 | integer  |                                                                                             |
| `context.time.minute`                               | integer  |                                                                                             |
| `context.time.day`                                  | integer  |                                                                                             |
| `context.time.month`                                | integer  |                                                                                             |
| `context.time.year`                                 | integer  |                                                                                             |
| `context.time.weekday`                              | string   | Day name, lowercase.                                                                        |
| `context.time.season`                               | string   | Hemisphere-aware.                                                                           |
| `context.weather`                                   | string   | `clear`, `rain`, `snow`, `fog`, `storm`.                                                    |
| `context.temperature`                               | float    | Celsius.                                                                                    |
| `context.wind`                                      | float    | m/s.                                                                                        |
| `context.humidity`                                  | float    | Percentage, 0–100.                                                                          |
| `context.location`                                  | point    | Test it against an area with `matches` — see [Coordinate literals](#coordinate-literals).  |
| `context.location.lat` / `.lng` / `.alt` / `.acc`   | float    |                                                                                             |
| `context.heading`                                   | float    | Compass heading, 0–360.                                                                     |
| `context.speed`                                     | float    | m/s.                                                                                        |
| `context.orientation`                               | float    | Device rotation, 0–360.                                                                     |
| `context.tilt.x` / `.y`                             | float    | Forward/backward and left/right tilt.                                                       |
| `context.acceleration.x` / `.y` / `.z`              | float    |                                                                                             |
| `context.light`                                     | float    | Ambient light in lux.                                                                       |
| `context.device.camera`                             | boolean  |                                                                                             |
| `context.device.gps`                                | boolean  |                                                                                             |
| `context.device.vibration`                          | boolean  |                                                                                             |
| `context.group.size`                                | integer  |                                                                                             |
| `context.group.readers`                             | array    |                                                                                             |
| `context.group.role`                                | string   |                                                                                             |

This replaces the old `reader.*`, `world.*`, `device.*`, `group.*` built-in namespaces — a breaking change with no compatibility shim; a story referencing `world.location` gets `link/unknown-domain`. A scanned/spoken payload (`{scan}`/`{listen}`) stays a lexical `event.kind`/`event.value` binding, not a `context.*` path — there is no "last scan result" to read continuously. The two built-ins that used to hang off a namespace become plain global builtins, matching the un-prefixed style of `max()`/`length()`/`number()`: `world.has(feature)` is **`has(feature)`** and `group.readers_in_role(role)` is **`readers_in_role(role)`**.

**What the reader carries is not `context.`** — `{give}`/`{take}` and the coin wallet write `story.reader.inventory`, `story.reader.pocket` and `story.reader.coins`, under `story.` because they are consequences of the story that a save must carry. `context.` is only what the platform observes and the story cannot change.

A manifest MAY remap individual `context.*` paths, independently of a domain rename:

```json
{
  "domains": { "context": "周囲" },
  "context": { "location": "位置" }
}
```

**Writability:** `context.` is read-only in full — `{set context.* = ...}` at any path is an error (`eval/context-write-refused`). Every current path is populated by the platform, never by `{set}`.

**Redaction:** no `context.` path's *value* may ever appear in a diagnostic record, at any severity — the type name is reportable, the value never is. No carve-outs by path (`context.time.hour` is not "just the hour, that's fine" — it is redacted the same as `context.location`).

### Story metadata

<Feature id="story-metadata" />

`meta` is reserved as a first free segment **only** under `story.`:

```rea
story.meta.title
story.meta.chapter
story.meta.progress
```

`part.meta.*`, `shared.meta.*`, and `context.meta.*` are ordinary author namespace — not reserved. `{set story.meta.* = ...}` at any path under this subtree is an error: `eval/story-meta-write-refused`, same partition and shape as `eval/context-write-refused`, kept as a distinct code because the two are different write-refusal reasons (built-in read-only namespace vs. a reserved-but-otherwise-normal domain).

### Unicode identifiers

<Feature id="unicode-identifiers" />

Rea identifiers (domain segments, after any manifest rename, and everything in the author's free namespace) are defined over Unicode Identifier and Pattern Syntax characters (`ID_Start`/`ID_Continue`, per UAX #31) plus `_` and digits in continue position, excluding the ASCII punctuation Rea's own grammar already reserves (`.`, `,`, `=`, braces, brackets, parens, quotes). `周囲.位置` is exactly as valid as `context.location`.

Every identifier is compared and stored in **NFC (Normalization Form C)**, normalized the moment it's read, before any comparison, storage, or diagnostic — a precomposed and a combining-sequence spelling of the same visible identifier are always the same variable.

**Confusable-script mixing produces a diagnostic, not an error:** an identifier that mixes characters from two or more of {Latin, Cyrillic, Greek} which are members of Unicode's confusables table for each other, evaluated pairwise across the identifier's characters, gets `style/confusable-identifier` (info) naming the mixed scripts. Common/inherited scripts (digits, `_`, combining marks) never count toward "more than one script," so a single non-Latin identifier (`周囲.位置`, `context.météo`) is never flagged — this is deliberately narrow: it catches a homoglyph swap meant to look identical, not the normal case of a localized identifier mixing, say, CJK and Latin.

### Deletion via `undefined`

<Feature id="deletion" />

`{set story.x = undefined}` deletes the variable — reading `story.x` again afterward is indistinguishable from it never having been set. Assigning `undefined` to a node with children deletes the entire subtree (`story.player.stats.strength = undefined` also removes any `story.player.stats.strength.*` nested properties). There is no domain-clear command — deleting everything under a domain is `{set domain.root = undefined}` on the shallowest common ancestor, since subtree-delete already covers it.

A `{set shared.x = undefined}` replicates like any other shared write, through the same last-write-wins conflict resolution — no special case. A checkpoint/save taken *after* a deletion simply doesn't contain that path; restoring an *earlier* snapshot naturally brings the variable back, since restore replaces the whole variable state with the snapshot's.

### Data types

<Feature id="data-types" />

| Type        | Example          | Description                      |
| ----------- | ---------------- | -------------------------------- |
| `string`    | `"hello"`        | Text value, always double-quoted |
| `integer`   | `42`             | Whole number                     |
| `float`     | `3.14`           | Decimal number                   |
| `boolean`   | `true`, `false`  | Logical value                    |
| `array`     | `[1, 2, "adam"]` | Ordered collection               |
| `regex`     | `/^[a-z]+$/i`    | Regular expression — a literal on the right of [`matches`](#pattern-membership-tests). Not yet a value a variable can hold: a save is JSON, and a stored pattern would not survive it. |
| `undefined` | `undefined`      | Null/empty value                 |

**Strings always require double quotes** — there are no unquoted string literals. A bare word in an expression is always a variable reference, never a string. This eliminates ambiguity:

```rea
{set story.player.name = "Aiden"}
{set story.player.weapon = "sword"}
{if story.player.weapon = "sword" begin}
```

Here `"sword"` is a string value and `story.player.weapon` is a variable — the quotes are the only thing that tells them apart, and they are never optional.

In command attributes, string values also require quotes. Bare attribute values are interpreted as numbers, booleans, or identifier references — not as strings:

```rea
{voice speaker="elena", emotion="whisper", speed=3 begin}
{input name=story.answer.guess, type="number", placeholder="Enter a number"}
```

`speed=3` is a number (no quotes), `name=story.answer.guess` is a variable reference (the domain-prefixed path where input is stored), and `emotion="whisper"` is a string value (quoted).

### Arrays

<Feature id="arrays" />

**Arrays** are the universal collection type. Items are comma-separated and can be **positional** (indexed by position) or **named** (indexed by key), or both:

```rea
{set story.player.inventory = ["sword", "torch", "map"]}
{set story.stats = [strength=10, dexterity=8, wisdom=12]}
{set story.mixed = ["positional first", 12.345, shift=true]}
```

Positional items are accessed by **0-based index** (the first item is `.0`, the second `.1`, etc.), named items by key:

```rea
{story.player.inventory.0}
{story.stats.strength}
{story.mixed.0}
{story.mixed.shift}
```

When mixing positional and named items, positional items must come before named items — consistent with function parameters. Named items can be reordered freely.

::: warning Named items are not implemented `[strength=10, dexterity=8]` parses each item as an **equality test**, so the array comes out as `[false, false]` and `story.stats.strength` reads as unset. Only positional arrays work today. Keep named values in their own paths until this lands:

```rea
{comment WRONG — yields [false, false]}
{set story.stats = [strength=10, dexterity=8]}

{comment RIGHT}
{set story.stats.strength = 10}
{set story.stats.dexterity = 8}
```
:::

### Date, time & duration values

<Feature id="datetime-types" />

**Constructor types** (runtime types without literal syntax):

| Constructor                       | Description                                |
| --------------------------------- | ------------------------------------------ |
| `datetime("2026-06-15T10:30:00")` | ISO 8601 timestamp, supports wildcards `*` |
| `duration("P1DT2H30M")`           | ISO 8601 duration                          |

### Coordinate literals

<Feature id="coordinate-literals" />

A geographic point is written `@(lat, lng)` — **latitude first, then longitude**, the order every mapping service and GPS reading uses. Both arguments are ordinary expressions, so a point can be built from variables as readily as from numbers:

```rea
{set story.home = @(48.14, 17.10)}
{set story.here = @(story.lat, story.lng)}
```

The point is the only literal. Everything with an extent is built from points by an ordinary function, so the shapes compose the way any other value does:

| Constructor                 | Description                                                     |
| --------------------------- | --------------------------------------------------------------- |
| `path(p1, p2, …)`           | An ordered chain of at least two points. A path has no interior. |
| `area(p1, p2, p3, …)`       | A closed ring of at least three points. The ring closes itself.  |
| `circle(centre, metres)`    | Everything within `metres` of a point.                           |
| `buffer(shape, metres)`     | Everything within `metres` of a path, area, circle or point.     |
| `area1 + area2`             | Union — everything in either area.                               |
| `area1 - area2`             | Difference — everything in the first that is not in the second.  |

Every radius is in **metres**. `area()` closes its own ring, so repeating the first point at the end changes nothing: `area(p1, p2, p3)` and `area(p1, p2, p3, p1)` are the same triangle. `buffer()` is what gives a path an interior — a route only becomes somewhere a reader can *be* once it has a width:

```rea
{set story.park = circle(@(48.14, 17.10), 500)}
{set story.forest = area(@(48.14, 17.10), @(48.15, 17.10), @(48.15, 17.11), @(48.14, 17.11))}
{set story.corridor = buffer(path(@(48.14, 17.10), @(48.15, 17.11)), 50)}
{set story.donut = circle(@(48.14, 17.10), 1000) - circle(@(48.14, 17.10), 200)}
```

Ask whether a point is inside an area with [`matches`](#_12-expressions-operators), the same operator that tests a string against a pattern:

```rea
{if context.location matches story.park begin}
  You feel a strange resonance. This is the place from the story!
{end if}
```

A point prints as `lat, lng` at six decimals — about 11 cm, finer than any GPS reading. The form is the same in every locale: a locale that renders the decimal separator as a comma would print a value nothing could read back.

::: warning Built-in names
`path`, `area`, `circle` and `buffer` are core built-ins, and a built-in cannot be redefined. A `{function area() begin}` of your own is reported as [`link/redefines-builtin`](error-handling.md) and the built-in keeps running — the alternative, letting the declaration win silently, would break every geographic call in the document with nothing said about it.
:::

### DateTime wildcards

Wildcards enable time-based patterns using `datetime()` constructor strings:

```rea
{if context.time.now matches datetime("*-12-24T*") begin}
  Merry Christmas, {context.reader.name}!
{end if}

{if context.time.now matches datetime("*-*-*T22:*:*") begin}
  The night deepens around you...
{end if}
```

---

## 12. Expressions & Operators

<Feature id="operators" />

Expressions can appear anywhere inside `{ }`. They follow standard precedence rules.

### Expression atoms

An expression is built from these atomic elements:

| Atom               | Example                             | Description                         |
| ------------------ | ----------------------------------- | ----------------------------------- |
| Literal            | `42`, `"text"`, `true`, `[1, 2, 3]`     | Number, string, boolean, or array   |
| Variable           | `story.player.gold`, `story.quest.has_key` | Domain-prefixed variable path   |
| Function call      | `max(a, b)`, `length(inv.items)`        | Call with comma-separated arguments |
| Grouped expression | `(story.player.gold + bonus) * 2`       | Parentheses override precedence     |

### Operator precedence (highest to lowest)

| Precedence | Operator              | Description                         |
| ---------- | --------------------- | ----------------------------------- |
| 1          | `( )`                 | Grouping                            |
| 2          | `.`                   | Property access                     |
| 3          | `f()`                 | Function call                       |
| 4          | `-`, `!`              | Unary minus, logical NOT            |
| 5          | `*`, `/`, `%`         | Multiply, divide, modulo            |
| 6          | `+`, `-`              | Add, subtract, string concatenation |
| 7          | `matches`, `!matches` | Pattern match, negated              |
| 8          | `in`, `!in`           | Membership test, negated            |
| 9          | `<`, `<=`, `>`, `>=`  | Comparison                          |
| 10         | `=`, `!=`             | Equality, inequality                |
| 11         | `and`                 | Logical AND                         |
| 12         | `or`                  | Logical OR                          |
| 13         | `? :`                 | Ternary conditional                 |

### Pattern & membership tests

<Feature id="pattern-matching" />

`matches` tests a value against a regular expression and `in` tests membership in an array. Both are keywords rather than symbols, and both take a `!` prefix to negate:

```rea
{if story.player.name matches /^[A-Z]/ begin}
{if "sword" !in story.player.inventory begin}
```

### Ternary conditional

<Feature id="ternary" />

The ternary operator provides inline conditional values:

```rea
{set story.mood = story.player.health < 50 ? "desperate" : "determined"}
The hero looks {story.player.gold > 0 ? "hopeful" : "dejected"}.
```

The condition is evaluated first; if truthy, the expression before `:` is returned, otherwise the expression after `:`. Ternary has the **lowest** precedence — use parentheses when nesting:

```rea
{(context.time.hour >= 20 ? 2 : 1) * story.combat.base_damage}
```

**Notes:**

- `=` in expressions is equality (not assignment). Assignment uses `{set}`.
- `and` / `or` use short-circuit evaluation.
- Unary `-` negates a number: `-story.player.gold`, `-(a + b)`.
- `+` with a string operand performs concatenation: `"Hello, " + story.player.name`
- Property access chains are left-to-right: `context.group.readers.0.name`

### String behavior

Strings are **opaque values** — `{expression}` syntax is NOT interpreted inside string literals. To build dynamic strings, use concatenation:

```rea
{set story.msg.greeting = "Hello, " + context.reader.name + "!"}
```

The `{expression}` syntax works only in **narrative text** (outside of string literals), where it is evaluated and its result is inserted inline.

### Type coercion in expressions

<Feature id="type-coercion" />

When operands have different types, Rea applies implicit coercion:

- **Addition / Concatenation** (`+`): if either operand is a string, the result is a string (concatenation). Otherwise numeric addition
- **Arithmetic** (`-`, `*`, `/`, `%`): operands coerced to numbers. Non-numeric strings produce `undefined`
- **Comparison** (`<`, `>`, `<=`, `>=`): both coerced to numbers if possible, otherwise string comparison
- **Equality** (`=`, `!=`): no coercion — types must match, except `""` equals `false` (both falsy)
- **Boolean context** (`if`, `and`, `or`, `!`): falsy values are `false`, `0`, `""`, `undefined`, empty array `[]`

**Core rule: string + anything = string.** When `+` encounters a string operand, the other operand is converted to its string representation and the result is concatenated.

| Expression           | Result            | Why                                   |
| -------------------- | ----------------- | ------------------------------------- |
| `"gold: " + 42`      | `"gold: 42"`      | String + number → concatenation       |
| `"has key: " + true` | `"has key: true"` | String + boolean → concatenation      |
| `42 + 8`             | `50`              | Number + number → addition            |
| `"3" + "7"`          | `"37"`            | String + string → concatenation       |
| `"3" * 2`            | `6`               | Arithmetic coerces to number          |
| `"hello" * 2`        | `undefined`       | Non-numeric string → arithmetic fails |

### Explicit type conversion

To convert between types explicitly, use conversion functions:

| Function     | Description                                                             |
| ------------ | ----------------------------------------------------------------------- |
| `number(x)`  | Convert to number. `number("42")` → `42`, `number("abc")` → `undefined` |
| `string(x)`  | Convert to string. `string(42)` → `"42"`, `string(true)` → `"true"`     |
| `boolean(x)` | Convert to boolean. Falsy values → `false`, everything else → `true`    |
| `integer(x)` | Convert to integer (truncates). `integer(3.7)` → `3`                    |

```rea
{set story.total = number(story.reader_input) + story.player.gold}
{set story.label = "Score: " + string(story.player.score)}
{set story.has_items = boolean(length(story.player.inventory))}
```

### Examples

```rea
{story.player.gold * 2 + story.combat.bonus}
{story.player.level >= 10 and story.quest.has_key}
{story.player.name matches /^[A-Z]/}
{"sword" in story.player.inventory}
{!story.door.is_locked or story.quest.has_master_key}
{story.player.health < 50 ? "run" : "fight"}
{-story.combat.penalty + story.combat.bonus}
{context.reader.name + " the " + upper(story.player.class)}
```

---

## 13. Control Flow

### If / Else If / Else

<Feature id="if-else" />

```rea
{if story.player.gold > 100 begin}
  The merchant smiles greedily.
{else if story.player.gold > 50}
  The merchant nods politely.
{else}
  The merchant looks at you with pity.
{end if}
```

### Switch / Case

<Feature id="switch-case" />

`{switch}` takes exactly one subject expression; each `{case}` matches exactly **one** literal value — there is no comma-list, multi-value match. An author wanting several values to hit the same branch uses `{if}`/`or` inside the case body, or repeats the branch.

```rea
{switch story.player.class begin}
{case "warrior"}
  You draw your sword.
{case "mage"}
  You raise your staff.
{case "rogue"}
  You melt into the shadows.
{default}
  You stand your ground.
{end switch}
```

### For Loop

<Feature id="for-loop" />

The loop item (and optional index) is an ordinary domain-prefixed variable, chosen by the author like any `{set}` target — the loop header sets it on every iteration, exactly as `{set <path> = <value>}` would:

```rea
{for part.item in story.player.inventory begin}
  You have: {part.item}
{end for}
```

With an index variable (defined after a comma before `begin`, also domain-prefixed):

```rea
{for part.item in story.player.inventory, part.index begin}
  {part.index + 1}. {part.item}
{end for}
```

The index variable starts at 0 and increments with each iteration. Neither `part.item` nor `part.index` is cleared when the loop ends — they keep their last value, like any other `part.` variable, until the active part changes.

### While Loop

<Feature id="while-loop" />

```rea
{while story.lock.attempts > 0 begin}
  You try the lock again...
  {set story.lock.attempts = story.lock.attempts - 1}
{end while}
```

With an iteration counter (defined after a comma before `begin`, domain-prefixed like the `{for}` index):

```rea
{while story.lock.attempts > 0, part.tryNumber begin}
  Attempt {part.tryNumber + 1}: You try the lock again...
  {set story.lock.attempts = story.lock.attempts - 1}
{end while}
```

The counter variable starts at 0 and increments with each iteration.

::: warning The `{while}` counter is not implemented The parser does not split `, part.tryNumber` off the condition — it swallows it, so the counter is never bound and the condition is malformed. `{for}`'s index variable works correctly; `{while}`'s counter does not. Count with an ordinary `{set}` until it lands:

```rea
{set part.tryNumber = 0}
{while story.lock.attempts > 0 begin}
  Attempt {part.tryNumber + 1}: you try the lock again...
  {set part.tryNumber = part.tryNumber + 1}
  {set story.lock.attempts = story.lock.attempts - 1}
{end while}
```
:::

### Break & Continue

<Feature id="break-continue" />

```rea
{for part.item in story.player.inventory begin}
  {if part.item = "cursed_ring" begin}
    {continue}
  {end if}
  You inspect the {part.item}.
  {if part.item = "golden_key" begin}
    This is the one! {break}
  {end if}
{end for}
```

### State Machines

<Feature id="state-machines" />

Formal state machines model entities that transition between named states based on events and conditions. Useful for doors, NPCs, weather systems, or any entity with distinct behavioral modes:

```rea
{state_machine door, initial="locked" begin}
  {state locked begin}
    The door is locked tight.
    {on unlock when story.quest.has_key begin}
      You turn the key. Click!
      {-> closed}
    {end on}
  {end state}

  {state closed begin}
    The door is closed but unlocked.
    {on open begin}
      The door swings open.
      {-> open}
    {end on}
    {on lock begin}
      You lock the door behind you.
      {-> locked}
    {end on}
  {end state}

  {state open begin}
    The doorway stands open before you.
    {on close begin}
      You pull the door shut.
      {-> closed}
    {end on}
  {end state}
{end state_machine}
```

**State machine attributes:**

| Attribute | Description                           |
| --------- | ------------------------------------- |
| `initial` | Starting state (required)             |
| `persist` | `true` to save state across sessions  |
| `shared`  | `true` to share state between readers |

A machine's current state is readable at `story.<id>.state` — story state like any other, written by the machine rather than by a `{set}`:

```rea
{if story.door.state = "locked" begin}
  You need a key.
{end if}

{trigger door.unlock}
```

Guard conditions on transitions prevent invalid state changes:

```rea
{on unlock when story.quest.has_key and !story.alarm.active begin}
  {-> closed}
{end on}
```

---

## 14. Functions

<Feature id="functions" />

Custom functions defined with `{function}…{end function}` — pure, template, hybrid, and side-effect classifications, calling-context behavior, parameters with default values, and which classifications a `.rext` file may export — now live on their own page: see [Custom Functions](/spec/functions).

---

## 15. Events

<Feature id="events" />

Events respond to platform triggers. They are defined using `{on event_name begin}`:

```rea
{on story_start begin}
  {set story.player.gold = 100}
  {set story.player.health = 100}
{end on}

{on chapter_start begin}
  The next chapter of your journey begins...
{end on}

{on shake begin}
  The ground trembles beneath your feet!
{end on}
```

### Built-in events

| Event            | Trigger                                |
| ---------------- | -------------------------------------- |
| `story_start`    | Story is opened for the first time     |
| `story_resume`   | Story is reopened after being closed   |
| `chapter_start`  | A new chapter begins                   |
| `chapter_end`    | A chapter is completed                 |
| `timer`          | A timer reaches zero                   |
| `shake`          | Device is shaken                       |
| `screenshot`     | Reader takes a screenshot              |
| `idle`           | Reader is inactive for a period        |
| `proximity`      | Another reader is nearby (cooperative) |
| `location_enter` | Reader enters a geographic area        |
| `location_exit`  | Reader leaves a geographic area        |
| `time_match`     | Real-world time matches a pattern      |
| `weather_match`  | Weather condition matches a pattern    |
| `scan`           | Reader scans a QR code or barcode      |

### Parameterized events

Some events accept parameters that filter when they fire:

```rea
{on time_match datetime("*-12-25T*") begin}
  Merry Christmas!
{end on}

{on weather_match "snow" begin}
  Snowflakes drift past the window.
{end on}

{on shake, intensity=3 begin}
  The ground trembles violently!
{end on}
```

The parameter narrows the event trigger. Without parameters, the event fires on any match (e.g., `{on scan begin}` fires on any scan, `{on scan "CODE-42" begin}` fires only when "CODE-42" is scanned).

### Save & checkpoints

<Feature id="checkpoints" />

The platform auto-saves reader progress after every choice. Authors can define named checkpoints for explicit save/restore points:

```rea
{checkpoint name="before_boss"}
```

Readers can restore to any checkpoint via the platform UI. Authors can also restore checkpoints programmatically:

```rea
{restore name="before_boss"}
```

Restore MAY carry an optional guard, evaluated at the moment of restore against current `context.*` and the checkpoint's own recorded metadata:

```rea
{restore name="before_boss", when=context.time.now - checkpoint.saved_at < duration("PT10M")}
```

`checkpoint.saved_at` is an implicit field on every named checkpoint — the timestamp at save time. If `when=` evaluates false, the restore is refused (`flow/restore-condition-failed`, info): reading continues from the current position, distinct from restoring a checkpoint that doesn't exist at all (`link/unknown-checkpoint`). Named-checkpoint restore is blocked the same way `{undo}` is when an irretractable effect (an active `{exclusive}` lock, an in-progress `{vote}`) happened since the checkpoint — same `env/undo-blocked` code, not a separate one.

#### What a snapshot captures

A snapshot (whether auto-save or named checkpoint) captures the **complete reader state**:

| Category          | What is saved                                                                |
| ----------------- | ---------------------------------------------------------------------------- |
| Variables         | All `{set}` values under `part.`, `story.`, and (cooperative) `shared.` — `context.*` is never snapshotted; see below. |
| RNG stream position | The seeded random stream's position, so a feature relying on it (`{vote}`'s random tiebreak, dice notation) doesn't desync on restore. |
| Position          | Current passage, line offset, active choice stack                            |
| Visit counts      | How many times each anchor/heading has been visited                          |
| Reader attributes | Language, name, role, custom metadata                                        |
| State machines    | Current state of every `{state_machine}`                                     |
| Once-block flags  | Which `{once}` blocks have already fired                                     |
| Cycle indices     | Current position in each `{cycle}`                                           |
| Label text        | Current text of each `{label}` (after any `{replace}`)                       |
| Card inventory    | Items given/taken via `{give}`/`{take}`                                      |
| Deck state        | Which storylets have been drawn, remaining pool                              |
| Timer state       | Active timers are **paused** on save and **resumed** on restore              |
| Media playback    | Audio/video positions are **not saved** — media restarts on restore          |

`context.*` values are live-read, never frozen into a snapshot — restoring a save re-reads current sensor/platform state rather than replaying stale values (a save that pinned yesterday's GPS position would be actively wrong on restore). `part.` state is snapshotted like any other domain; restoring a checkpoint recorded mid-part restores its `part.` values intact, and they stay intact until the reader next actually changes part — restore itself is a state replacement, not a part transition, so it does not trigger `part.`'s normal reset.

**Scrolling up to re-read is not restoring.** Scroll position is purely cosmetic — current variables are unaffected, no diagnostic, no confirmation needed. An implementation MUST NOT let a reader change story state (a new choice, a new `{set}`-bearing event) while scrolled to a re-read position without first either restoring to that position (an explicit, confirmed operation) or blocking the interaction.

In cooperative reading, a snapshot additionally captures:

| Category          | What is saved                                                   |
| ----------------- | --------------------------------------------------------------- |
| Shared variables  | All `shared.*` values                                           |
| Per-reader state  | Each reader's individual state (variables, position, inventory) |
| Role assignments  | Current `{define role}` bindings                                |
| Lock state        | Which `{lock}` blocks are active and who holds them             |
| Vote/race results | Completed vote/race outcomes                                    |

Checkpoints in cooperative reading require **all connected readers** to agree before restoring. If a reader is disconnected, their consent is not required — the platform restores their state when they reconnect.

#### Manual save

Readers can manually save at **any point during reading** (not just at author-defined checkpoints). Manual saves capture the same data as checkpoints. Authors can disable manual save for specific sections:

```rea
{save enabled=false}
{comment Auto-save still occurs but reader cannot manually save/load}
```

When `{save enabled=false}` is active, the platform UI hides the save button. Auto-save continues at choices so that progress is not lost on app crash.

#### Save portability across story versions

Saves are **bound to a specific story version** (the `version` metadata field). When a story is updated:

- **Patch version change** (e.g., `1.0.0` → `1.0.1`): saves are loaded normally. Missing new variables use their default values. Removed variables are silently ignored.
- **Minor version change** (e.g., `1.0` → `1.1`): the platform attempts to load the save. If the reader's current position no longer exists (passage was removed/renamed), the platform falls back to the nearest valid checkpoint or the beginning of the current chapter.
- **Major version change** (e.g., `1.x` → `2.x`): saves are **incompatible**. The platform notifies the reader and offers to start fresh.

The platform stores saves as JSON. The schema includes a `spec_version` field (the Rea language version) and a `story_version` field (the author's version), enabling the runtime to detect compatibility.

---
