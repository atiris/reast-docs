# Extending the Engine

The engine has two independent extension tiers, for two different audiences:

- **Tier 1 — Rea extensions (`.rext`)** are for **story authors**. They are
  written in Rea, travel inside the `.reast` archive, are sandboxed and work
  offline on any host.
- **Tier 2 — Host extensions** are for **embedders**. They are JavaScript
  supplied by the page, registered per `<reast-engine>` element, and can reach
  device APIs on the story's behalf.

Neither tier is a module-global registry. Everything is scoped — Rea extensions
to the archive they ship in, host extensions to the element instance they are
registered on.

## Tier 1 — Rea extensions (`.rext`)

A `.rext` file is **declaration-only Rea**. It may contain only:

- `{function …}` blocks,
- top-level `{set}` constants,
- `{use}` imports,
- comments.

Any prose node anywhere in the file is a **load error** — this is what keeps an
extension reviewable and mechanically checkable. Control-flow commands (`{if}`,
`{return}`, …) are allowed only inside function bodies.

### Writing one

`extensions/inventory.rext`:

```rea
{set sword_weight = 3}
{set shield_weight = 5}

{function total_weight(swords, shields) begin}
{return swords * sword_weight + shields * shield_weight}
{end function}

{function is_overloaded(swords, shields) begin}
{if total_weight(swords, shields) > 20 begin}
{return true}
{end if}
{return false}
{end function}
```

Top-level `{set}` values become module constants that its functions can read;
functions in the same module can call each other.

Constants are **private to the module**. They never become story variables, so
they never appear in exported reading state, two modules may use the same
constant name without colliding, and a module can never clobber a variable the
author declared. A function parameter of the same name shadows the constant.

::: warning
A `{set}` **inside a function body**, of a name the function does not already
hold, writes a **story variable** — that is ordinary Rea function scoping, and
it applies to extensions too. Use it deliberately (to record something in the
story) and never as a loop counter, or it will surface in the reader's saved
state. Accumulate with recursion, as `std/dice`'s `roll` does.
:::

### Using one

Import with `{use}` — the path omits the `.rext` suffix — bind it to an alias,
and call through the alias:

```rea
---
title: The Armory
---
{use "extensions/inventory" as inv}
{set swords = 4}
{set shields = 2}

You are carrying {inv.total_weight(swords, shields)} kg.

{if inv.is_overloaded(swords, shields) begin}
You stagger under the weight and drop the shield.
{end if}
```

### Rules the loader enforces

Every `.rext` in the archive is compiled and validated at load, **before any
prose runs** — a broken extension surfaces at publish time, not on a reader's
device. But compilation is not activation: only a `{use}` actually binds a
module. Beyond that:

- the `{use}` graph must be **acyclic** and every target must resolve;
- **duplicate export names** are an error, not silent first-wins;
- extension code is **never encrypted** — it must stay auditable without a key
  and must never materialise mid-story behind an unlock code.

### `std/*` — the standard library

`std/` is a reserved namespace resolved from **inside the engine**, never from
the archive and never from the host. `{use "std/dice" as dice}` therefore needs
nothing shipped alongside the story and works identically on every host:

```rea
{use "std/dice" as dice}

You roll {dice.roll(2, 6)} for initiative.
The trap deals {dice.d(8)} damage.
```

`std/dice` exports:

| Function | Description |
| --- | --- |
| `d(sides)` | Roll one die: `random(1, sides)`. |
| `roll(count, sides)` | Sum of `count` dice of `sides` (bounded by call depth, max 64 dice). |
| `advantage(sides)` | The higher of two `d(sides)` rolls. |
| `disadvantage(sides)` | The lower of two `d(sides)` rolls. |

An archive `.rext` that resolves under `std/`, and a host extension that
declares `namespace: 'std'`, are both load errors.

## Tier 2 — Host extensions

A host extension is a plain object implementing `EngineExtension`, registered on
**one element instance** with `element.use(ext)` and removed with
`element.unuse(name)`. Two elements on one page can hold different extensions.
Registration survives story reloads and applies to every story the element
loads afterwards.

