# Rea Language Specification — Part 1: Basics (Sections 1–9)

> [Back to main specification](/)
>
> **Implementation status:** Sections 1–9 are implemented in the client-side parser. Metadata extraction, text formatting, headings, blockquotes, horizontal rules, links, media, anchors, extended formatting commands (underline, strikethrough, monospace), footnotes (named and auto-numbered), nested inline formatting, and variable support work as specified. See [REA-CHEATSHEET.md](REA-CHEATSHEET.md) for detailed status.

---

## What Rea Is

Rea is a plain-text markup language for interactive stories. Its defining property is that **plain text is already a valid Rea document** — an ordinary paragraph of prose is a complete, renderable story. Formatting, choices, variables, logic, multimedia, cooperative reading and real-world interaction are all opt-in additions layered on top of prose. Nothing is required; you reach for syntax only when you need it.

Rea exists for branching narrative that a person can write in a text editor and diff in git, and that a machine can validate, render and sandbox. The same file is readable by a human and executable by the engine — there is no separate compiled form.

The three stages below are all valid Rea. The first line is already a complete story; the second adds one variable, the third one choice:

```rea
The road forked at the old oak.

{set player.torch = true}

* [Take the left path]
* [Take the right path]
```

### File types

- **`.rea`** — a story file: prose plus any opt-in Rea syntax.
- **`.rext`** — a Rea *extension* module: declaration-only (functions, top-level `{set}` constants, `{use}` and comments — no prose). See [Extensibility](05-reference.md#31-extensibility).
- **`.reast`** — the distributable ZIP package: one or more `.rea` files, optional `.rext` extensions and media, plus a `manifest.json`. See [File Format & Packaging](05-reference.md#28-file-format--packaging).

### What Rea is not

Rea is not a general-purpose programming language, not HTML and not a game engine. Its functions are sandboxed and intentionally limited, its rendering is platform-controlled, and it has no raw markup passthrough. For the full list of deliberate exclusions, see [What Rea intentionally omits](05-reference.md#what-rea-intentionally-omits).

---

## 1. Document Structure

Rea stories exist in a hierarchy:

```txt
Series → Reast → Part → Chapter → Section → Scene → Paragraph
```

Every story is distributed as a `.reast` package — a ZIP archive containing `.rea` story files in `story/`, a `manifest.json`, and optional media (see [File Format & Packaging](05-reference.md#28-file-format--packaging)). A standalone `.rea` file can be used during authoring, but the platform always works with `.reast` packages.

A series groups multiple reasts under a common title (e.g., "Friends"). Within a series, an optional **season** metadata field groups reasts into logical blocks (numbered or named). A standalone story needs neither — it is simply a reast.

A minimal `.rea` content file is just text:

```rea
Once upon a time, in a land far away, a young traveler set out on a journey.

The road stretched endlessly before them.
```

No headers, no special syntax — plain prose is valid content. To publish, the author packages this `.rea` file into a `.reast` archive with a minimal `manifest.json`. Authoring tools handle this automatically.

### Metadata

A `.rea` file is **pure text** — it contains no metadata. All metadata (title, author, genre, sensors, permissions, etc.) is stored in the `.reast` package's `manifest.json` file (see [Section 28](05-reference.md#28-file-format--packaging)).

This separation keeps `.rea` files clean and portable: a `.rea` file is always just the story content, readable by any text editor. The manifest in `manifest.json` declares everything the platform needs to know before executing the story: story info, permissions, and requirements.

---

## 2. Text & Paragraphs

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

Underline, strikethrough, and monospace are available as commands (rarely needed in narrative fiction):

```rea
{underline begin}the signature{end underline}
{strike begin}the old plan{end strike}
{mono begin}code:X7F2{end mono}
```

**Code/plaintext blocks** use a single backtick on its own line:

```rea
`
This text is rendered exactly as written.
No formatting applies here.
`
```

Inline code uses backticks within a line: `` `variable_name` ``.

**Nesting:** If the raw text itself contains a lone backtick line, use double backticks to delimit the block. Triple backticks allow double backticks inside, and so on:

```rea
``
This block can contain a single ` on its own line.
``
```

---

## 4. Headings

Headings use one or more `#` characters. They serve as structural markers for **chapters**, **sections**, and **scenes**.

```rea
# The Beginning

## The Forest Path

### The Clearing

#### A Strange Tree

##### The Inscription
```

The platform renders each level with a distinct visual style. Beyond the platform's supported depth, additional levels render identically to the deepest supported level.

**Heading anchors** are auto-generated from the heading text:

1. Convert to lowercase
2. Remove diacritics (accents)
3. Replace non-alphanumeric characters with `_`
4. Collapse consecutive `_` into one
5. Trim leading/trailing `_`

Example: `## The Forest's Edge!` → anchor: `the_forests_edge`

---

## 5. Alignment & Indentation

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

Blockquotes use `|` at the start of a line. Multiple `|` characters nest blockquotes:

```rea
| The old man spoke slowly:
|| Remember this: every path leads somewhere.
|| Even the ones that seem to go nowhere.
| His words lingered in the silence.
```

The platform renders each nesting level with a distinct visual style up to its supported depth.

### Horizontal Rules

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

> **Parser note:** Horizontal rules are lines consisting only of dashes. A `-` followed by text in a choice context is a gather point (see [Choices & Branching](03-narrative-interaction.md#16-choices--branching)), not a horizontal rule.

---

## 7. Links

Links use a unified bracket syntax with the `>` arrow pointing toward the destination:

```rea
[read more > #the_clearing]
[next chapter > chapter2.rea]
```

**Structure:** `[display text > target]`

**Internal links** to anchors use `#`:

```rea
[go back > #the_beginning]
```

**Story-to-story links:**

```rea
[continue the adventure > reast://ABC123]
```

> **Note:** External URLs (http/https) are not allowed in `.rea` text. All external access is declared via `allowed_urls` in `manifest.json` and referenced by alias (see [External API access](04-utilities.md#external-api-access)).

---

## 8. Media

Media commands use the bracket syntax with type-specific prefixes. The `<` arrow indicates the source flows **into** the display element:

| Type  | Syntax                 | Example                               |
| ----- | ---------------------- | ------------------------------------- |
| Image | `[!alt text < source]` | `[!A dark forest < media/forest.jpg]` |
| Video | `[>caption < source]`  | `[>The gate opens < media/gate.mp4]`  |
| Audio | `[?caption < source]`  | `[?Birdsong < media/birds.ogg]`       |

**Memory aid:**

- `!` = image (symbol for brush; like attention/visual impact)
- `>` = video (symbol for play button)
- `?` = audio (symbol for ear; listen/question mark — "hear this?")

### Media attributes

Attributes follow the source, comma-separated:

```rea
[!The castle < media/castle.jpg width=800, height=600]
[>Intro cinematic < media/intro.mp4 autoplay, loop, muted]
[?Background music < media/theme.ogg volume=0.5, loop]
```

### Inline media references

For media bundled in a `.reast` package, use numeric references:

```rea
[!A secret map < :1]
[>The ritual < :2]
```

The number maps to an entry in the [package manifest](05-reference.md#28-file-format--packaging).

---

## 9. Anchors & Footnotes

### Custom Anchors

Place a custom anchor anywhere with:

```rea
[#anchor_name]
```

Jump to it via a link:

```rea
[return to safety > #anchor_name]
```

### Footnotes

Footnotes use `[^identifier]` for the reference and matching content later:

```rea
The ancient dialect[^dialect] was nearly forgotten.

[^dialect]: A form of Old Elvish spoken only in the northern territories.
```

Auto-numbered footnotes use `[^]` (assigned sequentially):

```rea
The ritual[^] required three components[^].

[^]: Described in detail in Part II.
[^]: Fire, water, and a willing heart.
```

---
