# Embedding

The `<reast-player>` web component works in any HTML page or JavaScript framework.

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
    <reast-player src="./story.reast"></reast-player>
  </body>
</html>
```

## React

```tsx
import { useEffect, useRef } from 'react';

// Register the custom element once
import { registerPlayer } from '@reast/engine/player';
registerPlayer();

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

  return <reast-player ref={ref} src={src} />;
}
```

## Vue

```vue
<template>
  <reast-player :src="storySrc" @rea-choice="onChoice" />
</template>

<script setup lang="ts">
import { registerPlayer } from '@reast/engine/player';
registerPlayer();

const storySrc = './story.reast';
const onChoice = (e: CustomEvent) => console.log(e.detail);
</script>
```

## Angular

```typescript
// In your component or app initializer:
import { registerPlayer } from '@reast/engine/player';
registerPlayer();
```

```typescript
// In your module or standalone component:
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';

@Component({
  selector: 'app-story',
  template: `<reast-player [attr.src]="src"></reast-player>`,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StoryComponent {
  src = './story.reast';
}
```

## Sizing

By default, the player fills its container. Control its size with CSS:

```css
reast-player {
  width: 100%;
  max-width: 800px;
  height: 600px;
}
```

For a full-page reader experience:

```css
reast-player {
  position: fixed;
  inset: 0;
  width: 100dvw;
  height: 100dvh;
}
```

## Multiple Players

You can embed multiple players on the same page. Each instance is independent:

```html
<reast-player src="./story-a.reast"></reast-player>
<reast-player src="./story-b.reast"></reast-player>
```
