# Getting Started

## Requirements

- Any modern browser (Chrome, Firefox, Safari, Edge)
- A `.reast` story file or `.rea` text file

## Installation

Choose one of three methods:

### CDN (zero setup)

Add a single script tag to your HTML:

```html
<script src="https://cdn.rea.st/engine/latest/reast-engine.iife.js"></script>
```

The script registers the `<reast-engine>` custom element automatically.

### ES Module (tree-shakeable)

```html
<script type="module">
  import { registerEngine } from 'https://cdn.rea.st/engine/latest/reast-engine.es.js';
  registerEngine();
</script>
```

### npm (bundled apps)

```bash
npm install @reast/engine
```

```typescript
import { registerEngine } from '@reast/engine/player';
registerEngine();
```

## First Story

Create a file called `hello.rea`:

```rea
# Welcome

Hello, reader! This is your first interactive story.

What do you want to do?

* Explore the garden
  You step into a sunlit garden. Flowers bloom everywhere.
* Enter the library
  Shelves of books stretch to the ceiling. Where do you begin?
```

Then embed it:

```html
<reast-engine src="./hello.rea"></reast-engine>
```

## Loading `.reast` Archives

For multi-part stories with metadata, use the `.reast` format (a ZIP archive containing a `manifest.json` and `.rea` story files in `story/`):

```html
<reast-engine src="./my-story.reast"></reast-engine>
```

The player handles extraction, manifest parsing, and part navigation automatically.

## Shadow DOM

The player uses Shadow DOM for complete style isolation. Your page's CSS will not affect the story rendering, and vice versa. To customise the player's appearance, use [CSS custom properties](theming).

## Events

The player emits custom events you can listen to:

```javascript
const player = document.querySelector('reast-engine');

player.addEventListener('rea-loaded', (e) => {
  console.log('Story loaded:', e.detail.title);
});

player.addEventListener('rea-choice', (e) => {
  console.log('Reader chose:', e.detail.label);
});

player.addEventListener('rea-complete', () => {
  console.log('Story finished');
});

player.addEventListener('rea-error', (e) => {
  console.error('Error:', e.detail.message);
});
```

See the [API Reference](api) for the full event list and detail shapes.
