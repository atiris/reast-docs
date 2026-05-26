# Rea Language Specification — Part 3: Narrative & Interaction (Sections 16–21)

> [Back to main specification](/)
>
> **Implementation status:** Choices and branching (16) including nested, conditional, sticky, and fallback choices are fully implemented. Dialogue attribution (via `@speaker:`) works. First-visit content (`{once}`/`{then}`/`{end once}`) is implemented. Narrative utilities within Section 16 (`{cycle}`/`{replace}`), Cards (17), Voice & Audio (18), Input & Interaction (19), Cooperative Reading (20), and Real-World Interactions (21) are specified but not yet implemented. See [REA-CHEATSHEET.md](REA-CHEATSHEET.md) for detailed status.

---

## 16. Choices & Branching

Choices are the heart of interactive stories. Rea supports both simple and complex branching.

### Simple choices

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

Choices can have conditions:

```rea
* {has_key} [Unlock the door]
  The key fits perfectly. The door swings open.

* {gold >= 50} [Bribe the guard]
  The guard pockets your gold and steps aside.

* [Walk away]
  You turn and leave quietly.
```

### Diverts

Use `->` to jump to a named section (anchor):

```rea
-> the_clearing

[#the_clearing]
You arrive at a small clearing bathed in moonlight.
```

### Nested choices

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

A choice without text acts as a fallback (chosen automatically when no other options remain):

```rea
* [Ask about the weather]
  "Fine day, isn't it?"
* [Ask about the news]
  "Heard anything interesting?"
* ->
  The conversation fizzled out. -> leave_tavern
```

### Tunnels (divert and return)

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
{if dexterity > 5 begin}
  The pins click into place smoothly.
{else}
  It takes several attempts, but finally...
{end if}
->->
```

Tunnels are useful for reusable passages (e.g., recurring inspections, shared dialogue sequences) without manually routing back.

### First-visit content

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

Labels mark text that can be replaced in-place as the story progresses:

```rea
The door is {label door_state begin}locked{end label}.

