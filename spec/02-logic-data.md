# Rea Language Specification — Part 2: Logic & Data (Sections 10–15)

> [Back to main specification](/)
>
> **Implementation status:** Commands (10), variables (11), and basic control flow (13: `if`/`else`/`for`) are implemented. Expression printing (12) is partial — simple variable references work but arithmetic, ternary, and function calls are not yet evaluated at parse time. Functions (14), `while`, `switch/case`, and events (15) are specified but not yet implemented. See [REA-CHEATSHEET.md](REA-CHEATSHEET.md) for detailed status.

---

## 10. Commands

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

An expression inside `{ }` by itself is printed:

```rea
Hello, {player.name}! You have {player.gold} gold.
```

This is conceptually equivalent to printing the expression's value.

### Attributes

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
{plural(player.gold, zero="no coins", one="{} coin", other="{} coins")}
{formatNumber(player.score, style="decimal", maximumFractionDigits=0)}
{max(a, b)}
```

`{}` inside a named parameter value inserts the first positional argument's value.

### Command naming

Commands can be named for later reference using `name=`:

```rea
{if player.gold > 100, name=rich_check begin}
  You flash your wealth.
{end if}
```

Named commands track execution state (see [Built-in Functions](05-reference.md#30-built-in-functions)).

### Reserved keyword

`end` is a **reserved keyword** and cannot be used as a command name. It is recognized exclusively as the closer in paired commands: `{end command_name}`.

### Common command attributes

| Attribute | Description                                                    |
| --------- | -------------------------------------------------------------- |
| `name`    | Assign a name for reference                                    |
| `repeat`  | `true` (default) or `false` — evaluate once only               |
| `once`    | Shorthand for `repeat=false` — display only on first encounter |

---

## 11. Variables & Data Types

### Declaring variables

All persistent variables must have a **domain prefix** — a dot-separated namespace that organizes state into logical categories:

```rea
{set player.name = "Aiden"}
{set player.gold = 100}
{set quest.has_key = true}
{set player.inventory = ["sword", "torch", "map"]}
```

Authors choose domain names freely. Common patterns:

| Domain pattern      | Use case                  | Example                         |
| ------------------- | ------------------------- | ------------------------------- |
| Character name      | Character state           | `player.gold`, `elena.location` |
| Object category     | Items, tools, environment | `tool.knife`, `door.state`      |
| Story concept       | Flags, quests, progress   | `quest.has_key`, `flag.visited` |
| Multi-level nesting | Fine-grained organization | `role.king.power`, `map.zone.3` |

### Scoping

Variables exist in three scopes:

| Scope       | Syntax                          | Description                                                                                                        |
| ----------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **story**   | `{set domain.var = val}`        | Default. Accessible throughout the entire reast.                                                                   |
| **shared**  | `{set shared.domain.var = val}` | Shared across all readers in a group. Persists between reasts in a series.                                         |
| **heading** | `{set simplevar = val}`         | Scoped to the current heading and its subheadings. Ceases to exist when a heading of equal or higher level starts. |

```rea
{set player.gold = 50}
{set shared.player.name = "Aiden"}
```

The `shared.` prefix is a scope modifier — `shared.player.name` means "the `player.name` variable shared across all readers in the group and between reasts."

**Heading-scoped variables** use simple names **without** a dot (no domain prefix):

```rea
## The Castle

{set strength = 50}

### The Gate
{comment begin}strength is still 50 here — subheading inherits parent scope{end comment}

