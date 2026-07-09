# Rozširovanie enginu

Engine má dve nezávislé úrovne rozšírení pre dve rôzne publiká:

- **Úroveň 1 — Rea rozšírenia (`.rext`)** sú pre **autorov príbehov**. Sú písané
  v Rea, cestujú vnútri archívu `.reast`, sú izolované (sandboxed) a fungujú
  offline na ľubovoľnom hostiteľovi.
- **Úroveň 2 — hostiteľské rozšírenia** sú pre **embedderov**. Je to JavaScript
  dodaný stránkou, registrovaný na jednotlivý element `<reast-engine>`, a smie
  siahať na API zariadenia v mene príbehu.

Ani jedna úroveň nie je modulovo-globálny register. Všetko je scoped — Rea
rozšírenia na archív, v ktorom cestujú, hostiteľské rozšírenia na inštanciu
elementu, na ktorej sú zaregistrované.

## Úroveň 1 — Rea rozšírenia (`.rext`)

Súbor `.rext` je **iba deklaratívna Rea**. Smie obsahovať len:

- bloky `{function …}`,
- `{set}` konštanty na najvyššej úrovni,
- `{use}` importy,
- komentáre.

Akýkoľvek prozaický uzol kdekoľvek v súbore je **chyba pri načítaní** — práve to
udržiava rozšírenie recenzovateľné a mechanicky overiteľné. Príkazy riadenia
toku (`{if}`, `{return}`, …) sú povolené len vnútri tiel funkcií.

### Ako ho napísať

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

`{set}` hodnoty na najvyššej úrovni sa stanú modulovými konštantami, ktoré jeho
funkcie vedia čítať; funkcie v tom istom module sa môžu navzájom volať.

### Ako ho použiť

Importujte cez `{use}` — cesta vynecháva príponu `.rext` — priraďte alias a
volajte cez alias:

```rea
---
title: Zbrojnica
---
{use "extensions/inventory" as inv}
{set swords = 4}
{set shields = 2}

Nesieš {inv.total_weight(swords, shields)} kg.

{if inv.is_overloaded(swords, shields) begin}
Podlomíš sa pod váhou a odhodíš štít.
{end if}
```

### Pravidlá, ktoré loader vynucuje

Každý `.rext` v archíve sa skompiluje a overí pri načítaní, **ešte pred prózou** —
pokazené rozšírenie sa ukáže pri publikovaní, nie na zariadení čitateľa.
Kompilácia však nie je aktivácia: modul viaže až samotné `{use}`. Okrem toho:

- graf `{use}` musí byť **acyklický** a každý cieľ sa musí rozlíšiť;
- **duplicitné mená exportov** sú chyba, nie tiché „vyhráva prvý";
- kód rozšírenia sa **nikdy nešifruje** — musí zostať auditovateľný bez kľúča a
  nesmie sa objaviť uprostred príbehu za odomykacím kódom.

### `std/*` — štandardná knižnica

`std/` je vyhradený menný priestor riešený **vnútri enginu**, nikdy z archívu a
nikdy od hostiteľa. `{use "std/dice" as dice}` preto nepotrebuje nič dodané
spolu s príbehom a funguje identicky na každom hostiteľovi:

```rea
{use "std/dice" as dice}

Hádžeš {dice.roll(2, 6)} na iniciatívu.
Pasca uštedrí {dice.d(8)} zranenia.
```

`std/dice` exportuje:

| Funkcia | Popis |
| --- | --- |
| `d(sides)` | Hod jednou kockou: `random(1, sides)`. |
| `roll(count, sides)` | Súčet `count` kociek s `sides` stenami (obmedzené hĺbkou volania, max. 64 kociek). |
| `advantage(sides)` | Vyšší z dvoch hodov `d(sides)`. |
| `disadvantage(sides)` | Nižší z dvoch hodov `d(sides)`. |

Archívny `.rext`, ktorý sa rozlíši pod `std/`, aj hostiteľské rozšírenie, ktoré
deklaruje `namespace: 'std'`, sú oba chyby pri načítaní.

## Úroveň 2 — hostiteľské rozšírenia

Hostiteľské rozšírenie je obyčajný objekt implementujúci `EngineExtension`,
zaregistrovaný na **jednej inštancii elementu** cez `element.use(ext)` a
odstránený cez `element.unuse(name)`. Dva elementy na jednej stránke môžu držať
rôzne rozšírenia. Registrácia prežije prenačítania príbehu a platí pre každý
príbeh, ktorý element potom načíta.

