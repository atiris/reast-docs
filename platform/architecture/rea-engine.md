# REA Engine Architecture

The `@reast/engine` package is a framework-agnostic, zero-dependency library for
processing and rendering REA interactive stories. It covers the full pipeline
from archive extraction and parsing to runtime execution and web-component-based
rendering.

## Package Structure

```text
packages/rea-engine/src/
├── parser/       # .rea source → AST
├── runtime/      # AST evaluation, expression engine, state
├── loader/       # .reast ZIP archive pipeline
├── player/       # Web component, DOM renderer, styles
├── validator/    # Static analysis and linting
├── errors.ts     # Domain-specific error classes
└── types.ts      # Shared type definitions
```

## Parser Pipeline

The parser is orchestrated by the `parseRea()` facade in `analyser.ts`. It
produces a `ReaDocument` (metadata + `ReaNode[]`) from raw `.rea` source text.

```text
Source text
  │
  ▼
┌──────────┐   ┌──────────────┐   ┌───────────────┐   ┌────────────────┐
│ B1 Lexer │──▶│ B2 Block     │──▶│ B2 Inline     │──▶│ B3 Post-       │
│          │   │    Parser    │   │    Parser     │   │    processor   │
└──────────┘   └──────────────┘   └───────────────┘   └────────────────┘
                                                             │
                                                             ▼
                                                       ReaDocument
```

1. **Lexer (B1)** — tokenizes raw source into block-level tokens (headings,
   choices, commands) using regex patterns from `parser-patterns.ts`.
2. **Block Parser (B2)** — consumes tokens to build a structural AST of
   `ReaNode[]`. Handles nesting (choices, if/for/while/switch blocks) and
   delegates command argument parsing.
3. **Inline Parser (B2)** — processes text within blocks for formatting (bold,
   italic, links, variable references `{var}`, footnotes) using a recursive
   marker-based approach.
4. **Post-processor (B3)** — assigns unique node IDs, calculates footnote
   numbering, and produces the final `ReaDocument`.

## Runtime Execution Model

The runtime lives in `src/runtime/` and centres on the `StoryEngine` class.

### StoryEngine

Manages the lifecycle of a story session. Maintains:

- **Variables** — sandboxed `Map<string, unknown>` storage.
- **Label index** — pre-scanned heading anchors and `{label}` targets for
  `{goto}` navigation.
- **Function registry** — user-defined `{function}` blocks with parameters and
  defaults.
- **Once-block tracking** — ensures `{once}` content displays at most once.
- **Used-choice tracking** — filters already-selected choices.

Key method: `evaluateConditionalBlocks(nodes)` recursively evaluates command
nodes (`if`, `for`, `while`, `switch`, `set`, `goto`, etc.) and returns the
resulting content nodes. Includes multiple safety limits:

- Max nodes produced per evaluation cycle
- Max steps per tick
- Max call depth (recursion guard)
- Wall-clock timeout with configurable deadline
- Expression result cache (per-cycle, with selective invalidation)

### Expression Evaluator

A custom recursive-descent parser (`ExprParser`) that evaluates arithmetic,
comparisons, ternary operators, string interpolation, array literals, and
function calls. Strict depth limit (64) prevents stack overflows.

### Built-in Functions

Registry of standard functions organised by domain:

- **Math**: `abs`, `ceil`, `floor`, `round`, `min`, `max`, `pow`, `sqrt`,
  `random`, `clamp`
- **String**: `len`, `upper`, `lower`, `trim`, `substr`, `replace`, `split`,
  `join`, `starts_with`, `ends_with`, `contains`, `repeat`, `pad_start`,
  `pad_end`, `char_at`, `index_of`
- **Array**: `push`, `pop`, `slice`, `reverse`, `sort`, `unique`, `flat`,
  `filter`, `map`, `find`, `count`, `sum`, `avg`, `range`
- **Type**: `type`, `to_number`, `to_string`, `to_bool`, `is_number`,
  `is_string`, `is_bool`, `is_array`
- **Locale**: `format_number`, `format_date`

Each function validates argument count and types via a strict schema.

## Loader Pipeline

Handles the `.reast` archive format (a ZIP containing `.rea` files, media, and
a `reast.json` manifest). Orchestrated by `loadReast()`.

```text
ArrayBuffer (.reast ZIP)
  │
  ▼
┌────────────┐   ┌────────────┐   ┌─────────────┐   ┌──────────┐
│ Extractor  │──▶│ Decryptor  │──▶│ Manifestor  │──▶│ Mapper   │
│ (unzip)    │   │ (optional) │   │ (reast.json)│   │ (blob:)  │
└────────────┘   └────────────┘   └─────────────┘   └──────────┘
                                                          │
                                              ┌───────────┤
                                              ▼           ▼
                                        Integrity    LoaderResult
                                        (SHA-256)
```

