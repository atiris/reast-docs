# Embedding

The `<reast-engine>` web component works in any HTML page or JavaScript
framework.

## Host responsibilities

The engine emits semantics and requests capabilities; the host supplies the
world around it. A platform integrating the engine is responsible for:

- **Permissions and capability events.** The engine never calls `navigator.*`.
  It emits runtime bus events (`vibrate`, `location-start`, `speak`, `notify`,
  …) on `element.events`; the host asks the user for consent and answers by
  calling `updateLocation()` or `importVariables()`.
- **The media viewer.** The engine renders no lightbox or player chrome. Listen
  for `rea-media-activate`, open your own viewer/player, and call
  `preventDefault()`.
- **Locale.** Supply `locale` (attribute or property) when you know the reader's
  language; otherwise it falls back to the story metadata, then `<html lang>`,
  then `en`.
- **Persistence.** Nothing is saved automatically. Call `exportState()` and
  store the result; restore it with `importState()`.
- **Styling.** Theme through the `--re-*` CSS custom properties (see
  [Theming](theming)).
- **Avoiding a double parse.** If your app already parses the story, hand the
  parsed document over instead of the raw text (see below).

## Vanilla HTML

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My Story</title>
  </head>
  <body>
    <script src="https://cdn.rea.st/engine/latest/reast-engine.iife.js"></script>
    <reast-engine src="./story.reast"></reast-engine>
  </body>
</html>
```

## React

```tsx
import { useEffect, useRef } from 'react';

// Register the custom element once
import { registerEngine } from '@reast/engine/player';
registerEngine();

function StoryViewer({ src }: { src: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onChoice = (e: Event) => {
      console.log('Choice:', (e as CustomEvent).detail);
    };
    el.addEventListener('rea-choice', onChoice);
    return () => el.removeEventListener('rea-choice', onChoice);
  }, []);

  return <reast-engine ref={ref} src={src} />;
}
```

## Vue

```vue
<template>
  <reast-engine :src="storySrc" @rea-choice="onChoice" />
</template>

<script setup lang="ts">
import { registerEngine } from '@reast/engine/player';
registerEngine();

const storySrc = './story.reast';
const onChoice = (e: CustomEvent) => console.log(e.detail);
</script>
```

## Angular

```typescript
// In your component or app initializer:
import { registerEngine } from '@reast/engine/player';
registerEngine();
```

```typescript
// In your module or standalone component:
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';

@Component({
  selector: 'app-story',
  template: `<reast-engine [attr.src]="src"></reast-engine>`,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StoryComponent {
  src = './story.reast';
}
```

## Handing over a parsed document

Binding the `content` attribute makes the element parse the text. A host that
has *already* parsed the story (for a consent gate, SEO, or an offline cache)
should hand the `ReaDocument` over directly — the element renders it without a
second parse:

```ts
import { parseRea } from '@reast/engine/parser';
import { loadReast } from '@reast/engine/loader';

const result = await loadReast(buffer);
const doc = parseRea(new TextDecoder().decode(result.files.get(result.mainStory)!));

const engine = document.querySelector('reast-engine')!;
// Set these BEFORE `document` so archive media and {use} resolve:
engine.mediaMap = result.mediaMap;
engine.extensions = result.extensions;
engine.manifest = result.manifest;
engine.document = doc; // renders — no re-parse
```

Use `content` only when the host has no parser of its own.

## Media

Archive media is extracted to `blob:` object URLs by the loader, so a host that
receives a `src` in `rea-media-activate` already holds the bytes — a download or
a gallery costs **no network round-trip**:

```ts
engine.addEventListener('rea-media-activate', (e) => {
  const { kind, src, path, alt } = e.detail;
  e.preventDefault();          // suppress the default (CDN-only) lightbox
  openHostViewer(kind, src, alt, path);
});
```

Set `media-controls="none"` to suppress the engine's native `<video>`/`<audio>`
controls so you can supply your own player; the default is `native`. Under
`none`, video and audio become activation targets that report through
`rea-media-activate` too.

To enumerate every media node up front — including ones nested in choice
branches, state machines and card hooks — call `collectMedia(document)`:

```ts
import { collectMedia } from '@reast/engine';

for (const ref of collectMedia(engine.document!)) {
  // ref: { kind, path, alt }
}
```

## Sizing

By default, the player fills its container. Control its size with CSS:

```css
reast-engine {
  width: 100%;
  max-width: 800px;
  height: 600px;
}
```

For a full-page reader experience:

```css
reast-engine {
  position: fixed;
  inset: 0;
  width: 100dvw;
  height: 100dvh;
}
```

## Multiple Players

You can embed multiple players on the same page. Each instance is independent:

```html
<reast-engine src="./story-a.reast"></reast-engine>
<reast-engine src="./story-b.reast"></reast-engine>
```
