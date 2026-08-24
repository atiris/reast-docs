# Error Handling

> [Introduction](/spec/) · [Feature index](features) · [Cheatsheet](REA-CHEATSHEET)

Rea has two audiences and they never share a pipe.

The **reader** gets prose. Every failure has a defined, silent fallback, and no error text ever reaches the page — not a message, not a placeholder token, not a bare identifier. This is a language guarantee, not a runtime detail.

The **author** gets *records*: structured, code-identified, position-carrying data with no rendered form. A record is never shown to a reader at any severity. `reast validate` prints them; the editor underlines them; a host formats them from `code + args + locale`.

The two channels are the whole design. A failure produces a fallback **and** a record, and neither one substitutes for the other.

### Severities

Every code carries exactly one severity, fixed in the engine's registry. A call site never chooses one, so two places noticing the same condition cannot disagree about how bad it is.

| Severity   | What it means                                                                       | Fails CI          |
| ---------- | ----------------------------------------------------------------------------------- | ----------------- |
| `fatal`    | The artefact cannot be loaded at all. Package and extension faults only.             | yes               |
| `error`    | An authoring mistake with a reader-visible consequence: content is lost, dead or wrong. | yes            |
| `warning`  | An authoring mistake with no reader-visible consequence yet.                         | under `--strict`  |
| `degraded` | *Correct* behaviour under a reduced environment or conformance level.                | **never**         |
| `info`     | Hygiene, style and authoring notes.                                                  | no                |

`degraded` is never promoted, not even by `--strict`. Promoting it would defeat the reason it is a separate severity: an author has to be able to tell "my Platform feature did nothing here, and that is by design" from "I made a mistake".

Nothing in `parse/` is `fatal`. Any UTF-8 text is a valid Rea document — a `.rea` file never fails to parse.

### Code partitions

A code is a lowercase, slash-partitioned string; the prefix *is* the range, so codes sort, grep and glob.

| Partition | Raised by                                                     |
| --------- | ------------------------------------------------------------- |
| `pkg/`    | Archive, manifest, integrity, decryption                      |
| `ext/`    | `.rext` load-time trust and grammar, `{use}` resolution       |
| `parse/`  | Reading one file                                              |
| `link/`   | Resolving names across the whole package                      |
| `eval/`   | Evaluating an expression                                      |
| `flow/`   | Running the story: limits, control flow, saves                |
| `env/`    | The environment the story is read in: media, sensors, readers |
| `style/`  | Hygiene and authoring notes                                   |
| `meta/`   | The record stream itself                                      |

### The escape rule

A gate that depends on state neither the author nor the reader controls needs a way out, and that rule belongs to every waiting condition rather than to one block. A `{wait}` or `{waypoint}` whose expression reads `context.*` and declares neither `escape=` nor `escape_to=` gets `link/wait-no-escape` or `link/waypoint-no-escape` — a warning, not an error, because a deliberate hard physical gate with no digital bypass is a legitimate design.

Its `now`-mode counterpart is `link/context-no-fallback`: an `{if}` on a real-world source with no `{else}` renders nothing at all when the source is denied or has not delivered yet, which is a blank page where the author expected one of two scenes. And a condition reading a `context.` subtree no platform provides gets `link/unknown-context-source` — it could never become true, so the story would stop there for good.

### What the reader gets

<Feature id="error-handling" />

Every code has a defined fallback, and the whole table is normative: an implementation conforms by producing the stated reader experience for each one. It is generated from the engine's code registry by `scripts/check-spec-fallback-table.mjs`, so a new code cannot ship without stating what the reader gets, and the spec cannot drift from the implementation. Do not edit the block by hand.

An unknown command is **skipped whole** — including its block, if it opens one. It is not printed as an expression. Printing it put the author's markup on the reader's page, which is exactly the thing the reader channel exists to prevent.