## After the Siege
{comment begin}strength no longer exists — new heading at the same level{end comment}
```

Heading-scoped variables are ideal for temporary story-local state that should not persist beyond the current narrative section. Loop variables (`{for}`) and function parameters are similarly scoped without a domain.

### Built-in variable namespaces

The platform provides read-only (or read-write where noted) namespaces:

| Namespace  | Description         | Examples                                                                                                              |
| ---------- | ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `reader.*` | Current reader info | `reader.name`, `reader.language`, `reader.age`                                                                        |
| `story.*`  | Current story info  | `story.title`, `story.chapter`, `story.progress`                                                                      |
| `world.*`  | Real-world context  | `world.time`, `world.date`, `world.hour`, `world.day`, `world.month`, `world.year`, `world.location`, `world.weather` |
| `device.*` | Device capabilities | `device.camera`, `device.gps`, `device.vibration`                                                                     |
| `group.*`  | Cooperative reading | `group.size`, `group.readers`, `group.role`                                                                           |

### Data types

| Type        | Example          | Description                      |
| ----------- | ---------------- | -------------------------------- |
| `string`    | `"hello"`        | Text value, always double-quoted |
| `integer`   | `42`             | Whole number                     |
| `float`     | `3.14`           | Decimal number                   |
| `boolean`   | `true`, `false`  | Logical value                    |
| `array`     | `[1, 2, "adam"]` | Ordered collection               |
| `regex`     | `/^[a-z]+$/i`    | Regular expression               |
| `undefined` | `undefined`      | Null/empty value                 |

**Strings always require double quotes** — there are no unquoted string literals. A bare word in an expression is always a variable reference, never a string. This eliminates ambiguity:

```rea
{set player.name = "Aiden"}
"Ako si sa dnes vyspal{player.knight.rod ["a"]}?"
{if weapon = "sword" begin}
```

In command attributes, string values also require quotes. Bare attribute values are interpreted as numbers, booleans, or identifier references — not as strings:

```rea
{voice speaker="elena", emotion="whisper", speed=3 begin}
{input name=guess, type="number", placeholder="Enter a number"}
```

`speed=3` is a number (no quotes), `name=guess` is an identifier binding (the variable name where input is stored), and `emotion="whisper"` is a string value (quoted).

**Arrays** are the universal collection type. Items are comma-separated and can be **positional** (indexed by position) or **named** (indexed by key), or both:

```rea
{set player.inventory = ["sword", "torch", "map"]}
{set stats = [strength=10, dexterity=8, wisdom=12]}
{set mixed = ["positional first", 12.345, shift=true]}
```

Positional items are accessed by **0-based index** (the first item is `.0`, the second `.1`, etc.), named items by key:

```rea
{player.inventory.0}
{stats.strength}
{mixed.0}
{mixed.shift}
```

When mixing positional and named items, positional items must come before named items — consistent with function parameters. Named items can be reordered freely.

**Constructor types** (runtime types without literal syntax):

| Constructor                       | Description                                |
| --------------------------------- | ------------------------------------------ |
| `datetime("2025-06-15T10:30:00")` | ISO 8601 timestamp, supports wildcards `*` |
| `duration("P1DT2H30M")`           | ISO 8601 duration                          |

**Coordinate literals** (geographic types with `@` syntax):

| Literal             | Description                                   |
| ------------------- | --------------------------------------------- |
| `@lat;lng`          | Geographic point                              |
| `@p1@p2@p3`         | Route/line (chain of points)                  |
| `@@lat;lng/radius`  | Circle (radius in meters)                     |
| `@@p1@p2/radius`    | Corridor (line with radius buffer, meters)    |
| `@@p1@p2@p3@p1`     | Polygon (closed chain of points)              |
| `@@.../radius`      | Inflated polygon (polygon with radius buffer) |
| `@@area1 + @@area2` | Union of areas                                |
| `@@area1 - @@area2` | Difference of areas (donut, exclusion)        |

Points use `@`, areas use `@@`. Radius is always in meters. Examples:

```rea
{set home = @48.14;17.10}
{set park = @@48.14;17.10/500}
{set forest = @@48.14;17.10@48.15;17.10@48.15;17.11@48.14;17.11}
{set donut = @@48.14;17.10/1000 - @@48.14;17.10/200}
```

### DateTime wildcards

Wildcards enable time-based patterns using `datetime()` constructor strings:

```rea
{if world.time matches datetime("*-12-24T*") begin}
  Merry Christmas, {reader.name}!
{end if}

