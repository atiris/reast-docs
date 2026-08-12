# Changelog

## v1.0.0 (Current)

The first release of the Rea language and `@reast/engine`.

### The language

- The complete Rea specification: basics, logic & data, narrative & interaction, utilities, and reference — plus the [feature index](/spec/features), which states the maturity of every feature in one place.
- The **prose core is stable and frozen**: paragraphs, italic/bold, underline/strike/monospace, code blocks, headings and their anchors, alignment and indentation, blockquotes, horizontal rules, links, custom anchors, media embeds, footnotes and progressive hints. Only a new MAJOR version may change any of it.
- Commands, variables, expressions, control flow, functions, choices, storylets, cards, the coin wallet, `.rext` extensions and the localization built-ins ship as **experimental** — released and usable, with the syntax open to refinement within 1.x.
- Features that are documented but not yet available carry a `development` or `draft` badge. They are specified so a story can be designed around them, not so it can be shipped against them.

### The engine

- Parser: lexer, block parser, inline parser, post-processor, analyser
- Runtime: interpreter, expression evaluator, state manager, flow navigator, seeded PRNG
- Loader: ZIP extraction, AES decryption, manifest parsing, media mapping, GitHub repository import
- Player: `<reast-engine>` Custom Element with Shadow DOM
- Validator: story structure validation with warnings
- Built-in functions: string, math, array, type, date and locale categories, plus the `std/*` standard library
- Security: URI scheme allowlist, path traversal protection, variable name sanitization
- Accessibility: ARIA live regions, focus management, semantic HTML rendering
- Reader preferences: font, size, line height, theme (light/sepia/dark/AMOLED)
- Reading position save/restore with LRU eviction

### Version policy

The language follows **MAJOR.MINOR** versioning. A MAJOR bump may invalidate existing stories; a MINOR bump only adds. A story declares the version it targets with the `rea` field in its manifest, and a parser must reject a higher MAJOR than it supports while accepting a lower MINOR gracefully. See [Spec versioning](/spec/05-reference#spec-versioning).

Previously published stories stay readable by newer engine versions. The documentation version switcher in the footer lists every published release; each older one is a frozen snapshot of the site as it stood at that version.
