# Narrative & Interaction: Dialogue, Flow & Input

> [Introduction](/spec/) · [Feature index](features) · [Cheatsheet](REA-CHEATSHEET)
>
> This page has the widest spread of maturity in the whole specification. Choices, storylets, cards and free-text input are **experimental** — released and usable today. Cooperative reading and most sensor features are **development** or **draft**: fully specified so you can design around them, but not available to write a story against yet. Check the badge under each heading before you rely on anything here.

---

## 16. Choices & Branching

Choices are the heart of interactive stories. Rea supports both simple and complex branching.

### Simple choices

<Feature id="choices" />

Use `*` for one-time choices and `+` for repeatable (sticky) choices:

```rea
The path splits before you.

* [Take the left path]
  The left path leads deeper into the forest.
  -> dark_forest

* [Take the right path]
  The right path follows the river.
  -> river_bank

+ [Look around]
  You survey your surroundings carefully.
  -> the_crossroads
```

::: warning An `{if}` inside a branch ends the whole group A block command indented under a choice closes the choice group, so every option written after it disappears and the reader is left with the ones above. Set a flag in the branch and put the conditional prose after the gather:

```rea
{comment WRONG — "Take the right path" never appears}
* [Take the left path]
  {if story.player.lamp begin}
  The lamp shows you the roots.
  {end if}

* [Take the right path]
  The river is louder here.

{comment RIGHT}
* [Take the left path]
  {set story.player.went = "left"}

* [Take the right path]
  {set story.player.went = "right"}

- {if story.player.went = "left" and story.player.lamp begin}
The lamp showed you the roots.
{end if}
```

`{set}`, `{give}`, `{take}`, `{earn}`, `{spend}` and `{play}` are all fine inside a branch — it is the block commands that close the group. :::

**Choice text rules:**

```text
* BEFORE [LABEL] AFTER
  ╰─┬──╯  ╰─┬─╯ ╰─┬─╯
    │       │      └── shown only after picking (narration)
    │       └── shown as clickable choice text
    └── shown in BOTH the choice AND the narration
```

- Text in `[ ]` is displayed as the choice label
- Text after `[ ]` is narration shown after the choice is picked
- Text before `[ ]` appears in both the choice and the narration

```rea
* "I need to think about this[."]," you said.
  The merchant waited patiently.
```

When chosen, displays: `"I need to think about this," you said. The merchant waited patiently.`  
As a choice, displays: `"I need to think about this."`

### Conditional choices

<Feature id="conditional-choices" />

Choices can have conditions:

```rea
* {story.quest.has_key} [Unlock the door]
  The key fits perfectly. The door swings open.

* {story.player.gold >= 50} [Bribe the guard]
  The guard pockets your gold and steps aside.

* [Walk away]
  You turn and leave quietly.
```

### Hidden choices

<Feature id="hidden-choices" />