Division by zero yields **nothing**, which renders as nothing. It used to yield `0`, a value the reader could not tell from a real result.

<!-- BEGIN GENERATED: fallback-table -->

#### `pkg/` — Package, manifest, integrity (17)

| Code | Severity | What the reader gets |
| ---- | -------- | -------------------- |
| `pkg/invalid-archive` | `fatal` | load refused |
| `pkg/size-exceeded` | `fatal` | load refused |
| `pkg/too-many-entries` | `fatal` | load refused |
| `pkg/path-traversal` | `fatal` | load refused |
| `pkg/loader-invalid-url` | `fatal` | load refused |
| `pkg/loader-fetch-failed` | `fatal` | load refused |
| `pkg/manifest-missing` | `fatal` | load refused |
| `pkg/manifest-invalid-json` | `fatal` | load refused |
| `pkg/manifest-schema-error` | `fatal` | load refused |
| `pkg/manifest-unsupported-version` | `fatal` | load refused |
| `pkg/manifest-older-minor` | `degraded` | unknown features skipped |
| `pkg/manifest-unknown-key` | `info` | none |
| `pkg/integrity-mismatch` | `fatal` | load refused |
| `pkg/signature-mismatch` | `error` | loads; host chrome flags source |
| `pkg/decrypt-no-key` | `fatal` | load refused |
| `pkg/decrypt-failed` | `fatal` | load refused |
| `pkg/session-config-invalid` | `error` | file ignored; no vars injected |

#### `ext/` — Extension load and `{use}` resolution (10)

| Code | Severity | What the reader gets |
| ---- | -------- | -------------------- |
| `ext/invalid` | `fatal` | load refused |
| `ext/prose-node` | `fatal` | load refused |
| `ext/encrypted` | `fatal` | load refused |
| `ext/use-cycle` | `fatal` | load refused |
| `ext/duplicate-export` | `fatal` | load refused |
| `ext/unresolved-use` | `fatal` | load refused |
| `ext/declared-not-packaged` | `fatal` | load refused |
| `ext/reserved-namespace` | `fatal` | load refused |
| `ext/requires-missing` | `fatal` | load refused |
| `ext/unbound-alias` | `error` | call yields `undefined` → empty |

#### `parse/` — Reading one file (48)

