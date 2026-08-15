# Rea Language

Rea is a plain-text markup language for interactive stories. Its defining property is that **plain text is already a valid Rea document** — an ordinary paragraph of prose is a complete, renderable story. Formatting, choices, variables, logic, multimedia, cooperative reading and real-world interaction are all opt-in additions layered on top of prose. Nothing is required; you reach for syntax only when you need it.

Rea exists for branching narrative that a person can write in a text editor and diff in git, and that a machine can validate, render and sandbox. The same file is readable by a human and executable by the engine — there is no separate compiled form.

The three stages below are all valid Rea. The first line is already a complete story; the second adds one variable, the third one choice:

```rea
The road forked at the old oak.

{set story.player.torch = true}

* [Take the left path]
* [Take the right path]
```

## File types

- **`.rea`** — a story file: prose plus any opt-in Rea syntax.
- **`.rext`** — a Rea *extension* module: declaration-only (functions, top-level `{set}` constants, `{use}` and comments — no prose). See [When rules differ in `.rext` files](rext-differences).
- **`.reast`** — the distributable ZIP package: one or more `.rea` files, optional `.rext` extensions and media, plus a `manifest.json` in the packaged layout. See the engine's [`.reast` package format reference](/engine/package-format).

## What Rea is not

Rea is not a general-purpose programming language, not HTML and not a game engine. Its functions are sandboxed and intentionally limited, its rendering is platform-controlled, and it has no raw markup passthrough. For the full list of deliberate exclusions, see [What Rea intentionally omits](05-reference.md#what-rea-intentionally-omits).

## How far along is each feature?

Rea 1.0 is the first release of the language, and not every feature in this specification is equally far along. Each one carries a status badge under its own heading:

- **`stable`** — released and frozen; only a new MAJOR version may change it. This is the prose core: paragraphs, formatting, headings, links, media, notes.
- **`experimental`** — released and usable, but the syntax may still be refined within 1.x. Most of the language is here today.
- **`development`** — designed and being built; not usable yet.
- **`draft`** — specified and discussed; no implementation has started.
- **`cancelled`** — considered and deliberately ruled out.

The [**feature index**](features) lists every feature grouped by what it is for, with a filter by status. Read it before planning a story around anything beyond the prose core.

## Reading order

The specification is split into five parts, meant to be read in order the first time through:

1. **[Basics](01-basics)** — document structure, text formatting, headings, links, media, anchors, and choices.
2. **[Logic & Data](02-logic-data)** — commands, variables, expressions, and control flow. See also [Custom Functions](functions).
3. **[Narrative & Interaction](03-narrative-interaction)** — dialogue, cards, voice, input, cooperative reading, and real-world interactions. See also [Storylets & Decks](storylets).
4. **[Utilities](04-utilities)** — pluralization, localization, content protection, and captions. See also [Error Handling](error-handling).
5. **[Reference](05-reference)** — identifiers, built-in functions, extensibility, accessibility, and conformance levels.

Looking for a quick syntax refresher instead of the full spec? See the [Cheatsheet](REA-CHEATSHEET).
