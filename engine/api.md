# API Reference

The `<reast-engine>` custom element drives the full pipeline and exposes its
state and controls as attributes, properties, methods and events.

## Attributes

| Attribute | Type | Description |
| --- | --- | --- |
| `src` | `string` | URL to a `.reast` archive — fetched, extracted and rendered. |
| `content` | `string` | Raw `.rea` text — parsed and rendered inline. |
| `speed` | `none \| fast \| medium \| slow` | Typewriter speed. Default `medium`. |
| `story-id` | `string` | Stable story identifier used in exported state. Falls back to `src`. |
| `locale` | `string` | BCP-47 locale for i18n/date built-ins. |
| `media-controls` | `native \| none` | Whether `<video>`/`<audio>` render native controls (`native`, default) or become host-handled activation targets (`none`). |

`src`, `content`, `locale` and `media-controls` are observed and re-render on
change; `speed` and `story-id` are read on demand. Locale resolution order is:
the `locale` attribute → the story's metadata language → the host page's
`<html lang>` → `en`.

## Properties

| Property | Type | Access | Description |
| --- | --- | --- | --- |
| `document` | `ReaDocument \| null` | get/set | The parsed story. Setting an already-parsed document renders it **without re-parsing** — the load path for a host that parses first (consent gates, SEO, offline caches). Set `extensions` and `mediaMap` beforehand for archive stories. Setting `null` clears the element. |
| `manifest` | `ReastManifest \| null` | get/set | Manifest for a bundle the host loaded itself, so `chapters`/`metadata` report as they do for a `src` load. Set before `document`. |
| `extensions` | `ExtensionModules \| null` | set | Compiled `.rext` modules for a host-loaded bundle, so `{use "extensions/…"}` resolves. Set before `document`. |
| `mediaMap` | `Map<string,string> \| null` | get/set | Archive-relative path → blob/object URL. Wins over the element's own loader map. The host owns the URLs — the element never revokes them. |
| `runtime` | `StoryEngine \| null` | get | The story runtime — an advanced read surface for host chrome (variables, cards, condition evaluation). Do not cache: it is swapped on revert/restart/reload. |
| `contentRoot` | `HTMLElement` | get | The shadow container holding rendered blocks, in flow order (scroll math). |
| `metadata` | `StoryMetadata \| null` | get | Title, authors, genre, language, chapters, reading-time estimate, choice count. |
| `chapters` | `readonly ChapterInfo[]` | get | Chapters in play order. Empty for flat/chapterless stories. |
| `currentChapter` | `ChapterInfo \| null` | get | The chapter currently rendered. |
| `waitingFor` | `'choice' \| 'external-event' \| null` | get | What the story is blocked on. |
| `completed` | `boolean` | get | Whether the story reached its end. |
| `renderedParagraph` | `{ chapter, paragraph } \| null` | get | Last block the reader has seen rendered. |
| `revealedNodes` | `readonly RevealedNode[]` | get | The visible flow: each node's identity plus whether its block is revealed yet. Read surface for tables of contents and progress UIs. |
| `choices` | `readonly PendingChoice[]` | get | The pending choice group with its **visible** options. Option indices match `selectChoice`. |
| `highlights` | `HighlightManager` | get | Search/annotation mark surface, re-anchored automatically on re-render. |
| `unlockCodes` | `Record<string,string>` | get | Unlock codes held for protected content (defensive copy). |
| `locale` | `string` | get/set | Effective locale (see above). Setting rebuilds the runtime. |

## Methods

