# Cards & Decks

> [Introduction](/spec/) · [Feature index](features) · [Cheatsheet](REA-CHEATSHEET)

A **deck** is a named pool of **cards**. A card is a piece of story — text, `{set}`, calls, choices — with a face (name, art, description) and a condition. At a point the author chooses, the story deals a hand from a deck; the reader picks one or more; each picked card plays exactly like a tunnel and the story continues where it was.

A card with no deck is the older idea of a *storylet*: content the world wakes rather than content a deck deals. It is the same declaration, which is why there is one page for both.

### Declaring a deck

<Feature id="define-deck" />

A deck is a face and a set of defaults, so it is unpaired — one command, no `begin`:

```rea
{define deck roles name="Role cards", back="assets/cards/card-role-background.webp",
                   scope="group", play="consumed", face="down"}
```

| Deck attribute                     | Meaning                                                                                                                                    | Default   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| `name`, `back`, `description`      | The face of the deck itself (title, back art)                                                                                              | —         |
| `scope`                            | `reader` (a copy each) or `group` (one deck for the cooperative session)                                                                   | `reader`  |
| `play`                             | What happens to a played card: `reusable` (back to the deck), `exhausted` (set aside until restored), `consumed` (gone for this reading)   | `reusable`|
| `deal`, `pick`, `face`, `optional` | Defaults for the `{draw}` / `{play}` commands that use this deck                                                                           | `all`, `1`, `up`, `false` |
| `reclaim`                          | Seconds after a holder disconnects before their card returns to the deck; `never` keeps it held (`scope="group"` only)                     | the platform grace period |

### Declaring a card

<Feature id="define-card" />

A card has a body — what plays when it is activated — so it is paired, and it closes with its own kind:

```rea
{define card king deck="roles", name="The King", image="assets/cards/card-role-king.webp",
                  role="king" begin}
  You wake in the royal bedchamber. Somebody has already opened the shutters.
  * [Summon the council] -> council_chamber
  * [Walk the walls alone]
    The stone is cold and the guards pretend not to see you.
{end card}
```

A card joins a deck by **naming** it, not by sitting inside it — the same way a card joins a card set. The hierarchy lives in the data, so a card opened in the middle of a file still says what it belongs to.

A card takes `deck=`, the face attributes any card definition takes (`name`, `image`, `description`, plus author-chosen properties), its own `play=` overriding the deck's, and the selection attributes below. Its eligibility is the head's trailing `when` clause.

