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
{plural(story.player.gold, zero="no coins", one="{} coin", other="{} coins")}
```

For 0: "no coins", for 1: "1 coin", for 5: "5 coins". The `{}` placeholder inserts the count value.

**Slovak (4 categories):**

```rea
{plural(story.pens, one="{} pero", few="{} perá", other="{} pier")}
```

For 1: "1 pero", for 3: "3 perá", for 5: "5 pier".

::: warning A `{}` template belongs in prose, not in `{set}` Write the call where you want its text ([print shorthand](02-logic-data#print-shorthand)):

```rea
You have {plural(story.player.gold, one="{} coin", other="{} coins")}.
```

A `{set}` cannot hold a `{}` placeholder: the `{set}` block ends at the first `}` it meets, which is the one inside your template. If you do need the word in a variable, leave the placeholder out and join the count yourself:

```rea
{set story.coin_word = plural(story.player.gold, one="coin", other="coins")}
You have {story.player.gold} {story.coin_word}.
```

:::

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
{select(story.player.pronoun, he="He draws his sword", she="She draws her sword", other="They draw their sword")}
```

`other` is the fallback for unmatched values.

**Role-based variation:**

```rea
{select(story.player.class, warrior="You swing your blade", mage="You cast a spell", other="You act")}
```

### Number formatting with `formatNumber()`

<Feature id="format-number" />

The `formatNumber()` function delegates to locale-aware number formatting (`Intl.NumberFormat`). It defaults to the **host-supplied engine locale**; an optional second positional argument overrides it with a specific BCP 47 tag:

```rea
Score: {formatNumber(story.player.score)}
Localised: {formatNumber(1234567, "sk")}
```

| Parameter                | Values                            | Default        |
| ------------------------ | --------------------------------- | -------------- |
| _(2nd positional)_       | BCP 47 locale tag                 | engine locale  |
| `style`                  | `decimal`, `percent`, `currency`  | `decimal`      |
| `currency`               | ISO 4217 code (e.g. `EUR`, `USD`) | —              |
| `minimumFractionDigits`  | integer (minimum decimal digits)  | `Intl` default |
| `maximumFractionDigits`  | integer (maximum decimal digits)  | `Intl` default |

Grouping (thousands separators), decimal count and symbols follow the locale's CLDR data. On any `Intl` error (malformed tag, invalid option combination) the value falls back to its plain string form.

```rea
Price: {formatNumber(item.price, style="currency", currency="EUR")}
Chance: {formatNumber(hit_rate, style="percent")}
Distance: {formatNumber(meters, maximumFractionDigits=1)} m
```

### Fantasy calendars with `calendar()`

<Feature id="calendar" />

The `calendar()` function maps real date components to custom names — perfect for fantasy world-building:

```rea
The month of {calendar(context.time.date, month="Frost,Bloom,Fire,Rain,Wind,Sun,Storm,Harvest,Mist,Shadow,Ice,Star")}
```

For January: "Frost", for March: "Fire", for December: "Star".

| Parameter | Description                                          |
| --------- | ---------------------------------------------------- |
| `month`   | Comma-separated list of 12 month names               |
| `weekday` | Comma-separated list of 7 day names (Monday = first) |
| `era`     | Expression defining era calculation                  |

```rea
Day of {calendar(context.time.date, weekday="Moonday,Fireday,Waterday,Earthday,Windday,Lightday,Darkday")},
{calendar(context.time.date, month="Frost,Bloom,Fire,Rain,Wind,Sun,Storm,Harvest,Mist,Shadow,Ice,Star")} the
{ordinal(context.time.day)}.
```

### Ordinal numbers with `ordinal()`

<Feature id="ordinal" />

```rea
You finished in {ordinal(story.race.position)} place.
```

The ordinal category (one/two/few/other) comes from `Intl.PluralRules(locale, { type: "ordinal" })` for the host-supplied locale. Without named args, `ordinal()` appends the English suffixes `st`/`nd`/`rd`/`th` **only for `en*` locales**; every other locale receives the locale-formatted number with no suffix, because `Intl` carries no ordinal spell-out data and inventing suffixes per language would be wrong. Authors who want suffixes in another language pass per-category templates, where `{}` is replaced by the formatted number:

