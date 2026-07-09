# API referencia

Custom element `<reast-engine>` poháňa celú pipeline a svoj stav aj ovládanie
sprístupňuje ako atribúty, vlastnosti, metódy a udalosti.

## Atribúty

| Atribút | Typ | Popis |
| --- | --- | --- |
| `src` | `string` | URL k archívu `.reast` — stiahne sa, extrahuje a vykreslí. |
| `content` | `string` | Surový text `.rea` — sparsuje sa a vykreslí inline. |
| `speed` | `none \| fast \| medium \| slow` | Rýchlosť typewriter efektu. Predvolene `medium`. |
| `story-id` | `string` | Stabilný identifikátor príbehu použitý v exportovanom stave. Ako záloha slúži `src`. |
| `locale` | `string` | BCP-47 locale pre i18n/dátumové vstavané funkcie. |
| `media-controls` | `native \| none` | Či `<video>`/`<audio>` vykresľujú natívne ovládanie (`native`, predvolené) alebo sa stanú cieľmi aktivácie riešenými hostiteľom (`none`). |

`src`, `content`, `locale` a `media-controls` sú sledované a pri zmene sa
prevykreslia; `speed` a `story-id` sa čítajú na požiadanie (nie sú v
`observedAttributes`). Poradie rozlíšenia locale je: atribút `locale` → jazyk
z metadát príbehu → `<html lang>` hostiteľskej stránky → `en`.

## Vlastnosti

| Vlastnosť | Typ | Prístup | Popis |
| --- | --- | --- | --- |
| `document` | `ReaDocument \| null` | get/set | Sparsovaný príbeh. Nastavenie už sparsovaného dokumentu ho vykreslí **bez opätovného parsovania** — cesta načítania pre hostiteľa, ktorý parsuje sám (súhlasové brány, SEO, offline cache). Pri archívnych príbehoch najprv nastavte `extensions` a `mediaMap`. Nastavenie `null` element vyčistí. |
| `manifest` | `ReastManifest \| null` | get/set | Manifest pre balík, ktorý hostiteľ načítal sám, aby `chapters`/`metadata` reportovali rovnako ako pri načítaní cez `src`. Nastavte pred `document`. |
| `extensions` | `ExtensionModules \| null` | set | Skompilované `.rext` moduly pre hostiteľom načítaný balík, aby sa `{use "extensions/…"}` rozlíšil. Nastavte pred `document`. |
| `mediaMap` | `Map<string,string> \| null` | get/set | Cesta relatívna k archívu → blob/object URL. Má prednosť pred vlastnou mapou loadera elementu. URL vlastní hostiteľ — element ich nikdy neuvoľňuje. |
| `runtime` | `StoryEngine \| null` | get | Runtime príbehu — pokročilá čítacia plocha pre chrome hostiteľa (premenné, karty, vyhodnocovanie podmienok). Necachujte ju: pri revert/restart/reload sa vymení. |
| `contentRoot` | `HTMLElement` | get | Shadow kontajner s vykreslenými blokmi v poradí toku (výpočty scrollu). |
| `metadata` | `StoryMetadata \| null` | get | Názov, autori, žáner, jazyk, kapitoly, odhad času čítania, počet volieb. |
| `chapters` | `readonly ChapterInfo[]` | get | Kapitoly v poradí prehrávania. Prázdne pri plochých/bezkapitolových príbehoch. |
| `currentChapter` | `ChapterInfo \| null` | get | Práve vykreslená kapitola. |
| `waitingFor` | `'choice' \| 'external-event' \| null` | get | Na čo je príbeh zablokovaný. |
| `completed` | `boolean` | get | Či príbeh dosiahol koniec. |
| `renderedParagraph` | `{ chapter, paragraph } \| null` | get | Posledný blok, ktorý čitateľ videl vykreslený. |
| `revealedNodes` | `readonly RevealedNode[]` | get | Viditeľný tok: identita každého uzla plus či je jeho blok už odhalený. Čítacia plocha pre obsahy a UI postupu. |
| `choices` | `readonly PendingChoice[]` | get | Čakajúca skupina volieb s jej **viditeľnými** možnosťami. Indexy možností zodpovedajú `selectChoice`. |
| `highlights` | `HighlightManager` | get | Plocha pre vyhľadávacie/anotačné značky, pri prevykreslení sa automaticky preukotví. |
| `unlockCodes` | `Record<string,string>` | get | Odomykacie kódy držané pre chránený obsah (obranná kópia). |
| `locale` | `string` | get/set | Efektívne locale (pozri vyššie). Nastavenie prebuduje runtime. |

## Metódy

