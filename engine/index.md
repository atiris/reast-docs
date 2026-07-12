# Reast Engine

The Reast Engine (`<reast-engine>`) is a framework-agnostic library plus a web component that loads, parses, evaluates and renders interactive [Rea](/spec/) stories in any browser. It can be embedded on any website with a single script tag — no framework required. The standalone build is roughly 57 KB gzipped with zero runtime dependencies (one, `fflate`, unpacks the ZIP).

## Who this is for

This section is for two audiences, distinct from the [Platform](/platform/) docs:

- **Embedders** — anyone dropping a story into an existing website or app: a blog post, a game's dialogue system, an internal tool. Start at [Embedding](embedding).
- **Self-hosters** — anyone running the engine (and optionally the platform) on their own infrastructure instead of rea.st. Start at [Getting Started](getting-started) and the [API Reference](api).

If you're writing a story rather than embedding a player, see the platform's [Story Design](/platform/design/) guide instead — this section documents the engine that renders stories, not how to author one.

## What the engine does — and does not do

It runs the pipeline **Loader → Parser → Runtime → Player**. It deliberately touches no device, storage or network API outside the standalone build: it *requests* a capability by emitting an event and receives the answer as a variable, and it emits semantics rather than looks. It ships no lightbox, media chrome, persistence or auth — those belong to the host.

Concretely, the engine has **no accounts, no hosting, and no editor**: it does not know what a user is, does not store or serve `.reast` files (you point it at a URL or feed it a `File`/`Blob`), and does not provide any UI for writing or packaging stories. Those are the platform's job — see [rea.st](https://rea.st) or self-host the platform alongside the engine.

## Quick Start

### CDN (simplest)

```html
<script src="https://cdn.rea.st/engine/latest/reast-engine.iife.js"></script>
<reast-engine src="https://example.com/my-story.reast"></reast-engine>
```

### ES Module

```html
<script type="module">
  import { registerEngine } from 'https://cdn.rea.st/engine/latest/reast-engine.es.js';
  registerEngine();
</script>
<reast-engine src="./my-story.reast"></reast-engine>
```

### npm

```bash
npm install @reast/engine
```

```typescript
import { registerEngine } from '@reast/engine/player';
registerEngine(); // registers <reast-engine> custom element
```

> **Note:** The `@reast/engine/player` subpath uses browser APIs (`CSSStyleSheet`, `HTMLElement`). Import it only in browser environments — not from Node.js or SSR contexts.

## Sections

- [Getting Started](getting-started) — Setup and first story
- [Embedding](embedding) — Framework integration (React, Vue, Angular, vanilla)
- [Extending](extending) — Rea extensions (`.rext`) for authors, host extensions for embedders
- [Theming](theming) — CSS custom properties for visual customisation
- [Package Format](package-format) — The `.reast` archive layout and manifest schema
- [API Reference](api) — Attributes, events, JavaScript API
