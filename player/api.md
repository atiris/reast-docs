# API Reference

## HTML Attributes

| Attribute | Type     | Description                              |
| --------- | -------- | ---------------------------------------- |
| `src`     | `string` | URL or path to a `.rea` or `.reast` file |

## Events

All events are `CustomEvent` instances with typed `detail`.

### `rea-loaded`

Fired when the story has been parsed and is ready to render.

```typescript
interface ReaLoadedDetail {
  title: string;
  partCount: number;
}
```

### `rea-choice`

Fired when the reader selects a choice.

```typescript
interface ReaChoiceDetail {
  label: string;
  index: number;
}
```

### `rea-complete`

Fired when the story reaches a terminal node (no more content to display).

```typescript
interface ReaCompleteDetail {
  storyId?: string;
}
```

### `rea-error`

Fired when a parse error, load error, or runtime error occurs.

```typescript
interface ReaErrorDetail {
  code: string;
  message: string;
}
```

## JavaScript API

After the element is connected to the DOM, you can access these methods and properties:

### Properties

| Property | Type                  | Description                 |
| -------- | --------------------- | --------------------------- |
| `story`  | `ReaDocument \| null` | The parsed story document   |
| `engine` | `StoryEngine \| null` | The running engine instance |

### Methods

| Method              | Description                      |
| ------------------- | -------------------------------- |
| `load(src: string)` | Load a story from a URL          |
| `reset()`           | Reset the story to the beginning |

## Subpath Exports

The `@reast/engine` package exposes multiple subpath imports:

| Export                  | Description                                                      |
| ----------------------- | ---------------------------------------------------------------- |
| `@reast/engine`         | Main barrel — Node-safe (parser, loader, runtime, errors, types) |
| `@reast/engine/parser`  | Rea language lexer + parser                                      |
| `@reast/engine/loader`  | `.reast` archive loader (extraction, decryption, manifest)       |
| `@reast/engine/runtime` | StoryEngine, expression evaluator, state manager                 |
| `@reast/engine/player`  | `<reast-player>` web component (browser-only)                    |
| `@reast/engine/geo`     | Geo-position utilities                                           |
| `@reast/engine/errors`  | Error classes and codes                                          |
| `@reast/engine/types`   | TypeScript type definitions                                      |
