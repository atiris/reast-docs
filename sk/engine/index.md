# Reast Engine

Reast Engine (`<reast-engine>`) je frameworkovo nezávislá knižnica plus webový komponent, ktorý načíta, parsuje, vyhodnocuje a vykresľuje interaktívne [Rea](/sk/spec/) príbehy v ľubovoľnom prehliadači. Dá sa vložiť na ľubovoľnú stránku jediným script tagom — bez potreby frameworku. Standalone build má približne 57 KB v gzipe a bez runtime závislostí (okrem `fflate` na rozbalenie ZIP).

## Pre koho je táto sekcia

Táto sekcia je pre dve skupiny čitateľov, odlišné od dokumentácie [Platformy](/sk/platform/):

- **Embeddery** — každý, kto vkladá príbeh do existujúcej webovej stránky či appky: blogový článok, dialógový systém hry, interný nástroj. Začnite pri [Vkladaní](embedding).
- **Self-hosteri** — každý, kto prevádzkuje engine (a voliteľne aj platformu) na vlastnej infraštruktúre namiesto rea.st. Začnite pri [Začíname](getting-started) a [API referencii](api).

Ak píšete príbeh namiesto vkladania prehrávača, pozrite radšej sprievodcu platformy [Návrh príbehov](/sk/platform/design/) — táto sekcia dokumentuje engine, ktorý príbeh vykresľuje, nie ako príbeh napísať.

## Čo engine robí — a čo nie

Beží v pipeline **Loader → Parser → Runtime → Player**. Zámerne nesiaha na žiadne API zariadenia, úložiska ani siete mimo standalone buildu: schopnosť si *vyžiada* emitovaním eventu a odpoveď dostane ako premennú, a emituje sémantiku, nie vzhľad. Nedodáva lightbox, ovládanie médií, perzistenciu ani autentifikáciu — tie patria hostiteľovi.

Konkrétne: engine **nemá účty, hosting ani editor** — nevie, čo je používateľ, neukladá ani neservíruje súbory `.reast` (dostane URL alebo `File`/`Blob`) a neposkytuje žiadne UI na písanie či balenie príbehov. To je úlohou platformy — pozri [rea.st](https://rea.st) alebo si popri engine self-hostnite aj platformu.

## Rýchly štart

### CDN (najjednoduchšie)

```html
<script src="https://cdn.rea.st/engine/latest/reast-engine.iife.js"></script>
<reast-engine src="https://example.com/my-story.reast"></reast-engine>
```

### ES Module

```html
<script type="module">
  import { registerEngine } from 'https://cdn.rea.st/engine/latest/reast-engine.es.js';
  registerEngine();
</script>
<reast-engine src="./my-story.reast"></reast-engine>
```

### npm

```bash
npm install @reast/engine
```

```typescript
import { registerEngine } from '@reast/engine/player';
registerEngine(); // zaregistruje <reast-engine> custom element
```

> **Poznámka:** Subpath `@reast/engine/player` používa prehliadačové API (`CSSStyleSheet`, `HTMLElement`). Importujte ho iba v prehliadačovom prostredí — nie z Node.js ani SSR kontextu.

## Sekcie

- [Začíname](getting-started) — Inštalácia a prvý príbeh
- [Vkladanie](embedding) — Integrácia do frameworkov (React, Vue, Angular, vanilla)
- [Rozširovanie](extending) — Rea rozšírenia (`.rext`) pre autorov, hostiteľské rozšírenia pre embedderov
- [Témy](theming) — CSS custom properties pre vizuálne prispôsobenie
- [Formát balíčka](package-format) — Rozloženie archívu `.reast` a schéma manifestu
- [API referencia](api) — Atribúty, udalosti, JavaScript API
