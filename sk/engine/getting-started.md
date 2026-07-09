# Začíname

## Čo engine je

`@reast/engine` je frameworkovo nezávislá knižnica plus custom element `<reast-engine>`, ktorý v prehliadači načíta, parsuje, vyhodnotí a vykreslí interaktívny Rea príbeh. Standalone build má približne 57 KB v gzipe a bez runtime závislostí — jediná, `fflate`, slúži len na rozbalenie ZIP archívu `.reast`.

### Čo robí

Engine beží štvorstupňovú pipeline:

- **Loader** — rozbalí archív `.reast`: extrahuje súbory, prečíta manifest, namapuje vložené médiá na blob URL v pamäti, skompiluje `.rext` rozšírenia.
- **Parser** — premení zdroj `.rea` na AST (`ReaDocument`).
- **Runtime** — vyhodnotí premenné, podmienky, voľby a tok.
- **Player** — vykreslí prístupný, sémantický DOM s typewriter efektom.

### Čo zámerne nerobí

Toto je časť, ktorú embedderi potrebujú vedieť najskôr. Engine nikdy nesiaha na žiadne API zariadenia, úložiska ani siete mimo standalone buildu. Schopnosť si *vyžiada* emitovaním eventu a odpoveď *dostane* ako premennú — vypýtať povolenie je vždy úloha hostiteľa. Emituje sémantiku, nie vzhľad: rozhodne, že niečo *je* nadpis úrovne 2; ako to vyzerá, rozhodne hostiteľ. Nedodáva lightbox, ovládanie prehrávača médií, perzistenciu ani autentifikáciu. Tie dodáva hostiteľ — pozri [Vkladanie](embedding) a [Rozširovanie](extending).

### Pre koho to je

Ak chcete len publikovať príbeh, stačí vám [CDN snippet](#cdn-bez-nastavovania) nižšie. Ak ste platforma integrujúca engine do väčšej aplikácie, prečítajte si [Vkladanie](embedding) a [Rozširovanie](extending).

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

player.addEventListener('rea-loaded', () => {
  console.log('Príbeh načítaný a vykreslený');
});

player.addEventListener('rea-metadata', (e) => {
  console.log('Názov:', e.detail.title);
});

player.addEventListener('rea-choice', (e) => {
  console.log('Čitateľ si vybral možnosť', e.detail.index, 'zo skupiny', e.detail.nodeId);
});

player.addEventListener('rea-complete', () => {
  console.log('Príbeh dokončený');
});

player.addEventListener('rea-error', (e) => {
  console.error('Chyba:', e.detail.message);
});
```