| Code | Severity | What the reader gets |
| ---- | -------- | -------------------- |
| `parse/unterminated-block` | `warning` | auto-closed at EOF |
| `parse/implicitly-closed-block` | `info` | closed by the same-kind opener |
| `parse/orphan-block-end` | `warning` | `{end x}` dropped |
| `parse/unterminated-code-block` | `warning` | auto-closed at EOF |
| `parse/unterminated-command` | `warning` | literal text |
| `parse/unterminated-bracket` | `warning` | literal text |
| `parse/unknown-command` | `error` | block skipped entirely (D9) |
| `parse/unknown-namespace` | `error` | block skipped entirely |
| `parse/malformed-heading` | `warning` | literal text |
| `parse/malformed-media` | `warning` | embed skipped |
| `parse/malformed-blockquote` | `warning` | literal text |
| `parse/malformed-dialogue` | `warning` | literal text |
| `parse/malformed-pin` | `warning` | pin skipped |
| `parse/malformed-bounds` | `warning` | the map draws unanchored |
| `parse/invalid-mediasession` | `warning` | directive skipped |
| `parse/invalid-vibrate` | `warning` | directive skipped |
| `parse/empty-menu` | `warning` | menu not shown |
| `parse/empty-choice-group` | `warning` | group not shown |
| `parse/choice-options-capped` | `error` | options past the cap are not offered |
| `parse/single-option-choice-group` | `info` | the one option is shown |
| `parse/unknown-attribute` | `warning` | the attribute is ignored |
| `parse/body-property` | `error` | the line renders as prose; the setting is lost |
| `parse/unexpected-when` | `warning` | the condition is ignored |
| `parse/missing-event-subject` | `error` | the handler never runs |
| `parse/ambiguous-event-subject` | `warning` | only the first subject is used |
| `parse/unknown-event` | `warning` | the handler never runs |
| `parse/missing-deck-subject` | `error` | the command does nothing |
| `parse/face-outside-card` | `warning` | the face text is dropped |
| `parse/invalid-face-position` | `warning` | the face sits in the default band |
| `parse/detail-outside-card` | `warning` | the detail is dropped |
| `parse/manifest-not-first` | `warning` | the metadata is ignored |
| `parse/duplicate-embedded-file` | `error` | the first declaration is used |
| `parse/invalid-storylet-match` | `error` | storylet never eligible |
| `parse/inline-depth-exceeded` | `warning` | deeper inlines flatten to text |
| `parse/document-truncated` | `error` | content after the limit is lost |
| `parse/unknown-formatting` | `info` | literal text |
| `parse/formatting-not-adjacent` | `info` | literal text |
| `parse/alignment-missing-space` | `info` | literal text |
| `parse/hint-contains-marker` | `warning` | marker treated as literal in the hint |
| `parse/footnote-contains-bracket` | `warning` | footnote ends at the first `]` |
| `parse/heading-depth-clamped` | `degraded` | rendered at the deepest supported |
| `parse/indent-depth-clamped` | `degraded` | rendered at the deepest supported |
| `parse/duplicate-anchor` | `error` | first definition wins; the rest unreachable |
| `parse/content-after-gate` | `warning` | unreachable — a gate is terminal |
| `parse/reserved-word-misuse` | `error` | block skipped entirely |
| `parse/dotless-set` | `error` | block skipped entirely |
| `parse/comma-on-no-attribute-command` | `error` | block skipped entirely |
| `parse/bare-word-attribute-value` | `error` | block skipped entirely |

#### `link/` — Resolving names across the package (45)

| Code | Severity | What the reader gets |
| ---- | -------- | -------------------- |
| `link/undefined-anchor` | `error` | divert ignored; reading continues |
| `link/undefined-tunnel-target` | `error` | tunnel ignored; reading continues |
| `link/tunnel-return-without-entry` | `error` | return ignored |
| `link/unreachable-after-divert` | `warning` | none |
| `link/unused-anchor` | `info` | none |
| `link/dead-end-anchor` | `info` | reading stops there |
| `link/cyclic-divert` | `info` | none |
| `link/cyclic-variable` | `warning` | `undefined` → empty |
| `link/variable-never-set` | `warning` | `undefined` → empty |
| `link/undefined-function` | `error` | call yields `undefined` → empty |
| `link/builtin-arity` | `error` | call yields `undefined` → empty |
| `link/redefines-builtin` | `error` | the built-in runs; the declaration is ignored |
| `link/story-scope-dotless-set` | `warning` | variable is heading-scoped, not story-scoped |
| `link/missing-media` | `warning` | placeholder / skip / poster per §27 |
| `link/media-missing-alt` | `warning` | image renders without alt |
| `link/missing-part` | `error` | link inert |
| `link/missing-gate-target` | `error` | gate is terminal — the story ends |
| `link/missing-part-anchor` | `error` | part opens at its start |
| `link/preload-target-missing` | `warning` | nothing preloaded |
| `link/sensor-not-declared` | `error` | `has()` is `false` |
| `link/sensor-declared-unused` | `info` | a permission is requested for nothing |
| `link/unreachable-choice` | `warning` | authored content the reader cannot reach |
| `link/undefined-replace-target` | `error` | `{replace}` is a no-op |
| `link/unknown-card` | `warning` | `{play}` is a no-op (specified) |
| `link/unknown-deck` | `warning` | the command deals nothing |
| `link/undealt-deck` | `info` | none — the deck is never dealt |
| `link/unreachable-card` | `warning` | authored content the reader cannot reach |
| `link/deck-short-of-deal` | `warning` | a smaller hand than the deck asks for |
| `link/group-deck-without-readers` | `warning` | the deck degrades to reader scope |
| `link/undefined-item` | `info` | item stacks without a definition |
| `link/unknown-machine-event` | `error` | `{trigger}` is a no-op |
| `link/undefined-initial-state` | `error` | machine has no valid state |
| `link/undefined-state-target` | `error` | transition does not fire |
| `link/storylet-requires-unset-variable` | `warning` | storylet never eligible |
| `link/unknown-storylet-trigger` | `warning` | storylet never triggered |
| `link/undefined-timer-target` | `error` | `on_expire` fires into nothing |
| `link/unknown-checkpoint` | `error` | `{restore}` is a no-op |
| `link/unknown-domain` | `error` | block skipped entirely |
| `link/unwritten-variable` | `error` | `undefined` → empty |
| `link/possibly-unwritten-variable` | `warning` | `undefined` → empty |
| `link/waypoint-no-escape` | `warning` | none — gate behaves as authored |
| `link/wait-no-escape` | `warning` | none — the wait behaves as authored |
| `link/unknown-context-source` | `warning` | reads `unknown`; an `until` keeps waiting |
| `link/context-no-fallback` | `warning` | block skipped when the source is unavailable |
| `link/unknown-route-waypoint` | `error` | the stage is skipped; the route can never complete |

