# Rea Language — Cheat Sheet

> Plain text is valid content. Just write.

This sheet shows the syntax, not its maturity. Some of what follows is `draft` or `development` — specified but not usable yet. Check the [feature index](features) before you rely on anything here.

## Two Core Symbols

The entire Rea language builds on two characters:

| Symbol | Purpose                                                           | Remember      |
| ------ | ----------------------------------------------------------------- | ------------- |
| `{ }`  | **Commands** — everything that "does" (logic, variables, control) | Curly = code  |
| `[ ]`  | **References** — everything that "points" (links, media, anchors) | Square = link |

Everything else is story text.

---

## Text & Formatting

```rea
Plain text. Just write.

_italic_     *bold*     _*bold italic*_     `monospace`
{underline begin}underlined{end underline}
{strike begin}strikethrough{end strike}
```

**Structure:**

```rea
# Chapter        ## Section       ### Scene
= centered      > right-aligned  < forced left
| blockquote     || nested quote
---              Horizontal rule (1–5 dashes = 5 weights)
```

---

## Links & Media `[ ]`

The first character after `[` determines the type:

| Prefix   | Type            | Example                                     |
| -------- | --------------- | ------------------------------------------- |
| _(none)_ | Link            | `[Continue > #forest]`                      |
| `!`      | Image           | `[!Forest map < media/map.jpg]`             |
| `>`      | Video           | `[>Intro < media/intro.mp4]`                |
| `?`      | Audio           | `[?Rain < media/rain.ogg, volume=0.5, loop]` |
| `#`      | Anchor (define) | `[#forest]`                                 |
| `[[`     | Part gate       | `[[ story/0005-forest.rea ]]` (ends the part) |

For a link (`[text > target]`), the first character of the **target** (after `>`) picks the destination:

| Target prefix | Type     | Example                                    |
| ------------- | -------- | ------------------------------------------ |
| `#`           | Anchor   | `[back > #forest]`                         |
| _(file/path)_ | Part     | `[on > story/0004-kingdom.rea]`            |
| `^`           | Footnote | `[dialect > ^Old Elvish, nearly lost.]`    |
| `*`           | Hint     | `[the tower > *A nudge.**A firmer hint.]`  |

**Arrow direction:** `>` = where the link goes, `<` = where the source comes from.

---

## Variables & Printing `{set}` `{name}`

```rea
{set story.player.gold = 100}         Number
{set story.player.name = "Aria"}      String (always double-quoted)
{set story.player.items = ["sword", "map"]}  Array
{set story.stats = [hp=100, dex=8]}   Named items

Hello, {story.player.name}! You have {story.player.gold} gold.
```

**In prose, only a plain path prints.** An expression or a call must go through a `{set}` first — written straight into the text it reaches the reader verbatim:

```rea
{set story.mood = story.player.gold > 50 ? "rich" : "poor"}
You look {story.mood}.
```

**Every path starts with a domain** — there is no domain-free form. The domain alone decides how long the variable lives:

| Domain     | Lives                                                              |
| ---------- | ------------------------------------------------------------------ |
| `part.`    | Until the reader changes part, including on a return visit          |
| `story.`   | The whole reading, and across sessions via save/restore             |
| `shared.`  | Like `story.`, and every write replicates to every reader           |
| `context.` | Read-only: the reader, the device, the world, the running session   |

A manifest may rename all four (`"domains": {"story": "物語"}`).

---

## Control Flow

```rea
{if story.player.gold > 10 begin}   {for part.item in story.player.items begin}
  You have enough gold.                - {part.item}
{else if story.player.gold > 0}     {end for}
  Still have something.
{else}                               {while story.fuel > 0 begin}
  Broke.                               Keep going...
{end if}                               {set story.fuel = story.fuel - 1}
                                     {end while}
{switch story.weapon begin}
  {case "sword"} Melee.              {case "bow"} Ranged.
  {default} Fists.
{end switch}
```

---

## Choices & Branching

```rea
* [One-time choice]                  Disappears after selection
  Text after choosing.

+ [Sticky choice]                    Always available
  Text after choosing.

* {story.player.gold >= 10} [Buy potion]   Conditional choice
  {set story.player.gold = story.player.gold - 10}

* * [Nested choice]                  Second level

- Gather point                       Branches reconverge here
-> anchor_name                       Divert (jump)
->-> section_name                    Tunnel (jump + auto-return)
* ->                                 Fallback (auto-selected when nothing remains)

* hidden [&card_id] ...              Hidden choice — no button; fires via free-text or scan/mark/listen

{menu select=2 begin}                Exploration menu — waits for 2 picks
* hidden [&qr_door] ...              Hidden option — no button, wakes only by activation
{end menu}

{storylet bench_secret begin}        Triggered storylet — the world deals the card
  trigger: scan                        Input kind: scan, listen, text, nfc, ... (open set)
  match: "^REAST-BENCH-.*"             Optional regex on the input value
  ...                                  Plays as a side path, returns to the main story
{end storylet}
```

---

## Functions

```rea
{function greet(name, title = "adventurer") begin}
  Hello, {name} the {title}!
{end function}

{greet("Aria")}                      Call (renders text)
{set story.dmg = damage(10, 1.5)}    Call (returns value)
```

**Built-ins:** `abs` `min` `max` `round` `random(1,6)` `clamp` `length` `upper` `lower` `trim` `contains` `replace` `split` `join` `append` `remove` `shuffle` `sort`

---

## Extensions (`.rext`)

