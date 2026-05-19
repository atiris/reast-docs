# Rea Language — Cheat Sheet

> Plain text is valid content. Just write.

## Implementation Status

Features marked with status indicators reflect the current proof-of-concept parser state.

| Status | Meaning                                                      |
| ------ | ------------------------------------------------------------ |
| ✅     | Fully implemented and tested in the parser/platform          |
| 🔶     | Partially implemented (basic support, some features missing) |
| 📋     | Specified but not yet implemented (planned)                  |

| Feature Area                           | Status | Notes                                                                               |
| -------------------------------------- | ------ | ----------------------------------------------------------------------------------- |
| Metadata (in `reast.json`)             | ✅     | All keys parsed from manifest                                                       |
| Text & Paragraphs                      | ✅     | Line breaks, blank-line separation                                                  |
| Inline formatting (`_`, `*`, `` ` ``)  | ✅     | Italic, bold, bold-italic, code                                                     |
| Headings (`#` through `#####`)         | ✅     | All 5 levels                                                                        |
| Blockquotes (`\|`)                     | ✅     | Single and nested                                                                   |
| Horizontal rules (`-` through `-----`) | ✅     | All 5 weights                                                                       |
| Links (`[text > target]`)              | ✅     | Internal, file, and story links                                                     |
| Media (`[!]`, `[>]`, `[?]`)            | ✅     | Image, video, audio nodes                                                           |
| Anchors (`[#name]`)                    | ✅     | Inline anchors, label jumps                                                         |
| Footnotes (`[^id]:`)                   | ✅     | Named and auto-numbered, sequential indexing                                        |
| Variables (`{set}`)                    | ✅     | Numbers, strings, arrays, domain-prefixed                                           |
| Expression printing (`{expr}`)         | ✅     | Full: arithmetic (+−\*/%​), comparison, logical, ternary (?:), parens, `in`, arrays |
| `{if}`/`{else if}`/`{else}`/`{end if}` | ✅     | Full conditional blocks                                                             |
| `{for ... in ...}` with index          | ✅     | Loop with optional index variable                                                   |
| Choices (`*` one-time, `+` sticky)     | ✅     | Nested, conditional, fallback                                                       |
| Gathers (`-`)                          | ✅     | Branch reconvergence                                                                |
| Diverts (`->`)                         | ✅     | Simple jumps                                                                        |
| Dialogue (`@speaker:`)                 | ✅     | Speaker attribution                                                                 |
| `.reast` package unpacking             | ✅     | ZIP extraction, `reast.json` manifest                                               |
| Moderator / DM instructions            | 📋     | Spec-only — `moderator/` directory in `.reast`                                      |
| Alignment (`=`, `>`, `<`)              | ✅     | Parsed with indentation levels                                                      |
| Underline, strikethrough, monospace    | ✅     | Inline and multi-line block forms                                                   |
| Nested inline formatting               | ✅     | Bold inside italic, italic inside bold                                              |
| `{function}` / `{return}`              | ✅     | Define, call, defaults, return values                                               |
| Tunnels (`->->`)                       | ✅     | Tunnel divert + return stack                                                        |
| `{while}` loop                         | ✅     | Condition + body, nested, 1000-iteration safety                                     |
| `{switch}`/`{case}`                    | ✅     | Expression match, multiple cases, default, nested                                   |
| `{once}`/`{then}`/`{end once}`         | ✅     | First-visit content with optional fallback                                          |
| `{cycle}`/`{replace}`                  | ✅     | Inline varying text with 4 modes                                                    |
| Built-in functions                     | ✅     | Math, string, type, array, localization (spec §30)                                  |
| Storylets & decks                      | 📋     | Spec-only                                                                           |
| Cards (characters, items, actions)     | 📋     | Spec-only                                                                           |
| Voice & audio commands                 | 📋     | Spec-only                                                                           |
| Input & interaction                    | 📋     | Spec-only                                                                           |
| Cooperative reading                    | 🔶     | Broadcast, whisper, wait, vote blocks parsed                                        |
| State machines                         | 📋     | Spec-only                                                                           |
| Events                                 | 📋     | Spec-only                                                                           |
| Real-world interactions (GPS, NFC)     | 🔶     | Waypoint directive parsed; NFC, weather pending                                     |
| Pluralization & localization           | ✅     | plural(), select(), ordinal() built-ins with named params                           |
| Content protection (`{lock}`)          | 📋     | Spec-only                                                                           |
| Varying text (`{first\|second}`)       | ✅     | sequence/cycle/once/shuffle modes                                                   |

## Formatting

| Syntax                                 | Result            |
| -------------------------------------- | ----------------- |
| `_text_`                               | Italic            |
| `*text*`                               | **Bold**          |
| `_*text*_`                             | **_Bold italic_** |
| `{underline begin}text{end underline}` | Underline         |
| `` `text` ``                           | Monospace         |
| `{strike begin}text{end strike}`       | ~~Strikethrough~~ |

## Structure

```rea
# Chapter          ## Section         ### Scene
#### Subsection    ##### Detail
= centered         > right-aligned    < forced left
| blockquote
-                  Heavy HR (thickest)
--                 Medium-heavy HR
---                Medium HR
----               Light HR
-----              Subtle HR (finest)
```

## Links & Media

```rea
[text > #anchor]            Internal link
[text > chapter2.rea]       File link
[text > reast://ABC123]     Story-to-story link
[!alt text < source]        Image
[>caption < source]         Video
[?caption < source]         Audio
[#anchor_name]              Inline anchor
[^id]: content              Footnote definition
[^]: content                Auto-numbered footnote
```

## Variables & Assignment

```rea
{set player.gold = 50}                   Number (domain-prefixed)
{set player.name = "Aria"}               String (always double-quoted)
{set player.inventory = ["torch", "map"]} Array (positional items)
{set stats = [hp=100, dex=8]}            Array (named items)
{set mixed = ["first", shift=true]}      Array (positional + named)
{set temp = 42}                          Heading-scoped (no domain)
```

**Namespaces:** `reader.*` `story.*` `world.*` `device.*` `group.*` — read-only platform data

**Shared state (coop):** `{set shared.player.name = "Aiden"}`

## Expressions & Print

```rea
{player.name}                    Print variable
{player.gold + 50}              Print expression result
{health > 0 ? "alive" : "dead"} Ternary
```

**Operators (by precedence):**
`.` `f()` → `-` `!` (unary) → `*` `/` `%` → `+` `-` → `matches` `!matches` → `in` → `<` `>` `<=` `>=` → `=` `!=` → `and` → `or` → `?` `:`

**Equality uses single `=`** (not `==`). Assignment is always `{set}`.

## Control Flow

```rea
{if condition begin}              {for item in list begin}
  ...                               ...
{else if condition}               {end for}
  ...
{else}                            {for item in list, index begin}
  ...                               ...
{end if}                          {end for}

{while condition begin}           {switch value begin}
  ...                             {case "a"} ...
  {break}                         {case "b"} ...
  {continue}                      {default} ...
{end while}                       {end switch}
```

## Functions

```rea
{function greet(name, title = "adventurer") begin}
  Hello, {name} the {title}!
{end function}

{function damage(base, multiplier = 1.0) begin}
  {return base * multiplier}
{end function}

{greet("Aria")}                  Call (renders text)
{set dmg = damage(10, 1.5)}     Call (returns value)
```

## Built-in Functions

```rea
{set y = abs(x)}                 Math: abs, min, max, round, floor, ceil
{set r = random(1, 6)}          Random integer in range (inclusive)
{set v = clamp(x, 0, 100)}      Constrain to range
{set n = length(name)}           String/array length
{set s = upper("hello")}        String: upper, lower, trim
{set ok = contains(s, "sub")}    Check substring/array membership
{set s2 = replace(s, "a", "b")} Replace all occurrences
{set arr = split("a,b", ",")}    Split into array
{set s3 = join(arr, ", ")}       Join array into string
{set n = number("42")}           Type: number, string, boolean, integer
{set inv = append(inv, "sword")} Array: append, remove, shuffle, sort, slice
```

## Choices & Branching

```rea
* [One-time choice]              Disappears after selection
+ [Sticky choice]                Always available
* {player.gold > 10} [Buy potion] Conditional choice
* * [Nested choice]              Second level

-> anchor_name                   Jump (divert)
->-> section_name                Tunnel (jump and return)
->->                             Return from tunnel
- Gather point                   Branch reconvergence
* ->                             Fallback (auto-selected when no options remain)
```

## Anchors

```rea
[#anchor_name]                   Define inline anchor
-> anchor_name                   Jump to anchor
[go back > #anchor_name]         Link to anchor
```

## Advanced Narrative

```rea
{once begin} First visit. {then} Return visit. {end once}
{label clue begin}an old book{end label}
{replace clue = "a glowing tome"}
{cycle mood begin}calm|nervous|terrified{end cycle}
{storylet name begin} ... {end storylet}
{deck from="tavern_stories", max=3, shuffle begin} ... {end deck}
```

## Varying Text

```rea
{first|second|third}             Sequence (stops at last)
{&a|b|c}                        Cycle (loops)
{!once|twice|done}               Once-only (then empty)
{~opt1|opt2|opt3}                Shuffle (random)
```

## Cards

```rea
{define character elena begin}        [@elena] to reference
  name: Elena Voss
  title: The Wandering Scholar
  image: media/elena.png
{end define}

{define item golden_key begin}        [$golden_key] to reference
  name: Golden Key
{end define}

[&open_gate]                     Action reference
{give golden_key}                Give item to reader
{take golden_key}                Remove item from reader
```

## Dialogue

```rea
@elena: "Follow me!"            Speaker attribution
@narrator: The path grew dark.  Narrator (no quotes needed)
```

## Voice & Audio

```rea
{voice speed=5, pitch=5, emotion="whisper" begin}
  The cave echoed with whispers.
{end voice}

[?Rain sounds < media/rain.ogg volume=0.5, loop]
[>Intro cinematic < media/intro.mp4 autoplay]
{stop ambient_music}
```

## Input & Interaction

```rea
{input name=player_name, placeholder="Enter your name"}
{input name=guess, type="number", min=1, max=100}
{button label="Continue", target=next_chapter}
{timer duration=30, on_expire="-> timeout" begin} ... {end timer}
```

## Cooperative Reading

```rea
{define role scout begin}             Reader roles
  max: 1
{end define}

{vote timeout=60 begin}               Group voting
  * [Go left]   * [Go right]
{end vote}

{whisper to="captain" begin} ... {end whisper}
{broadcast begin} ... {end broadcast}
{wait readers=all begin} ... {end wait}
{exclusive action="open_chest" begin} ... {end exclusive}
{presence show="cursor" begin} ... {end presence}
{set shared.group_score = 0}     Shared variable
```

## State Machines

```rea
{state_machine door, initial="locked" begin}
  {state locked begin}
    The door is locked.
    {on unlock when quest.has_key begin}
      You turn the key. Click!
      {-> closed}
    {end on}
  {end state}
  {state closed begin}
    The door is unlocked.
    {on open begin}
      {-> open}
    {end on}
  {end state}
{end state_machine}
```

## Events

```rea
{on story_start begin} ... {end on}
{on chapter_start begin} ... {end on}
{on reader_join begin} ... {end on}
{on time_match datetime("*-12-25T*") begin} ... {end on}
{on shake begin} ... {end on}
{checkpoint name="before_boss"}
```

## Real-World Interactions

```rea
{require gps}
{require nfc optional}
{waypoint old_bridge, @@48.14;17.10/50 begin} ... {end waypoint}
{zone dark_forest @@48.14;17.10@48.15;17.10@48.15;17.11@48.14;17.11 begin}
  {on enter begin} ... {end on}
  {on exit begin} ... {end on}
{end zone}
{route treasure_hunt, sequential begin} ... {end route}
```

## Pluralization & Localization

```rea
{plural(count, zero="no coins", one="{} coin", other="{} coins")}
{select(pronoun, he="He draws his sword", she="She draws her sword", other="They draw their sword")}
{ordinal(position)}
{format(score, style="decimal", grouping=true)}
```

## Content Protection

```rea
{lock type="soft", key="a1b2c3d4e5f6g7h8i9j0" begin}
  Premium content here.
{end lock}
```

## Error Handling

Rea uses **graceful degradation** — no `try/catch`. Errors never interrupt the reader:

- Undefined variable → empty string
- Missing media → placeholder
- Invalid expression → silently skipped

Use `{strict on}` during development to see warnings.

## Comments

```rea
{// This is a single-line comment}
{comment begin}
  This is a multi-line comment.
  Not rendered to readers.
{end comment}
```

## Escaping

```rea
\{not a command\}                Backslash escapes special chars
{raw begin}
  Everything here is literal text.
{end raw}
```

## Author Tools

```rea
{todo: Fix this section}         Warning in dev mode
{note: Review dialogue tone}     Dev annotation
{strict on}                      Warnings become visible
```

## Story Metadata

Metadata is stored in `reast.json` inside the `.reast` package (not in the `.rea` file):

```json
{
  "title": "My Story",
  "author": [{ "name": "Name" }],
  "language": "en",
  "readers": [1, 2],
  "sensors": ["gps"],
  "tags": ["fantasy", "adventure"],
  "age": { "min": 12 }
}
```

The `.rea` file contains only story content — no metadata.

## Built-in Functions

| Category | Functions                                                                           |
| -------- | ----------------------------------------------------------------------------------- |
| String   | `length()` `upper()` `lower()` `trim()` `contains()` `replace()` `split()` `join()` |
| Math     | `round()` `floor()` `ceil()` `abs()` `min()` `max()` `random()` `clamp()`           |
| Array    | `length()` `append()` `remove()` `contains()` `shuffle()` `sort()` `slice()`        |
| Query    | `visited()` `visit_count()` `turns()` `elapsed()` `choice_count()` `reader_count()` |
| Text     | `select()` `plural()` `ordinal()` `format()` `calendar()`                           |
| Convert  | `number()` `string()` `boolean()` `integer()` `datetime()` `duration()`             |
| Testing  | `seed()` `snapshot()`                                                               |

**`select()`** / **`plural()`** use named arguments:

```rea
{select(pronoun, he="sword", she="bow", other="staff")}
{plural(count, one="a gem", other="{} gems")}
```