#### `eval/` — Evaluating an expression (33)

| Code | Severity | What the reader gets |
| ---- | -------- | -------------------- |
| `eval/undefined-variable` | `warning` | empty string (X-01) |
| `eval/non-numeric-arithmetic` | `warning` | `undefined` → empty |
| `eval/division-by-zero` | `warning` | `undefined` → empty (X-02) |
| `eval/number-conversion-failed` | `warning` | `undefined` → empty |
| `eval/conversion-failed` | `warning` | `undefined` → empty |
| `eval/type-mismatch-comparison` | `info` | coerced per §12 |
| `eval/empty-string-false-equality` | `info` | `""` equals `false` per §12 |
| `eval/matches-non-regex` | `warning` | `false` |
| `eval/in-non-array` | `warning` | `false` |
| `eval/index-out-of-bounds` | `warning` | `undefined` → empty |
| `eval/property-on-non-object` | `warning` | `undefined` → empty |
| `eval/depth-exceeded` | `error` | `undefined` → empty |
| `eval/ops-exceeded` | `error` | `undefined` → empty |
| `eval/expression-too-long` | `error` | `undefined` → empty |
| `eval/invalid-expression` | `error` | `undefined` → empty |
| `eval/string-truncated` | `error` | reader sees a cut string |
| `eval/variable-limit-reached` | `error` | the write is dropped |
| `eval/unsafe-variable-name` | `error` | the write is dropped |
| `eval/coordinate-out-of-range` | `error` | `undefined` → empty |
| `eval/invalid-datetime` | `warning` | the empty string, per §30 |
| `eval/invalid-duration` | `warning` | `0` per §30 |
| `eval/format-fallback` | `degraded` | plain string form |
| `eval/plural-missing-other` | `error` | `undefined` → empty |
| `eval/select-no-match` | `error` | `undefined` → empty |
| `eval/calendar-incomplete` | `error` | `undefined` → empty |
| `eval/ordinal-unsupported-locale` | `degraded` | number, no suffix |
| `eval/invalid-dice-notation` | `warning` | `undefined` → empty |
| `eval/strict-undeclared-write` | `warning` | the write succeeds |
| `eval/context-write-refused` | `error` | the write is dropped |
| `eval/story-meta-write-refused` | `error` | the write is dropped |
| `eval/card-write-refused` | `error` | the write is dropped |
| `eval/unknown-card` | `warning` | `undefined` → empty |
| `eval/unknown-card-property` | `warning` | `undefined` → empty |

