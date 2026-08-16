# Basics: Documents, Text & Choices

> [Introduction](/spec/) · [Feature index](features) · [Cheatsheet](REA-CHEATSHEET)
>
> Almost everything on this page is **stable** — the prose core of Rea, frozen with the 1.0 release. Each feature carries its own badge; see the [feature index](features) for what the levels mean.

---

## 1. Document Structure

Rea stories exist in a hierarchy:

```txt
Series → Reast → Part → Chapter → Section → Scene → Paragraph
```

A story is distributed as a `.reast` package — a ZIP archive holding the story's `.rea` files, optional media, and (in the packaged layout) a `manifest.json` (see [File Format & Packaging](05-reference.md#_28-file-format-packaging)). A standalone `.rea` file is enough while authoring, but a published story is always a `.reast` package.

A series groups multiple reasts under a common title (e.g., "Friends"). Within a series, an optional **season** metadata field groups reasts into logical blocks (numbered or named). A standalone story needs neither — it is simply a reast.

A minimal `.rea` content file is just text:

<Feature id="plain-text" />

```rea
Once upon a time, in a land far away, a young traveler set out on a journey.

The road stretched endlessly before them.
```

No headers, no special syntax — plain prose is valid content. To publish, the author packages this `.rea` file into a `.reast` archive with a minimal `manifest.json`. Authoring tools handle this automatically.

### Metadata

<Feature id="rea-file" />

A `.rea` file is **pure text** — it contains no metadata. All metadata (title, author, genre, sensors, permissions, etc.) is stored in the `.reast` package's `manifest.json` file (see [Section 28](05-reference.md#_28-file-format-packaging)).

This separation keeps `.rea` files clean and portable: a `.rea` file is always just the story content, readable by any text editor. The manifest in `manifest.json` declares everything the platform needs to know before executing the story: story info, permissions, and requirements.

---

## 2. Text & Paragraphs

<Feature id="paragraphs" />

**Paragraphs** are separated by one or more blank lines:

```rea
The forest was dark and quiet.

Somewhere in the distance, a wolf howled.
```

A **single line break** is a hard line break (the text continues on a new line within the same paragraph):

```rea
The inscription read:
In shadow I wait,
In light I fade.
```

**Suppress a line break** with `\` at the end of a line (join to the next line):

```rea
This is a very long sentence that I want to \
write across two lines in the source.
```

This renders as a single continuous line.

---

## 3. Text Formatting

<Feature id="inline-formatting" />

| Syntax     | Renders as        | Example              |
| ---------- | ----------------- | -------------------- |
| `_text_`   | _Italic_          | `_whispered softly_` |
| `*text*`   | **Bold**          | `*the door slammed*` |
| `_*text*_` | **_Bold italic_** | `_*impossible!*_`    |

Only two inline markers exist: `_` (italic) and `*` (bold). Bold italic is achieved by combining them — `_*text*_` or `*_text_*`. Both orders are valid; the preferred form is `_*text*_`.

Formatting markers must be adjacent to the text (no spaces between marker and text).

Formatting can be **nested**:

```rea
_The *ancient* tome's *forbidden* chapter_
```

### Extended Formatting

<Feature id="extended-formatting" />

Underline, strikethrough, and monospace are available as commands (rarely needed in narrative fiction):

```rea
{underline begin}the signature{end underline}
{strike begin}the old plan{end strike}
{mono begin}code:X7F2{end mono}
```

### Rich formatting

<Feature id="format-command" />

`{format}` is the general formatting block — colour, size and weight in one command, for the rare moment a scene needs a visual effect the three markers above cannot give it:

```rea
{format color="#00f" begin}the cold blue light{end format}
{format color="#00f", content="the cold blue light"}
```

Both forms are identical: the parser sets `content` to the inner text of every paired block, so an author picks inline or block style freely (see [Commands](02-logic-data.md#_10-commands)).

Colour is the only attribute settled so far. Rea has no CSS and never will — `{format}` exists so that a *semantic* emphasis the theme can honour stays available, not so a story can dictate its own appearance. A platform theme may render any `{format}` differently, or ignore an attribute it chooses not to support.

### Code & plaintext blocks

<Feature id="code-blocks" />

**Code/plaintext blocks** use a single backtick on its own line:

```rea
`
This text is rendered exactly as written.
No formatting applies here.
`
```

Inline code uses backticks within a line: `` `variable_name` ``.

**Code is verbatim, including `{ }`.** Nothing is substituted inside a backtick span or block, so a variable written there reaches the reader as the text you typed. `{mono}` behaves the same way. To print a value in a readout, build the line outside the code — a blockquote reads as a panel and does interpolate:

```rea
{comment WRONG — the reader sees the braces}
`FUEL ....... {story.ship.fuel}%`

