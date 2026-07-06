# Začíname

## Požiadavky

- Ľubovoľný moderný prehliadač (Chrome, Firefox, Safari, Edge)
- Súbor s príbehom `.reast` alebo textový súbor `.rea`

## Inštalácia

Vyberte si jednu z troch metód:

### CDN (bez nastavovania)

Pridajte jediný script tag do HTML:

```html
<script src="https://cdn.rea.st/engine/latest/reast-engine.iife.js"></script>
```

Skript automaticky zaregistruje custom element `<reast-engine>`.

### ES Module (tree-shakeable)

```html
<script type="module">
  import { registerEngine } from 'https://cdn.rea.st/engine/latest/reast-engine.es.js';
  registerEngine();
</script>
```

### npm (pre bundlované aplikácie)

```bash
npm install @reast/engine
```

```typescript
import { registerEngine } from '@reast/engine/player';
registerEngine();
```

## Prvý príbeh

Vytvorte súbor `hello.rea`:

```rea
# Vitajte

Ahoj, čitateľ! Toto je tvoj prvý interaktívny príbeh.

Čo chceš robiť?

* Preskúmať záhradu
  Vstúpiš do slnečnej záhrady. Kvety kvitnú všade okolo.
* Vojsť do knižnice
  Regály s knihami siahajú až po strop. Kde začneš?
```

Potom ho vložte:

```html
<reast-engine src="./hello.rea"></reast-engine>
```

## Načítanie `.reast` archívov

Pre viacdielne príbehy s metadátami použite formát `.reast` (ZIP archív obsahujúci `manifest.json` a `.rea` súbory v adresári `story/`):

```html
<reast-engine src="./my-story.reast"></reast-engine>
```

Player sa automaticky postará o extrakciu, parsovanie manifestu a navigáciu medzi časťami.

## Shadow DOM

Player používa Shadow DOM pre úplnú izoláciu štýlov. CSS vašej stránky neovplyvní vykresľovanie príbehu a naopak. Na prispôsobenie vzhľadu playera použite [CSS custom properties](theming).

## Udalosti

Player emituje custom udalosti, na ktoré môžete počúvať:

```javascript
const player = document.querySelector('reast-engine');

player.addEventListener('rea-loaded', (e) => {
  console.log('Príbeh načítaný:', e.detail.title);
});

player.addEventListener('rea-choice', (e) => {
  console.log('Čitateľ si vybral:', e.detail.label);
});

player.addEventListener('rea-complete', () => {
  console.log('Príbeh dokončený');
});

player.addEventListener('rea-error', (e) => {
  console.error('Chyba:', e.detail.message);
});
```