| Method | Description |
| --- | --- |
| `load(url)` | Load a story from a `.reast` archive URL. |
| `render(text)` | Parse and render raw `.rea` text. |
| `importVariables(vars)` | Merge variables into the runtime and re-sync conditional content. |
| `updateLocation(position)` | Feed a `GeoPosition` (or `null`) back after a `location-start` event; drives `world.location.*`. |
| `selectChoice(nodeId, optionIndex)` | Select an option programmatically. `optionIndex` addresses the **visible** options — the same numbering `choices` reports, so a hidden conditional option never shifts it. Returns `false` if the group is gone, already selected, or the index is out of range. |
| `blockAt(index)` | The rendered block element at a container index (the numbering `rea-progress` uses), or `null`. |
| `revertChoice(nodeId)` | Revert a choice group: clears its selection and everything after, replays the kept selections, rewinds the flow. |
| `restart()` | Restart from the beginning, clearing all state. |
| `exportState()` | Portable, JSON-serializable reading state (selections, variables, last rendered block, unlock codes), or `null`. |
| `importState(state)` | Restore exported state, rendering read content instantly and resuming the reveal beyond it. May be called before a story loads. |
| `setUnlockCodes(codes)` | Provide unlock codes for protected content, keyed by content id. |
| `use(ext)` | Register a host extension on this instance (see [Extending](extending)). |
| `unuse(name)` | Remove a host extension by name. Returns whether one was registered. |

## Events

All events are `CustomEvent` instances that bubble.

| Event | Detail | When |
| --- | --- | --- |
| `rea-loaded` | — | Story loaded and rendered. |
| `rea-metadata` | `StoryMetadata` | Story metadata resolved. |
| `rea-chapter` | `ChapterInfo` | Current chapter changed. |
| `rea-waiting` | `{ waiting }` | Waiting state changed. |
| `rea-choice` | `{ nodeId, index }` | Reader selected a choice. |
| `rea-undo` | `{ nodeId }` | Reader reverted a choice. |
| `rea-progress` | `{ chapter, paragraph }` | A block finished revealing. |
| `rea-complete` | — | Story reached its end. |
| `rea-error` | `{ message }` | A load/parse/runtime error occurred. |
| `rea-media-activate` | `{ kind, src, path, alt }` | Reader activated a story media element. |

### `rea-media-activate`

Cancelable and `composed`. `kind` is `'image' | 'video' | 'audio'`; `src` is a
renderable URL (a `blob:` URL for archive media); `path` is the original
archive-relative path (name a download, or look the entry up in the manifest);
`alt` is the author's alternative text. Images always fire; video/audio only
under `media-controls="none"`. **The engine renders no overlay** — it only
reports the activation. Only the standalone CDN build ships a default lightbox
(registered through this same event); an embedding host opens its own viewer and
calls `preventDefault()`.

## Slots

Host chrome is injected through named slots: `before-identity`,
`after-identity`, `before-chapter`, `after-chapter`, `story-end`.

## Module exports worth naming

From `@reast/engine` (and, where noted, `@reast/engine/player`):

| Export | Description |
| --- | --- |
| `collectMedia(doc)` | Every media reference in document order, deduplicated by path — including media nested in choice branches, state machines and card hooks. Also on `/player`. |
| `resolveMediaPath(mediaMap, path)` | Resolve one media path through a media map, without mutating the AST. |
| `compileExtensions(files, manifest)` | Compile and validate the `.rext` modules of an archive (plus `std/*`). Also on `@reast/engine/loader`. |
| `haversineDistance`, `bearing`, `isWithinRadius` | Great-circle geo helpers. |
| `isInExclusionZone`, `isInAnyExclusionZone`, `isGeoTriggerAllowed` | Exclusion-zone gating for location triggers. |

## Subpath exports

| Export | Description |
| --- | --- |
| `@reast/engine` | Main barrel — Node-safe (parser, loader, runtime, errors, types, `collectMedia`, geo). |
| `@reast/engine/parser` | Rea lexer + parser. |
| `@reast/engine/loader` | `.reast` archive loader (extraction, decryption, manifest, `compileExtensions`). |
| `@reast/engine/runtime` | `StoryEngine`, expression evaluator, state manager. |
| `@reast/engine/player` | `<reast-engine>` web component and host-extension types (browser-only). |
| `@reast/engine/geo` | Geo-position utilities. |
| `@reast/engine/errors` | Error classes and codes. |
| `@reast/engine/types` | TypeScript type definitions. |
| `@reast/engine/validator` | `validateStory`. |
| `@reast/engine/debug` | `DebugStepper`. |

> **Note:** `@reast/engine/player` uses browser APIs (`CSSStyleSheet`,
> `HTMLElement`). Import it only in browser environments.
