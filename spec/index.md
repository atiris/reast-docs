# Rea Language

Rea is a plain-text markup language for interactive stories. Its defining property is that **plain text is already a valid Rea document** — an ordinary paragraph of prose is a complete, renderable story. Formatting, choices, variables, logic, multimedia, cooperative reading and real-world interaction are all opt-in additions layered on top of prose. Nothing is required; you reach for syntax only when you need it.

Rea exists for branching narrative that a person can write in a text editor and diff in git, and that a machine can validate, render and sandbox. The same file is readable by a human and executable by the engine — there is no separate compiled form.

The three stages below are all valid Rea. The first line is already a complete story; the second adds one variable, the third one choice:

```rea
The road forked at the old oak.

{set player.torch = true}

* [Take the left path]
* [Take the right path]
```

## File types

- **`.rea`** — a story file: prose plus any opt-in Rea syntax.
- **`.rext`** — a Rea *extension* module: declaration-only (functions, top-level `{set}` constants, `{use}` and comments — no prose). See [When rules differ in `.rext` files](rext-differences).
- **`.reast`** — the distributable ZIP package: one or more `.rea` files, optional `.rext` extensions and media, plus a `manifest.json`. See the engine's [`.reast` package format reference](/engine/package-format).

## What Rea is not

Rea is not a general-purpose programming language, not HTML and not a game engine. Its functions are sandboxed and intentionally limited, its rendering is platform-controlled, and it has no raw markup passthrough. For the full list of deliberate exclusions, see [What Rea intentionally omits](05-reference.md#what-rea-intentionally-omits).

## Reading order

The specification is split into five parts, meant to be read in order the first time through:

1. **[Basics](01-basics)** — document structure, text formatting, headings, links, media, anchors, and choices.
2. **[Logic & Data](02-logic-data)** — commands, variables, expressions, and control flow.
3. **[Narrative & Interaction](03-narrative-interaction)** — dialogue, cards, voice, input, cooperative reading, and real-world interactions.
4. **[Utilities](04-utilities)** — pluralization, localization, content protection, captions, and error handling.
5. **[Reference](05-reference)** — identifiers, built-in functions, extensibility, accessibility, and conformance levels.

Looking for a quick syntax refresher instead of the full spec? See the [Cheatsheet](REA-CHEATSHEET).