| Metóda | Popis |
| --- | --- |
| `load(url)` | Načítať príbeh z URL archívu `.reast`. |
| `render(text)` | Sparsovať a vykresliť surový text `.rea`. |
| `importVariables(vars)` | Zlúčiť premenné do runtime a znovu zosynchronizovať podmienený obsah. |
| `updateLocation(position)` | Vrátiť `GeoPosition` (alebo `null`) po evente `location-start`; poháňa `world.location.*`. |
| `selectChoice(nodeId, optionIndex)` | Programovo vybrať možnosť. `optionIndex` adresuje **viditeľné** možnosti — rovnaké číslovanie, aké reportuje `choices`, takže skrytá podmienená možnosť ho nikdy neposunie. Vráti `false`, ak skupina zmizla, už je vybraná, alebo je index mimo rozsahu. |
| `blockAt(index)` | Vykreslený blokový element na indexe kontajnera (číslovanie, ktoré používa `rea-progress`), alebo `null`. |
| `revertChoice(nodeId)` | Vrátiť skupinu volieb: zruší jej výber aj všetko za ním, prehrá ponechané výbery, previnie tok. |
| `restart()` | Reštartovať od začiatku a vymazať všetok stav. |
| `exportState()` | Prenositeľný, JSON-serializovateľný čítací stav (výbery, premenné, posledný vykreslený blok, odomykacie kódy), alebo `null`. |
| `importState(state)` | Obnoviť exportovaný stav, prečítaný obsah vykresliť okamžite a pokračovať v odhaľovaní za ním. Možno zavolať aj pred načítaním príbehu. |
| `setUnlockCodes(codes)` | Poskytnúť odomykacie kódy pre chránený obsah, kľúčované podľa id obsahu. |
| `use(ext)` | Zaregistrovať hostiteľské rozšírenie na tejto inštancii (pozri [Rozširovanie](extending)). |
| `unuse(name)` | Odstrániť hostiteľské rozšírenie podľa mena. Vráti, či nejaké bolo zaregistrované. |

## Udalosti

Všetky udalosti sú inštancie `CustomEvent`, ktoré bublajú.

| Udalosť | Detail | Kedy |
| --- | --- | --- |
| `rea-loaded` | — | Príbeh načítaný a vykreslený. |
| `rea-metadata` | `StoryMetadata` | Metadáta príbehu vyriešené. |
| `rea-chapter` | `ChapterInfo` | Aktuálna kapitola sa zmenila. |
| `rea-waiting` | `{ waiting }` | Stav čakania sa zmenil. |
| `rea-choice` | `{ nodeId, index }` | Čitateľ vybral voľbu. |
| `rea-undo` | `{ nodeId }` | Čitateľ vrátil voľbu. |
| `rea-progress` | `{ chapter, paragraph }` | Blok dokončil odhaľovanie. |
| `rea-complete` | — | Príbeh dosiahol koniec. |
| `rea-error` | `{ message }` | Nastala chyba načítania/parsovania/runtime. |
| `rea-media-activate` | `{ kind, src, path, alt }` | Čitateľ aktivoval mediálny element príbehu. |

### `rea-media-activate`

Zrušiteľná (cancelable) a `composed`. `kind` je `'image' | 'video' | 'audio'`;
`src` je vykresliteľná URL (`blob:` URL pri archívnych médiách); `path` je
pôvodná cesta relatívna k archívu (pomenujte podľa nej sťahovanie alebo si
položku vyhľadajte v manifeste); `alt` je alternatívny text autora. Obrázky
emitujú vždy; video/audio iba pri `media-controls="none"`. **Engine nevykresľuje
žiadny overlay** — iba nahlási aktiváciu. Predvolený lightbox dodáva jedine
standalone CDN build (zaregistrovaný cez tú istú udalosť); embedujúci hostiteľ
otvorí vlastný prehliadač a zavolá `preventDefault()`.

## Sloty

Chrome hostiteľa sa vkladá cez pomenované sloty: `before-identity`,
`after-identity`, `before-chapter`, `after-chapter`, `story-end`.

## Exporty modulu, ktoré stoja za zmienku

Z `@reast/engine` (a kde je uvedené, z `@reast/engine/player`):

| Export | Popis |
| --- | --- |
| `collectMedia(doc)` | Každá referencia na médium v poradí dokumentu, deduplikovaná podľa cesty — vrátane médií vnorených vo vetvách volieb, stavových automatoch a hookoch kariet. Aj v `/player`. |
| `resolveMediaPath(mediaMap, path)` | Rozlíšiť jednu cestu média cez mediálnu mapu, bez mutovania AST. |
| `compileExtensions(files, manifest)` | Skompilovať a overiť `.rext` moduly archívu (plus `std/*`). Aj v `@reast/engine/loader`. |
| `haversineDistance`, `bearing`, `isWithinRadius` | Geo pomocníci pre ortodrómu. |
| `isInExclusionZone`, `isInAnyExclusionZone`, `isGeoTriggerAllowed` | Bránenie zónami vylúčenia pre polohové triggery. |

## Subpath exporty

| Export | Popis |
| --- | --- |
| `@reast/engine` | Hlavný barrel — bezpečný pre Node (parser, loader, runtime, errors, types, `collectMedia`, geo). |
| `@reast/engine/parser` | Rea lexer + parser. |
| `@reast/engine/loader` | Loader `.reast` archívov (extrakcia, dešifrovanie, manifest, `compileExtensions`). |
| `@reast/engine/runtime` | `StoryEngine`, evaluátor výrazov, správca stavu. |
| `@reast/engine/player` | `<reast-engine>` webový komponent a typy hostiteľských rozšírení (iba prehliadač). |
| `@reast/engine/geo` | Geo-pozičné utility. |
| `@reast/engine/errors` | Triedy chýb a kódy. |
| `@reast/engine/types` | TypeScript definície typov. |
| `@reast/engine/validator` | `validateStory`. |
| `@reast/engine/debug` | `DebugStepper`. |

> **Poznámka:** `@reast/engine/player` používa prehliadačové API (`CSSStyleSheet`,
> `HTMLElement`). Importujte ho iba v prehliadačovom prostredí.
