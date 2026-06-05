# Reast Player

Reast Player (`<reast-player>`) je webový komponent, ktorý zobrazuje interaktívne Rea príbehy v ľubovoľnom prehliadači. Dá sa vložiť na ľubovoľnú stránku jediným script tagom — bez potreby frameworku.

## Rýchly štart

### CDN (najjednoduchšie)

```html
<script src="https://cdn.rea.st/engine/latest/reast-engine.iife.js"></script>
<reast-player src="https://example.com/my-story.reast"></reast-player>
```

### ES Module

```html
<script type="module">
  import { registerPlayer } from 'https://cdn.rea.st/engine/latest/reast-engine.es.js';
  registerPlayer();
</script>
<reast-player src="./my-story.reast"></reast-player>
```

### npm

```bash
npm install @reast/engine
```

```typescript
import { registerPlayer } from '@reast/engine/player';
registerPlayer(); // zaregistruje <reast-player> custom element
```

> **Poznámka:** Subpath `@reast/engine/player` používa prehliadačové API (`CSSStyleSheet`, `HTMLElement`). Importujte ho iba v prehliadačovom prostredí — nie z Node.js ani SSR kontextu.

## Sekcie

- [Začíname](getting-started) — Inštalácia a prvý príbeh
- [Vkladanie](embedding) — Integrácia do frameworkov (React, Vue, Angular, vanilla)
- [Témy](theming) — CSS custom properties pre vizuálne prispôsobenie
- [Formát balíčka](package-format) — Rozloženie archívu `.reast` a schéma manifestu
- [API referencia](api) — Atribúty, udalosti, JavaScript API
