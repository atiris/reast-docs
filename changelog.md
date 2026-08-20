# Changelog

## v1.1.0 (Current)

### Conditions: one language, three modes

- **`{wait EXPR begin} … {end wait}` now blocks.** The story pauses until the expression turns true; the body is what the reader sees while waiting, and the story continues after `{end wait}`. `escape=` gives up after a duration and `escape_to=` sends the reader to an anchor instead. A bare `{wait begin}` is unchanged — it is a pause beat, not a gate.
- **`{waypoint}` is a form of `{wait}`.** `{waypoint name, AREA, require=EXPR}` is `{wait context.location matches AREA and EXPR}` plus map metadata, so `hint=` is its waiting text and its body is arrival content. It has a reader-side runtime for the first time.
- **`context.` subtrees are sources with a cadence.** Time is derived and wakes exactly once at the next boundary a condition can notice; location is a push stream; weather is one shared rate-limited poll. A source starts when the first condition waits on it and stops when the last one leaves, so the consent screen is computed from the story rather than trusted from its manifest.
- **A condition can be `unknown`** when a source it reads is denied or unavailable. A wait keeps waiting; an `{if}` treats it as false, which is what `link/context-no-fallback` asks the author to write an `{else}` for.
- **Deadlines are absolute, and a missed window still counts.** A story closed on a bench and reopened three hours later resumes with the right answer, and the pending set travels in the reading state (schema v3; older saves resume with nothing pending). A resume also replays the instants the story slept through, so `{wait context.time.hour = 22}` fires for a reader who was away from nine until half past eleven instead of waiting another day.
- **A reading depends on no server.** A wait is decided on the device, from its own clock and the state it already holds; nothing about what a reader is waiting for is stored or evaluated anywhere else. The cost is stated rather than hidden: a reader is not notified while the story is closed, and `escape=` is the mitigation for one who never returns.

### New functions

- `duration("PT30M")` — an ISO 8601 duration as milliseconds
- `between(time, from, to)` — a time-of-day range, including one that crosses midnight
- `elapsed(timestamp)` — milliseconds since an instant, from the host clock
- `within(point, area)` / `within(point, "waypoint_name")` — containment, reusing a named waypoint's own area

### New diagnostics

- `link/wait-no-escape` — the escape rule, generalized past waypoints to every waiting condition
- `link/unknown-context-source` — a condition reading a `context.` subtree no platform provides
- `link/context-no-fallback` — a `now`-mode gate on a real-world source with no `{else}`

### Fixes

- A cached condition result survived the sensor-result path, so a position that arrived after a gate was first evaluated left that gate reading `false` for the rest of the reading.
- `context.location` was never written as a point, only as its components — so `context.location matches circle(…)`, the comparison every waypoint makes, tested an undefined left side.
- A state machine's `when` guard was invisible to every static pass: a variable a guard plainly read was reported as unused.

## v1.0.0

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