```ts
import type { EngineExtension } from '@reast/engine/player';

const engine = document.querySelector('reast-engine')!;

const host: EngineExtension = {
  name: 'host',

  // 1. functions — callable from Rea as {host.fn(...)}
  functions: {
    playerName: { fn: () => currentUser.name },
  },

  // 2. commands — handle {host.command args}
  commands: {
    buzz: ({ emit }) => emit({ type: 'vibrate', pattern: 40 }),
  },

  // 3. renderers — substitute a node type's rendering
  renderers: {
    'card:achievement': (node, doc) => {
      const el = doc.createElement('div');
      el.className = 'achievement';
      el.textContent = node.raw ?? '';
      return el;
    },
  },

  // 4. lifecycle
  onStoryLoaded: (ctx) => console.log('loaded', ctx.document?.metadata.title),
  onChoiceSelected: (ctx) => track('choice', { index: ctx.index }),
  onStoryComplete: (ctx) => track('done', { readingTimeMs: ctx.readingTimeMs }),
  onDisconnect: () => cleanup(),
};

engine.use(host);
```

### functions

Each entry is `{ fn, schema? }`. `fn` receives sanitized arguments and returns a
value. Functions become callable as `{host.fnName(...)}`. Because the namespace
is always dotted, an extension function can never shadow a core builtin.

### commands

A command handles a namespaced command node `{host.command args}`. **A command
requires arguments** — a bare `{host.buzz}` is parsed as a *dotted variable
reference*, not a command. The handler receives `{ emit, setVariables, node }`:

- `emit(event)` — emit a runtime bus event (the only way to reach a device);
- `setVariables(vars)` — merge variables back into the runtime (the sensor
  result path);
- `node` — the resolved command node.

### The capability boundary

**An extension that needs a device API emits a bus event; engine code never
calls `navigator.*` on its behalf.** A vibration command does not call
`navigator.vibrate` — it emits, and the host (which asked the user for
permission) decides whether to honour it:

```ts
engine.use({
  name: 'host',
  commands: {
    // Author writes: {host.buzz 40}
    buzz: ({ emit, node }) => {
      emit({ type: 'vibrate', pattern: 40 });
      // The HOST listens on engine.events and calls navigator.vibrate itself,
      // only after it has the user's consent.
    },
  },
});

engine.events.on('vibrate', ({ pattern }) => {
  if (navigator.vibrate) navigator.vibrate(pattern);
});
```

### renderers

A renderer substitutes the DOM produced for a node type — this is what the old
`beforeRenderNode` hook could not do, since it could only veto. Keys are a
`ReaNode` `type` (e.g. `paragraph`) or `card:<card_kind>` for a custom card. A
renderer returning `null` falls back to the built-in rendering.

### Lifecycle hooks

| Hook | Context | When |
| --- | --- | --- |
| `onStoryLoaded` | `{ host, document }` | After a story parses, before rendering. |
| `onChoiceSelected` | adds `{ nodeId, index }` | The reader picks an option. |
| `onStoryComplete` | adds `{ readingTimeMs }` | The story reaches its end. |
| `onDisconnect` | `{ host, document }` | The element disconnects or a story tears down. |

### Required host namespaces

A story can declare in its manifest which host namespaces it depends on:

```json
{ "requires": ["host"] }
```

When the element loads such a story, `assertRequiredExtensions` checks the
declared namespaces against the extensions actually registered. If any is
missing, the load is **refused with a clear diagnostic** rather than the story
calling `host.*` and getting a wrong answer mid-chapter. Hosts that load
bundles themselves can call `assertRequiredExtensions(manifest, namespaces)`
directly.

## Related surfaces

For host-side reading of runtime state (variables, cards, condition
evaluation), the currently loaded story exposes its `runtime`
(`StoryEngine`) — see the [API Reference](api). Persist and restore reading
progress with `exportState()` / `importState()`, and theme the player through
[CSS custom properties](theming).
