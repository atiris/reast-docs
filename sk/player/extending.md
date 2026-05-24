# Rozširovanie playera

Tento návod pokrýva rozširovacie body dostupné v `@reast/engine` pre vývojárov, ktorí chcú prispôsobiť alebo rozšíriť správanie playera.

## Architektúra pluginov

Player podporuje jednoduchý systém pluginov. Pluginy sa môžu napojiť na vykresľovanie, spracovanie volieb a lifecycle udalosti.

### Definovanie pluginu

```ts
import { definePlugin } from '@reast/engine';

const analyticsPlugin = definePlugin({
  name: 'analytics',

  onStoryLoaded(ctx) {
    console.log('Príbeh načítaný:', ctx.src);
  },

  beforeRenderNode(ctx) {
    // Vráťte false pre potlačenie vykresľovania tohto uzla
    if (ctx.node.type === 'command') return false;
  },

  afterRenderNode(ctx) {
    // Sledovanie vykreslených uzlov
    trackEvent('node-rendered', { type: ctx.node.type });
  },

  onChoiceSelected(ctx) {
    trackEvent('choice', { index: ctx.index });
  },

  onStoryComplete(ctx) {
    trackEvent('story-complete', { readingTimeMs: ctx.readingTimeMs });
  },

  onDisconnect(ctx) {
    // Upratanie pri odpojení playera z DOM
    cleanup();
  },
});
```

### Registrácia pluginov

```ts
import { registerPlugin, unregisterPlugin, clearPlugins } from '@reast/engine';

registerPlugin(analyticsPlugin);

// Neskôr, pre odstránenie:
unregisterPlugin('analytics');

// Alebo odstránenie všetkých:
clearPlugins();
```

### Hook-y pluginov

| Hook               | Kontext               | Vetuje?              | Popis                                   |
| ------------------ | --------------------- | -------------------- | --------------------------------------- |
| `onStoryLoaded`    | `PluginContext`       | Nie                  | Volané po načítaní a sparsovaní príbehu |
| `beforeRenderNode` | `RenderHookContext`   | Áno (`return false`) | Pred vykreslením uzla do DOM            |
| `afterRenderNode`  | `RenderHookContext`   | Nie                  | Po vykreslení uzla                      |
| `onChoiceSelected` | `ChoiceHookContext`   | Nie                  | Keď čitateľ vyberie voľbu               |
| `onStoryComplete`  | `CompleteHookContext` | Nie                  | Keď príbeh dosiahne koniec              |
| `onDisconnect`     | `PluginContext`       | Nie                  | Keď je player odpojený z DOM            |

### Typy kontextu hookov

```ts
interface PluginContext {
  readonly host: HTMLElement;
  readonly src?: string;
}

interface RenderHookContext extends PluginContext {
  readonly node: ReaNode;
  readonly element?: HTMLElement | null;
}

interface ChoiceHookContext extends PluginContext {
  readonly index: number;
}

interface CompleteHookContext extends PluginContext {
  readonly readingTimeMs?: number;
}
```

## CSS Custom Properties

Všetky vizuálne aspekty playera sú tématizovateľné cez CSS custom properties. Pozrite si úplnú referenciu v časti [Témy](./theming.md).