```rea
{use "extensions/inventory" as inv}   Import a bundled extension (path omits .rext)
{inv.total_weight()}                  Call an exported function
{use "std/dice" as dice}              Standard library — always available, offline
{dice.roll(2, 6)}                     std/dice: d(sides) roll(n,sides) advantage/disadvantage
```

See [When rules differ in `.rext` files](rext-differences) for the language rules inside a `.rext`, and the engine's [`.reast` package format reference](/engine/package-format#packaged) for archive mechanics.

---

## Localization & Dates

All of these run inside `{set}`, never in prose, and `plural` templates take no `{}` placeholder ([why](02-logic-data#print-shorthand)):

```rea
{set story.word = plural(story.coins, one="coin", other="coins")}
{set story.his = select(story.pronoun, he="his", she="her", other="their")}
{set story.rank = ordinal(3)}                        "3rd" (en); "3" elsewhere
{set story.big = formatNumber(1234567, "sk")}        2nd arg = locale
{set story.day = formatDate(context.time.date, "long")}
{set story.at = formatTime(now(), "short")}          iso|short|medium|long|full

You have {story.coins} {story.word}, counted on {story.day}.
```

The host supplies locale and formatting policy. `calendar()` is still in development — see the [feature index](features#localization).

---

## Dialogue

```rea
@elena: "Follow me!"                Speaker attribution (with quotes)
@narrator: The path grew dark.      Narrator (no quotes needed)
```

---

## Narrative Tools

```rea
{once begin} First visit. {then} Return visit. {end once}

{first|second|third}                 Sequence (stops at last)
{&a|b|c}                            Cycle (loops forever)
{!once|twice|done}                   Once-only (then empty)
{~opt1|opt2|opt3}                    Shuffle (random)
```

---

## Cooperative Reading

```rea
{define role scout begin}            Role definition
  max: 1
{end define}

{vote timeout=60 begin}              Group voting
  * [Go left]   * [Go right]
{end vote}

{whisper to="captain" begin}         Secret message
  I see guards.
{end whisper}

{broadcast begin} Everyone hears. {end broadcast}
{wait readers=all begin} Waiting... {end wait}
{set shared.score = shared.score + 1}  Shared variable
```

---

## Real-World Interactions

```rea
{require gps}                        Require sensor
{require nfc optional}               Optional sensor

{waypoint bridge, @@48.14;17.10/50 begin}
  You stand on the old bridge.
{end waypoint}

{timer duration=30, on_expire="-> timeout" begin}
  Hurry!
{end timer}
```

---

## Voice & Audio

```rea
{voice speed=5, pitch=5, emotion="whisper" begin}
  The cave echoed with whispers.
{end voice}

{stop ambient_music}
```

---

## Cards (Characters, Items)

```rea
{define character elena begin}
  name: Elena Voss
  image: media/elena.png
{end define}

[@elena]                    Character reference
[$golden_key]               Item reference
{give golden_key}           Give item to reader
{take golden_key}           Remove item from reader
{play ability_card}         Play a card → runs its on_use hook
```

```rea
{coins gold="Dukát" silver="Groš" bronze="Halier"}  Rename coin tiers
{coins silver_per_gold=5 bronze_per_silver=4}        Redefine ratios
{earn gold 2}               Add 2 gold (1 gold = 10 silver = 100 bronze)
{spend bronze 3}            Spend 3 bronze (breaks higher coins as needed)
{if story.reader.coins.total >= 100 begin} ... {end if}  Check wallet value
```

```rea
{define cardset ability begin}   Declare a custom card set/category
  name: Ability Cards
  use: Play to apply the bonus.
  {on_use begin}                 Hook runs for every card of the set
    {set story.ability_count = story.ability_count + 1}
  {end on_use}
{end define}

{define ability spinach begin}   A card belonging to the set
  name: Spinach
  strength: +2
{end define}
```

```rea
{define action door begin}       Real-world activation fields
  scan: ^REAST-DOOR-.*             QR/barcode payload (regex)
  mark: emb1:Zk3q…                 Drawn mark signature (opaque — never hand-edit)
  listen: open the door            Speech transcript (regex)
{end define}
```

---

## Input & Interaction

```rea
{input name=player_name, placeholder="Your name"}
{input name=guess, type="number", min=1, max=100}
{input type="action", placeholder="What do you do?"}   Free text matched to the pending choices
{button label="Continue", target=next_chapter}
```

---

## Comments & Author Tools

```rea
{comment Single-line comment}
{comment begin}
  Multi-line comment — readers never see this.
{end comment}

\{not a command\}                    Backslash escaping
{raw begin} Everything literal. {end raw}

{todo Fix this scene}                Hidden from readers, listed by reast validate
{todo begin} ... {end todo}          Multi-line TODO
```

---

## Rules to Remember

1. **`{ }` = action**, **`[ ]` = reference** — that's the whole language
2. **`begin` / `end`** — all block commands use this pair
3. **Single `=` for comparison** (not `==`), assignment is always `{set domain.name = ...}`
4. **Every path carries a domain** — `part.` `story.` `shared.` are the author's, `context.` is the platform's and read-only
5. **`*` = one-time choice**, **`+` = sticky choice**, **`-` = gather (reconverge)**
6. **`->` = jump**, **`->->` = tunnel (jump + automatic return)**
7. **First char in `[ ]`** decides media/anchor: `!` image, `>` video, `?` audio, `#` anchor; in a link, the **target** prefix `^` = footnote, `*` = hint
8. **Plain text is a valid story** — you add syntax only when you need it
9. **Prose prints a path and nothing else** — compute in `{set}`, print the name; and never inside backticks, where everything is verbatim