#### `flow/` — Running the story (19)

| Code | Severity | What the reader gets |
| ---- | -------- | -------------------- |
| `flow/tunnel-overflow` | `error` | tunnel unwound |
| `flow/call-depth-exceeded` | `error` | call yields `undefined` |
| `flow/config-value-invalid` | `warning` | default limit used |
| `flow/iteration-limit` | `error` | loop cut short; the scene changes |
| `flow/node-limit` | `error` | remaining content is lost |
| `flow/timeout` | `error` | remaining content is lost |
| `flow/for-non-array` | `warning` | loop body never runs |
| `flow/break-outside-loop` | `error` | ignored |
| `flow/return-outside-function` | `error` | ignored |
| `flow/missing-argument` | `warning` | parameter is `undefined` |
| `flow/fallback-choice-taken` | `info` | fallback auto-selected (specified) |
| `flow/no-eligible-choice` | `error` | dead end — no choice, no fallback |
| `flow/menu-underfilled` | `degraded` | fewer than `select=N` shown (specified) |
| `flow/empty-cycle` | `warning` | nothing shown |
| `flow/insufficient-funds` | `info` | `{spend}` refuses, nothing changes |
| `flow/timer-replaced` | `warning` | outer `on_expire` never fires |
| `flow/save-position-lost` | `degraded` | nearest checkpoint / chapter start |
| `flow/save-major-mismatch` | `error` | host notice + fresh start (the one specified reader-facing message) |
| `flow/restore-condition-failed` | `info` | restore refused; reading continues |

#### `env/` — The environment the story is read in (27)

| Code | Severity | What the reader gets |
| ---- | -------- | -------------------- |
| `env/missing-image` | `degraded` | placeholder with alt text |
| `env/missing-audio` | `degraded` | silently skipped |
| `env/missing-video` | `degraded` | poster frame, else placeholder |
| `env/media-fallback-failed` | `warning` | platform default |
| `env/tts-unavailable` | `degraded` | silently skipped |
| `env/sensor-unavailable` | `degraded` | `has()` is `false` |
| `env/permission-denied` | `degraded` | story degrades per §21 |
| `env/permission-revoked` | `degraded` | treated as newly unavailable |
| `env/requirement-unsatisfiable` | `error` | host refuses to start; not story text |
| `env/request-failed` | `warning` | `undefined`; story continues |
| `env/url-alias-undeclared` | `error` | request fails → `undefined` |
| `env/part-load-failed` | `error` | part unreachable |
| `env/input-coerced` | `warning` | non-numeric input becomes `0` |
| `env/input-clamped` | `warning` | value clamped to the nearest bound |
| `env/no-match` | `info` | gentle non-match feedback (specified) |
| `env/reader-timeout` | `degraded` | excluded after the 30s grace |
| `env/vote-reader-dropped` | `degraded` | vote excluded; cast votes stand |
| `env/vote-no-votes` | `degraded` | `vote.result` is `undefined` |
| `env/vote-tie` | `info` | random among tied, from the seeded stream |
| `env/race-no-winner` | `degraded` | `race.winner` `undefined`; block skipped |
| `env/lock-released-on-disconnect` | `degraded` | released after grace |
| `env/role-vacated` | `warning` | role not reassigned; content may be unreachable |
| `env/shared-write-conflict` | `info` | last-write-wins |
| `env/solo-degradation` | `degraded` | the §20 degradation table |
| `env/no-transport` | `degraded` | renders single-reader |
| `env/undo-chapter-boundary` | `degraded` | undo stops at the chapter start |
| `env/undo-blocked` | `degraded` | lock not released; vote not retracted |

#### `style/` — Authoring hygiene (11)

