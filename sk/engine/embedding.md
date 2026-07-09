# Vkladanie

Webový komponent `<reast-engine>` funguje v ľubovoľnej HTML stránke alebo JavaScript frameworku.

## Zodpovednosti hostiteľa

Engine emituje sémantiku a vyžiada si schopnosti; svet okolo neho dodáva
hostiteľ. Platforma integrujúca engine zodpovedá za:

- **Povolenia a eventy schopností.** Engine nikdy nevolá `navigator.*`. Emituje
  eventy runtime zbernice (`vibrate`, `location-start`, `speak`, `notify`, …) na
  `element.events`; hostiteľ si vypýta súhlas používateľa a odpovie zavolaním
  `updateLocation()` alebo `importVariables()`.
- **Prehliadač médií.** Engine nevykresľuje žiadny lightbox ani chrome
  prehrávača. Počúvajte `rea-media-activate`, otvorte vlastný
  prehliadač/prehrávač a zavolajte `preventDefault()`.
- **Locale.** Dodajte `locale` (atribút alebo vlastnosť), keď poznáte jazyk
  čitateľa; inak sa použije metadátum príbehu, potom `<html lang>`, potom `en`.
- **Perzistenciu.** Nič sa neukladá automaticky. Zavolajte `exportState()` a
  výsledok uložte; obnovte ho cez `importState()`.
- **Štýlovanie.** Témujte cez CSS custom properties `--re-*` (pozri
  [Témy](theming)).
- **Vyhýbanie sa dvojitému parsovaniu.** Ak vaša aplikácia príbeh už parsuje,
  odovzdajte sparsovaný dokument namiesto surového textu (pozri nižšie).

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
    <reast-engine src="./story.reast"></reast-engine>
  </body>
</html>
```

## React

```tsx
import { useEffect, useRef } from 'react';

// Zaregistrovať custom element raz
import { registerEngine } from '@reast/engine/player';
registerEngine();

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
// V komponente alebo app initializeri:
import { registerEngine } from '@reast/engine/player';
registerEngine();
```

```typescript
// V module alebo standalone komponente:
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

## Odovzdanie sparsovaného dokumentu

Naviazanie atribútu `content` prinúti element text sparsovať. Hostiteľ, ktorý má
príbeh *už* sparsovaný (pre súhlasovú bránu, SEO alebo offline cache), by mal
odovzdať `ReaDocument` priamo — element ho vykreslí bez druhého parsovania:

```ts
import { parseRea } from '@reast/engine/parser';
import { loadReast } from '@reast/engine/loader';

const result = await loadReast(buffer);
const doc = parseRea(new TextDecoder().decode(result.files.get(result.mainStory)!));

const engine = document.querySelector('reast-engine')!;
// Nastavte tieto PRED `document`, aby sa archívne médiá a {use} rozlíšili:
engine.mediaMap = result.mediaMap;
engine.extensions = result.extensions;
engine.manifest = result.manifest;
engine.document = doc; // vykreslí — bez opätovného parsovania
```

`content` použite iba vtedy, keď hostiteľ nemá vlastný parser.

## Médiá

Archívne médiá loader extrahuje do `blob:` object URL, takže hostiteľ, ktorý
dostane `src` v `rea-media-activate`, už drží bajty — sťahovanie alebo galéria
nestoja **žiadny sieťový round-trip**:

```ts
engine.addEventListener('rea-media-activate', (e) => {
  const { kind, src, path, alt } = e.detail;
  e.preventDefault();          // potlačí predvolený (iba CDN) lightbox
  openHostViewer(kind, src, alt, path);
});
```

Nastavte `media-controls="none"`, aby ste potlačili natívne ovládanie
`<video>`/`<audio>` enginu a mohli dodať vlastný prehrávač; predvolené je
`native`. Pri `none` sa video a audio stanú cieľmi aktivácie, ktoré tiež
reportujú cez `rea-media-activate`.

Na vymenovanie každého mediálneho uzla vopred — vrátane tých vnorených vo
vetvách volieb, stavových automatoch a hookoch kariet — zavolajte
`collectMedia(document)`:

```ts
import { collectMedia } from '@reast/engine';

for (const ref of collectMedia(engine.document!)) {
  // ref: { kind, path, alt }
}
```

## Veľkosť

Player štandardne vypĺňa svoj kontajner. Veľkosť ovládate cez CSS:

```css
reast-engine {
  width: 100%;
  max-width: 800px;
  height: 600px;
}
```

Pre celoobrazovkový čitateľský zážitok:

```css
reast-engine {
  position: fixed;
  inset: 0;
  width: 100dvw;
  height: 100dvh;
}
```

## Viacero playerov

Na jednej stránke môžete vložiť viacero playerov. Každá inštancia je nezávislá:

```html
<reast-engine src="./story-a.reast"></reast-engine>
<reast-engine src="./story-b.reast"></reast-engine>
```