{comment RIGHT}
| FUEL — {story.ship.fuel}%
```

**Nesting:** If the raw text itself contains a lone backtick line, use double backticks to delimit the block. Triple backticks allow double backticks inside, and so on:

```rea
``
This block can contain a single ` on its own line.
``
```

---

## 4. Headings

<Feature id="headings" />

Headings use one or more `#` characters. They serve as structural markers for **chapters**, **sections**, and **scenes**.

```rea
# The Beginning

## The Forest Path

### The Clearing

#### A Strange Tree

##### The Inscription
```

The platform renders each level with a distinct visual style. Beyond the platform's supported depth, additional levels render identically to the deepest supported level.

### Heading anchors

<Feature id="heading-anchors" />

**Heading anchors** are auto-generated from the heading text:

1. Convert to lowercase
2. Remove diacritics (accents)
3. Replace non-alphanumeric characters with `_`
4. Collapse consecutive `_` into one
5. Trim leading/trailing `_`

Example: `## The Forest's Edge!` → anchor: `the_forests_edge`

---

## 5. Alignment & Indentation

<Feature id="alignment" />

Lines can be aligned by starting them with a special character:

| Prefix    | Alignment                                         |
| --------- | ------------------------------------------------- |
| `=`       | Center                                            |
| `>`       | Right                                             |
| `<`       | Left (forced — useful in right-aligned documents) |
| (default) | Left                                              |

```rea
= The End

> — Author Unknown

< forced left in a right-to-left context
```

**Indentation** uses repeated alignment characters. Each extra character adds one indent level from the corresponding side:

```rea
= centered
== centered with 1 indent from both sides
=== centered with 2 indents from both sides

> right-aligned
>> right-aligned with 1 indent from right
>>> right-aligned with 2 indents from right

< left-aligned (forced)
<< left-aligned with 1 indent from left
<<< left-aligned with 2 indents from left
```

A space after the alignment prefix is mandatory. The platform renders each level distinctly up to its supported depth; beyond that, additional levels render identically to the deepest.

---

## 6. Blockquotes & Horizontal Rules

### Blockquotes

<Feature id="blockquotes" />

Blockquotes use `|` at the start of a line. Multiple `|` characters nest blockquotes:

```rea
| The old man spoke slowly:
|| Remember this: every path leads somewhere.
|| Even the ones that seem to go nowhere.
| His words lingered in the silence.
```

The platform renders each nesting level with a distinct visual style up to its supported depth.

### Horizontal Rules

<Feature id="horizontal-rules" />

Horizontal rules are lines consisting solely of dashes. Different counts produce different visual weights:

```rea
-
--
---
----
-----
```

**Consistency principle:** Just as `#` is the top-level (largest) heading for document structure, `-` is the top-level (heaviest) separator. More dashes = lighter/subtler rule:

| Rule    | Visual weight        | Typical use                |
| ------- | -------------------- | -------------------------- |
| `-`     | **Heavy** (thickest) | Major part/act break       |
| `--`    | Medium-heavy         | Chapter break              |
| `---`   | Medium               | Section break              |
| `----`  | Light                | Scene transition           |
| `-----` | **Subtle** (finest)  | Thought break / soft pause |

The visual appearance of each level is fully controlled by the platform theme. Authors choose the semantic weight; the theme determines the visual style (solid, dotted, ornamental, gradient, etc.).

