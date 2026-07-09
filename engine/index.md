# Reast Engine

The Reast Engine (`<reast-engine>`) is a framework-agnostic library plus a web component that loads, parses, evaluates and renders interactive Rea stories in any browser. It can be embedded on any website with a single script tag — no framework required. The standalone build is roughly 57 KB gzipped with zero runtime dependencies (one, `fflate`, unpacks the ZIP).

It runs the pipeline **Loader → Parser → Runtime → Player**. It deliberately touches no device, storage or network API outside the standalone build: it *requests* a capability by emitting an event and receives the answer as a variable, and it emits semantics rather than looks. It ships no lightbox, media chrome, persistence or auth — those belong to the host.

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
