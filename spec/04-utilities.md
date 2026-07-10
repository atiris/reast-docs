# Rea Language Specification — Part 4: Utilities (Sections 22–27)

> [Back to main specification](/)
>
> **Implementation status:** Sections 22–27 describe advanced features (pluralization & localization, content protection, captions, escaping, comments, error handling) that are specified but not yet implemented in the proof-of-concept parser. The error handling philosophy (graceful degradation) is followed in the parser design. See [REA-CHEATSHEET.md](REA-CHEATSHEET.md) for detailed status.

---

## 22. Pluralization & Localization

Rea provides built-in functions for grammatically correct text across all languages. These replace any need for custom condition syntax by leveraging CLDR plural rules and standard internationalization APIs.

> **Requirement:** the **host supplies the locale and formatting policy**. Plural
> and ordinal categories, number grouping and date/time styles are all resolved
> from CLDR via `Intl` for the host-supplied locale — the engine bakes in no
> per-language table. A story renders identically wherever a host declares the
> same locale.

### Pluralization with `plural()`

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

> **Implementation status:** `calendar()` is specified but not yet implemented.

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
logic. See [Extensibility](05-reference.md#31-extensibility) for the full rule.

To keep a secret out of an extension while still checking it, keep the function
generic and plaintext and put the secret in an **encrypted `.rea` chapter** via
`{set}`, then verify *against* that variable rather than embedding it:

```rea
{// extensions/gate.rext — plaintext, generic, holds no secret}
{function unlocked(given, expected) begin}
  {return given = expected}
{end function}
```

```rea
{// an encrypted .rea chapter carries the secret}
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

### Author comments (hidden from reader)

```rea
{// This is a single-line comment}

{comment begin}
  This is a multi-line comment.
  Readers never see this.
{end comment}
```

Single-line comments use `{// text}`. The `//` token causes the parser to ignore **everything** inside the braces — including any keywords like `begin`. For example, `{// this has begin at the end begin}` is still a valid single-line comment.

Multi-line comments use the `{comment begin}...{end comment}` block syntax, consistent with all other paired commands.

### TODO markers (compile-time warnings)

```rea
{todo: Write the battle scene here}
```

The platform/compiler shows these as warnings during development.

### Notes (development annotations)

```rea
{note: This section needs playtesting with 3+ readers}
```

---

## 27. Error Handling

### Error categories

Rea distinguishes three categories of errors:

| Category              | When detected    | Examples                                                                     |
| --------------------- | ---------------- | ---------------------------------------------------------------------------- |
| **Parse error**       | Before execution | Syntax errors, unclosed blocks, malformed metadata, invalid nesting          |
| **Runtime error**     | During execution | Undefined variable, division by zero, missing divert target, recursion limit |
| **Environment error** | During execution | Missing media file, sensor unavailable, network failure                      |

Parse errors are always reported before the story runs (in strict mode) or silently patched (in graceful mode). Runtime and environment errors occur during story execution and are subject to graceful degradation.

Rea does **not** have `try/catch`. All error handling is implicit — the runtime silently recovers, and the reader's experience is never interrupted. Authors see errors during testing (strict mode); readers never do.

### Graceful mode (default)

By default, Rea fails gracefully — the reader's experience is never broken:

| Error                              | Graceful behavior                                                                                               |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Undefined variable `{gold}`        | Renders as empty string (nothing shown)                                                                         |
| Invalid expression `{1 / 0}`       | Skipped silently                                                                                                |
| Missing image                      | Shows placeholder with alt text                                                                                 |
| Missing audio                      | Silently skipped, story continues                                                                               |
| Missing video                      | Poster frame shown if available, else placeholder                                                               |
| Missing voice/TTS                  | Silently skipped                                                                                                |
| Unclosed block `{if begin}` at EOF | Auto-closed at end of file                                                                                      |
| Unknown command `{magic}`          | Treated as print expression                                                                                     |
| Unknown host command `{ns.cmd a}`  | Treated as print expression (namespace not registered)                                                          |
| Sensor unavailable                 | `world.has("sensor")` returns `false`; see [Section 21](03-narrative-interaction.md#21-real-world-interactions) |

### Strict mode

Enable strict mode for development and testing:

```rea
{strict on}
```

**In strict mode, errors are shown as inline warnings** visible only to the author (in a preview/development view). Readers never see error messages — they always get graceful behavior.

Example strict mode warnings:

```text
⚠ Line 42: Undefined variable "goldd" — did you mean "gold"?
⚠ Line 87: Unclosed block command {if begin} opened at line 83
⚠ Line 15: Missing media "media/castle.jpg" — file not found in package
⚠ Line 63: Expression error in {1 / 0} — division by zero
⚠ Line 10: {use "extensions/missing"} — no such extension in the package
⚠ Line 25: Unknown function "bearing" — did you forget a {use}?
```

**Strict mode features:**

- Typo detection with suggestions (Levenshtein distance on variable/command names)
- Line numbers in all warnings
- Highlights unclosed blocks with the opening line reference
- Validates media references against the package manifest
- Validates `{use}` targets against the package's extensions

### Fallback values

Where it makes sense, syntax supports optional inline fallback values:

```rea
[!map < media/map.png, fallback="media/map-lowres.png"]
[?thunder < sounds/thunder.mp3, fallback="sounds/rain.mp3"]
```

If the primary resource fails, the fallback is used. If the fallback also fails, the platform applies its default graceful behavior (placeholder for images, silence for audio, etc.).

### External API access

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