```ts
import type { EngineExtension } from '@reast/engine/player';

const engine = document.querySelector('reast-engine')!;

const host: EngineExtension = {
  name: 'host',

  // 1. functions — volateľné z Rea ako {host.fn(...)}
  functions: {
    playerName: { fn: () => currentUser.name },
  },

  // 2. commands — obslúžia {host.command args}
  commands: {
    buzz: ({ emit }) => emit({ type: 'vibrate', pattern: 40 }),
  },

  // 3. renderers — nahradia vykreslenie typu uzla
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

Každá položka je `{ fn, schema? }`. `fn` dostane sanitizované argumenty a vráti
hodnotu. Funkcie sú volateľné ako `{host.fnName(...)}`. Keďže menný priestor je
vždy bodkovaný, funkcia rozšírenia nikdy nemôže zatieniť jadrový builtin.

### commands

Príkaz obslúži menný príkazový uzol `{host.command args}`. **Príkaz vyžaduje
argumenty** — samotné `{host.buzz}` sa sparsuje ako *bodkovaná referencia na
premennú*, nie ako príkaz. Handler dostane `{ emit, setVariables, node }`:

- `emit(event)` — emitovať event runtime zbernice (jediný spôsob, ako sa dostať
  k zariadeniu);
- `setVariables(vars)` — zlúčiť premenné späť do runtime (cesta výsledku senzora);
- `node` — rozlíšený príkazový uzol.

### Hranica schopností

**Rozšírenie, ktoré potrebuje API zariadenia, emituje event na zbernici; engine
nikdy nevolá `navigator.*` zaň.** Príkaz vibrácie nevolá `navigator.vibrate` —
emituje, a hostiteľ (ktorý si vypýtal povolenie od používateľa) rozhodne, či ho
uctí:

```ts
engine.use({
  name: 'host',
  commands: {
    // Autor napíše: {host.buzz 40}
    buzz: ({ emit, node }) => {
      emit({ type: 'vibrate', pattern: 40 });
      // HOSTITEĽ počúva na engine.events a sám zavolá navigator.vibrate,
      // až keď má súhlas používateľa.
    },
  },
});

engine.events.on('vibrate', ({ pattern }) => {
  if (navigator.vibrate) navigator.vibrate(pattern);
});
```

### renderers

Renderer nahradí DOM vytvorený pre typ uzla — presne to, čo starý hook
`beforeRenderNode` nevedel, keďže mohol vykreslenie iba zakázať. Kľúče sú `type`
uzla `ReaNode` (napr. `paragraph`) alebo `card:<card_kind>` pre vlastnú kartu.
Renderer, ktorý vráti `null`, prepadne späť na vstavané vykreslenie.

### Lifecycle hooky

| Hook | Kontext | Kedy |
| --- | --- | --- |
| `onStoryLoaded` | `{ host, document }` | Po sparsovaní príbehu, pred vykreslením. |
| `onChoiceSelected` | pridáva `{ nodeId, index }` | Čitateľ vyberie možnosť. |
| `onStoryComplete` | pridáva `{ readingTimeMs }` | Príbeh dosiahne koniec. |
| `onDisconnect` | `{ host, document }` | Element sa odpojí alebo sa príbeh zruší. |

### Vyžadované hostiteľské menné priestory

Príbeh môže v manifeste deklarovať, na ktorých hostiteľských menných priestoroch
závisí:

```json
{ "requires": ["host"] }
```

Keď element načíta takýto príbeh, `assertRequiredExtensions` porovná deklarované
menné priestory s reálne zaregistrovanými rozšíreniami. Ak niektorý chýba,
načítanie sa **odmietne s jasnou diagnostikou**, namiesto toho, aby príbeh volal
`host.*` a dostal uprostred kapitoly zlú odpoveď. Hostitelia, ktorí si balíky
načítavajú sami, môžu zavolať `assertRequiredExtensions(manifest, namespaces)`
priamo.

## Súvisiace plochy

Pre čítanie runtime stavu na strane hostiteľa (premenné, karty, vyhodnocovanie
podmienok) práve načítaný príbeh sprístupňuje svoj `runtime` (`StoryEngine`) —
pozri [API referenciu](api). Perzistujte a obnovujte čítací postup cez
`exportState()` / `importState()` a témujte player cez
[CSS custom properties](theming).