| Attribute     | Description                                                                                        |
| ------------- | -------------------------------------------------------------------------------------------------- |
| `when …`      | Condition that must be true for the card to be eligible                                            |
| `priority=`   | Higher priority cards are dealt first (default `0`)                                                |
| `repeatable=` | `true` to allow re-drawing, `false` for one-time (default)                                         |
| `cooldown=`   | Minimum draws before the card may reappear                                                         |
| `weight=`     | Relative probability when several cards are eligible                                               |
| `tags=`       | Categorization for filtering                                                                       |
| `trigger=`    | Real-world input kind that can wake this card (see [Triggered cards](#triggered-storylets))            |
| `match=`      | Optional case-insensitive regex the input value must match                                         |

Three attributes **do** something rather than describe something:

| Behavioural attribute | Effect                                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `role="king"`         | Drawing the card puts the reader in that role — this is how `context.group.role` is assigned               |
| `mandatory=true`      | Always dealt when eligible, ignoring the `deal` cap                                                        |
| `alone=true`          | When eligible, the card is dealt by itself and crowds every other card out of the hand                     |

`when` is a **`whenever`** condition, evaluated at *selection* time — every time the engine deals, and never in between. A deck therefore never starts a sensor: a `when` reading `context.location` is answered from whatever position the platform last delivered, and if nothing is watching, that answer is `unknown` and the card is simply not eligible. A story that wants the engine to keep looking writes a [`{wait}`](03-narrative-interaction.md#waiting-for-a-condition), which is the `until` verb and does start what it needs.

### Drawing and playing

<Feature id="draw-play" />

`{draw}` acquires; `{play}` activates.

```rea
{draw deck="basic"}               {comment take a card into the Bag; played later}
{play deck="basic"}               {comment choose a card from the deck and play it now}
{play card="king"}                {comment the story forces one specific card}
{return card="king"}              {comment put a card back in its deck}
```

Both commands take a block form for the moment that needs a prompt or a fallback:

```rea
{play deck="basic", deal=3, pick=1 begin}
  The market spreads out. What do you take?
  {empty begin}
    The stalls are bare; the season is over.
  {end empty}
{end play}
```

| Command attribute | Meaning                                  | Default                       |
| ----------------- | ---------------------------------------- | ----------------------------- |
| `deck` / `card`   | What to draw from, or which card to play | —                             |
| `count`           | How many cards                           | `1`                           |
| `deal`            | How many are laid out to choose between  | the deck's, else all eligible |
| `pick`            | How many the reader takes                | `1`                           |
| `face`            | `up` (reader chooses) or `down` (random) | the deck's, else `up`         |
| `optional`        | May the reader take nothing              | the deck's, else `false`      |

A `face="down"` hand is shuffled and taken off the top: a deal the reader cannot see is not a choice, so nothing is presented. `{empty}` runs when nothing in the deck is eligible — a deck must be exhaustible, and an exhausted deck must have somewhere to go.

`{return card="…"}` is spelled with an attribute because `{return EXPR}` already returns from a function. One verb, two jobs, and the card form is the one that names its subject — exactly as `{draw}` and `{play}` do.

### Reading deck state

```rea
{if drawn("king") begin}          {comment did this reader draw it}
  You still feel the weight of the crown.
{end if}

{if held("king") begin}           {comment is it in their hand right now}
  The card is still warm.
{end if}

{story.deck.basic.remaining} of {story.deck.basic.size} cards are left.

{for part.card in eligible("basic") begin}   {comment the hand as data, laid out by hand}
  - {part.card}
{end for}
```

The counter is shown by default, because a hidden deck size is the thing readers read as rigged. `eligible()` returns the pool without dealing it, so an author who wants a layout the built-in hand does not give can render the cards themselves — the selection stays the engine's, the presentation stays the author's.

### Cards in the package

A card is Rea text, and a file is one of the places it can live. A package may carry a `deck/` directory whose subdirectories are decks and whose `.rea` files are cards:

```
project.reast
├── manifest.json
├── story/0001-the-silence.rea      ← ordered parts, unchanged
├── deck/roles/deck.rea             ← {define deck roles …}
├── deck/roles/king.rea             ← one card per file
└── deck/basic/coin.rea
```

The manifest lists **directories to load**, not decks — `"decks": ["deck/roles", "deck/basic"]` — because what a deck *is* comes from `{define deck}`, and a deck named in both places would be one thing with two sources of truth. A card file that declares no `deck=` joins the deck its directory is named after, so adding a card is adding a file and never a manifest edit. Cards written inline in a part keep working and simply declare `deck=`.

### Triggered cards {#triggered-storylets}

<Feature id="triggered-storylets" />

A card with a `trigger=` and no deck is woken by the world instead of dealt: at almost any moment while reading, a real-world input — scanning a QR sticker on a bench, saying a phrase aloud, tapping an NFC tag — can interrupt the main story, play the card as a side path, and return exactly where the reader left off:

```rea
{define card bench_secret trigger=scan, match="^REAST-BENCH-.*", weight=2 when story.act >= 2 begin}
  The code on the bench flickers to life. A voice whispers: "You found me."
  * [Follow the whisper]
    -> bench_alley
  * [Ignore it]
{end card}

{define card magic_word trigger=listen, match=abracadabra begin}
  The word hangs in the air — and the wall answers.
{end card}
```

- **`trigger=`** names the input kind. The set is open — the reader app decides which kinds it can physically capture. Common kinds: `scan` (QR/barcode payload), `listen` (recognized speech transcript), `text`, `vision`, `nfc`, `shake`, `location`
- **`match=`** is a case-insensitive regular expression tested against the input's value (the QR payload, the transcript). Omit it to accept any input of that kind
- **A card in a deck is dealt, never woken.** The deck decides when its cards come out, so `trigger=` belongs to a card with no `deck=`
- **Selection** follows normal card rules: among cards whose kind and `match=` fit, `when` conditions, drawn-state, `cooldown=` and `priority=` are respected, then one is picked by weighted random. One input wakes exactly one card
- **Inside the body**, `event.kind` and `event.value` expose the triggering input to conditions and text (they are also visible to `when` during selection), so the scanned payload or the spoken words can be quoted back: `Its tag reads {event.value}.`

#### Interruption and return

A triggered card plays like an author-written tunnel (`->->`): the engine remembers the main-story position — including a pending, not-yet-answered choice group — plays the card, and resumes the main story exactly where it was when the card ends (its last line, or an explicit divert out). State changes made inside (`{set}`, `{give}`, coins) persist into the main story. Saves taken mid-card restore into it with the return position intact. A new trigger is ignored while a triggered card is already running — side paths never nest.

When an input matches nothing — no eligible card, no pending [exploration menu](/spec/03-narrative-interaction#exploration-menus) option — the reader app gives gentle feedback ("that did nothing… yet") rather than an error, so scanning stray codes is always safe. When both a pending exploration menu and a triggered card could answer the same input, the menu wins — see [Priority with storylet triggers](/spec/03-narrative-interaction#priority-with-storylet-triggers).

## See also

- [Card events](/spec/03-narrative-interaction#event-handlers) — what a card does when it is acquired, lost or used, written as a flat `{on}` handler.
- [Priority with storylet triggers](/spec/03-narrative-interaction#priority-with-storylet-triggers) — arbitration between a pending exploration menu and a card trigger for the same input, under Exploration menus.
- [Priority: exploration menus vs. storylet triggers](/spec/03-narrative-interaction#priority-exploration-menus-vs-storylet-triggers) — the same arbitration rule, restated under Real-World Interactions.