1. **Extractor** — unpacks ZIP with security checks (size limits, max file
   count, path traversal prevention).
2. **Decryptor** — optional AES-GCM decryption via Web Crypto API.
3. **Manifestor** — reads and validates `reast.json` (metadata, entry point,
   required capabilities).
4. **Mapper** — converts archive paths to `blob:` URLs for media elements.
5. **Integrity** — SHA-256 hash verification (parallel) against manifest-
   declared hashes.

## Player Architecture

The player provides a framework-agnostic rendering surface as a web component.

### Web Component

`<reast-player>` is a Custom Element v1 with Shadow DOM for style isolation.
Accepts story content via the `content` attribute (raw `.rea` text) or
programmatically via `.loadStory()`. Dispatches custom events:

- `rea-loaded` — content rendered
- `rea-choice` — user selected a choice option
- `rea-complete` — story reached an endpoint (no choices remain)

### DOM Renderer

Stateless function (`renderNodes`) that converts `ReaNode[]` into semantic
HTML with CSS class hooks (`rp-paragraph`, `rp-dialogue`, `rp-choices`, etc.).
Features:

- Accessible choice groups with ARIA listbox pattern and keyboard navigation
- Media elements with lazy loading and error fallback placeholders
- Safe URI enforcement for all links and media sources

### Event Bus

Central communication hub for the host application to subscribe to runtime
events (variable changes, navigation, errors, speech synthesis triggers).

### Flow Navigator (TunnelStack)

Manages subroutine-like navigation within stories. The `TunnelStack` maintains
a stack of return indices, allowing `{tunnel}` commands to jump to a label and
automatically return to the caller when the target section completes.

- **Push** — saves the current position as a return point before jumping.
- **Pop** — restores the saved position when the tunnel section ends.
- **Depth limit** — configurable `maxDepth` (from `runtime-constants.ts`)
  prevents infinite recursion. Overflow produces a `RUNTIME_TUNNEL_OVERFLOW`
  error.

This pattern enables reusable story segments (e.g., a shop menu, a dialogue
branch) that can be called from multiple points without duplicating content.

### Safety Limits

The runtime enforces multiple budgets to prevent runaway execution:

| Limit                | Default | Purpose                          |
| -------------------- | ------- | -------------------------------- |
| `MAX_CALL_DEPTH`     | 64      | Function/eval recursion guard    |
| `MAX_STEPS_PER_TICK` | 100,000 | Infinite-loop guard per tick     |
| `MAX_TUNNEL_DEPTH`   | 128     | Tunnel stack overflow prevention |
| `MAX_STRING_LENGTH`  | 100,000 | String concatenation limit       |

### Theming

CSS custom properties on the `<reast-player>` element or any ancestor:

- `--rp-color-bg`, `--rp-color-text`, `--rp-color-accent`
- `--rp-font-body`, `--rp-font-heading`
- `--rp-spacing`, `--rp-border-radius`

## CDN Distribution

Two build targets for direct browser use (no bundler required):

- **ESM** (`rea-engine.esm.js`) — for `import` in modern apps.
- **IIFE** (`rea-engine.iife.js`) — for `<script>` tags; auto-registers the
  `<reast-player>` component and exposes `window.ReaEngine`.

Bundle sizes: ESM ~27 kB gzip, IIFE ~24 kB gzip. Only dependency: `fflate`
(ZIP decompression, bundled).

## Validator

Static analysis tool that checks `.rea` source for:

- Unreachable labels (never referenced by any `{goto}`)
- Undefined variable references
- Unclosed blocks (if/for/while/switch)
- Choice depth consistency
- Expression syntax errors

## Type System

Key interfaces from `types.ts`:

| Interface       | Purpose                                                |
| --------------- | ------------------------------------------------------ |
| `ReaDocument`   | Root: metadata + `ReaNode[]` + parse warnings          |
| `ReaNode`       | Block-level element (paragraph, command, media, etc.)  |
| `ReaInline`     | Inline text segment (text, bold, link, variable, etc.) |
| `ReastManifest` | Archive config (title, parts, integrity, capabilities) |

## Security Features

The engine is designed for untrusted content:

- **Expression sandboxing** — custom evaluator, no `eval()` or `new Function()`
- **Resource limits** — string length, array size, recursion depth, execution
  steps, and wall-clock timeout
- **Prototype pollution protection** — `isDangerousVarName()` blocks
  `__proto__`, `constructor`, `prototype` and dunder methods at all mutation
  points
- **URI safety** — `isSafeUri()` restricts links/media to `http:`, `https:`,
  `mailto:`, `tel:`, `blob:` and validated `data:` media prefixes
- **Archive security** — path traversal prevention, decompressed size limits,
  max file count enforcement
