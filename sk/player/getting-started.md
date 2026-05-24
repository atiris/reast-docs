# Začíname

## Požiadavky

- Ľubovoľný moderný prehliadač (Chrome, Firefox, Safari, Edge)
- Súbor s príbehom `.reast` alebo textový súbor `.rea`

## Inštalácia

Vyberte si jednu z troch metód:

### CDN (bez nastavovania)

Pridajte jediný script tag do HTML:

```html
<script src="https://cdn.rea.st/player/latest/reast-player.iife.js"></script>
```

Skript automaticky zaregistruje custom element `<reast-player>`.

### ES Module (tree-shakeable)

```html
<script type="module">
  import { registerPlayer } from 'https://cdn.rea.st/player/latest/reast-player.es.js';
  registerPlayer();
</script>
```

### npm (pre bundlované aplikácie)

```bash
npm install @reast/engine
```

```typescript
import { registerPlayer } from '@reast/engine/player';
registerPlayer();
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
<reast-player src="./hello.rea"></reast-player>
```

## Načítanie `.reast` archívov

Pre viacdielne príbehy s metadátami použite formát `.reast` (ZIP archív obsahujúci manifest `reast.json` a jeden alebo viac `.rea` súborov):

```html
<reast-player src="./my-story.reast"></reast-player>
```

Player sa automaticky postará o extrakciu, parsovanie manifestu a navigáciu medzi časťami.

## Shadow DOM

Player používa Shadow DOM pre úplnú izoláciu štýlov. CSS vašej stránky neovplyvní vykresľovanie príbehu a naopak. Na prispôsobenie vzhľadu playera použite [CSS custom properties](theming).

## Udalosti

Player emituje custom udalosti, na ktoré môžete počúvať:

```javascript
const player = document.querySelector('reast-player');

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