| Code | Severity | What the reader gets |
| ---- | -------- | -------------------- |
| `style/empty-section` | `info` | nothing — a hygiene note has no reader consequence |
| `style/unused-variable` | `info` | nothing — a hygiene note has no reader consequence |
| `style/deep-nesting` | `info` | nothing — a hygiene note has no reader consequence |
| `style/dead-condition` | `info` | nothing — a hygiene note has no reader consequence |
| `style/empty-anchor` | `info` | nothing — a hygiene note has no reader consequence |
| `style/choice-without-consequence` | `info` | nothing — a hygiene note has no reader consequence |
| `style/choice-label-too-short` | `info` | nothing — a hygiene note has no reader consequence |
| `style/heading-level-skipped` | `info` | nothing — a hygiene note has no reader consequence |
| `style/paragraph-too-long` | `info` | nothing — a hygiene note has no reader consequence |
| `style/todo` | `info` | nothing — a hygiene note has no reader consequence |
| `style/confusable-identifier` | `info` | nothing — a hygiene note has no reader consequence |

#### `meta/` — The record stream itself (3)

| Code | Severity | What the reader gets |
| ---- | -------- | -------------------- |
| `meta/budget-exceeded` | `warning` | nothing — the record stream was truncated, not the story |
| `meta/above-conformance-level` | `degraded` | the feature is skipped |
| `meta/redacted` | `warning` | nothing — a record was suppressed, not content |

<!-- END GENERATED: fallback-table -->

### What a record may carry

A record may name an identifier the author wrote, quote what the author literally typed, and describe the *type* of a runtime value. It may never carry a runtime value.

That rule is enforced by the shape of the API, not by review: there is no constructor that accepts a caller-supplied string. Quoted source is read back out of the file at a position. So a failed `{set story.gold = "abc"}` may report `"abc"`, because the author typed it into the file, while the same failure on a value that arrived through `{input}` can only report a type name.

This binds the free-text and audio privacy guarantees of [Section 19](03-narrative-interaction.md#_19-input-interaction) and [Section 21](03-narrative-interaction.md#_21-real-world-interactions) to diagnostic records too, not only to story state. A `{listen}` that fails to match records that it failed to match — never what was said.

### Reading the records

```bash
reast validate                 # every .rea and .rext under data/seed
reast validate path/ --json    # the record stream, for CI
reast validate path/ --strict  # warnings fail the build too
```

```text
story/0001.rea:124:1 error link/undefined-anchor Divert to "the_vault" — no such anchor
```

The exit code is non-zero on any `fatal` or `error`, in every output mode.

Rea does **not** have `try/catch`. All error handling is implicit — the runtime recovers, the reader's experience is never interrupted, and the author reads the record.

### Fallback values

<Feature id="fallback-values" />

Where it makes sense, syntax supports optional inline fallback values:

```rea
[!map < media/map.png, fallback="media/map-lowres.png"]
[?thunder < sounds/thunder.mp3, fallback="sounds/rain.mp3"]
```

If the primary resource fails, the fallback is used. If the fallback also fails, the platform applies its default graceful behavior (placeholder for images, silence for audio, etc.).

### External API access

<Feature id="external-api" />

External API calls (network requests from within a story) must be declared in `manifest.json` via `allowed_urls`. URLs must not appear anywhere in `.rea` text — authors reference APIs by alias only. This ensures all external access is declared, auditable, and permission-controlled.

```json
{
  "title": "Weather Story",
  "allowed_urls": [
    {
      "alias": "weather",
      "url": "https://api.weather.example.com",
      "params": ["lat", "lng"]
    },
    { "alias": "maps", "url": "https://maps.example.com" }
  ]
}
```

Each entry in `allowed_urls` is an object with:

| Field    | Type     | Description                                    |
| -------- | -------- | ---------------------------------------------- |
| `alias`  | string   | Short name used to reference this API in .rea  |
| `url`    | string   | Base URL prefix the story may access           |
| `params` | string[] | Optional list of allowed query parameter names |

Authors reference allowed APIs by alias in story code. If a request fails, the runtime returns `undefined` and the story continues.

---
