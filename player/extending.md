# Extending the Player

This guide covers the extension points available in `@reast/engine` for developers who want to customize or extend the player's behaviour.

## Plugin Architecture

The player supports a lightweight plugin system. Plugins can hook into rendering, choice handling, and lifecycle events.

### Defining a Plugin

```ts
import { definePlugin } from '@reast/engine';

const analyticsPlugin = definePlugin({
  name: 'analytics',

  onStoryLoaded(ctx) {
    console.log('Story loaded:', ctx.src);
  },

  beforeRenderNode(ctx) {
    // Return false to suppress rendering of this node
    if (ctx.node.type === 'command') return false;
  },

  afterRenderNode(ctx) {
    // Track rendered nodes
    trackEvent('node-rendered', { type: ctx.node.type });
  },

  onChoiceSelected(ctx) {
    trackEvent('choice', { index: ctx.index });
  },

  onStoryComplete(ctx) {
    trackEvent('story-complete', { readingTimeMs: ctx.readingTimeMs });
  },

  onDisconnect(ctx) {
    // Cleanup when player is removed from DOM
    cleanup();
  },
});
```

### Registering Plugins

```ts
import { registerPlugin, unregisterPlugin, clearPlugins } from '@reast/engine';

registerPlugin(analyticsPlugin);

// Later, to remove:
unregisterPlugin('analytics');

// Or remove all:
clearPlugins();
```

### Plugin Hooks

| Hook               | Context               | Can Veto?            | Description                              |
| ------------------ | --------------------- | -------------------- | ---------------------------------------- |
| `onStoryLoaded`    | `PluginContext`       | No                   | Called after story is loaded and parsed  |
| `beforeRenderNode` | `RenderHookContext`   | Yes (`return false`) | Before a node is rendered to DOM         |
| `afterRenderNode`  | `RenderHookContext`   | No                   | After a node is rendered                 |
| `onChoiceSelected` | `ChoiceHookContext`   | No                   | When the reader selects a choice         |
| `onStoryComplete`  | `CompleteHookContext` | No                   | When the story reaches its end           |
| `onDisconnect`     | `PluginContext`       | No                   | When the player is disconnected from DOM |

### Hook Context Types

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

All visual aspects of the player are themeable via CSS custom properties. See the full reference in [Theming](./theming.md).

Quick example:

```css
reast-player {
  --rp-font-body: 'Merriweather', serif;
  --rp-color-bg: #1a1a2e;
  --rp-color-text: #e0e0e0;
  --rp-color-accent: #e94560;
}
```

## Custom Built-in Functions

The runtime supports registering custom functions that Rea stories can call:

```ts
import { StoryEngine } from '@reast/engine';

const engine = new StoryEngine(doc);

// Stories can use: {call myFunc("hello")}
engine.registerFunction('myFunc', (args) => {
  return args[0].toUpperCase();
});
```

### Built-in Function Categories

| Category | Functions                                                                     |
| -------- | ----------------------------------------------------------------------------- |
| Math     | `random`, `round`, `floor`, `ceil`, `abs`, `min`, `max`                       |
| String   | `upper`, `lower`, `length`, `contains`, `replace`                             |
| Array    | `count`, `pick`, `shuffle`                                                    |
| Date     | `now`, `today`, `formatDate`, `parseDate`, `dateDiff`, `dayOfWeek`, `dateAdd` |

## State Management

The `StateManager` handles reading progress persistence:

```ts
import { StateManager } from '@reast/engine';

const sm = new StateManager();

// Serialize current state (e.g. for localStorage)
const state = sm.serialize(engine.getAllVariables());
localStorage.setItem('story-progress', JSON.stringify(state));

// Restore later
const saved = JSON.parse(localStorage.getItem('story-progress')!);
sm.restore(saved);
```

State includes:

- Choice selections
- Variable values
- Visited choice groups
- Schema version for forward-compatible migration

## Accessibility Utilities

The player includes accessibility helpers you can use when building custom integrations:

```ts
import {
  createLiveRegion,
  announce,
  focusFirstContent,
  prefersReducedMotion,
  onReducedMotionChange,
} from '@reast/engine';

// Create a screen-reader announcement region
const region = createLiveRegion(document);
container.appendChild(region);

// Announce content changes
announce(region, 'New chapter loaded');

// Focus the first content element after navigation
focusFirstContent(container);

// Respect motion preferences
if (prefersReducedMotion()) {
  // Skip animations
}
```

## Event Bus

The runtime emits events you can subscribe to:

```ts
import { EventBus } from '@reast/engine';

const bus = new EventBus();
bus.on('choice-selected', (data) => {
  /* ... */
});
bus.on('variable-changed', (data) => {
  /* ... */
});
bus.on('story-complete', (data) => {
  /* ... */
});
```

## Project Structure

```text
src/
├── parser/          # Rea source → AST
│   ├── lexer.ts         # Tokenizer (line-level)
│   ├── block-parser.ts  # Token stream → node tree
│   ├── inline-parser.ts # Inline formatting
│   └── analyser.ts      # Top-level parse orchestrator
├── runtime/         # AST → evaluated output
│   ├── interpreter.ts       # StoryEngine (conditionals, loops, etc.)
│   ├── expression-evaluator.ts
│   ├── state-manager.ts     # Save/load progress
│   ├── event-bus.ts
│   └── builtins/            # Built-in function implementations
├── player/          # Web Component UI
│   ├── reast-player.ts     # <reast-player> Custom Element
│   ├── renderer.ts         # AST → DOM rendering
│   ├── styles.ts           # Shadow DOM CSS
│   ├── plugins.ts          # Plugin architecture
│   ├── accessibility.ts    # A11y utilities
│   └── progress-bar.ts     # Reading progress
└── types.ts         # Shared TypeScript interfaces
```
