# Reast Player

The Reast Player (`<reast-player>`) is a web component that renders interactive Rea stories in any browser. It can be embedded on any website with a single script tag — no framework required.

## Quick Start

### CDN (simplest)

```html
<script src="https://cdn.rea.st/player/latest/reast-player.iife.js"></script>
<reast-player src="https://example.com/my-story.reast"></reast-player>
```

### ES Module

```html
<script type="module">
  import { registerPlayer } from 'https://cdn.rea.st/player/latest/reast-player.es.js';
  registerPlayer();
</script>
<reast-player src="./my-story.reast"></reast-player>
```

### npm

```bash
npm install @reast/engine
```

```typescript
import { registerPlayer } from '@reast/engine/player';
registerPlayer(); // registers <reast-player> custom element
```

> **Note:** The `@reast/engine/player` subpath uses browser APIs (`CSSStyleSheet`, `HTMLElement`). Import it only in browser environments — not from Node.js or SSR contexts.

## Sections

- [Getting Started](getting-started) — Setup and first story
- [Embedding](embedding) — Framework integration (React, Vue, Angular, vanilla)
- [Theming](theming) — CSS custom properties for visual customisation
- [API Reference](api) — Attributes, events, JavaScript API