{if world.time matches datetime("*-*-*T22:*:*") begin}
  The night deepens around you...
{end if}
```

---

## 12. Expressions & Operators

Expressions can appear anywhere inside `{ }`. They follow standard precedence rules.

### Expression atoms

An expression is built from these atomic elements:

| Atom               | Example                             | Description                         |
| ------------------ | ----------------------------------- | ----------------------------------- |
| Literal            | `42`, `"text"`, `true`, `[1, 2, 3]` | Number, string, boolean, or array   |
| Variable           | `player.gold`, `quest.has_key`      | Domain-prefixed variable path       |
| Function call      | `max(a, b)`, `length(inv.items)`    | Call with comma-separated arguments |
| Grouped expression | `(player.gold + bonus) * 2`         | Parentheses override precedence     |

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

### Ternary conditional

The ternary operator provides inline conditional values:

```rea
{set mood = health < 50 ? "desperate" : "determined"}
The hero looks {gold > 0 ? "hopeful" : "dejected"}.
```

The condition is evaluated first; if truthy, the expression before `:` is returned, otherwise the expression after `:`. Ternary has the **lowest** precedence — use parentheses when nesting:

```rea
{(is_night ? 2 : 1) * base_damage}
```

**Notes:**

- `=` in expressions is equality (not assignment). Assignment uses `{set}`.
- `and` / `or` use short-circuit evaluation.
- Unary `-` negates a number: `-player.gold`, `-(a + b)`.
- `+` with a string operand performs concatenation: `"Hello, " + player.name`
- Property access chains are left-to-right: `group.readers.0.name`

### String behavior

Strings are **opaque values** — `{expression}` syntax is NOT interpreted inside string literals. To build dynamic strings, use concatenation:

```rea
{set msg.greeting = "Hello, " + reader.name + "!"}
```

The `{expression}` syntax works only in **narrative text** (outside of string literals), where it is evaluated and its result is inserted inline.

### Type coercion in expressions

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
{set total = number(reader_input) + player.gold}
{set label = "Score: " + string(player.score)}
{set has_items = boolean(length(player.inventory))}
```

### Examples

```rea
{player.gold * 2 + combat.bonus}
{player.level >= 10 and quest.has_key}
{player.name matches /^[A-Z]/}
{"sword" in player.inventory}
{!door.is_locked or quest.has_master_key}
{player.health < 50 ? "run" : "fight"}
{-combat.penalty + combat.bonus}
{reader.name + " the " + upper(reader.class)}
```

---

## 13. Control Flow

### If / Else If / Else

```rea
{if player.gold > 100 begin}
  The merchant smiles greedily.
{else if player.gold > 50}
  The merchant nods politely.
{else}
  The merchant looks at you with pity.
{end if}
```

### Switch / Case

```rea
{switch player.class begin}
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

```rea
{for item in player.inventory begin}
  You have: {item}
{end for}
```

With index variable (defined after a comma before `begin`):

```rea
{for item in player.inventory, index begin}
  {index + 1}. {item}
{end for}
```

The index variable starts at 0 and increments with each iteration.

### While Loop

```rea
{while lock.attempts > 0 begin}
  You try the lock again...
  {set lock.attempts = lock.attempts - 1}
{end while}
```

With iteration counter (defined after a comma before `begin`):

```rea
{while lock.attempts > 0, tryNumber begin}
  Attempt {tryNumber + 1}: You try the lock again...
  {set lock.attempts = lock.attempts - 1}
{end while}
```

The counter variable starts at 0 and increments with each iteration.

### Break & Continue

```rea
{for item in player.inventory begin}
  {if item = "cursed_ring" begin}
    {continue}
  {end if}
  You inspect the {item}.
  {if item = "golden_key" begin}
    This is the one! {break}
  {end if}
{end for}
```

### State Machines

Formal state machines model entities that transition between named states based on events and conditions. Useful for doors, NPCs, weather systems, or any entity with distinct behavioral modes:

```rea
{state_machine door, initial="locked" begin}
  {state locked begin}
    The door is locked tight.
    {on unlock when has_key begin}
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

