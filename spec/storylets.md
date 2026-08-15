# Storylets & Decks

> [Introduction](/spec/) · [Feature index](features) · [Cheatsheet](REA-CHEATSHEET)

### Storylets (quality-based narrative)

<Feature id="storylets" />

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
| `trigger`    | Real-world input kind that can wake this storylet (see [Triggered storylets](#triggered-storylets)) |
| `match`      | Optional case-insensitive regex the input value must match |

<Feature id="storylet-deck" />

**Storylet deck** — present available storylets as a hand of cards the reader can choose from:

```rea
{deck from="tavern_stories", max=3, shuffle begin}
  Choose what catches your attention:
{end deck}
```

This presents up to 3 eligible storylets tagged `tavern_stories`, shuffled.

Storylets enable organic, non-linear narratives where the story adapts to the reader's state, encouraging exploration and replay.

### Triggered storylets

<Feature id="triggered-storylets" />

A storylet with a `trigger:` line is woken by the world instead of a deck: at almost any moment while reading, a real-world input — scanning a QR sticker on a bench, saying a phrase aloud, tapping an NFC tag — can interrupt the main story, play the storylet as a side path, and return exactly where the reader left off:

```rea
{storylet bench_secret begin}
  trigger: scan
  match: "^REAST-BENCH-.*"
  require: story.act >= 2
  weight: 2
  repeatable: false

  The code on the bench flickers to life. A voice whispers: "You found me."
  * [Follow the whisper]
    -> bench_alley
  * [Ignore it]
{end storylet}

{storylet magic_word begin}
  trigger: listen
  match: "abracadabra"

  The word hangs in the air — and the wall answers.
{end storylet}
```

- **`trigger:`** names the input kind. The set is open — the reader app decides which kinds it can physically capture. Common kinds: `scan` (QR/barcode payload), `listen` (recognized speech transcript), `text`, `vision`, `nfc`, `shake`, `location`. A storylet without `trigger:` behaves exactly as before (deck-only); a storylet may carry both `trigger:` and `tags:` and appear in decks too
- **`match:`** is a case-insensitive regular expression tested against the input's value (the QR payload, the transcript). Omit it to accept any input of that kind
- **Selection** follows normal storylet rules: among storylets whose kind and `match:` fit, `require:` conditions, drawn-state, `cooldown:` and `priority:` are respected, then one is picked by weighted random. One input wakes exactly one storylet
- **Inside the body**, `event.kind` and `event.value` expose the triggering input to conditions and text (they are also visible to `require:` during selection), so the scanned payload or the spoken words can be quoted back to the reader: `Its tag reads {event.value}.`

#### Interruption and return

A triggered storylet plays like an author-written tunnel (`->->`): the engine remembers the main-story position — including a pending, not-yet-answered choice group — plays the storylet, and resumes the main story exactly where it was when the storylet ends (its last line, or an explicit divert out). State changes made inside (`{set}`, `{give}`, coins) persist into the main story. Saves taken mid-storylet restore into the storylet with the return position intact. A new trigger is ignored while a triggered storylet is already running — side paths never nest.

When an input matches nothing — no eligible storylet, no pending [exploration menu](/spec/03-narrative-interaction#exploration-menus) option — the reader app gives gentle feedback ("that did nothing… yet") rather than an error, so scanning stray codes is always safe. When both a pending exploration menu and a triggered storylet could answer the same input, the menu wins — see [Priority with storylet triggers](/spec/03-narrative-interaction#priority-with-storylet-triggers).

## See also

- [Priority with storylet triggers](/spec/03-narrative-interaction#priority-with-storylet-triggers) — arbitration between a pending exploration menu and a storylet trigger for the same input, under Exploration menus.
- [Priority: exploration menus vs. storylet triggers](/spec/03-narrative-interaction#priority-exploration-menus-vs-storylet-triggers) — the same arbitration rule, restated under Real-World Interactions.
