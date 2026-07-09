# Getting Started

## What the engine is

`@reast/engine` is a framework-agnostic library plus a `<reast-engine>` custom
element that loads, parses, evaluates and renders a Rea interactive story in a
browser. The standalone build is roughly 57 KB gzipped and has zero runtime
dependencies — one, `fflate`, is used only to unpack the `.reast` ZIP.

### What it does

The engine runs a four-stage pipeline:

- **Loader** — unpacks the `.reast` archive: extracts files, reads the
  manifest, maps embedded media to in-memory blob URLs, compiles `.rext`
  extensions.
- **Parser** — turns `.rea` source into an AST (`ReaDocument`).
- **Runtime** — evaluates variables, conditions, choices and flow.
- **Player** — renders accessible, semantic DOM with a typewriter reveal.

### What it deliberately does not do

This is the part embedders most need to know up front. The engine never touches
a device, storage or network API outside the standalone build. It *requests* a
capability by emitting an event and *receives* the answer as a variable —
asking for the permission is always the host's job. It emits semantics, not
looks: it decides that something *is* a level-2 heading; the host decides what
that looks like. It ships no lightbox, no media-player chrome, no persistence,
no auth. Those are the host's to supply — see [Embedding](embedding) and
[Extending](extending).

### Who this is for

If you just want to publish a story, the [CDN snippet](#cdn-zero-setup) below is
all you need. If you are a platform integrating the engine into a larger app,
read [Embedding](embedding) and [Extending](extending).

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

player.addEventListener('rea-loaded', () => {
  console.log('Story loaded and rendered');
});

player.addEventListener('rea-metadata', (e) => {
  console.log('Title:', e.detail.title);
});

player.addEventListener('rea-choice', (e) => {
  console.log('Reader chose option', e.detail.index, 'of group', e.detail.nodeId);
});

player.addEventListener('rea-complete', () => {
  console.log('Story finished');
});

player.addEventListener('rea-error', (e) => {
  console.error('Error:', e.detail.message);
});
```

See the [API Reference](api) for the full event list and detail shapes.