Access and trigger state transitions:

```rea
{if door.state = "locked" begin}
  You need a key.
{end if}

{trigger door.unlock}
```

Guard conditions on transitions prevent invalid state changes:

```rea
{on unlock when quest.has_key and !alarm.active begin}
  {-> closed}
{end on}
```

---

## 14. Functions

### Defining functions

Functions are defined at the top of a file or in a shared library file:

```rea
{function greet(name, time_of_day) begin}
  {if time_of_day = "morning" begin}
    Good morning, {name}!
  {else}
    Good evening, {name}!
  {end if}
{end function}
```

Functions can return values:

```rea
{function max(a, b) begin}
  {if a > b begin}
    {return a}
  {else}
    {return b}
  {end if}
{end function}
```

### Calling functions

```rea
{greet("Aiden", "morning")}

The stronger fighter has {max(player.strength, enemy.strength)} power.
```

### Function behavior by calling context

Functions can render text, return values, or both. The behavior depends on context:

| Context                           | Text rendered? | Return value used?   |
| --------------------------------- | -------------- | -------------------- |
| Standalone: `{greet("Aiden")}`    | Yes            | Discarded            |
| In expression: `{max(a, b) + 10}` | Yes (if any)   | Yes                  |
| In assignment: `{set x = fn()}`   | Yes (if any)   | Assigned to `x`      |
| In condition: `{if fn() begin}`   | Yes (if any)   | Evaluated as boolean |

**Function classifications:**

- **Pure function** — only `{return}`, no narrative text. Behaves like a traditional function (`max`, `damage`)
- **Template function** — only narrative text, no `{return}`. Behaves like a reusable text block (`greet`)
- **Hybrid function** — renders text AND returns a value. Powerful but potentially confusing; linters should warn
- **Side-effect function** — no text, no `{return}`. Only modifies variables or triggers commands (`reset_stats`)

```rea
{function reset_stats() begin}
  {set player.health = 100}
  {set player.gold = 0}
{end function}
```

A function's text body always renders when called — even in expression context. `{return}` is optional; if absent, the function's value in expressions is `undefined`.

### Parameters

Parameters support default values:

```rea
{function damage(base, multiplier = 1.0) begin}
  {return base * multiplier}
{end function}
```

---

## 15. Events

Events respond to platform triggers. They are defined using `{on event_name begin}`:

```rea
{on story_start begin}
  {set player.gold = 100}
  {set player.health = 100}
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

The platform auto-saves reader progress after every choice. Authors can define named checkpoints for explicit save/restore points:

```rea
{checkpoint name="before_boss"}
```

Readers can restore to any checkpoint via the platform UI. Authors can also restore checkpoints programmatically:

```rea
{restore name="before_boss"}
```

#### What a snapshot captures

A snapshot (whether auto-save or named checkpoint) captures the **complete reader state**:

| Category          | What is saved                                                                |
| ----------------- | ---------------------------------------------------------------------------- |
| Variables         | All `{set}` values, including nested properties and heading-scoped variables |
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
{// Auto-save still occurs but reader cannot manually save/load}
```

When `{save enabled=false}` is active, the platform UI hides the save button. Auto-save continues at choices so that progress is not lost on app crash.

#### Save portability across story versions

Saves are **bound to a specific story version** (the `version` metadata field). When a story is updated:

- **Patch version change** (e.g., `1.0.0` → `1.0.1`): saves are loaded normally. Missing new variables use their default values. Removed variables are silently ignored.
- **Minor version change** (e.g., `1.0` → `1.1`): the platform attempts to load the save. If the reader's current position no longer exists (passage was removed/renamed), the platform falls back to the nearest valid checkpoint or the beginning of the current chapter.
- **Major version change** (e.g., `1.x` → `2.x`): saves are **incompatible**. The platform notifies the reader and offers to start fresh.

The platform stores saves as JSON. The schema includes a `spec_version` field (the Rea language version) and a `story_version` field (the author's version), enabling the runtime to detect compatibility.

---
