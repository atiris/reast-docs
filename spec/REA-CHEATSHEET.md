# Rea Language — Cheat Sheet

> Plain text is valid content. Just write.

## Two Core Symbols

The entire REA language builds on two characters:

| Symbol | Purpose | Remember |
| ------ | ------- | -------- |
| `{ }` | **Commands** — everything that "does" (logic, variables, control) | Curly = code |
| `[ ]` | **References** — everything that "points" (links, media, anchors) | Square = link |

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

| Prefix | Type | Example |
| ------ | ---- | ------- |
| *(none)* | Link | `[Continue > #forest]` |
| `!` | Image | `[!Forest map < media/map.jpg]` |
| `>` | Video | `[>Intro < media/intro.mp4]` |
| `?` | Audio | `[?Rain < media/rain.ogg volume=0.5, loop]` |
| `#` | Anchor (define) | `[#forest]` |
| `^` | Footnote | `[^1]: Explanation` |

**Arrow direction:** `>` = where the link goes, `<` = where the source comes from.

---

## Variables & Printing `{set}` `{name}`

```rea
{set player.gold = 100}              Number
{set player.name = "Aria"}           String (always double-quoted)
{set player.items = ["sword", "map"]} Array
{set stats = [hp=100, dex=8]}        Named items

Hello, {player.name}! You have {player.gold} gold.
{player.gold > 50 ? "rich" : "poor"}
```

**Domain prefixes** (read-only platform data):
`reader.*` `story.*` `world.*` `device.*` `group.*`

---

## Control Flow

```rea
{if player.gold > 10 begin}         {for item in player.items begin}
  You have enough gold.                - {item}
{else if player.gold > 0}           {end for}
  Still have something.
{else}                               {while fuel > 0 begin}
  Broke.                               Keep going...
{end if}                               {set fuel = fuel - 1}
                                     {end while}
{switch weapon begin}
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

* {player.gold >= 10} [Buy potion]   Conditional choice
  {set player.gold = player.gold - 10}

* * [Nested choice]                  Second level

- Gather point                       Branches reconverge here
-> anchor_name                       Divert (jump)
->-> section_name                    Tunnel (jump + auto-return)
* ->                                 Fallback (auto-selected when nothing remains)
```

---

## Functions

```rea
{function greet(name, title = "adventurer") begin}
  Hello, {name} the {title}!
{end function}

{greet("Aria")}                      Call (renders text)
{set dmg = damage(10, 1.5)}         Call (returns value)
```

**Built-ins:** `abs` `min` `max` `round` `random(1,6)` `clamp` `length` `upper` `lower` `trim` `contains` `replace` `split` `join` `append` `remove` `shuffle` `sort`

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
```

---

## Input & Interaction

```rea
{input name=player_name, placeholder="Your name"}
{input name=guess, type="number", min=1, max=100}
{button label="Continue", target=next_chapter}
```

---

## Comments & Author Tools

```rea
{// Single-line comment}
{comment begin}
  Multi-line comment — readers never see this.
{end comment}

\{not a command\}                    Backslash escaping
{raw begin} Everything literal. {end raw}

{todo: Fix this scene}               Warning in dev mode
{strict on}                          Show all warnings
```

---

## Rules to Remember

1. **`{ }` = action**, **`[ ]` = reference** — that's the whole language
2. **`begin` / `end`** — all block commands use this pair
3. **Single `=` for comparison** (not `==`), assignment is always `{set x = ...}`
4. **Domain prefixes** separate author variables (`player.*`) from platform (`reader.*`)
5. **`*` = one-time choice**, **`+` = sticky choice**, **`-` = gather (reconverge)**
6. **`->` = jump**, **`->->` = tunnel (jump + automatic return)**
7. **First char in `[ ]`** decides: `!` image, `>` video, `?` audio, `#` anchor
8. **Plain text is a valid story** — you add syntax only when you need it
