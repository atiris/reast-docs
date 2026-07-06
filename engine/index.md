# Reast Engine

The Reast Engine (`<reast-engine>`) is a web component that renders interactive Rea stories in any browser. It can be embedded on any website with a single script tag — no framework required.

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
- [Theming](theming) — CSS custom properties for visual customisation
- [Package Format](package-format) — The `.reast` archive layout and manifest schema
- [API Reference](api) — Attributes, events, JavaScript API