A choice marked `hidden` renders no button. It stays in the group's pool — conditions, one-time consumption and narration all work as usual — but it can only fire through something other than a tap: the reader describing it in [free-text input](#free-text-action-input), or a real-world input matching its card's [activation fields](#real-world-activation) (a scanned code, a photographed mark, a spoken phrase):

```rea
* hidden [&look_under_sofa] Jozef bent down and looked under the old sofa, where he found a mysterious envelope marked _Secret!_
  {give secret_envelope}
```

The `hidden` keyword comes first on the choice line; a condition can follow it:

```rea
* hidden {story.player.curious} [&look_under_sofa] …
```

Hidden choices are usually bound to an action card with `[&card_id]` — the card's `description=` is what free-text matching compares against, and its `scan=`/`mark=`/`listen=` fields are what real-world inputs match. Because the label only appears after the choice fires, hint at hidden content in the surrounding prose; the label and narration are the reward, not the invitation. Groups built mostly from hidden choices are covered in [Exploration menus](#exploration-menus).

### Diverts

<Feature id="diverts" />

Use `->` to jump to a named section (anchor):

```rea
-> the_clearing

[#the_clearing]
You arrive at a small clearing bathed in moonlight.
```

### Nested choices

<Feature id="nested-choices" />

Choices can be nested using increasing `*` or `+`:

```rea
* [Talk to the stranger]
  "Who are you?" you ask.
  * * [Press harder]
    "Tell me your real name!"
  * * [Let it go]
    "Never mind. Forget I asked."
  - - The stranger shifts uncomfortably.
* [Ignore the stranger]
  You walk past without a word.
- The night continued in silence.
```

`- -` serves as a **gather point** — where nested branches reconverge (inspired by Ink's weave system).

### Gather points

Gathers use `-` at the appropriate nesting level to collect all branches back together:

```rea
What do you do?

* [Fight]
  You draw your weapon!
* [Flee]
  You turn and run!
* [Negotiate]
  "Can we talk about this?"

- Whatever you chose, the outcome was the same: trouble found you.
```

### Fallback choices

<Feature id="fallback-choices" />

A choice without text acts as a fallback (chosen automatically when no other options remain):

```rea
* [Ask about the weather]
  "Fine day, isn't it?"
* [Ask about the news]
  "Heard anything interesting?"
* ->
  The conversation fizzled out. -> leave_tavern
```

::: warning Parsed, but not yet auto-selected The fallback is recognised as an option and renders no button, but the runtime does not yet pick it when the others run out — `flow/fallback-choice-taken` has no emitter. A group that relies on it will simply end with nothing to click, so give the reader a visible way on until this lands. :::

### Tunnels (divert and return)

<Feature id="tunnels" />

A tunnel diverts into a section and automatically returns to the caller when it ends. Use `->->` to enter a tunnel:

```rea
You approach the locked door.
->-> examine_lock
After examining it, you consider your options.

* [Pick the lock]
  ->-> pick_lock_sequence
  The door is open!
* [Find another way]
  -> alternative_path
```

The tunneled section uses `->->` at its end (or simply reaches its last line) to return:

```rea
[#examine_lock]
The lock is old and rusted. Iron, with a simple mechanism.
->->

[#pick_lock_sequence]
You pull out your tools and get to work.
{if story.player.dexterity > 5 begin}
  The pins click into place smoothly.
{else}
  It takes several attempts, but finally...
{end if}
->->
```

Tunnels are useful for reusable passages (e.g., recurring inspections, shared dialogue sequences) without manually routing back.

A tunnel and a storylet solve different problems, and reach for one on purpose: a tunnel is a reusable content block scoped to the current chapter — the author writes the call site (`->->`) explicitly, and it always returns to exactly that point. A [storylet](/spec/storylets) is engine-selected, not author-called: it is drawn from a story-wide pool via `{deck}` or woken by a real-world `trigger=`, based on `require`/`priority`/`cooldown` rather than a fixed call site in the text.

### First-visit content

<Feature id="once-then" />

Show content only on the first visit to a passage, with optional fallback for subsequent visits:

```rea
[#the_tavern]
{once begin}
  The tavern is warm and lively. A bard plays in the corner.
  You've never seen a place quite like this.
{then}
  The familiar tavern. The bard nods as you enter.
{end once}

The barkeep waves you over.
```

The `{once begin}` block renders its primary content on the first encounter and the `{then}` fallback on all subsequent visits. If `{then}` is omitted, nothing is shown after the first visit.

### Text replacement (live labels)

<Feature id="labels-replace" />

Labels mark text that can be replaced in-place as the story progresses:

```rea
The door is {label door_state begin}locked{end label}.

{comment Later, after unlocking}
{replace door_state = "open"}
```

Combined with choices for interactive reveal:

```rea
You see a {label clue begin}mysterious symbol{end label} on the wall.

* [Examine the symbol]
  {replace clue = "rune of protection"}
  Of course — it's a rune of protection!
```

### Cycling text (tap-to-cycle)

<Feature id="cycling-text" />

Inline text that readers can tap to cycle through options, useful for character customization or exploratory narrative:

```rea
You chose the {cycle story.cloak_color begin}red|blue|green|black{end cycle} cloak.
```

The reader taps the highlighted word to cycle: `red` → `blue` → `green` → `black` → `red` → ...

The selected value is accessible as a variable: `{story.cloak_color}` returns the current selection.

### Varying text

<Feature id="varying-text" />

Text can vary based on visit count using `|` within `{ }`:

```rea
{You enter the tavern.|You return to the tavern.|The tavern again. This is becoming a habit.}
```

Modes:

| Prefix | Behavior                                      |
| ------ | --------------------------------------------- |
| (none) | **Sequence** — plays in order, sticks on last |
| `&`    | **Cycle** — loops indefinitely                |
| `!`    | **Once** — plays each once, then nothing      |
| `~`    | **Shuffle** — random order                    |

```rea
It was {&Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday}.

He laughed. {!A genuine laugh.|A polite chuckle.|He didn't laugh this time.}

The coin landed on {~heads|tails}.
```

### Hub-and-spoke pattern

A central hub anchor that readers return to after exploring branches. Combined with `{once begin}`, each branch adds new context to the hub:

```rea
[#town_square]
You stand in the town square.

{once name=visit_market begin}
  * [Visit the market]
    You explore the bustling market stalls.
    {set story.flag.visited_market = true}
    -> town_square
{end once}

{once name=visit_temple begin}
  * [Enter the temple]
    The temple is quiet and cool inside.
    {set story.flag.temple_blessing = true}
    -> town_square
{end once}

{if story.flag.visited_market and story.flag.temple_blessing begin}
  * [Head to the castle]
    With supplies and blessing, you're ready.
    -> castle_gates
{end if}
```

### Parallel storylines

<Feature id="parallel-storylines" />

Multiple storylines that advance independently and converge at key moments:

```rea
{parallel begin}
  {thread elena_thread begin}
    [#elena_journey]
    Elena travels west through the forest.
    {set story.elena.location = "forest"}
    {wait gareth_thread.reached("bridge") begin}{end wait}
    They meet at the bridge.
  {end thread}

  {thread gareth_thread begin}
    [#gareth_journey]
    Gareth takes the mountain path.
    {set story.gareth.location = "mountain"}
    [#bridge]
    He arrives at the old stone bridge.
  {end thread}
{end parallel}
```

In cooperative reading, different readers can follow different threads simultaneously, experiencing the story from different character perspectives.

### Cards and decks (quality-based narrative)

<Feature id="storylets" />

A card is a face plus a body, and a deck is a named pool of them. Selection runs on `when`, `priority`, `repeatable`, `cooldown`, `weight` and `tags`; a `{draw}` or `{play}` deals a hand, and a card with no deck may be woken by a real-world `trigger=` as a side path that returns exactly where the reader left off. Cards have their own page: see [Cards & Decks](/spec/storylets).

### Exploration menus

<Feature id="exploration-menus" />

A choice group can also be a **hidden exploration menu** — a set of [hidden choices](#hidden-choices) that wake only when the reader produces a matching real-world input: scanning a QR code, photographing a hand-drawn mark, saying a phrase, or typing a description:

```rea
{menu select=2 begin}
* hidden [&qr_door] The service door clicks open…
* hidden [&painted_tree] The painted tree shimmers…
* hidden [&couch_secret] Under the couch you find an envelope…
* [Give up and move on]
{end menu}
```

Wrapping a choice group in `{menu select=N begin} … {end menu}` changes how many discoveries the group waits for before the story moves on:

| `select=` value | Behavior                                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| _(omitted)_       | Normal single-pick choice group — unchanged from today                                               |
| `N`               | Re-presents the group after each activation until `N` options were chosen, or none remain eligible   |
| `all`             | Stays open while any option is still eligible                                                        |

Each activation plays that option's narration and effects exactly like a tapped choice — `{set}`, `{give}`, diverts, all run through the same path. A one-time (`*`) option leaves the pool once chosen; a repeatable (`+`) option stays available. A visible option can end the menu early by diverting elsewhere, or simply counts toward `N` like any other pick.

Activation channels — `scan=`, `mark=`, `listen=` — are declared on the referenced card (see [Real-world activation](#real-world-activation) in Cards), not on the choice line itself. The same `[&card_id]` reference and `hidden` flag work whether the card wakes from a tap, a scan, a mark, or a voice line.

#### Undo and saves inside a menu

Each discovery is a separate recorded choice, so undo steps back one discovery at a time — undoing inside a `select=2` menu returns to just before the last activation, with the earlier discovery still in place. Saves taken mid-menu resume with the same set of remaining eligible options.

#### Priority with storylet triggers

A single scan, spoken phrase, or drawn-mark photo can only mean one thing. If the reader has a pending exploration menu open when they produce that input, the menu is checked first; only if nothing in the menu matches does the input fall through to wake a storylet (see [Real-World Interactions](#_21-real-world-interactions)).

See [Storylets & Decks](/spec/storylets) for storylet selection, triggers, and priority/weight.

### Undo & back navigation

<Feature id="undo" />

The platform provides built-in back navigation, allowing readers to revisit previous passages. Authors can control this behavior:

```rea
{undo enabled=false}
```

By default, undo is **enabled** for solo reading and **disabled** for cooperative reading (shared state cannot be rewound). Authors can explicitly disable it for puzzle sections where undoing defeats the purpose:

```rea
{lock condition="story.quest.has_key" begin}
  {undo enabled=false}
  The door slams shut behind you. There is no going back.
  {comment Reader cannot undo past this point until the lock section ends}
{end lock}
```

Undo operates at the **choice level** — each reader choice creates a restore point. Undo reverts all variable changes since the last choice.

#### Undo in cooperative reading

Undo is **disabled by default** in cooperative mode because shared state cannot be rewound unilaterally. If an author explicitly enables undo in cooperative reading (`{undo enabled=true}`):

- Undo affects **only the individual reader's local state** — their variables, position, and inventory.
- **Shared variables** (`shared.*`) are **never** reverted by undo. Once a shared variable is set, it stays set for all readers.
- If the reader undoes past an `{exclusive}` block they claimed, the exclusive lock is **not released** — other readers' state depends on it.
- If the reader undoes past a `{vote}` they participated in, their vote is **not retracted** — the vote outcome stands.
- The undo stack is limited to **the current chapter**. Readers cannot undo across chapter boundaries.

### Checkpoints

Automatic saving happens at every choice, and an author can mark explicit restore points with `{checkpoint}`. Because a checkpoint is a state concern rather than a narrative one, it is specified in full — including exactly what a snapshot captures and how saves survive a story update — under [Save & checkpoints](02-logic-data.md#save-checkpoints).

### Multi-part stories

<Feature id="multi-part-stories" />

A longer story can be split into **story parts** — separate `.rea` files listed in the bundle manifest as `parts` (see Part 5 for the manifest schema). The reader plays through a sequence of parts: only the **current part** is the live document, and scrolling up reveals the **previously-visited parts** — the actual path taken, never an un-taken branch. There are two ways to move between parts.

<Feature id="part-gates" />

**Gate `[[ target ]]`** — an automatic, text-free transition. It occupies its own line and is terminal: when the flow reaches it, nothing after it in the current part renders, and the gate marks where the story continues. Scrolling past the current part's end reveals the gated part inline, as a seamless continuation.

```rea
You step through the archway; there is no going back.

[[ story/0005-forest.rea ]]
```

Because a gate ends the part, content placed after it is unreachable — the editor flags it as a warning. A gate may target a scene within the part with `[[ part.rea:scene ]]`, resuming at that `[#scene]` anchor. Gates inside an `{if}` express variable-driven branching without a manual choice:

```rea
{if story.quest.has_key begin}
[[ story/0006-castle.rea ]]
{end if}
{if not story.quest.has_key begin}
[[ story/0006-bush.rea ]]
{end if}
```

<Feature id="cross-part-links" />

**Cross-part link** — a normal navigation link whose target is a part file lets the reader choose to move on by tapping:

```rea
[enter the castle > story/0006-castle.rea] rises ahead of you.
```

Variables carry across parts: each part's top-level `{set}` commands run once as it is entered, on top of the state accumulated so far. Saved progress records the ordered path of visited parts plus the current part and in-part position, so a resume replays the visited parts for the scroll-back and continues the current part where the reader left off (see Part 5, _Reading state_).

---

## 17. Cards: Characters, Items & Actions

Cards are interactive story elements that readers can tap to inspect. They bring the story world to life beyond plain text.

### Character cards `[@]`

<Feature id="character-cards" />

```rea
[@elena]
You see [@elena] standing by the fountain.
```

Character cards are defined in metadata or a dedicated block:

```rea
{define character elena name="Elena Voss", title="The Wandering Scholar", image="media/elena.png", description="A tall woman with silver-streaked hair and ink-stained fingers."}
```

When a reader taps `[@elena]`, they see the character's card with portrait, name, title, and description.

### Item cards `[$]`

<Feature id="item-cards" />

```rea
You find a [$golden_key] on the ground.

{define item golden_key name="Golden Key", image="media/golden_key.png", description="An ornate key, warm to the touch. It seems to hum faintly.", rarity=rare}
```

Items can be added to a reader's inventory:

```rea
{give golden_key}
{take golden_key}
{if "golden_key" in story.reader.inventory begin}
  The key grows warm in your pocket.
{end if}
```

More than one of something uses `count=`. A bare number is not a count — it is ignored, and nothing is given:

```rea
{give arrow count=12}   {comment 12 arrows}
{give arrow}            {comment 1 arrow}
{give arrow 12}         {comment WRONG — gives nothing at all}
```

### Coins & wallet

<Feature id="coins" />

Stories that need money use the built-in coin wallet. It has three tiers — `gold`, `silver`, `bronze` — with the fixed base ratio **1 gold = 10 silver = 100 bronze**. The internal tier names never change (so save files stay portable), but authors can rename the labels shown to the reader and adjust the conversion ratios:

```rea
{coins gold="Dukát" silver="Groš" bronze="Halier"}
{coins silver_per_gold=5 bronze_per_silver=4}

{earn gold 2}
{earn silver 5}
{spend bronze 3}

{if story.reader.coins.total >= 100 begin}
  You can afford the enchanted blade.
{end if}
```

`{spend}` automatically breaks higher denominations when the reader lacks the exact tier, and refuses (changing nothing) when the wallet cannot cover the cost. The balance is mirrored into reader-facing variables and persisted across saves:

| Variable             | Contents                                           |
| -------------------- | -------------------------------------------------- |
| `story.reader.coins`       | Normalized `{gold, silver, bronze, total}` balance |
| `story.reader.coins.total` | Total value in bronze base units                   |
| `story.reader.coinNames`   | Author display labels `{gold, silver, bronze}`     |

### Action cards `[&]`

<Feature id="action-cards" />

Action cards represent story branching points with visual emphasis:

```rea
[&open_the_gate] Open the ancient gate
[&climb_the_wall] Scale the wall instead
```

> **Note:** Action cards use `&` (ampersand) to distinguish from custom anchors, which use `[#name]`.

Like character and item cards, an action can carry a `{define action}` block with a name and description:

```rea
{define action open_the_gate name="The Ancient Gate", description="Push open the rusted gate; force the old gate; shove past the entrance"}
```

`description=` is shown on the card and doubles as the semantic target for [free-text action input](#free-text-action-input) — what a reader can type to name the action.

#### Real-world activation

<Feature id="real-world-activation" />

An action card can also wake from a real-world input instead of — or alongside — a tap. Three optional fields sit next to `description=`:

```rea
{define action qr_door name="The service door", scan="^REAST-DOOR-.*"}

{define action painted_tree name="The painted tree", mark="emb1:Zk3q…                      // signature computed by the editor from the drawing"}

{define action couch_secret name="Under the couch", description="look under the couch; lift the sofa; search beneath the seat", listen="under the couch"}
```

| Field     | Matches against                | Comparison                          |
| --------- | ------------------------------- | ------------------------------------ |
| `scan=`   | A scanned QR/barcode payload    | Case-insensitive regular expression |
| `listen=` | A speech transcript             | Case-insensitive regular expression |
| `mark=`   | A photographed hand-drawn mark  | Exact signature match                |

A card can combine any number of these fields — `couch_secret` above answers to both a typed description and a spoken phrase.

> **`mark=` is opaque.** Its value is a signature the editor's "Draw a mark" tool computes from a drawing or photo — never write or edit it by hand. To create or change a mark, redraw it in the editor; see [Real-world exploration menus](/platform/design/real-world-exploration-menus) for the authoring workflow.

These fields shine when the option playing the card is `hidden` — see [Exploration menus](#exploration-menus) in Choices & Branching. A visible option with activation fields answers to both: the reader can tap its button or produce the matching real-world input.

### Card sets & categories

<Feature id="card-sets" />

`character`, `item` and `action` are the three **built-in card sets**. Authors can declare additional sets to group cards that share the same acquisition, loss and usage rules — for example an `ability` set, an `attribute` set, or a themed `relic` set. A set is declared with a `{define cardset <id> begin}` block:

```rea
{define cardset ability name="Ability Cards", description="Stat-granting cards a hero can equip.", acquire="Earned by completing quests.", lose="Lost when the character is defeated.", use="Play to apply the listed attribute bonus."}
```

A set may carry the human-readable rule fields `acquire`, `lose` and `use`, plus any additional `key: value` properties. The set `id` becomes the **kind** of every card that belongs to it.

A card joins a set by using the set id where `character`/`item`/`action` would otherwise appear:

```rea
{define ability spinach name=Spinach, strength=+2}
```

#### Event handlers

What a card *does* is written as a top-level `{on <event> <subject> begin} ... {end on}` handler. The subject is one attribute — `card=`, `item=`, `deck=` or `set=` — so a rule for one card, a whole deck or a whole set is written the same way, and a handler can be read without knowing which block it fell inside. The events a card, deck or set understands are `acquire`, `lose`, `use` and `missed`.

A handler on a set runs for **every** card of that set:

```rea
{define cardset ability name="Ability Cards"}

{on acquire set="ability" begin}
  {set story.ability_count = story.ability_count + 1}
{end on}

{on use set="ability" begin}
  {set story.last_ability_used = event.card_id}
{end on}
```

A card adds its own rule beside its set's, rather than replacing it:

```rea
{define ability ginko name=Ginko, intelligence=+2}

{on use card="ginko" begin}
  {set story.player.intelligence = story.player.intelligence + 2}
{end on}
```

A handler may carry a `when` clause, which runs to `begin}` so the condition keeps its own commas and quotes:

```rea
{on lose set="ability" when story.act >= 3 begin}
  The knowledge slips away for good.
{end on}
```

> **Resolution order:** every matching handler runs, least specific first — the set's, then the deck's, then the card's own. An override is written as a `when` guard rather than as a redefinition.

#### Playing a card

<Feature id="play-card" />

`{play <card_id>}` triggers a card's usage. It runs every `{on use}` handler that matches the card — its set's, then its own — so an attribute card applies its attribute and an action card runs its effect through the same command:

```rea
{play ginko}        Runs the ability set's handler, then ginko's own
{play spinach}      Runs the ability set's handler alone
```

**`play=` decides whether a card can be played again.** A card, its deck and its set may each declare one of three lifecycles, and the card's own wins, then its deck's, then its set's:

| Value       | What happens after a play                                                        |
| ----------- | ---------------------------------------------------------------------------------- |
| `reusable`  | The card goes back and may be played any number of times (the default)            |
| `exhausted` | The card is set aside until something restores it — a new turn, a new scene       |
| `consumed`  | The card is gone for this reading                                                 |

Replaying a consumed or exhausted card is a silent no-op, and the `card-played` event carries the disposition so a host can show a card as spent. `consumed` means gone *for this reading*, never gone forever: a story that hides content behind an unrepeatable draw is the pattern readers hate most, so the collection view shows what exists beside what this reader has met.

Card ids follow the same [identifier rules](05-reference#identifier-rules) as any other simple identifier — any Unicode character except space and dot, with at least one non-digit character. Playing an unknown card is a no-op. Each successful play emits a `card-played` runtime event carrying the card id and its set kind, which hosts can observe to update the UI.

#### Redefining built-in sets

The three built-in sets may be redefined to attach shared rules without changing how their cards are written. Redefining `action` to add a usage cost applies to every `[&]` action card:

```rea
{define cardset action name="Combat Actions", use="Spend an action point to play."}

{on use set="action" begin}
  {set story.actions_played = story.actions_played + 1}
{end on}
```

When an author redefinition and the implicit built-in collide, the author's declaration wins.

### Card property values

A card property is one of two things, and **quoting decides which**. An unquoted value that is a complete Rea literal — a number, a boolean, an `@(lat, lng)` point, an array — is a [typed property](#typed-card-properties): a real value the story can compare and compute with. Everything else is **verbatim text**, stored exactly as written, with one transformation: a `{variable}` placeholder is substituted with that variable's current value each time the card is queried, which is what lets a card show a live stat or an unlocked art tier.

```rea
{define character elena name="Elena Voss", level="{story.elena.level}", home="@(48.14, 17.10)"}
```

`level` is the *text* produced by substituting the variable, not a number. `home` is quoted, so it is the text `@(48.14, 17.10)` and not a point — it resembles a coordinate literal without being one. Drop the quotes and it becomes one.

### Typed card properties

<Feature id="typed-card-properties" />

A card is the story's single source of truth for a narrative entity, and a typed property is how the story reads that truth back. `weight=3` on an item is the number `3`, not the text `3`, so it goes into a comparison or a sum without being duplicated into a variable first — and a duplicated value is one that drifts, because the card and the logic disagree the moment one of them is edited.

**Quoting decides, and the two readings never overlap.**

| Written                       | Result                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------- |
| `weight=3`                    | number `3` — typed                                                            |
| `weight=-1.5`                 | number `-1.5` — typed                                                         |
| `lit=false`                   | boolean `false` — typed                                                       |
| `home=@(48.14, 17.10)`        | point — typed                                                                 |
| `sizes=[1, 2, 3]`             | array of numbers — typed                                                      |
| `traits=[brave, literate]`    | list of strings — `traits`/`tags` are list-parsed by the language itself       |
| `weight="3"`                  | text `3` — display only                                                       |
| `level="{story.elena.level}"` | text, substituted on every read                                               |
| `rarity=rare`                 | text `rare` — a bare word is an identifier, not a literal                     |
| `home="@(48.14, 17.10)"`      | text that resembles a coordinate                                              |

A `{variable}` placeholder is not a literal, so a value carrying one can never be typed and a typed value can never carry one. There is no value where both readings apply and therefore no precedence rule to learn. Quoting a number is also how an author keeps a display string like `"007"` or `"3+"`.

**A typed property is read as `story.card.<id>.<prop>`**, the way a deck's counters are read as `story.deck.<id>.remaining`:

```rea
{define item lantern name="Brass Lantern", weight=3, lit=false}
{define character elena name="Elena Voss", home=@(48.14, 17.10), traits=[brave, literate]}

{if story.card.lantern.weight > 2 begin} It drags at your belt. {end if}
{set story.load = story.load + story.card.lantern.weight}
{if distance(story.reader.position, story.card.elena.home) < 500 begin} She is close. {end if}
{if "brave" in story.card.elena.traits begin} She goes first. {end if}
```

Three rules govern the path:

- **Read-only.** `{set story.card.…}` is refused and reported. The definition is the source of truth; a writable mirror would re-open the drift the feature closes.
- **Typed properties only.** A text property has no path: `story.card.elena.name` does not exist. A card's display text is display text, and mirroring it would make every card's prose reachable as a variable and every rename a broken expression.
- **The name is checked against the card, not against a pattern.** An unknown card id and a card with no such typed property are each reported, so `story.card.lantern.wieght` is caught rather than quietly resolving to nothing.

A card defined further down the file still resolves: properties are mirrored when the card is registered, which is a document-order pass that runs before play.

**A typed value is a literal, not an expression.** It is fixed at definition time: `weight={story.base_weight}` is text, and `weight=story.base_weight` is text too, because a bare identifier is not a literal. A card that must show a live number keeps the `{variable}` text form or a `{face begin}` block, which resolves inline on every read. A bare flag (`mandatory`) is boolean `true`, as it always was. A value that is shaped like a literal but cannot be built — a latitude outside its range — stays text.

The language's own fields are never typed: `name`, `title`, `image`, `description`, `scan`, `mark`, `listen`, `play`, `deck`, `role`, `require`, `trigger` and `match` have their own parsing, so `name=3` is the string `3`. `traits` and `tags` reach `story.card.<id>.traits` (or `.tags`) from the list the language already parses, under the name the author wrote.

### Dialogue attribution

<Feature id="dialogue" />

Use `@character_id:` at the start of a line to attribute dialogue. This links speech to a character card and enables automatic voice assignment:

```rea
@elena: "The map leads to the northern tower. We must hurry."
@gareth: "Are you sure about this? The guards patrol that area."
@elena: "Trust me. I know a way through the gardens."
```

The platform uses the character's defined voice settings (from `{define character}`) to render TTS automatically. When no voice is defined, the platform assigns a distinct voice based on the character's properties.

Dialogue attribution also works with inline narration:

```rea
@elena: "Follow me," she whispered, slipping into the shadows.
@gareth: He hesitated. "I have a bad feeling about this."
```

Anonymous or unnamed speakers use a description:

```rea
@stranger: "You shouldn't be here."
@crowd: "Long live the king!"
```

---

## 18. Voice & Audio

### Text-to-Speech

<Feature id="voice-output" />

The `{voice}` command controls TTS rendering:

```rea
{voice speaker="narrator", speed=5, pitch=5 begin}
  In the beginning, there was nothing but silence.
{end voice}

{voice speaker="elena", emotion="whisper", speed=3 begin}
  Can you hear it? The walls are listening.
{end voice}
```

**Voice attributes:**

| Attribute     | Range/Values | Default      | Description                                                                                    |
| ------------- | ------------ | ------------ | ---------------------------------------------------------------------------------------------- |
| `description` | string       | —            | Free-text description of the desired voice (e.g., `"A deep, melancholic male voice"`)          |
| `speaker`     | string       | `"narrator"` | Voice identity or character description                                                        |
| `speed`       | 1-9          | 5            | Speech rate                                                                                    |
| `volume`      | 1-9          | 5            | Loudness                                                                                       |
| `pitch`       | 1-9          | 5            | Voice pitch                                                                                    |
| `emotion`     | string       | (neutral)    | Emotional tone (in the text's language): `whisper`, `shout`, `sad`, `excited`, `angry`, `calm` |
| `tone`        | string       | —            | Overall speech tone: `formal`, `informal`, `friendly`, `authoritative`, `narrative`            |
| `pause`       | 1-9          | —            | Pause before speaking (1 = shortest, 9 = longest)                                              |

Reset to defaults by calling `{voice}` without attributes.

### Audio playback

<Feature id="audio-playback" />

```rea
{audio src="media/thunder.ogg", volume=0.8}
{audio src="media/ambient.ogg", loop, volume=0.3, name=ambient_music}
{stop ambient_music}
```

---

## 19. Input & Interaction

### Text input

<Feature id="text-input" />

```rea
{input name=story.player.name, placeholder="Enter your name"}
Hello, {story.player.name}!
```

**Input behavior:** Execution pauses at `{input}` until the reader submits a value. The value is stored in the variable specified by `name`. If the reader submits an empty value, the variable is set to an empty string `""`.

### Numeric input

```rea
{input name=story.answer.guess, type="number", min=1, max=100, placeholder="Guess a number"}
```

Numeric input validates against `min`/`max` constraints. Out-of-range values are clamped to the nearest bound. Non-numeric input defaults to `0`.

### Free-text action input

<Feature id="action-input" />

`{input type="action"}` turns a scene from a menu into a place: the reader types what they want to do in their own words, and the story activates the choice that best describes it — even when the wording differs from anything on screen:

```rea
The room is small and dusty. An old couch sags in the corner.

{input type="action", placeholder="What do you do?"}

* [Open the window]
  Fresh air streams in.
* hidden [&look_under_sofa] Jozef bent down and looked under the old sofa, where he found a mysterious envelope marked _Secret!_

{define action look_under_sofa name="Look under the sofa", description="lift or look under the old couch in the corner; check beneath the sofa; search under the seat"}
```

Unlike a plain text input, the submission is not stored in a variable — it is matched against the eligible options of the pending choice group, visible and [hidden](#hidden-choices) alike, with conditions already applied and consumed one-time options excluded. For options bound to an action card, the card's `description=` is the semantic target — write it as a compact list of intents, synonyms welcome, in the language of the story; the card's `name=` and the option label are considered as well.

A match activates the option through the exact same path as a tap — narration, effects, undo, saves and analytics behave identically. A submission that matches nothing shows a gentle non-match message in the field and the group stays open, so guessing is always safe.

Matching runs entirely on the reader's device: the reader app provides a small multilingual embedding model, and a built-in word-overlap matcher answers when no model is available (or while it is still loading), so free-text input always works — offline, private, no per-interaction cost. Because the model is multilingual, the reader's wording can even drift from the author's description language within reason.

The typed sentence itself never leaves the device and is not stored in story state; only the resulting choice is recorded. That binds the author channel too: a submission that matches nothing raises `env/no-match`, and the record carries **no arguments at all** — not the sentence, not its length, not what it was compared against. A diagnostic is data that leaves the device the moment an author runs `reast validate` in CI, so it is held to the same rule as story state. See [Error Handling](error-handling.md).

### Buttons

<Feature id="buttons" />

```rea
{button label="Continue the journey", target=next_chapter}
{button label="Open inventory", action=show_inventory}
```

Buttons with `target` navigate to anchors (equivalent to `-> anchor`). Buttons with `action` trigger named events that `{on action_name begin}` blocks can handle.

### Timer

<Feature id="timer" />

```rea
{timer duration=30, on_expire="-> times_up" begin}
  You have 30 seconds to decide!
  * [Cut the red wire]
    -> red_wire
  * [Cut the blue wire]
    -> blue_wire
{end timer}
```

**Timer behavior:** When a timer expires, the `on_expire` divert fires immediately — even if the reader is mid-choice. Pending choices are canceled and the story continues at the divert target. If no `on_expire` is set, the timer block simply ends and reading continues after `{end timer}`. Timers pause when the app is backgrounded and resume when foregrounded. Nested timers are not allowed — a new `{timer}` inside an active timer replaces the outer one.

### Verb-target interaction

<Feature id="verb-target" />

Inspired by Texture's word-on-word mechanic, verb-target interaction lets readers drag action words onto highlighted targets in the text. This creates a tactile, discovery-driven experience:

```rea
{verbs begin}
  examine: "Look closely at"
  use: "Use"
  talk: "Talk to"
{end verbs}

You see a {target chest begin}wooden chest{end target} and
{target old_man begin}an old man{end target} sitting nearby.

{on use chest begin}
  You open the chest and find a silver dagger inside.
  {give silver_dagger}
{end on}

{on examine chest begin}
  The chest is old oak, bound with iron bands. A faint glow seeps from within.
{end on}

{on talk old_man begin}
  "Ah, an adventurer! That chest has been waiting for someone brave."
{end on}

{on examine old_man begin}
  His eyes are sharp despite his age. A map peeks from his coat pocket.
{end on}
```

**How it works:** Available verbs float as draggable elements. The reader drags a verb onto a highlighted target word. The matching `{on verb target begin}` block fires. Unmatched combinations show a default response:

```rea
{on default begin}
  That doesn't seem to work.
{end on}
```

Verbs can be conditional and context-sensitive:

```rea
{verbs begin}
  unlock: "Unlock" {if story.quest.has_key}
  pick: "Pick the lock" {if story.player.dexterity > 5}
{end verbs}
```

---

## 20. Cooperative Reading

Rea natively supports **multi-reader experiences** where multiple people read the same story simultaneously.

### Reader roles

<Feature id="roles" />

```rea
{define role captain name="The Captain", description="Leader of the expedition. Makes final decisions.", max=1}

{define role crew name="Crew Member", description="Follows orders. Has unique skills.", max=4}
```

### Role-specific content

```rea
{if context.group.role = "captain" begin}
  Only you can see the secret map. What do you tell your crew?
{else}
  The captain is studying something. You wait for orders.
{end if}
```

### Synchronized choices

<Feature id="vote" />

```rea
{vote timeout=60 begin}
  The crew must decide together:
  * [Go north through the mountains]
  * [Go south along the coast]
  * [Stay and make camp]
{end vote}

The majority chose: {vote.result}
```

### Reader-to-reader communication

<Feature id="whisper-broadcast" />

```rea
{whisper to="captain" begin}
  Only the captain sees this: the treasure is hidden under the third stone.
{end whisper}

{broadcast begin}
  Everyone sees this: a storm is approaching!
{end broadcast}
```

### Waiting for readers

<Feature id="wait" />

```rea
{wait readers=all begin}
  Waiting for all readers to reach this point...
{end wait}
```

### Shared state

<Feature id="shared-state" />

Readers share a common state namespace. Any reader can modify shared variables, and changes propagate to other readers:

```rea
{set shared.torch_lit = true}
{set shared.door_opened_by = context.reader.name}

{if shared.torch_lit begin}
  The torch illuminates the passage for everyone.
  (Lit by {shared.door_opened_by})
{end if}
```

### State synchronization

<Feature id="synchronize" />

By default, shared variable changes propagate automatically in real-time. The `{synchronize}` command gives authors explicit control over when state is sent and received:

```rea
{synchronize out}
```

Pushes the current reader's shared state to the server — other readers receive the update.

```rea
{synchronize in}
```

Pulls the latest shared state from the server into the current reader's view.

**Automatic sync mode** can be toggled on or off. When enabled, the platform synchronizes at regular intervals without explicit `{synchronize}` calls:

```rea
{synchronize auto="on", interval=5}
```

This enables automatic sync every 5 seconds. To switch back to manual control:

```rea
{synchronize auto="off"}
```

After `auto=off`, changes only propagate when `{synchronize out}` or `{synchronize in}` is called explicitly.

| Attribute  | Description                                      | Default          |
| ---------- | ------------------------------------------------ | ---------------- |
| `out`      | Push local shared state to server                | —                |
| `in`       | Pull latest shared state from server             | —                |
| `auto`     | Enable/disable periodic sync (`on`/`off`)        | `on`             |
| `interval` | Seconds between automatic syncs (when `auto=on`) | platform-defined |

**Usage patterns:**

- **Turn-based games**: `auto=off`, explicit `{synchronize out}` after each player's turn
- **Real-time collaboration**: `auto=on` with short interval (default behavior)
- **Critical sections**: `{synchronize out}` after `{exclusive}` blocks to ensure immediate propagation

### Conflict resolution

<Feature id="conflict-resolution" />

When multiple readers attempt conflicting actions simultaneously, the platform resolves conflicts:

```rea
{exclusive action="open_chest" begin}
  {comment Only one reader can open the chest}
  You reach the chest first and pry it open.
  {set shared.chest_opened = true}
{end exclusive}

{race timeout=10 begin}
  {comment First reader to complete wins}
  * [Grab the gem]
    You snatch the gem before anyone else!
    {give ruby}
{end race}
```

### Live presence

<Feature id="presence" />

Readers can see each other's reading position and reactions in real-time:

```rea
{presence show="cursor" begin}
  {comment Show where each reader is in the text}
{end presence}

{react options=["😮", "😂", "😢", "❤️"] begin}
  {comment Floating emoji reactions visible to all readers}
{end react}
```

### Reader events

```rea
{on reader_join begin}
  {broadcast begin}A new adventurer has joined the party!{end broadcast}
{end on}

{on reader_leave begin}
  {broadcast begin}{event.reader_name} has left the party.{end broadcast}
{end on}

{on reader_idle, timeout=120 begin}
  {whisper to=event.reader begin}Are you still there?{end whisper}
{end on}
```

### Edge cases and platform behavior

#### Disconnection

When a reader disconnects (network loss, app close, crash):

- **During `{wait}`**: the platform adjusts the required reader count. If `readers=all`, disconnected readers are excluded after a grace period (default: 30 seconds). Remaining readers proceed.
- **During `{vote}`**: the disconnected reader's vote is excluded from the tally. If they had already voted, their vote stands.
- **During `{race}`**: the disconnected reader is disqualified. If no readers remain, the race ends with no winner and the platform executes the `{else}` branch (if any) or skips the block.
- **During `{exclusive}`**: if the disconnected reader held the exclusive lock, the lock is released after the grace period, allowing another reader to claim it.
- **General**: the platform fires `{on reader_leave begin}` and preserves the disconnected reader's local state. If they reconnect within the session window (configurable in metadata, default: 5 minutes), they resume from their last position with state intact.

#### Shared variable conflicts

When multiple readers modify a shared variable simultaneously:

- **Last-write-wins** is the default resolution strategy. The platform uses server timestamps to determine order.
- For numeric accumulation (e.g., `{set shared.gold = shared.gold + 10}`), the platform applies **atomic increment** — each reader's `+10` is applied independently, not based on a stale read.
- Authors can request explicit locking for critical sections:

```rea
{exclusive action="modify_treasury" begin}
  {set shared.gold = shared.gold + story.player.contribution}
{end exclusive}
```

#### Vote edge cases

- **Timeout with no votes**: the `{vote}` block evaluates to `undefined`. Authors should handle this:

```rea
{if vote.result = undefined begin}
  No decision was made. The captain decides.
{end if}
```

- **Tie**: the platform picks randomly among tied options. `vote.result` reflects the chosen option; `vote.tied` is `true`.
- **Single reader**: if only one reader is present, their choice wins immediately without waiting for timeout.

#### Race edge cases

- **Timeout with no completions**: `race.winner` is `undefined`. The block's content is skipped.
- **Simultaneous completion**: server timestamp determines the winner.

#### Role reassignment

Roles are **not automatically reassigned** when a reader disconnects. If the captain leaves, the story continues without a captain until:

- The author handles it via `{on reader_leave begin}` with explicit reassignment logic, or
- A new reader joins and claims the vacant role

Authors should always write defensive role checks:

```rea
{if readers_in_role("captain") = 0 begin}
  The crew is leaderless. Someone must step up.
{end if}
```

### Solo mode behavior

<Feature id="solo-degradation" />

Cooperative stories must be playable by a single reader without modification. The platform applies these degradation rules automatically:

| Command / Property                      | Multi-reader behavior                    | Solo degradation                                  |
| --------------------------------------- | ---------------------------------------- | ------------------------------------------------- |
| `{vote timeout=N begin}`                | All readers vote, majority wins          | Reader's choice wins **instantly** (no timeout)   |
| `{wait readers=all begin}...{end wait}` | Blocks until all readers reach the point | **Instant pass**                                  |
| `{wait EXPR begin}...{end wait}`        | Blocks until expression is true          | **Unchanged** — condition may be time/state-based |
| `{exclusive begin}`                     | Only one reader can claim the action     | **Always available** — reader claims instantly    |
| `{race timeout=N begin}`                | First reader to complete wins            | Reader **always wins instantly** (no timeout)     |
| `{whisper to=ROLE begin}`               | Only target role sees the text           | Shown as **normal text**                          |
| `{broadcast begin}`                     | All readers see the message              | Shown as **normal text**                          |
| `{presence show=... begin}`             | Shows other readers' positions           | **Hidden** (no-op)                                |
| `{react options=[...] begin}`           | Emoji reactions visible to all           | **Hidden** (no other readers to react)            |
| `{synchronize out/in}`                  | Push/pull shared state to/from server    | **No-op** — single reader, no server sync needed  |
| `{synchronize auto=on/off}`             | Toggle automatic periodic sync           | **No-op** — state is always local                 |
| `{on reader_join begin}`                | Fires when a reader joins                | **Never fires**                                   |
| `{on reader_leave begin}`               | Fires when a reader leaves               | **Never fires**                                   |
| `{on reader_idle begin}`                | Fires when a reader is idle              | **Can fire** — solo reader can be idle            |
| `context.group.size`                            | Number of connected readers              | Returns **1**                                     |
| `context.group.readers`                         | List of reader objects                   | Returns **[self]**                                |
| `context.group.role`                            | Current reader's role                    | Returns first defined role                        |
| `readers_in_role(R)`              | Count of readers in role R               | Returns **1** for all roles                       |

**Solo principles:**

1. **No waiting for absent readers** — timeouts and reader-count waits skip instantly
2. **No hidden content** — solo reader sees all role-gated content (plays all roles)
3. **No broken state** — `group.*` returns valid data (`size=1`, `readers=[self]`)
4. **Author override** — stories can opt into single-role mode via metadata

#### Role handling in solo mode

By default, the solo reader is assigned to **all roles simultaneously**. Role-gated blocks (`{if context.group.role = "captain" begin}`) evaluate to true, and when multiple role blocks exist for the same passage, all display with a visual role badge (e.g., `[Captain]`, `[Crew]`).

Authors who want single-role solo play (reader picks one role, replays for others) can opt in via the manifest:

```json
{ "solo_mode": "single_role" }
```

---

## 21. Real-World Interactions

Rea integrates with real-world sensors and APIs through the `context.*` namespace, making stories that respond to the reader's physical context. All sensor access requires reader permission and degrades gracefully — if a sensor is unavailable, the story continues without it.

### Capability requirements

<Feature id="capability-requirements" />

Declare which real-world features a story needs. The reader app checks availability before starting:

```rea
{require gps}
{require camera}
{require accelerometer}
{require nfc optional}
```

Adding `optional` means the feature enhances the story but isn't required. The `has()` function checks at runtime:

```rea
{if has("nfc") begin}
  Tap the NFC tag hidden under the bench.
{else}
  Type the code printed on the bench: {input type="text", name=part.bench_code}
{end if}
```

### Three verbs, one language

<Feature id="conditional-wait" />

Every gate in a story — an `{if}`, a choice's `condition`, a storylet's `when`, a state machine's `when` guard, a map pin's `visible:`, a waypoint's area — is written in **one** expression language and decided by **one** subsystem. What differs is not the condition, it is *when the engine looks at it*, and that is expressed by the block the author chooses rather than by a second syntax:

| Mode         | Written as                                                                        | Semantics                                                            | Escape required                                    |
| ------------ | --------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------- |
| **now**      | `{if}`, a choice's `condition`, a pin's `visible:`                                | evaluated at the moment the reader reaches it                        | no                                                 |
| **until**    | `{wait EXPR begin} … {end wait}`, `{waypoint}`                                    | the story pauses here and continues when the expression turns true   | yes, when the expression reads `context.*`         |
| **whenever** | `{on EVENT when GUARD}`, a storylet's `when`, `{zone}` `on enter` / `on exit` | edge-triggered, may fire repeatedly                                  | not applicable                                     |

The author picks a verb by asking one question — *does the story stop here?* — and writes the same expression language in all three. New capabilities therefore arrive as new `context.` subtrees and new functions, never as new grammar.

### Waiting for a condition

<Feature id="conditional-wait" />

`{wait EXPR begin} … {end wait}` pauses the story until `EXPR` becomes true. Its body is what the reader sees **while** waiting; once the gate opens the body is replaced and the story continues after `{end wait}`.

```rea
{wait escape=duration("PT3H"), escape_to="dry_night" when context.weather = "rain" and context.time.hour >= 20 begin}
  You take the bench under the arcade and watch the sky.
{end wait}

The first drops hit the pavement. Under the arcade, someone is already waiting.
```

| Attribute   | Description                                                                     |
| ----------- | ------------------------------------------------------------------------------- |
| `escape`    | Duration after which the wait gives up on its own (`escape=duration("PT3H")`)    |
| `escape_to` | Anchor the reader is sent to instead of waiting indefinitely                     |

A wait whose expression reads `context.*` — device, location or weather state outside the author's control — MUST declare `escape=` or `escape_to=`; an author who omits both gets `link/wait-no-escape` (a warning, not an error: a deliberate hard gate is a valid design). This is the same rule `{waypoint}` has always had, stated once for every waiting condition.

Three things follow from the semantics, and authors need all three:

- **A condition can be `unknown`.** When a source it reads is denied, unavailable or stale, the expression is neither true nor false. A wait treats `unknown` as *keep waiting* and lets the escape decide — a denied sensor must never silently answer "no" and close a gate the reader was never told about. An `{if}` treats it as false, which is why `link/context-no-fallback` asks for an `{else}`.
- **Deadlines are absolute, and a missed window still counts.** A story is closed on a bench and reopened three hours later; `escape=duration("PT3H")` has expired by then, whether or not the app was running. More than that, a wait that *became* true while the story was shut is noticed on the way back in: `{wait context.time.hour = 22}` fires for a reader who was away from nine until half past eleven, because the engine replays the hours it slept through rather than only asking about the moment it woke. That works for anything derived from the clock; nothing recorded yesterday's weather, so a poll source is decided at the moment you return.
- **A wait moves the story when you next open it, not before.** No wait runs while the app is closed — the web platform has no background geolocation and no reliable scheduled local notification — so a story is never *ahead* of the reader, only ever caught up with the instant they return. Nothing about a wait is sent anywhere: it is decided on the device, from the device's clock. The reader is therefore not tapped on the shoulder, and `escape=` is what protects a story from one who never comes back at all.

Three functions exist for the conditions a wait is usually written with:

```rea
{wait between(context.time, "22:00", "06:00") begin}    {comment after ten in the evening, including past midnight}
{wait elapsed(story.started) >= duration("PT30M") begin} {comment half an hour of reading later}
{wait within(context.location, "old_bridge") begin}      {comment inside a named waypoint's own area}
```

A bare `{wait begin} … {end wait}` with no expression is unchanged: it is a pause beat, not a gate.

### Context sources

<Feature id="context-sources" />

Each `context.` subtree is a **source**, and sources are not uniform in cost: GPS is a stream that drains a battery, weather is a rate-limited network call, wall-clock time is free and exactly predictable. The engine works out from a condition's expression which sources it needs — a story never declares this, and the consent screen is computed from it rather than from the manifest.

| Source                                                  | Kind      | Cadence                                                                                   |
| ------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------- |
| `context.time.*`                                        | derived   | never polled — the engine wakes exactly once, at the next second, minute, hour or midnight the condition can notice |
| `context.location`, `context.heading`, `context.speed`  | push      | delivered by the device while some condition is waiting on it                              |
| `context.weather`, `.temperature`, `.wind`, `.humidity` | poll      | one shared request per interval, however many conditions read it                           |
| `context.ext.<ns>.*`                                    | host      | whatever the host extension that registered it provides                                    |
| `{scan}`, `{listen}`, `{capture}`, NFC                  | manual    | reader-initiated only                                                                      |

A source starts when the first condition that watches it begins waiting and stops when the last one leaves, so a story asks for a permission exactly when it needs it and never holds a sensor open across a chapter that does not use one.

The **manual** row is a rule, not an omission: a condition may *read* a variable that `{scan}` or `{listen}` produced, but the engine will never start a camera or a microphone because an expression mentioned one. A passive wait on an action the reader was never asked to perform is an invisible gate.

A condition reading a `context.` subtree no platform provides gets `link/unknown-context-source` at link time — it could never become true.

### Location

<Feature id="location" />

A position is written with the [`@(lat, lng)` point literal](02-logic-data.md#coordinate-literals), and `matches` asks whether it is inside an area:

```rea
{if context.location matches circle(@(48.14, 17.10), 500) begin}
  You feel a strange resonance. This is the place from the story!
{end if}
```

**Location properties:**

| Property             | Type  | Description                        |
| -------------------- | ----- | ---------------------------------- |
| `context.location`     | point | Current (lat, lng) position        |
| `context.location.lat` | float | Latitude                           |
| `context.location.lng` | float | Longitude                          |
| `context.location.alt` | float | Altitude in meters (if available)  |
| `context.location.acc` | float | Accuracy in meters                 |
| `context.heading`      | float | Compass heading in degrees (0-360) |
| `context.speed`        | float | Movement speed in m/s              |

### Waypoints

<Feature id="waypoints" />

Inspired by geocaching, waypoints define named locations that the reader must visit. A waypoint is a [`{wait}`](#waiting-for-a-condition) plus a place on the map — `{waypoint name, AREA, require=EXPR}` is `{wait context.location matches AREA and EXPR}` with map metadata — so `hint=` is its waiting text, its body is arrival content, and the same scheduler and the same escape rule decide both:

```rea
{waypoint old_bridge, circle(@(48.1432, 17.1056), 50) begin}
  The old bridge creaks beneath your feet. Under the third plank,
  you find a leather pouch with a strange symbol.
  {set story.symbol_found = true}
{end waypoint}

{waypoint castle_ruins, circle(@(48.1510, 17.1120), 100), require=story.symbol_found begin}
  The symbol glows as you approach the ruins.
  A hidden passage reveals itself in the eastern wall.
{end waypoint}
```

Waypoints have optional attributes:

| Attribute   | Description                                    |
| ----------- | ---------------------------------------------- |
| `require`   | Condition that must be true to activate        |
| `hint`      | Text shown to help reader find the location    |
| `proximity` | Distance in km at which hint becomes visible   |
| `icon`      | Map marker icon                                |
| `hidden`    | Waypoint invisible on map until require is met |
| `escape`    | Timeout duration (e.g. `duration("PT30M")`) after which the waypoint is skipped |
| `escape_to` | Fallback anchor the reader is sent to instead of waiting indefinitely |

Every attribute is written after the area, in any order. `require=`, `proximity=` and `escape=` take an expression; `hint=`, `icon=` and `escape_to=` take a quoted string; `hidden` is a bare flag, like a route's `sequential`:

```rea
{waypoint hidden_cave, circle(@(48.1490, 17.1099), 40), hint="Follow the stream past the fallen oak", proximity=1.5, icon="cave", hidden begin}
  The stream disappears into the rock. So does the path.
{end waypoint}
```

A waypoint whose passage condition depends on `context.*` (device, location, or time state outside the author's control) MUST declare `escape=` or `escape_to=` — an author who omits both gets `link/waypoint-no-escape` (warning, not error: a deliberate hard physical gate with no digital bypass is a valid design choice). A [`{route}`](#multi-stage-routes)'s constituent waypoints need the same when they depend on `context.*`.

```rea
{waypoint museum_door, circle(@(48.1486, 17.1077), 30), require=context.device.gps, escape=duration("PT2H") begin}
  The door gives. Inside, the exhibition is exactly as the letter described.
{end waypoint}
```

The condition this asks about is the one the *author* wrote. Every waypoint is compared against the reader's position by the runtime, so that comparison alone is not what triggers the warning — `require=context.…`, or an area built from a live read such as `circle(context.location, 50)`, is. `escape_to=` names an anchor like a divert does: one that no `[#anchor]` or `{label}` defines is reported as `link/undefined-anchor`, and defining one that only an `escape_to=` reaches does not make it unused.

### Map images & pins

<Feature id="maps" />

A story set in a real place can show its own map instead of a generic one: an author-supplied image anchored to real-world GPS bounds, with pins placed at coordinates.

```rea
{map old_town bounds="@(48.152, 17.100), @(48.140, 17.120)" begin}
  image [!The old town < assets/old-town.webp]
  {pin bridge at="@(48.1432, 17.1056)" begin}
    label "The old bridge"
  {end pin}
  {pin reader at=context.location begin}
    label "You"
  {end pin}
{end map}
```

`bounds=` gives the north-west and south-east corners of the image as two point literals, and the engine projects each pin onto it equirectangularly. A pin's `at:` takes any point expression — a literal, or `context.location` for a pin that follows the reader — so a pin can move with the reading or appear only once a variable is set (`visible`).

Nothing in this block renders yet — the parser understands it, the projection maths is written, and the reader-side canvas is the remaining piece.

### Multi-stage routes

<Feature id="routes" />

Chain waypoints into sequential or non-sequential routes:

```rea
{route treasure_hunt, waypoints="old_bridge, castle_ruins, hidden_cave", complete="You've completed the treasure hunt!", sequential begin}
{end route}
```

A route names waypoints declared elsewhere; it does not contain them, so a waypoint stays one thing in one place and a route is the trail through them. Its `complete=` line renders where the `{route}` block itself stands, and only once every stage is done — so an author puts the block where the payoff belongs, usually after the trail. Until then the block shows nothing.

`sequential` records that the stages are meant to be visited in order. Because each `{waypoint}` stops the story where it stands, that order is already the reading order; the attribute is what tells a map, a progress indicator or a host UI that skipping ahead is not intended.

The reader's progress is readable as `story.<route>.done`, `.total` and `.complete`, and it is derived from the waypoints rather than tracked separately — a route holds no state a save could disagree with.

A stage naming a waypoint no part of the story declares is `link/unknown-route-waypoint`: the trail could never be finished.

### Geo-fencing zones

<Feature id="zones" />

A zone is the **whenever** form of a [`{wait}`](#waiting-for-a-condition) — the same expression language over the same area value, decided on every edge rather than once. It never stops the story: the reader walks past the block, and it speaks when they cross into or out of the area.

```rea
{zone dark_forest, area(@(48.14, 17.10), @(48.15, 17.10), @(48.15, 17.11))}

{on enter zone="dark_forest" begin}
  The trees close in around you. The forest feels alive.
  {set story.ui.ambient = "forest"}
{end on}

{on exit zone="dark_forest" begin}
  You emerge from the forest, blinking in the sunlight.
  {set story.ui.ambient = "default"}
{end on}
```

A zone renders the content of the edge the reader **last crossed**, at the block's own position: the enter content while they are inside, the exit content once they have left. One bounded answer rather than a log — a reader who walks back through the wood sees the trees close in again, not a growing transcript of every crossing. Before they cross either edge the block shows nothing.

The zone itself is a single unpaired command: it declares the area and marks the place the crossed edge renders. Each edge is a top-level `{on enter zone="..."}` or `{on exit zone="..."}` handler, the same flat form every other event in the language takes, so an edge can be read without its zone above it.

An edge's commands run at the moment it fires, exactly as a chosen option's consequences do, so a `{set}` inside `{on enter}` takes effect on entry rather than when its text renders. An edge may carry a guard like any other `whenever` — `{on enter zone="dark_forest" when story.has_key begin}` — and `story.<zone>.inside` is readable anywhere in the story, so a zone can gate content far from where it is declared without repeating its area.

Like every condition watching the reader's position, a zone starts the position source when the story reaches it and releases it when nothing needs it any more.

### Time of day

<Feature id="time-of-day" />

```rea
{if context.time.hour >= 22 or context.time.hour < 6 begin}
  The darkness around you feels real tonight.
{else}
  Daylight makes the story feel less frightening.
{end if}
```

**Time properties:**

| Property        | Type    | Description                |
| --------------- | ------- | -------------------------- |
| `context.time.hour`    | integer | Current hour (0-23)        |
| `context.time.minute`  | integer | Current minute (0-59)      |
| `context.time.weekday` | string  | Day name (lowercase)       |
| `context.time.date`    | string  | ISO date string            |
| `context.time.season`  | string  | Season based on hemisphere |

### Night mode

Combine time and light sensor for atmosphere:

```rea
{if context.time.hour >= 22 and context.light < 50 begin}
  {set story.ui.theme = "dark"}
  The chapter can only be read in darkness. Turn off the lights.
{end if}
```

### Weather

<Feature id="weather" />

```rea
{if context.weather = "rain" begin}
  How fitting — it's raining in the story and outside your window.
{end if}
```

**Weather properties:**

| Property            | Type   | Description                                       |
| ------------------- | ------ | ------------------------------------------------- |
| `context.weather`     | string | Current condition (clear, rain, snow, fog, storm) |
| `context.temperature` | float  | Temperature in Celsius                            |
| `context.wind`        | float  | Wind speed in m/s                                 |
| `context.humidity`    | float  | Humidity percentage (0-100)                       |

### QR and barcode scanning

<Feature id="scan" />

```rea
{scan type="qr", target="REAST-SECRET-42" begin}
  Scan the QR code hidden in the real world to unlock this chapter.
{end scan}
```

Supported scan types:

| Type         | Description                          |
| ------------ | ------------------------------------ |
| `qr`         | QR code (most common)                |
| `barcode`    | Any supported barcode (EAN, UPC etc) |
| `aztec`      | Aztec code (boarding passes)         |
| `datamatrix` | Data Matrix code                     |

The `target` attribute matches the scanned value. Use `pattern` for regex matching:

```rea
{scan type="qr", pattern="^REAST-.*" begin}
  You found one of the hidden codes! {set story.codes_found = story.codes_found + 1}
{end scan}
```

A `{scan}` block is *blocking* — the story stops at that point and waits for the code. For codes the reader may encounter anywhere along the way, use [triggered storylets](/spec/storylets#triggered-storylets) (`trigger: scan`) or an [exploration menu](#exploration-menus) option with a `scan=` card field instead: those are opt-in interruptions that fire whenever the input arrives.

### NFC tags

<Feature id="nfc" />

```rea
{nfc target="reast:chapter5" begin}
  Tap your device on the NFC tag to reveal the hidden message.
{end nfc}

{nfc read, name=part.tag_data begin}
  The tag contains: {part.tag_data}
{end nfc}
```

### Camera and photo

<Feature id="camera" />

```rea
{capture type="photo", name=reader_photo begin}
  Take a photo of your surroundings to continue.
{end capture}
```

| Type     | Description                                    |
| -------- | ---------------------------------------------- |
| `photo`  | Single photo capture                           |
| `video`  | Short video recording (max duration attribute) |
| `selfie` | Front camera photo                             |

### Motion and orientation

<Feature id="motion" />

Access device sensors for physical interactions:

```rea
{on shake, intensity=2 begin}
  You shake the magic 8-ball. The answer appears: {~Yes|No|Maybe|Ask again}
{end on}

{on tilt, direction="north", threshold=15 begin}
  The compass needle swings north. The hidden door opens.
{end on}
```

**Motion properties:**

| Property               | Type  | Description                         |
| ---------------------- | ----- | ----------------------------------- |
| `context.tilt.x`         | float | Forward/backward tilt (-180 to 180) |
| `context.tilt.y`         | float | Left/right tilt (-90 to 90)         |
| `context.orientation`    | float | Device rotation (0-360, compass)    |
| `context.acceleration.x` | float | Acceleration along X axis           |
| `context.acceleration.y` | float | Acceleration along Y axis           |
| `context.acceleration.z` | float | Acceleration along Z axis           |

### Light level

<Feature id="light" />

```rea
{if context.light < 10 begin}
  In complete darkness, the phosphorescent text begins to glow.
{end if}

{if context.light > 500 begin}
  The bright sunlight reveals invisible ink on the page.
{end if}
```

`context.light` returns ambient light in lux (0 = darkness, 500+ = bright daylight).

### Vibration and haptics

<Feature id="vibration" />

```rea
{vibrate 200}
{vibrate pattern=[100, 50, 100, 50, 300]}
```

Pattern: array of alternating vibrate/pause durations in milliseconds.

### Proximity

<Feature id="proximity" />

```rea
{on proximity "near" begin}
  You hold the device close to the object. A secret message appears.
{end on}
```

### Voice input

<Feature id="listen" />

```rea
{listen language="en", name=story.spoken_word begin}
  Speak the magic word to open the door.
{end listen}

{if story.spoken_word = "abracadabra" begin}
  The door slowly creaks open.
{end if}
```

Like `{scan}`, a `{listen}` block stops and waits at one point. For phrases the reader can say at any moment, use [triggered storylets](/spec/storylets#triggered-storylets) (`trigger: listen`) or an exploration-menu option with a `listen=` card field.

### Priority: exploration menus vs. storylet triggers

A scan, spoken phrase, or photographed mark is a single physical event — it cannot mean two things at once. If the reader has a pending [exploration menu](#exploration-menus) open when they produce that input, the engine checks the menu's `scan=`/`mark=`/`listen=` options first. Only when nothing in the menu matches does the same input fall through to wake a storylet trigger.

See [Storylets & Decks](/spec/storylets) for storylet selection, triggers, and priority/weight.

### Dice and randomization

<Feature id="dice" />

Inspired by tabletop RPG conventions, Rea supports dice notation for game-like interactions:

```rea
{set story.combat.roll = dice("2d6+3")}
You rolled {story.combat.roll}!

{if story.combat.roll >= 10 begin}
  Critical success! The dragon flees.
{else if story.combat.roll >= 7}
  You wound the dragon.
{else}
  The dragon swipes you aside.
{end if}
```

**Dice notation:**

| Notation | Description                               |
| -------- | ----------------------------------------- |
| `d6`     | Single six-sided die                      |
| `2d6`    | Two six-sided dice, summed                |
| `2d6+3`  | Two d6 plus modifier                      |
| `d20adv` | Roll with advantage (best of two d20)     |
| `d20dis` | Roll with disadvantage (worst of two d20) |
| `4d6kh3` | Roll 4d6, keep highest 3                  |
| `d100`   | Percentile die                            |

### Real-world challenges

<Feature id="challenges" />

Combine multiple sensors into challenge-style interactions inspired by geocaching and adventure games:

```rea
{challenge night_vigil timeout=30m, hint="Find the old chapel after midnight. Bring no light."
            when context.time.hour >= 23 and context.light < 20
                 and context.location matches circle(@(48.14, 17.10), 200) begin}
  You stand in darkness before the ancient chapel.
  The stars above spell out a message only visible at this hour.
  {set story.star_message = "VERITAS"}
{end challenge}
```

Challenge attributes:

| Attribute | Description                                      |
| --------- | ------------------------------------------------ |
| `when …`  | One or more conditions, joined with `and`        |
| `timeout` | Time limit (e.g. `30m`, `2h`)                    |
| `hint`    | Guidance shown when conditions are partially met |
| `retry`   | Allow retry after failure (default: true)        |
| `reward`  | Variable set on completion                       |

### Privacy & data handling

<Feature id="privacy-tiers" />

Rea stories can access GPS, camera, microphone, and motion sensors. The platform enforces strict privacy rules:

**Permission tiers:**

| Tier   | Sensors                                     | Behavior                                           |
| ------ | ------------------------------------------- | -------------------------------------------------- |
| None   | time, date, season                          | No permission needed — non-identifying             |
| Low    | weather, light, vibration                   | Single prompt, approximate data only               |
| Medium | GPS (approximate), accelerometer, gyroscope | Explicit permission, while-story-open only         |
| High   | GPS (precise), camera, microphone, NFC      | Per-use permission with preview of what's captured |

**Data handling rules:**

1. **Ephemeral by default.** Sensor values exist only during the current reading session. No persistent location history, no sensor logs
2. **No author access to raw data.** Authors receive boolean/event results (`context.location matches circle(...)` → `true`/`false`), not exact coordinates. Exception: `{capture}` gives photos for in-story display only
3. **No server transmission of precise location.** In cooperative mode, other readers see events ("Reader A reached waypoint_X"), never raw coordinates
4. **Session-only microphone.** `{listen}` transcribes locally. Audio is never stored or transmitted — only recognized text is available as a variable
5. **Weather via approximate geolocation.** Weather API calls use IP-based location, not GPS coordinates
6. **Diagnostics carry no reader data.** Every rule above binds the author channel as well as story state. A record may name a variable, quote what the author literally typed into the `.rea` file, and describe the *type* of a runtime value — never the value. There is no code path by which a `{listen}` transcript, a `{capture}` photo, `reader.*` or `context.location` becomes a diagnostic argument; the constructors that build one refuse a caller-supplied string outright. See [Error Handling](error-handling.md)

**Reader-facing guarantees:**

- Before story starts: sensor requirements shown (from metadata `sensors:` field)
- Each sensor request displays a purpose description (author-provided via `hint` attribute)
- Reader can deny any sensor — story degrades gracefully
- Reader can revoke permissions mid-story
- All captured media and session state are deletable by the reader

### Sensor availability

Not all devices support all sensors. The Reast reader app provides fallbacks:

| Sensor        | Browser support | Fallback                    |
| ------------- | --------------- | --------------------------- |
| GPS location  | All browsers    | Manual city/region input    |
| Camera/QR     | All browsers    | Manual text code input      |
| Accelerometer | Chrome, Edge    | Tap/swipe gestures          |
| Gyroscope     | Chrome, Edge    | Compass direction buttons   |
| Light sensor  | Limited         | Time-of-day estimation      |
| NFC           | Android Chrome  | QR code alternative         |
| Vibration     | Chrome, Firefox | Visual pulse effect         |
| Voice input   | Chrome          | Text input                  |
| Weather       | Via API         | Reader self-reports or skip |

---
