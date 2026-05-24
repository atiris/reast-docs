# API referencia

## HTML atribúty

| Atribút | Typ      | Popis                                          |
| ------- | -------- | ---------------------------------------------- |
| `src`   | `string` | URL alebo cesta k `.rea` alebo `.reast` súboru |

## Udalosti

Všetky udalosti sú inštancie `CustomEvent` s typovaným `detail`.

### `rea-loaded`

Vyvolaná po sparsovaní príbehu, keď je pripravený na vykreslenie.

```typescript
interface ReaLoadedDetail {
  title: string;
  partCount: number;
}
```

### `rea-choice`

Vyvolaná keď čitateľ vyberie voľbu.

```typescript
interface ReaChoiceDetail {
  label: string;
  index: number;
}
```

### `rea-complete`

Vyvolaná keď príbeh dosiahne terminálny uzol (žiadny ďalší obsah na zobrazenie).

```typescript
interface ReaCompleteDetail {
  storyId?: string;
}
```

### `rea-error`

Vyvolaná pri chybe parsovania, načítavania alebo runtime chybe.

```typescript
interface ReaErrorDetail {
  code: string;
  message: string;
}
```

## JavaScript API

Po pripojení elementu do DOM máte prístup k týmto metódam a vlastnostiam:

### Vlastnosti

| Vlastnosť | Typ                   | Popis                       |
| --------- | --------------------- | --------------------------- |
| `story`   | `ReaDocument \| null` | Sparsovaný dokument príbehu |
| `engine`  | `StoryEngine \| null` | Bežiaca inštancia enginu    |

### Metódy

| Metóda              | Popis                        |
| ------------------- | ---------------------------- |
| `load(src: string)` | Načítať príbeh z URL         |
| `reset()`           | Resetovať príbeh na začiatok |

## Subpath exporty

Balík `@reast/engine` sprístupňuje viaceré subpath importy:

| Export                  | Popis                                                                      |
| ----------------------- | -------------------------------------------------------------------------- |
| `@reast/engine`         | Hlavný barrel — bezpečný pre Node (parser, loader, runtime, errors, types) |
| `@reast/engine/parser`  | REA lexer + parser                                                         |
| `@reast/engine/loader`  | Loader `.reast` archívov (extrakcia, dešifrovanie, manifest)               |
| `@reast/engine/runtime` | StoryEngine, evaluátor výrazov, správca stavu                              |
| `@reast/engine/player`  | `<reast-player>` webový komponent (iba prehliadač)                         |
| `@reast/engine/geo`     | Geo-pozičné utility                                                        |
| `@reast/engine/errors`  | Triedy chýb a kódy                                                         |
| `@reast/engine/types`   | TypeScript definície typov                                                 |
