# Reast Engine

Reast Engine (`<reast-engine>`) je webový komponent, ktorý zobrazuje interaktívne Rea príbehy v ľubovoľnom prehliadači. Dá sa vložiť na ľubovoľnú stránku jediným script tagom — bez potreby frameworku.

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
- [Témy](theming) — CSS custom properties pre vizuálne prispôsobenie
- [Formát balíčka](package-format) — Rozloženie archívu `.reast` a schéma manifestu
- [API referencia](api) — Atribúty, udalosti, JavaScript API
