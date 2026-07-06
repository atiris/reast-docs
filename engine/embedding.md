# Embedding

The `<reast-engine>` web component works in any HTML page or JavaScript framework.

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
