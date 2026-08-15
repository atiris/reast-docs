# Utilities: Media, Formatting & Helpers

> [Introduction](/spec/) · [Feature index](features) · [Cheatsheet](REA-CHEATSHEET)
>
> The localization built-ins and the error model on this page are released. Content protection, captions and the author diagnostics are **draft** — specified so a story can be designed around them, but not built. Each section carries its own badge.

---

## 22. Pluralization & Localization

Rea provides built-in functions for grammatically correct text across all languages. These replace any need for custom condition syntax by leveraging CLDR plural rules and standard internationalization APIs.

> **Requirement:** the **host supplies the locale and formatting policy**. Plural
> and ordinal categories, number grouping and date/time styles are all resolved
> from CLDR via `Intl` for the host-supplied locale — the engine bakes in no
> per-language table. A story renders identically wherever a host declares the
> same locale.

### Pluralization with `plural()`

<Feature id="plural" />

The `plural()` function maps a count to the correct grammatical form using CLDR plural categories. Categories vary by language — English has 2 (`one`, `other`), Slovak has 4 (`one`, `few`, `many`, `other`), Arabic has 6.

```rea
{plural(gold, zero="no coins", one="{} coin", other="{} coins")}
```

For 0: "no coins", for 1: "1 coin", for 5: "5 coins". The `{}` placeholder inserts the count value.

**Slovak (4 categories):**

```rea
{plural(count, one="{} pero", few="{} perá", other="{} pier")}
```

For 1: "1 pero", for 3: "3 perá", for 5: "5 pier".

**CLDR plural categories:**

| Category | English example | Used by                           |
| -------- | --------------- | --------------------------------- |
| `zero`   | 0 items         | Arabic, Latvian, Welsh            |
| `one`    | 1 item          | Most languages                    |
| `two`    | 2 items         | Arabic, Hebrew, Slovenian         |
| `few`    | 2-4 items       | Czech, Slovak, Polish, Russian    |
| `many`   | 5+ items        | Polish, Russian, Arabic           |
| `other`  | default         | All languages (required fallback) |

The runtime resolves categories through `Intl.PluralRules` for the host-supplied locale. Authors only provide the categories their language requires — `other` is the mandatory fallback, and an explicit `zero` template always wins for a count of 0 (an author affordance CLDR does not model for most locales).

### Text selection with `select()`

<Feature id="select" />

The `select()` function maps a string value to text variants. Use it for gender, pronoun, role-based, or any key-based text variation:

```rea
{select(pronoun, he="He draws his sword", she="She draws her sword", other="They draw their sword")}
```

`other` is the fallback for unmatched values.

**Role-based variation:**

```rea
{select(reader.class, warrior="You swing your blade", mage="You cast a spell", other="You act")}
```

### Number formatting with `formatNumber()`

<Feature id="format-number" />

The `formatNumber()` function delegates to locale-aware number formatting
(`Intl.NumberFormat`). It defaults to the **host-supplied engine locale**; an
optional second positional argument overrides it with a specific BCP 47 tag:

```rea
Score: {formatNumber(player.score)}
Localised: {formatNumber(1234567, "sk")}
```

| Parameter                | Values                            | Default        |
| ------------------------ | --------------------------------- | -------------- |
| _(2nd positional)_       | BCP 47 locale tag                 | engine locale  |
| `style`                  | `decimal`, `percent`, `currency`  | `decimal`      |
| `currency`               | ISO 4217 code (e.g. `EUR`, `USD`) | —              |
| `minimumFractionDigits`  | integer (minimum decimal digits)  | `Intl` default |
| `maximumFractionDigits`  | integer (maximum decimal digits)  | `Intl` default |

Grouping (thousands separators), decimal count and symbols follow the locale's
CLDR data. On any `Intl` error (malformed tag, invalid option combination) the
value falls back to its plain string form.

```rea
Price: {formatNumber(item.price, style="currency", currency="EUR")}
Chance: {formatNumber(hit_rate, style="percent")}
Distance: {formatNumber(meters, maximumFractionDigits=1)} m
```

### Fantasy calendars with `calendar()`

<Feature id="calendar" />

The `calendar()` function maps real date components to custom names — perfect for fantasy world-building:

```rea
The month of {calendar(world.date, month="Frost,Bloom,Fire,Rain,Wind,Sun,Storm,Harvest,Mist,Shadow,Ice,Star")}
```

For January: "Frost", for March: "Fire", for December: "Star".

| Parameter | Description                                          |
| --------- | ---------------------------------------------------- |
| `month`   | Comma-separated list of 12 month names               |
| `weekday` | Comma-separated list of 7 day names (Monday = first) |
| `era`     | Expression defining era calculation                  |