```rea
{ordinal(story.race.position, one="{}.", other="{}.")}
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
{lock condition="story.player.level >= 10 and story.player.has_dragon_scale" begin}
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

Content protection covers **prose only**. The loader rejects an encrypted `.rext` extension outright. Encryption is content protection, not a security boundary — the sandbox constrains an extension identically whether or not its source is encrypted — so forbidding it costs nothing defensively and buys three things: code is validated **before** prose runs (an unlock code can arrive mid-story, and code that materialises after the reader is committed fails at the worst moment); code is **auditable without a key** (`reast validate`, the editor, platform moderation); and a third-party embedder without the key can still run the story's logic. See [Extensibility](05-reference.md#_31-extensibility) for the full rule.

To keep a secret out of an extension while still checking it, keep the function generic and plaintext and put the secret in an **encrypted `.rea` chapter** via `{set}`, then verify *against* that variable rather than embedding it:

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

The caveat, stated plainly: an encrypted `.rea` is **not** a secret from a determined reader. The key reaches their device in order to render the chapter, so `crypt.passphrase` is extractable. It protects against spoilers, casual peeking and grepping the archive — not against a motivated attacker. Anything that must be genuinely unforgeable (a competition answer, a paid unlock) has to be verified **server-side** (see [Hard lock](#hard-lock)), which is the platform's job, not the engine's.

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

A comment's content is bare prose up to the closing brace — no quotes. Only the exact `{comment begin}` opens a block, so the word `begin` inside a comment is just a word: `{comment fix this before we begin}` is a single-line comment.

Multi-line comments use the `{comment begin}...{end comment}` block syntax, consistent with all other paired commands.

### TODO markers

<Feature id="todo" />

```rea
{todo Write the battle scene here}

{todo begin}
  Rewrite the ending.
  Then the middle.
{end todo}
```

A TODO is a comment that reports itself: it is hidden from the reader exactly like `{comment}`, and it raises `style/todo` on the author channel, so `reast validate` and the editor list every one of them. Like a comment, its content is bare prose and only `{todo begin}` opens a block.

---

## 27. Error Handling

The two-channel error model — reader-facing silent fallbacks versus author-facing diagnostic records, severities, code partitions, the generated fallback table, and external API access — now has its own page: see [Error Handling](/spec/error-handling).

---

## 28. The single-file story {#the-single-file-story}

<Feature id="single-file" />

A story arrives in exactly one of two shapes, and each has its own rule for where metadata and assets live:

- **A `.reast` archive.** `manifest.json` is mandatory and is the only place metadata lives; assets live under `assets/`. No `.rea` file inside an archive may declare a manifest
- **A single `.rea` file** handed straight to the engine — written in another editor, mailed, committed to a repository — may declare its own metadata and carry its own images, audio and fonts inline. Everything a `.reast` holds can be expressed in one text file

### `{define manifest}` — first command or nothing {#define-manifest-first-command-or-nothing}

<Feature id="define-manifest" />

```rea
{define manifest type="story", title="The Last Lantern", language="sk", genre="mystery",
                 audience_min=12, audience_max=99, version="1.0.0"}

# The first chapter

The story begins here.
```

The block is read **only as the first command of the file**. Anywhere else it is ignored — a `.rea` fragment pasted into another file should carry no metadata rather than fail — and the author is told why. That rule is what keeps the concession safe: a tool decides whether a file has metadata by reading its opening command and stopping, so `.rea` stays trivially scannable, and there is never a second manifest three screens down to disagree with the first.

The attributes are the `manifest.json` fields flattened to scalars. Comma lists (`tags`, `author`, `sensors`) become lists; the age range flattens to `audience_min` / `audience_max`; there is no `parts` array, because the file *is* the part. A single file with no manifest stays valid — it has no title, which is what it has today.

### `{define file}` — carrying assets inline {#define-file-carrying-assets-inline}

<Feature id="define-file" />

```rea
{define file "assets/cards/card-role-king.webp" mime="image/webp", encoding="base64" begin}
UklGRuYAAABXRUJQVlA4IN...
{end file}
```

**The identifier is the path.** A `{define file}` declares the archive-relative path the file would occupy inside a `.reast`, so every existing reference works unchanged in both shapes:

```rea
[!The King < assets/cards/card-role-king.webp]
{define card king image="assets/cards/card-role-king.webp" begin} … {end card}
```

No second reference syntax, no `file://` scheme, no rewriting a story when it moves between shapes. Converting a `.reast` into one file is inlining every asset; converting back is writing each one out to its path.

| Attribute      | Meaning                                                                                                                  | Default                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| *(positional)* | The archive-relative path this file would occupy, quoted                                                                 | required                    |
| `mime`         | Content type, so the host does not guess from the extension                                                              | inferred from the extension |
| `encoding`     | `base64` for binary, `text` for anything that should stay readable and diffable (SVG, JSON, `.rext`, an embedded `.rea`) | `base64`                    |

- **The body is verbatim**, lexed the way [`{raw}`](#raw-blocks) is: never scanned for commands, never `{variable}`-substituted, nothing to escape. Base64 carries no braces, but an embedded SVG or `.rext` does
- **A declared path shadows nothing.** Two declarations of one path is two sources of truth for one asset, and it is reported rather than silently resolved
- **Position is free, convention is last.** A parser skips a file body without interpreting it, so a large blob in the middle of a story does not stall the streaming path; putting them at the end is a convention, not a rule
- **One budget for the whole document, 50 MB.** There is no per-file limit — an embedded asset may be any size while the document fits. Base64 costs a third more than the bytes it carries; a document over the budget is refused rather than left to exhaust a phone
- **Embedded media is media.** It is listed by the media enumeration and counted in the content fingerprint, so offline prefetch and dedup never conclude that a story with its assets inside it has none

---