> **Parser note:** Horizontal rules are lines consisting only of dashes. A `-` followed by text in a choice context is a gather point (see [Choices & Branching](03-narrative-interaction.md#_16-choices-branching)), not a horizontal rule.

---

## 7. Links

<Feature id="links" />

Links use a unified bracket syntax with the `>` arrow pointing toward the destination:

```rea
[read more > #the_clearing]
[they set off to the kingdom of rocks > story/0004-kingdom.rea]
```

**Structure:** `[display text > target]`

A link whose target is another part file is a [cross-part link](03-narrative-interaction.md#multi-part-stories), and the target is the part's archive-relative path. Multi-part stories use the packaged layout, where parts live under `story/` and are listed in the manifest; a flat archive resolves only its single entry file, so it has nothing to link across.

**Internal links** to anchors use `#`:

```rea
[go back > #the_beginning]
```

**Story-to-story links:**

<Feature id="story-links" />

```rea
[continue the adventure > reast://author-slug/story-slug]
```

A `reast://` link opens another reast on the platform that hosts it, addressed by the author slug and story slug.

> **Note:** External URLs (http/https) are not allowed in `.rea` text. All external access is declared via `allowed_urls` in `manifest.json` and referenced by alias (see [External API access](error-handling.md#external-api-access)).

### Custom Anchors

<Feature id="custom-anchors" />

Place a custom anchor anywhere so a link can jump to it:

```rea
[#anchor_name]
```

Jump to it from anywhere in the story:

```rea
[return to safety > #anchor_name]
```

Custom anchors sit alongside the auto-generated [heading anchors](#_4-headings): a heading defines its anchor implicitly, while `[#anchor_name]` marks any other spot.

---

## 8. Media

<Feature id="media-embeds" />

Media commands use the bracket syntax with type-specific prefixes. The `<` arrow indicates the source flows **into** the display element:

| Type  | Syntax                 | Example                               |
| ----- | ---------------------- | ------------------------------------- |
| Image | `[!alt text < source]` | `[!A dark forest < media/forest.jpg]` |
| Video | `[>caption < source]`  | `[>The gate opens < media/gate.mp4]`  |
| Audio | `[?caption < source]`  | `[?Birdsong < media/birds.ogg]`       |

**Memory aid:**

- `!` = image — the exclamation mark resembles a paintbrush used to paint pictures.
- `>` = video — the greater-than symbol resembles the play button used to play videos.
- `?` = audio — the question mark resembles an ear used to listen to audio.

### Media attributes

<Feature id="media-attributes" />

Parameters inside `[ ]` and `{ }` are separated by commas (with optional surrounding spaces). The source path is the first parameter of a media embed, so a comma also separates it from the first attribute:

```rea
[!The castle < media/castle.jpg, width=800, height=600]
[>Intro cinematic < media/intro.mp4, autoplay, loop, muted]
[?Background music < media/theme.ogg, volume=0.5, loop]
```

This comma rule applies to all bracketed `[…]` and braced `{…}` parameters throughout Rea — the source path is simply the first parameter.

---

## 9. Help & Footnotes

Footnotes and hints both hang extra information off a span of text using the link bracket. The `>` arrow points from the displayed text to the annotation; the first character after `>` decides which kind it is — `^` for a footnote, `*` for a hint. (Custom anchors, which also live in `[ … ]`, are covered under [Links](#_7-links).)

### Footnotes

<Feature id="footnotes" />

A footnote attaches an inline note to a span of text — the note travels with the text, there is no separate definition block:

```rea
The [ancient dialect > ^A form of Old Elvish spoken only in the north.] was nearly forgotten.
```

The reader sees `ancient dialect` marked with a `^`. Pointing at it (desktop) or tapping it (touch) reveals the note as a tooltip. Footnote text is plain — no nested formatting — and may contain `>` (only the first `>` splits the text from the note); it may not contain `]`.

### Hints

<Feature id="hints" />

A hint is a footnote that only appears once the reader has switched on hints. It can carry several progressive levels, so the reader chooses how much help to reveal. Levels are numbered with a run of asterisks — one `*` is level 1, `**` is level 2, up to nine — and each level's text runs until the next asterisk run or the closing `]`:

```rea
This key needs to [use in the treasure room > *A first-level nudge.**A second-level, more direct hint.].
```

A hint may also start straight at a higher level when only a strong hint makes sense:

```rea
This key needs to [use in the top tower > ***A third-level hint that gives a lot away.].
```

The reader turns hints on and picks an **enabled level** (1–9; off by default). A hint marker appears next to the text only when the hint defines a level at or below the enabled level; clicking it reveals that hint's levels up to the enabled level. Whenever a page contains any hint — even ones above the reader's enabled level — the reader is told that hints are available on the page, without being shown where. Hint text follows the same plain-text rules as footnotes; because an asterisk run always opens a new level, hint text cannot itself contain a bare `*`.

---