```rea
Day of {calendar(world.date, weekday="Moonday,Fireday,Waterday,Earthday,Windday,Lightday,Darkday")},
{calendar(world.date, month="Frost,Bloom,Fire,Rain,Wind,Sun,Storm,Harvest,Mist,Shadow,Ice,Star")} the
{ordinal(world.date.day)}.
```

### Ordinal numbers with `ordinal()`

<Feature id="ordinal" />

```rea
You finished in {ordinal(position)} place.
```

The ordinal category (one/two/few/other) comes from `Intl.PluralRules(locale, { type: "ordinal" })` for the host-supplied locale. Without named args, `ordinal()` appends the English suffixes `st`/`nd`/`rd`/`th` **only for `en*` locales**; every other locale receives the locale-formatted number with no suffix, because `Intl` carries no ordinal spell-out data and inventing suffixes per language would be wrong. Authors who want suffixes in another language pass per-category templates, where `{}` is replaced by the formatted number:

```rea
{ordinal(position, one="{}.", other="{}.")}
```

So `ordinal(1)` is `1st` in English and `1` in German; the templated form yields `1.` in either.

---

## 23. Content Protection (Lock)

<Feature id="content-lock" />

The `{lock}` command protects story content, preventing readers from accessing chapters until conditions are met. This supports the platform's progressive download and monetization model.

### Soft lock

Content is bundled but hidden until the reader solves a puzzle or meets a condition. The key is derived from the correct answer using PBKDF2 + AES-GCM:

```rea
{lock type="soft", key="a1b2c3d4e5f6g7h8i9j0" begin}
  This chapter only unlocks when the reader provides the correct answer.
{end lock}
```

Multiple valid answers:

```rea
{lock type="soft", key=["hash_answer_1", "hash_answer_2"] begin}
  Either answer unlocks this content.
{end lock}
```

**How soft lock works internally:**

1. The author provides a plain-text answer during story creation
2. The platform derives an AES-256-GCM key using PBKDF2 (SHA-256, 100k iterations) from the answer + random salt
3. The locked content is encrypted with the derived key
4. The salt and IV (12 bytes) are stored alongside the ciphertext
5. When the reader submits an answer, the platform re-derives the key and attempts decryption
6. AES-GCM's built-in authentication tag verifies the answer is correct (tamper-proof)

### Hard lock

Content is stored on the server and downloaded only after the reader submits the correct key. This prevents extraction from the local package:

```rea
{lock type="hard", key="server_stored_hash" begin}
  This chapter is downloaded only after correct verification.
{end lock}
```

Hard locks use server-side validation: the reader's answer is hashed client-side and sent to the server, which compares it against the stored hash and returns the encrypted content only on match.

### Conditional lock

Lock content behind story conditions:

```rea
{lock condition="player.level >= 10 and has_dragon_scale" begin}
  The ancient text reveals itself only to the worthy.
{end lock}
```

### Encryption model

All content encryption in Rea uses the **Web Crypto API** for browser-safe, standards-compliant cryptography:

| Component      | Algorithm / Standard                        |
| -------------- | ------------------------------------------- |
| Encryption     | AES-256-GCM (authenticated encryption)      |
| Key derivation | PBKDF2 (SHA-256, 100k+ iterations)          |
| IV             | 12-byte random (per-block, never reused)    |
| Auth tag       | 128-bit (built into AES-GCM)                |
| Key exchange   | X25519 (cooperative readers, server-client) |
| Hashing        | SHA-256 (checksums, answer verification)    |
| Signing        | Ed25519 (package signatures, author ID)     |

The encryption model ensures:

- **No plaintext in packages** — locked content is always ciphertext in the `.reast` file
- **Forward secrecy** — each lock block uses a unique IV; compromising one doesn't expose others
- **Browser compatibility** — all algorithms work in Chrome, Firefox, Safari, and Edge via `SubtleCrypto`
- **Offline-capable** — soft locks decrypt locally without server contact

### Extension code is never encrypted

