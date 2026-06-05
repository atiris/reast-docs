# Vkladanie

Webový komponent `<reast-player>` funguje v ľubovoľnej HTML stránke alebo JavaScript frameworku.

## Vanilla HTML

```html
<!DOCTYPE html>
<html lang="sk">
  <head>
    <meta charset="UTF-8" />
    <title>Môj príbeh</title>
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

// Zaregistrovať custom element raz
import { registerPlayer } from '@reast/engine/player';
registerPlayer();

function StoryViewer({ src }: { src: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onChoice = (e: Event) => {
      console.log('Voľba:', (e as CustomEvent).detail);
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
// V komponente alebo app initializeri:
import { registerPlayer } from '@reast/engine/player';
registerPlayer();
```

```typescript
// V module alebo standalone komponente:
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

## Veľkosť

Player štandardne vypĺňa svoj kontajner. Veľkosť ovládate cez CSS:

```css
reast-player {
  width: 100%;
  max-width: 800px;
  height: 600px;
}
```

Pre celoobrazovkový čitateľský zážitok:

```css
reast-player {
  position: fixed;
  inset: 0;
  width: 100dvw;
  height: 100dvh;
}
```

## Viacero playerov

Na jednej stránke môžete vložiť viacero playerov. Každá inštancia je nezávislá:

```html
<reast-player src="./story-a.reast"></reast-player>
<reast-player src="./story-b.reast"></reast-player>
```