{// Later, after unlocking}
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

Inline text that readers can tap to cycle through options, useful for character customization or exploratory narrative:

```rea
You chose the {cycle color begin}red|blue|green|black{end cycle} cloak.
```

The reader taps the highlighted word to cycle: `red` → `blue` → `green` → `black` → `red` → ...

The selected value is accessible as a variable: `{color}` returns the current selection.

### Varying text

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
    {set flag.visited_market = true}
    -> town_square
{end once}

{once name=visit_temple begin}
  * [Enter the temple]
    The temple is quiet and cool inside.
    {set flag.temple_blessing = true}
    -> town_square
{end once}

{if flag.visited_market and flag.temple_blessing begin}
  * [Head to the castle]
    With supplies and blessing, you're ready.
    -> castle_gates
{end if}
```

### Parallel storylines

Multiple storylines that advance independently and converge at key moments:

```rea
{parallel begin}
  {thread elena_thread begin}
    [#elena_journey]
    Elena travels west through the forest.
    {set elena.location = "forest"}
    {wait gareth_thread.reached("bridge") begin}{end wait}
    They meet at the bridge.
  {end thread}

  {thread gareth_thread begin}
    [#gareth_journey]
    Gareth takes the mountain path.
    {set gareth.location = "mountain"}
    [#bridge]
    He arrives at the old stone bridge.
  {end thread}
{end parallel}
```

In cooperative reading, different readers can follow different threads simultaneously, experiencing the story from different character perspectives.

### Storylets (quality-based narrative)

Storylets are modular content blocks with prerequisites and effects — the building blocks for non-linear, discovery-driven narratives. Instead of rigid branching, the platform selects eligible storylets and presents them as available options.

```rea
{storylet the_merchants_plea begin}
  require: gold > 20 and visited("market")
  priority: 5
  repeatable: false

  A merchant approaches you with a desperate look.
  "Please, I need someone to deliver this package to the northern tower."

  * [Accept the quest]
    {set quest.has_merchant_quest = true}
    {set player.gold = player.gold + 10}
    "Bless you! Here's an advance."
  * [Decline]
    The merchant's shoulders slump.
{end storylet}

{storylet the_hidden_path begin}
  require: quest.has_merchant_quest and world.hour >= 20
  priority: 10
  repeatable: false

  As night falls, you notice a faint glow among the trees.
  A path you've never seen before reveals itself.
  -> hidden_path_adventure
{end storylet}
```

**Storylet attributes:**

| Attribute    | Description                                               |
| ------------ | --------------------------------------------------------- |
| `require`    | Condition that must be true for this storylet to appear   |
| `priority`   | Higher priority storylets appear first (default: `0`)     |
| `repeatable` | `true` to allow replaying, `false` for one-time (default) |
| `cooldown`   | Minimum visits/time before reappearing                    |
| `weight`     | Relative probability when multiple storylets are eligible |
| `tags`       | Categorization for filtering (`tags: tavern, social`)     |

**Storylet deck** — present available storylets as a hand of cards the reader can choose from:

```rea
{deck from="tavern_stories", max=3, shuffle begin}
  Choose what catches your attention:
{end deck}
```

This presents up to 3 eligible storylets tagged `tavern_stories`, shuffled.

Storylets enable organic, non-linear narratives where the story adapts to the reader's state, encouraging exploration and replay.

### Undo & back navigation

The platform provides built-in back navigation, allowing readers to revisit previous passages. Authors can control this behavior:

```rea
{undo enabled=false}
```

By default, undo is **enabled** for solo reading and **disabled** for cooperative reading (shared state cannot be rewound). Authors can explicitly disable it for puzzle sections where undoing defeats the purpose:

```rea
{lock condition="has_key" begin}
  {undo enabled=false}
  The door slams shut behind you. There is no going back.
  {// Reader cannot undo past this point until the lock section ends}
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

The platform automatically saves reader progress at safe points (chapter boundaries, after choices). Authors can create explicit checkpoints for critical moments:

```rea
{checkpoint}
```

After a checkpoint, the reader can resume from this exact point if they close and reopen the story. The checkpoint captures all variable state (story-scoped and heading-scoped).

```rea
{checkpoint name="before_boss"}
You stand at the gates of the Dark Fortress.
```

Named checkpoints allow the reader to select a specific save point when resuming. Unnamed checkpoints overwrite the previous unnamed checkpoint.

| Attribute | Description                                        | Default        |
| --------- | -------------------------------------------------- | -------------- |
| `name`    | Optional label for the checkpoint (reader-visible) | auto-generated |

**Platform requirements:**

- The runtime **must** persist checkpoint state between sessions — saving progress is a core priority
- On story open, the platform checks for existing checkpoints and offers to resume
- In cooperative mode, `{checkpoint}` saves the individual reader's state; shared state is managed by the server independently
- The platform may implement additional auto-save beyond author checkpoints (e.g., on app background, before battery-critical shutdown)

---

## 17. Cards: Characters, Items & Actions

Cards are interactive story elements that readers can tap to inspect. They bring the story world to life beyond plain text.

### Character cards `[@]`

```rea
[@elena]
You see [@elena] standing by the fountain.
```

Character cards are defined in metadata or a dedicated block:

```rea
{define character elena begin}
  name: Elena Voss
  title: The Wandering Scholar
  image: media/elena.png
  description: A tall woman with silver-streaked hair and ink-stained fingers.
{end define}
```

When a reader taps `[@elena]`, they see the character's card with portrait, name, title, and description.

### Item cards `[$]`

```rea
You find a [$golden_key] on the ground.

{define item golden_key begin}
  name: Golden Key
  image: media/golden_key.png
  description: An ornate key, warm to the touch. It seems to hum faintly.
  rarity: rare
{end define}
```

Items can be added to a reader's inventory:

```rea
{give golden_key}
{take golden_key}
{if "golden_key" in reader.inventory begin}
  The key grows warm in your pocket.
{end if}
```

### Action cards `[&]`

Action cards represent story branching points with visual emphasis:

```rea
[&open_the_gate] Open the ancient gate
[&climb_the_wall] Scale the wall instead
```

> **Note:** Action cards use `&` (ampersand) to distinguish from custom anchors, which use `[#name]`.

### Dialogue attribution

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

```rea
{audio src="media/thunder.ogg", volume=0.8}
{audio src="media/ambient.ogg", loop, volume=0.3, name=ambient_music}
{stop ambient_music}
```

---

## 19. Input & Interaction

### Text input

```rea
{input name=player_name, placeholder="Enter your name"}
Hello, {player_name}!
```

**Input behavior:** Execution pauses at `{input}` until the reader submits a value. The value is stored in the variable specified by `name`. If the reader submits an empty value, the variable is set to an empty string `""`.

### Numeric input

```rea
{input name=guess, type="number", min=1, max=100, placeholder="Guess a number"}
```

Numeric input validates against `min`/`max` constraints. Out-of-range values are clamped to the nearest bound. Non-numeric input defaults to `0`.

### Buttons

```rea
{button label="Continue the journey", target=next_chapter}
{button label="Open inventory", action=show_inventory}
```

Buttons with `target` navigate to anchors (equivalent to `-> anchor`). Buttons with `action` trigger named events that `{on action_name begin}` blocks can handle.

### Timer

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
  unlock: "Unlock" {if has_key}
  pick: "Pick the lock" {if dexterity > 5}
{end verbs}
```

---

## 20. Cooperative Reading

Rea natively supports **multi-reader experiences** where multiple people read the same story simultaneously.

### Reader roles

```rea
{define role captain begin}
  name: The Captain
  description: Leader of the expedition. Makes final decisions.
  max: 1
{end define}

{define role crew begin}
  name: Crew Member
  description: Follows orders. Has unique skills.
  max: 4
{end define}
```

### Role-specific content

```rea
{if group.role = "captain" begin}
  Only you can see the secret map. What do you tell your crew?
{else}
  The captain is studying something. You wait for orders.
{end if}
```

### Synchronized choices

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

```rea
{whisper to="captain" begin}
  Only the captain sees this: the treasure is hidden under the third stone.
{end whisper}

{broadcast begin}
  Everyone sees this: a storm is approaching!
{end broadcast}
```

### Waiting for readers

```rea
{wait readers=all begin}
  Waiting for all readers to reach this point...
{end wait}
```

### Shared state

Readers share a common state namespace. Any reader can modify shared variables, and changes propagate to other readers:

```rea
{set shared.torch_lit = true}
{set shared.door_opened_by = reader.name}

{if shared.torch_lit begin}
  The torch illuminates the passage for everyone.
  (Lit by {shared.door_opened_by})
{end if}
```

### State synchronization

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

When multiple readers attempt conflicting actions simultaneously, the platform resolves conflicts:

```rea
{exclusive action="open_chest" begin}
  {// Only one reader can open the chest}
  You reach the chest first and pry it open.
  {set shared.chest_opened = true}
{end exclusive}

{race timeout=10 begin}
  {// First reader to complete wins}
  * [Grab the gem]
    You snatch the gem before anyone else!
    {give ruby}
{end race}
```

### Live presence

Readers can see each other's reading position and reactions in real-time:

```rea
{presence show="cursor" begin}
  {// Show where each reader is in the text}
{end presence}

{react options=["😮", "😂", "😢", "❤️"] begin}
  {// Floating emoji reactions visible to all readers}
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
  {set shared.gold = shared.gold + player.contribution}
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
{if group.readers_in_role("captain") = 0 begin}
  The crew is leaderless. Someone must step up.
{end if}
```

### Solo mode behavior

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
| `group.size`                            | Number of connected readers              | Returns **1**                                     |
| `group.readers`                         | List of reader objects                   | Returns **[self]**                                |
| `group.role`                            | Current reader's role                    | Returns first defined role                        |
| `group.readers_in_role(R)`              | Count of readers in role R               | Returns **1** for all roles                       |

**Solo principles:**

1. **No waiting for absent readers** — timeouts and reader-count waits skip instantly
2. **No hidden content** — solo reader sees all role-gated content (plays all roles)
3. **No broken state** — `group.*` returns valid data (`size=1`, `readers=[self]`)
4. **Author override** — stories can opt into single-role mode via metadata

#### Role handling in solo mode

By default, the solo reader is assigned to **all roles simultaneously**. Role-gated blocks (`{if group.role = "captain" begin}`) evaluate to true, and when multiple role blocks exist for the same passage, all display with a visual role badge (e.g., `[Captain]`, `[Crew]`).

Authors who want single-role solo play (reader picks one role, replays for others) can opt in via the manifest:

```json
{ "solo_mode": "single_role" }
```

---

## 21. Real-World Interactions

Rea integrates with real-world sensors and APIs through the `world.*` namespace, making stories that respond to the reader's physical context. All sensor access requires reader permission and degrades gracefully — if a sensor is unavailable, the story continues without it.

### Capability requirements

Declare which real-world features a story needs. The reader app checks availability before starting:

```rea
{require gps}
{require camera}
{require accelerometer}
{require nfc optional}
```

Adding `optional` means the feature enhances the story but isn't required. The `world.has()` function checks at runtime:

```rea
{if world.has("nfc") begin}
  Tap the NFC tag hidden under the bench.
{else}
  Type the code printed on the bench: {input type="text", name=bench_code}
{end if}
```

### Location

GPS coordinates use the `@` point literal and `@@` area literal:

```rea
{if world.location matches @@48.14;17.10/500 begin}
  You feel a strange resonance. This is the place from the story!
{end if}
```

**Location properties:**

| Property             | Type  | Description                        |
| -------------------- | ----- | ---------------------------------- |
| `world.location`     | point | Current (lat, lng) position        |
| `world.location.lat` | float | Latitude                           |
| `world.location.lng` | float | Longitude                          |
| `world.location.alt` | float | Altitude in meters (if available)  |
| `world.location.acc` | float | Accuracy in meters                 |
| `world.heading`      | float | Compass heading in degrees (0-360) |
| `world.speed`        | float | Movement speed in m/s              |

### Waypoints

Inspired by geocaching, waypoints define named locations that the reader must visit:

```rea
{waypoint old_bridge, @@48.1432;17.1056/50 begin}
  The old bridge creaks beneath your feet. Under the third plank,
  you find a leather pouch with a strange symbol.
  {set story.symbol_found = true}
{end waypoint}

{waypoint castle_ruins, @@48.1510;17.1120/100, require=story.symbol_found begin}
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

### Multi-stage routes

Chain waypoints into sequential or non-sequential routes:

```rea
{route treasure_hunt, sequential begin}
  waypoint: old_bridge
  waypoint: castle_ruins
  waypoint: hidden_cave
  complete: "You've completed the treasure hunt!"
{end route}
```

Setting `sequential` forces visiting waypoints in order. Without it, readers can visit in any order.

### Geo-fencing zones

Define areas that trigger events when the reader enters or exits:

```rea
{zone dark_forest @@48.14;17.10@48.15;17.10@48.15;17.11@48.14;17.11 begin}
  {on enter begin}
    The trees close in around you. The forest feels alive.
    {set world.ambient = "forest"}
  {end on}
  {on exit begin}
    You emerge from the forest, blinking in the sunlight.
    {set world.ambient = "default"}
  {end on}
{end zone}
```

### Time of day

```rea
{if world.hour >= 22 or world.hour < 6 begin}
  The darkness around you feels real tonight.
{else}
  Daylight makes the story feel less frightening.
{end if}
```

**Time properties:**

| Property        | Type    | Description                |
| --------------- | ------- | -------------------------- |
| `world.hour`    | integer | Current hour (0-23)        |
| `world.minute`  | integer | Current minute (0-59)      |
| `world.weekday` | string  | Day name (lowercase)       |
| `world.date`    | string  | ISO date string            |
| `world.season`  | string  | Season based on hemisphere |

### Night mode

Combine time and light sensor for atmosphere:

```rea
{if world.hour >= 22 and world.light < 50 begin}
  {set ui.theme = "dark"}
  The chapter can only be read in darkness. Turn off the lights.
{end if}
```

### Weather

```rea
{if world.weather = "rain" begin}
  How fitting — it's raining in the story and outside your window.
{end if}
```

**Weather properties:**

| Property            | Type   | Description                                       |
| ------------------- | ------ | ------------------------------------------------- |
| `world.weather`     | string | Current condition (clear, rain, snow, fog, storm) |
| `world.temperature` | float  | Temperature in Celsius                            |
| `world.wind`        | float  | Wind speed in m/s                                 |
| `world.humidity`    | float  | Humidity percentage (0-100)                       |

### QR and barcode scanning

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

### NFC tags

```rea
{nfc target="reast:chapter5" begin}
  Tap your device on the NFC tag to reveal the hidden message.
{end nfc}

{nfc read, name=tag_data begin}
  The tag contains: {tag_data}
{end nfc}
```

### Camera and photo

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
| `world.tilt.x`         | float | Forward/backward tilt (-180 to 180) |
| `world.tilt.y`         | float | Left/right tilt (-90 to 90)         |
| `world.orientation`    | float | Device rotation (0-360, compass)    |
| `world.acceleration.x` | float | Acceleration along X axis           |
| `world.acceleration.y` | float | Acceleration along Y axis           |
| `world.acceleration.z` | float | Acceleration along Z axis           |

### Light level

```rea
{if world.light < 10 begin}
  In complete darkness, the phosphorescent text begins to glow.
{end if}

{if world.light > 500 begin}
  The bright sunlight reveals invisible ink on the page.
{end if}
```

`world.light` returns ambient light in lux (0 = darkness, 500+ = bright daylight).

### Vibration and haptics

```rea
{vibrate 200}
{vibrate pattern=[100, 50, 100, 50, 300]}
```

Pattern: array of alternating vibrate/pause durations in milliseconds.

### Proximity

```rea
{on proximity "near" begin}
  You hold the device close to the object. A secret message appears.
{end on}
```

### Voice input

```rea
{listen language="en", name=spoken_word begin}
  Speak the magic word to open the door.
{end listen}

{if spoken_word = "abracadabra" begin}
  The door slowly creaks open.
{end if}
```

### Dice and randomization

Inspired by tabletop RPG conventions, Rea supports dice notation for game-like interactions:

```rea
{set combat.roll = dice("2d6+3")}
You rolled {combat.roll}!

{if combat.roll >= 10 begin}
  Critical success! The dragon flees.
{else if combat.roll >= 7}
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

Combine multiple sensors into challenge-style interactions inspired by geocaching and adventure games:

```rea
{challenge night_vigil begin}
  require: world.hour >= 23 and world.light < 20
  require: world.location matches @@48.14;17.10/200
  timeout: 30m
  hint: "Find the old chapel after midnight. Bring no light."

  You stand in darkness before the ancient chapel.
  The stars above spell out a message only visible at this hour.
  {set story.star_message = "VERITAS"}
{end challenge}
```

Challenge attributes:

| Attribute | Description                                      |
| --------- | ------------------------------------------------ |
| `require` | One or more conditions (all must be true)        |
| `timeout` | Time limit (e.g. `30m`, `2h`)                    |
| `hint`    | Guidance shown when conditions are partially met |
| `retry`   | Allow retry after failure (default: true)        |
| `reward`  | Variable set on completion                       |

### Privacy & data handling

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
2. **No author access to raw data.** Authors receive boolean/event results (`world.location matches @@...` → `true`/`false`), not exact coordinates. Exception: `{capture}` gives photos for in-story display only
3. **No server transmission of precise location.** In cooperative mode, other readers see events ("Reader A reached waypoint_X"), never raw coordinates
4. **Session-only microphone.** `{listen}` transcribes locally. Audio is never stored or transmitted — only recognized text is available as a variable
5. **Weather via approximate geolocation.** Weather API calls use IP-based location, not GPS coordinates

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