Content protection covers **prose only**. The loader rejects an encrypted `.rext`
extension outright. Encryption is content protection, not a security boundary —
the sandbox constrains an extension identically whether or not its source is
encrypted — so forbidding it costs nothing defensively and buys three things:
code is validated **before** prose runs (an unlock code can arrive mid-story, and
code that materialises after the reader is committed fails at the worst moment);
code is **auditable without a key** (`reast validate`, the editor, platform
moderation); and a third-party embedder without the key can still run the story's
logic. See [Extensibility](05-reference.md#_31-extensibility) for the full rule.

To keep a secret out of an extension while still checking it, keep the function
generic and plaintext and put the secret in an **encrypted `.rea` chapter** via
`{set}`, then verify *against* that variable rather than embedding it:

```rea
{comment extensions/gate.rext — plaintext, generic, holds no secret}
{function unlocked(given, expected) begin}
  {return given = expected}
{end function}
```

```rea
{comment an encrypted .rea chapter carries the secret}
{set crypt.passphrase = "moonlit-antler"}
```

The caveat, stated plainly: an encrypted `.rea` is **not** a secret from a
determined reader. The key reaches their device in order to render the chapter,
so `crypt.passphrase` is extractable. It protects against spoilers, casual
peeking and grepping the archive — not against a motivated attacker. Anything
that must be genuinely unforgeable (a competition answer, a paid unlock) has to
be verified **server-side** (see [Hard lock](#hard-lock)), which is the
platform's job, not the engine's.

---

## 24. Captions

<Feature id="captions" />

The `{caption}` command adds descriptive captions to preceding content (images, code blocks, or text sections):

```rea
[!The ancient map < media/map.jpg]
{caption "A hand-drawn map found in the wizard's tower"}

{voice speaker="elena", emotion="sad" begin}
  I never thought it would end this way.
{end voice}
{caption "Elena's final words"}
```

---

## 25. Escaping & Raw Text

### Escaping special characters

<Feature id="escaping" />

Use `\` to escape any character with special meaning:

```rea
The price is \{not a command\}.
Use \_underscores\_ without italics.
The path was \*not\* what it seemed.
```

### Raw blocks

Content inside `{raw begin}` is rendered as-is with no processing:

```rea
{raw begin}
  This {text} is *not* processed.
  No _formatting_ or {commands} apply here.
{end raw}
```

---

## 26. Comments

<Feature id="comments" />

### Author comments (hidden from reader)

```rea
{comment This is a single-line comment}

{comment begin}
  This is a multi-line comment.
  Readers never see this.
{end comment}
```

A comment's content is bare prose up to the closing brace — no quotes. Only the
exact `{comment begin}` opens a block, so the word `begin` inside a comment is
just a word: `{comment fix this before we begin}` is a single-line comment.

Multi-line comments use the `{comment begin}...{end comment}` block syntax,
consistent with all other paired commands.

### TODO markers

<Feature id="todo" />

```rea
{todo Write the battle scene here}

{todo begin}
  Rewrite the ending.
  Then the middle.
{end todo}
```

A TODO is a comment that reports itself: it is hidden from the reader exactly
like `{comment}`, and it raises `style/todo` on the author channel, so
`reast validate` and the editor list every one of them. Like a comment, its
content is bare prose and only `{todo begin}` opens a block.

---

## 27. Error Handling

Rea has two audiences and they never share a pipe.

The **reader** gets prose. Every failure has a defined, silent fallback, and no
error text ever reaches the page — not a message, not a placeholder token, not a
bare identifier. This is a language guarantee, not a runtime detail.

The **author** gets *records*: structured, code-identified, position-carrying
data with no rendered form. A record is never shown to a reader at any severity.
`reast validate` prints them; the editor underlines them; a host formats them
from `code + args + locale`.

The two channels are the whole design. A failure produces a fallback **and** a
record, and neither one substitutes for the other.

### Severities

Every code carries exactly one severity, fixed in the engine's registry. A call
site never chooses one, so two places noticing the same condition cannot
disagree about how bad it is.

| Severity   | What it means                                                                       | Fails CI          |
| ---------- | ----------------------------------------------------------------------------------- | ----------------- |
| `fatal`    | The artefact cannot be loaded at all. Package and extension faults only.             | yes               |
| `error`    | An authoring mistake with a reader-visible consequence: content is lost, dead or wrong. | yes            |
| `warning`  | An authoring mistake with no reader-visible consequence yet.                         | under `--strict`  |
| `degraded` | *Correct* behaviour under a reduced environment or conformance level.                | **never**         |
| `info`     | Hygiene, style and authoring notes.                                                  | no                |

`degraded` is never promoted, not even by `--strict`. Promoting it would defeat
the reason it is a separate severity: an author has to be able to tell "my
Platform feature did nothing here, and that is by design" from "I made a
mistake".

Nothing in `parse/` is `fatal`. Any UTF-8 text is a valid Rea document — a
`.rea` file never fails to parse.

### Code partitions

A code is a lowercase, slash-partitioned string; the prefix *is* the range, so
codes sort, grep and glob.

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

#### `parse/` — Reading one file (31)

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
| `parse/invalid-mediasession` | `warning` | directive skipped |
| `parse/invalid-vibrate` | `warning` | directive skipped |
| `parse/empty-menu` | `warning` | menu not shown |
| `parse/empty-choice-group` | `warning` | group not shown |
| `parse/choice-options-capped` | `error` | options past the cap are not offered |
| `parse/single-option-choice-group` | `info` | the one option is shown |
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

#### `link/` — Resolving names across the package (31)

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
| `link/story-scope-dotless-set` | `warning` | variable is heading-scoped, not story-scoped |
| `link/missing-media` | `warning` | placeholder / skip / poster per §27 |
| `link/media-missing-alt` | `warning` | image renders without alt |
| `link/missing-part` | `error` | link inert |
| `link/missing-gate-target` | `error` | gate is terminal — the story ends |
| `link/missing-part-anchor` | `error` | part opens at its start |
| `link/preload-target-missing` | `warning` | nothing preloaded |
| `link/sensor-not-declared` | `error` | `world.has()` is `false` |
| `link/sensor-declared-unused` | `info` | a permission is requested for nothing |
| `link/unreachable-choice` | `warning` | authored content the reader cannot reach |
| `link/undefined-replace-target` | `error` | `{replace}` is a no-op |
| `link/unknown-card` | `warning` | `{play}` is a no-op (specified) |
| `link/undefined-item` | `info` | item stacks without a definition |
| `link/unknown-machine-event` | `error` | `{trigger}` is a no-op |
| `link/undefined-initial-state` | `error` | machine has no valid state |
| `link/undefined-state-target` | `error` | transition does not fire |
| `link/storylet-requires-unset-variable` | `warning` | storylet never eligible |
| `link/unknown-storylet-trigger` | `warning` | storylet never triggered |
| `link/undefined-timer-target` | `error` | `on_expire` fires into nothing |
| `link/unknown-checkpoint` | `error` | `{restore}` is a no-op |

#### `eval/` — Evaluating an expression (28)

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
| `eval/coordinate-unsupported` | `error` | `undefined` → empty |
| `eval/invalid-datetime` | `warning` | the empty string, per §30 |
| `eval/invalid-duration` | `warning` | `0` per §30 |
| `eval/format-fallback` | `degraded` | plain string form |
| `eval/plural-missing-other` | `error` | `undefined` → empty |
| `eval/select-no-match` | `error` | `undefined` → empty |
| `eval/calendar-incomplete` | `error` | `undefined` → empty |
| `eval/ordinal-unsupported-locale` | `degraded` | number, no suffix |
| `eval/invalid-dice-notation` | `warning` | `undefined` → empty |
| `eval/strict-undeclared-write` | `warning` | the write succeeds |

#### `flow/` — Running the story (18)

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

#### `env/` — The environment the story is read in (27)

| Code | Severity | What the reader gets |
| ---- | -------- | -------------------- |
| `env/missing-image` | `degraded` | placeholder with alt text |
| `env/missing-audio` | `degraded` | silently skipped |
| `env/missing-video` | `degraded` | poster frame, else placeholder |
| `env/media-fallback-failed` | `warning` | platform default |
| `env/tts-unavailable` | `degraded` | silently skipped |
| `env/sensor-unavailable` | `degraded` | `world.has()` is `false` |
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

#### `style/` — Authoring hygiene (10)

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

#### `meta/` — The record stream itself (3)

| Code | Severity | What the reader gets |
| ---- | -------- | -------------------- |
| `meta/budget-exceeded` | `warning` | nothing — the record stream was truncated, not the story |
| `meta/above-conformance-level` | `degraded` | the feature is skipped |
| `meta/redacted` | `warning` | nothing — a record was suppressed, not content |

<!-- END GENERATED: fallback-table -->

### What a record may carry

A record may name an identifier the author wrote, quote what the author
literally typed, and describe the *type* of a runtime value. It may never carry
a runtime value.

That rule is enforced by the shape of the API, not by review: there is no
constructor that accepts a caller-supplied string. Quoted source is read back
out of the file at a position. So a failed `{set gold = "abc"}` may report
`"abc"`, because the author typed it into the file, while the same failure on a
value that arrived through `{input}` can only report a type name.

This binds the free-text and audio privacy guarantees of
[Section 19](03-narrative-interaction.md#_19-input-interaction) and
[Section 21](03-narrative-interaction.md#_21-real-world-interactions) to
diagnostic records too, not only to story state. A `{listen}` that fails to
match records that it failed to match — never what was said.

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

Rea does **not** have `try/catch`. All error handling is implicit — the runtime
recovers, the reader's experience is never interrupted, and the author reads the
record.

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
