# Logika a dáta: Premenné, podmienky a výrazy

> [Úvod](/sk/spec/) · [Index funkcií](features) · [Ťahák](REA-CHEATSHEET)
>
> Väčšina tejto stránky je **experimental**: vydané a v každodennom používaní, ale syntax sa v rámci 1.x ešte môže upraviť. Dve funkcie tu autorom zatiaľ dostupné nie sú — [literály súradníc](#coordinate-literals) (`draft`) a [stavové automaty](#state-machines) (`development`). Každá nesie vlastnú značku.

---

## 10. Príkazy {#_10-commands}

<Feature id="commands" />

Príkazy sú jadrovým mechanizmom interaktivity. Uzatvárajú sa do zložených zátvoriek `{ }`.

Každý príkaz je **vždy buď samouzatvárajúci, alebo párový** — nikdy oboje. Neexistuje nič ako „voliteľné párovanie".

### Samouzatvárajúce príkazy {#self-closing-commands}

```rea
{nazov_prikazu atribut=hodnota}
```

### Párové príkazy {#paired-commands}

Na otvorenie použite `begin`, zatvorte pomocou `{end nazov_prikazu}`:

```rea
{nazov_prikazu atribut=hodnota begin}
  Obsah ovplyvnený príkazom.
{end nazov_prikazu}
```

Obsah vnútri párového príkazu je rovnocenný s atribútom `content`:

```rea
{format color="#00f" begin}formátovaný text{end format}
{format color="#00f", content="formátovaný text"}
```

Obidva tvary dávajú rovnaký výsledok. Atribút `content` nastavuje parser na vnútorný text každého párového bloku, čím dáva autorovi voľbu medzi inline a blokovým štýlom bez potreby zvláštnych pravidiel parsera.

### Skrátená tlač {#print-shorthand}

<Feature id="print-shorthand" />

Samotný výraz v `{ }` sa vytlačí:

```rea
Ahoj, {story.player.name}! Máš {story.player.gold} zlata.
```

Koncepčne je to rovnaké ako vytlačenie hodnoty výrazu.

### Atribúty {#attributes}

<Feature id="attributes" />

Príkazy a funkcie zdieľajú jednotnú syntax parametrov. Parametre sa **oddeľujú čiarkami**.

**Pomenované parametre** používajú `kľúč=hodnota`:

```rea
{voice speed=3, pitch=7, emotion="whisper" begin}
Naklonila sa bližšie a vyslovila tajné slovo.
{end voice}
```

Reťazcové hodnoty s medzerami sa uvádzajú v úvodzovkách:

```rea
{button action="show_map", title="Kráľovstvo Arath"}
```

Logické atribúty možno uviesť bez hodnoty (prítomnosť znamená `true`):

```rea
{video src="intro.mp4", autoplay, loop, muted}
```

**Pozičné parametre** predchádzajú pomenovaným. Vo volaniach funkcií idú pozičné argumenty ako prvé:

```rea
{plural(story.player.gold, zero="žiadne mince", one="{} minca", other="{} mincí")}
{formatNumber(story.player.score, style="decimal", maximumFractionDigits=0)}
{max(a, b)}
```

`{}` vnútri hodnoty pomenovaného parametra vloží hodnotu prvého pozičného argumentu.

### Pomenovanie príkazov {#command-naming}

Príkazy sa dajú pomenovať pre neskoršie použitie pomocou `name=`:

```rea
{if story.player.gold > 100, name=rich_check begin}
  Predvádzaš svoje bohatstvo.
{end if}
```

Pomenované príkazy sledujú stav vykonania (pozri [Vstavané funkcie](05-reference.md#_30-built-in-functions)).

### Vyhradené kľúčové slovo {#reserved-keyword}

`end` je **vyhradené kľúčové slovo** a nemožno ho použiť ako názov príkazu. Rozpoznáva sa výhradne ako uzáver párových príkazov: `{end nazov_prikazu}`.

### Bežné atribúty príkazov {#common-command-attributes}

| Atribút  | Popis                                                          |
| -------- | -------------------------------------------------------------- |
| `name`   | Priradí názov na odkazovanie                                   |
| `repeat` | `true` (predvolené) alebo `false` — vyhodnotiť len raz         |
| `once`   | Skratka pre `repeat=false` — zobraziť len pri prvom stretnutí  |

---

## 11. Premenné a dátové typy {#_11-variables-data-types}

### Deklarovanie premenných {#declaring-variables}

<Feature id="set" />

Každá referencia na premennú a každý cieľ `{set}` musí niesť **prefix domény**. Holé meno bez bodky v pozícii `{set}` je chyba (`parse/dotless-set`). Doména je povinný prvý segment; všetko za ňou je voľný, nedeklarovaný menný priestor autora, usporiadaný do logických kategórií. Neexistuje samostatný „trvalý" a „netrvalý" druh premennej — životnosť premennej určuje výhradne doména (pozri [Rozsahy platnosti](#scoping)):

```rea
{set story.player.name = "Aiden"}
{set story.player.gold = 100}
{set story.quest.has_key = true}
{set story.player.inventory = ["meč", "fakľa", "mapa"]}
```

Bežné vzory voľného menného priestoru, pod tou doménou, ktorá zodpovedá životnosti premennej:

| Vzor                  | Použitie                       | Príklad                                       |
| --------------------- | ------------------------------ | --------------------------------------------- |
| Meno postavy          | Stav postavy                   | `story.player.gold`, `story.elena.location`   |
| Kategória objektu     | Predmety, nástroje, prostredie | `story.tool.knife`, `story.door.state`        |
| Pojem príbehu         | Príznaky, úlohy, postup        | `story.quest.has_key`, `story.flag.visited`   |
| Viacúrovňové vnorenie | Jemnejšie členenie             | `story.role.king.power`, `story.map.zone.3`   |

### Rozsahy platnosti {#scoping}

<Feature id="scopes" />

Bez premenovania domén v manifeste ([nižšie](#domain-renaming)) existujú presne tieto štyri domény:

| Doména     | Životnosť a účel                                                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `part.`    | Lokálny dočasný stav. Vynuluje sa pri každej zmene aktívnej **časti** (terminálna brána, odkaz medzi časťami alebo akýkoľvek iný prechod medzi súbormi častí) — vrátane opätovného vstupu do už navštívenej časti; obnovenie neexistuje. |
| `story.`   | Pretrváva v celom balíku `.reast`, naprieč všetkými časťami, po celý čas čítania (a medzi sedeniami cez uloženie/obnovenie).                                                   |
| `shared.`  | Pretrváva ako `story.`, ale každý zápis sa replikuje ku každému pripojenému čitateľovi v kooperatívnom sedení (`env/shared-write-conflict` — vyhráva posledný zápis).          |
| `context.` | Interakcia so svetom, čitateľom, zariadením a bežiacim sedením, len na čítanie — pozri [Doména context](#context-domain).                                                       |

```rea
{set story.player.gold = 50}
{set shared.story.player.name = "Aiden"}
{set part.scratch.attempts = 0}
```

`shared.` a `part.` sú domény samy osebe, nie modifikátory nad `story.` — `shared.story.player.name` znamená „`story.player.name` pod doménou `shared`", nie „`story.player.name` z domény story, zdieľaná".

**Rozsah nadpisu už neexistuje.** Neexistuje forma premennej bez domény — každý cieľ `{set}` aj každé čítanie nesie jednu zo štyroch domén vyššie (alebo jej premenovanie z manifestu). Autor, ktorý chce dočasný stav miestny pre sekciu, použije `part.`: správa sa ako `story.` (pretrváva cez hranice nadpisov, telá cyklov aj vetvy `{if}`) s tým rozdielom, že sa vynuluje pri zmene časti, nie na hranici nadpisu.

**Premenné cyklu (`{for}` položka/index, počítadlo `{while}`) nie sú výnimkou.** Sú to bežné premenné s prefixom domény, ktoré si autor volí ako každý iný cieľ `{set}` — `part.item` je typická voľba pre pracovný stav, ale `story.item` alebo ktorákoľvek iná doména funguje rovnako. Hlavička cyklu vykoná ekvivalent `{set <cesta> = <hodnota>}` pri každej iterácii; pozri [Cyklus for](#for-loop) a [Cyklus while](#while-loop). Po skončení cyklu sa premenná nijako nevyprázdňuje — drží poslednú hodnotu tak dlho, ako hovorí jej doména.

**Parametre funkcií sú jediná výnimka bez bodky** — pozri [Vlastné funkcie](/sk/spec/functions#parameters) (rekurzia potrebuje čerstvú väzbu pre každý rámec volania, čo zdieľaná cesta v doméne poskytnúť nevie).

### Vyhradené holé slová {#reserved-bare-words}

<Feature id="reserved-words" />

`begin`, `end`, `else`, `elseif`, `true`, `false`, `undefined` sú vyhradené ako:

- **Názov domény** (iba prvý segment): `{set begin.x = 1}` je chyba, aj keď je s bodkou — segment domény je jediné miesto, kde je holé kľúčové slovo naozaj nejednoznačné.
- **Názov funkcie**: `{function true(...) ...}` je chyba.
- **Názov atribútu**: `{image end="..."}` je chyba.

Za prvým segmentom cesty vyhradené byť nemusia (`story.quest.true` je v poriadku) a mimo týchto troch pozícií nemusia byť vyhradené ani ako lexikálne identifikátory.

### Premenovanie domén {#domain-renaming}

<Feature id="domain-renaming" />

Manifest MÔŽE premenovať štyri domény na identifikátory podľa voľby autora:

```json
{
  "domains": {
    "context": "okolie",
    "story": "pribeh"
  }
}
```

- Kľúče sú vždy kanonické anglické názvy (`part`, `story`, `shared`, `context`) — lokalizuje sa iba identifikátor v príbehu.
- Cieľ premenovania nesmie kolidovať s vyhradeným holým slovom ([vyššie](#reserved-bare-words)) ani s názvom inej domény (kanonickým či premenovaným). Obe kontroly bežia pri načítaní manifestu, ešte pred spracovaním ktoréhokoľvek súboru `.rea`.
- Cieľ premenovania musí byť platný identifikátor Rea podľa pravidla Unicode ([nižšie](#unicode-identifiers)).
- Vynechanie `domains` alebo jednotlivých kľúčov ponechá kanonický anglický názov — čiastočné premenovanie je povolené.
- Nerozpoznaný kľúč vnútri `domains` sa riadi konvenciou `pkg/manifest-unknown-key` (info, bez dôsledku pre čitateľa), nie tvrdým zlyhaním.

### Doména context {#context-domain}

<Feature id="context-domain" />

`context.` je okno platformy na čitateľa, zariadenie, svet a bežiace sedenie, určené len na čítanie. Predvolená tabuľka schopností:

| Cesta                                             | Typ      | Poznámky                                                              |
| ------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| `context.reader.name`                             | string   |                                                                        |
| `context.reader.language`                         | string   |                                                                        |
| `context.reader.age`                              | integer  |                                                                        |
| `context.story.title`                             | string   | Metadáta platformy — nie vyhradený podstrom `story.meta.*`.            |
| `context.story.chapter`                           | string   |                                                                        |
| `context.story.progress`                          | float    |                                                                        |
| `context.time.now`                                | datetime |                                                                        |
| `context.time.date`                               | string   |                                                                        |
| `context.time.hour` / `.minute`                   | integer  |                                                                        |
| `context.time.day` / `.month` / `.year`           | integer  |                                                                        |
| `context.time.weekday`                            | string   | Názov dňa, malými písmenami.                                           |
| `context.time.season`                             | string   | Podľa pologule.                                                        |
| `context.weather`                                 | string   | `clear`, `rain`, `snow`, `fog`, `storm`.                               |
| `context.temperature` / `.wind` / `.humidity`     | float    | Stupne Celzia, m/s, percentá.                                          |
| `context.location`                                | point    | Návrh gramatiky súradnicových literálov zatiaľ obmedzuje priame porovnávanie. |
| `context.location.lat` / `.lng` / `.alt` / `.acc` | float    |                                                                        |
| `context.heading` / `.speed`                      | float    | Kurz kompasu 0–360, rýchlosť v m/s.                                    |
| `context.orientation`                             | float    | Otočenie zariadenia, 0–360.                                            |
| `context.tilt.x` / `.y`                           | float    | Náklon dopredu/dozadu a doľava/doprava.                                |
| `context.acceleration.x` / `.y` / `.z`            | float    |                                                                        |
| `context.light`                                   | float    | Okolité svetlo v luxoch.                                               |
| `context.device.camera` / `.gps` / `.vibration`   | boolean  |                                                                        |
| `context.group.size`                              | integer  |                                                                        |
| `context.group.readers`                           | array    |                                                                        |
| `context.group.role`                              | string   |                                                                        |

Toto nahrádza staré vstavané menné priestory `reader.*`, `world.*`, `device.*`, `group.*` — nekompatibilná zmena bez prechodovej vrstvy; príbeh, ktorý sa odvoláva na `world.location`, dostane `link/unknown-domain`. Naskenovaná či vyslovená hodnota (`{scan}`/`{listen}`) zostáva lexikálnou väzbou `event.kind`/`event.value`, nie cestou `context.*` — neexistuje „posledný výsledok skenu", ktorý by sa dal priebežne čítať. Dva vstavané prvky, ktoré viseli na mennom priestore, sa stávajú obyčajnými globálnymi funkciami v štýle `max()`/`length()`: `world.has(feature)` je **`has(feature)`** a `group.readers_in_role(role)` je **`readers_in_role(role)`**.

**To, čo čitateľ nesie, nie je `context.`** — `{give}`/`{take}` a peňaženka zapisujú do `story.reader.inventory`, `story.reader.pocket` a `story.reader.coins`, teda pod `story.`, pretože sú dôsledkom príbehu a uloženie ich musí niesť so sebou. `context.` je len to, čo platforma pozoruje a príbeh zmeniť nemôže.

Manifest MÔŽE premenovať jednotlivé cesty `context.*` nezávisle od premenovania domény:

```json
{
  "domains": { "context": "okolie" },
  "context": { "location": "poloha" }
}
```

**Zapisovateľnosť:** `context.` je celá len na čítanie — `{set context.* = ...}` na ktorejkoľvek ceste je chyba (`eval/context-write-refused`). Každú súčasnú cestu napĺňa platforma, nikdy `{set}`.

**Redakcia:** *hodnota* žiadnej cesty `context.` sa nikdy nesmie objaviť v diagnostickom zázname, pri žiadnej závažnosti — názov typu sa uviesť smie, hodnota nikdy. Bez výnimiek podľa cesty (`context.time.hour` nie je „len hodina, to je v poriadku" — redaguje sa rovnako ako `context.location`).

### Metadáta príbehu {#story-metadata}

<Feature id="story-metadata" />

`meta` je vyhradený ako prvý voľný segment **iba** pod `story.`:

```rea
story.meta.title
story.meta.chapter
story.meta.progress
```

`part.meta.*`, `shared.meta.*` a `context.meta.*` sú bežný menný priestor autora — nie sú vyhradené. `{set story.meta.* = ...}` na ktorejkoľvek ceste v tomto podstrome je chyba: `eval/story-meta-write-refused`.

### Identifikátory Unicode {#unicode-identifiers}

<Feature id="unicode-identifiers" />

Identifikátory Rea (segmenty domén po prípadnom premenovaní z manifestu a všetko vo voľnom mennom priestore autora) sú definované nad znakmi Unicode Identifier and Pattern Syntax (`ID_Start`/`ID_Continue`, podľa UAX #31) plus `_` a číslice v pokračovacej pozícii, s výnimkou tej ASCII interpunkcie, ktorú si gramatika Rea už vyhradzuje (`.`, `,`, `=`, zátvorky, úvodzovky). `周囲.位置` je presne tak platné ako `context.location`.

Každý identifikátor sa porovnáva a ukladá v **NFC (Normalization Form C)**, normalizovaný hneď pri načítaní, pred akýmkoľvek porovnaním, uložením či diagnostikou — predkomponovaný zápis a zápis s kombinujúcimi znakmi toho istého viditeľného identifikátora sú vždy tá istá premenná.

**Miešanie zameniteľných písiem je diagnostika, nie chyba:** identifikátor, ktorý mieša znaky z dvoch alebo viacerých písiem {latinka, cyrilika, gréčtina} zameniteľné navzájom podľa tabuľky Unicode confusables, dostane `style/confusable-identifier` (info) s uvedením zmiešaných písiem. Spoločné a zdedené znaky (číslice, `_`, kombinujúce znaky) sa do počtu písiem nerátajú, takže identifikátor v jedinom nelatinskom písme (`周囲.位置`, `context.météo`) sa neoznačí nikdy — kontrola je zámerne úzka: zachytáva zámenu homoglyfom, ktorá má vyzerať identicky, nie bežné lokalizované identifikátory.

### Mazanie cez `undefined` {#deletion}

<Feature id="deletion" />

`{set story.x = undefined}` premennú zmaže — ďalšie čítanie `story.x` je nerozoznateľné od stavu, keď nikdy nastavená nebola. Priradenie `undefined` uzlu s potomkami zmaže celý podstrom. Príkaz na vyčistenie celej domény neexistuje — zmazanie všetkého pod doménou je `{set domena.koren = undefined}` na najplytkejšom spoločnom predkovi, keďže mazanie podstromu to už pokrýva.

### Dátové typy {#data-types}

<Feature id="data-types" />

| Typ         | Príklad          | Popis                                        |
| ----------- | ---------------- | -------------------------------------------- |
| `string`    | `"ahoj"`         | Textová hodnota, vždy v dvojitých úvodzovkách |
| `integer`   | `42`             | Celé číslo                                   |
| `float`     | `3.14`           | Desatinné číslo                              |
| `boolean`   | `true`, `false`  | Logická hodnota                              |
| `array`     | `[1, 2, "adam"]` | Usporiadaná kolekcia                         |
| `regex`     | `/^[a-z]+$/i`    | Regulárny výraz — literál napravo od [`matches`](#pattern-membership-tests). Zatiaľ nie hodnota, ktorú by premenná mohla držať: uloženie je JSON a uložený vzor by ho neprežil. |
| `undefined` | `undefined`      | Prázdna hodnota                              |

**Reťazce vždy vyžadujú dvojité úvodzovky** — neexistujú reťazcové literály bez úvodzoviek. Holé slovo vo výraze je vždy odkaz na premennú, nikdy nie reťazec. Tým sa odstraňuje nejednoznačnosť:

```rea
{set story.player.name = "Aiden"}
{set story.player.weapon = "sword"}
{if story.player.weapon = "sword" begin}
```

Tu je `"sword"` reťazcová hodnota a `story.player.weapon` premenná — jediné, čo ich odlišuje, sú úvodzovky, a tie nie sú nikdy voliteľné.

V atribútoch príkazov reťazcové hodnoty takisto vyžadujú úvodzovky. Holé hodnoty atribútov sa interpretujú ako čísla, logické hodnoty alebo odkazy na identifikátory — nie ako reťazce:

```rea
{voice speaker="elena", emotion="whisper", speed=3 begin}
{input name=guess, type="number", placeholder="Zadajte číslo"}
```

`speed=3` je číslo (bez úvodzoviek), `name=guess` je naviazanie identifikátora (názov premennej, kam sa uloží vstup) a `emotion="whisper"` je reťazcová hodnota (v úvodzovkách).

### Polia {#arrays}

<Feature id="arrays" />

**Polia** sú univerzálnym kolekčným typom. Položky sa oddeľujú čiarkami a môžu byť **pozičné** (indexované podľa poradia), **pomenované** (indexované kľúčom) alebo oboje:

```rea
{set story.player.inventory = ["meč", "fakľa", "mapa"]}
{set story.stats = [strength=10, dexterity=8, wisdom=12]}
{set story.mixed = ["prvá pozičná", 12.345, shift=true]}
```

K pozičným položkám sa pristupuje **indexom od nuly** (prvá položka je `.0`, druhá `.1` atď.), k pomenovaným kľúčom:

```rea
{story.player.inventory.0}
{stats.strength}
{mixed.0}
{mixed.shift}
```

Pri miešaní pozičných a pomenovaných položiek musia pozičné predchádzať pomenované — v súlade s parametrami funkcií. Pomenované položky sa dajú preusporiadať voľne.

### Hodnoty dátumu, času a trvania {#date-time-duration-values}

<Feature id="datetime-types" />

**Konštruktorové typy** (typy počas behu bez literálovej syntaxe):

| Konštruktor                       | Popis                                            |
| --------------------------------- | ------------------------------------------------ |
| `datetime("2026-06-15T10:30:00")` | Časová značka ISO 8601, podporuje zástupné `*`   |
| `duration("P1DT2H30M")`           | Trvanie podľa ISO 8601                           |

### Literály súradníc {#coordinate-literals}

<Feature id="coordinate-literals" />

Geografické hodnoty sa zapisujú znakom `@`, nie konštruktorovou funkciou, pretože príbeh opretý o reálne miesta ich píše veľmi veľa:

| Literál             | Popis                                              |
| ------------------- | -------------------------------------------------- |
| `@lat;lng`          | Geografický bod                                    |
| `@p1@p2@p3`         | Trasa alebo čiara (reťaz bodov)                    |
| `@@lat;lng/polomer` | Kruh (polomer v metroch)                           |
| `@@p1@p2/polomer`   | Koridor (čiara s obalom daného polomeru, v metroch) |
| `@@p1@p2@p3@p1`     | Mnohouholník (uzavretá reťaz bodov)                |
| `@@.../polomer`     | Nafúknutý mnohouholník (mnohouholník s obalom)     |
| `@@oblast1 + @@oblast2` | Zjednotenie oblastí                            |
| `@@oblast1 - @@oblast2` | Rozdiel oblastí (šiška, vylúčenie)             |

Body používajú `@`, oblasti `@@`. Oddeľovačom vnútri súradnice je **bodkočiarka**, nikdy nie čiarka — čiarka už oddeľuje argumenty, medzi ktorými súradnica stojí. Polomer je vždy v metroch. Príklady:

```rea
{set story.home = @48.14;17.10}
{set story.park = @@48.14;17.10/500}
{set story.forest = @@48.14;17.10@48.15;17.10@48.15;17.11@48.14;17.11}
{set story.donut = @@48.14;17.10/1000 - @@48.14;17.10/200}
```

Jediné miesto, kde jadro dnes súradnicu číta, je príkaz [`{waypoint}`](03-narrative-interaction.md#waypoints), ktorý si ju parsuje sám. Priradenie súradnice do premennej alebo test `context.location` proti oblasti si vyžaduje, aby sa gramatika výrazov naučila `@` — presne to znamená značka `draft` vyššie.

### Zástupné znaky v dátume a čase {#datetime-wildcards}

Zástupné znaky umožňujú vzory podľa času pomocou reťazcov konštruktora `datetime()`:

```rea
{if context.time.now matches datetime("*-12-24T*") begin}
  Veselé Vianoce, {context.reader.name}!
{end if}

{if context.time.now matches datetime("*-*-*T22:*:*") begin}
  Noc sa okolo teba prehlbuje…
{end if}
```

---

## 12. Výrazy a operátory {#_12-expressions-operators}

<Feature id="operators" />

Výrazy sa môžu objaviť kdekoľvek vnútri `{ }`. Riadia sa štandardnými pravidlami priority.

### Atómy výrazu {#expression-atoms}

Výraz sa skladá z týchto atomárnych prvkov:

| Atóm               | Príklad                             | Popis                                   |
| ------------------ | ----------------------------------- | --------------------------------------- |
| Literál            | `42`, `"text"`, `true`, `[1, 2, 3]` | Číslo, reťazec, logická hodnota či pole |
| Premenná           | `story.player.gold`, `story.quest.has_key`      | Cesta k premennej s prefixom domény     |
| Volanie funkcie    | `max(a, b)`, `length(inv.items)`    | Volanie s argumentmi oddelenými čiarkou |
| Zoskupený výraz    | `(story.player.gold + bonus) * 2`         | Zátvorky prebijú prioritu               |

### Priorita operátorov (od najvyššej po najnižšiu) {#operator-precedence-highest-to-lowest}

| Priorita | Operátor              | Popis                                  |
| -------- | --------------------- | -------------------------------------- |
| 1        | `( )`                 | Zoskupenie                             |
| 2        | `.`                   | Prístup k vlastnosti                   |
| 3        | `f()`                 | Volanie funkcie                        |
| 4        | `-`, `!`              | Unárne mínus, logické NIE              |
| 5        | `*`, `/`, `%`         | Násobenie, delenie, zvyšok             |
| 6        | `+`, `-`              | Sčítanie, odčítanie, spájanie reťazcov |
| 7        | `matches`, `!matches` | Zhoda so vzorom, negovaná              |
| 8        | `in`, `!in`           | Test členstva, negovaný                |
| 9        | `<`, `<=`, `>`, `>=`  | Porovnanie                             |
| 10       | `=`, `!=`             | Rovnosť, nerovnosť                     |
| 11       | `and`                 | Logické A                              |
| 12       | `or`                  | Logické ALEBO                          |
| 13       | `? :`                 | Ternárna podmienka                     |

### Testy vzoru a členstva {#pattern-membership-tests}

<Feature id="pattern-matching" />

`matches` testuje hodnotu proti regulárnemu výrazu a `in` testuje členstvo v poli. Oba sú kľúčové slová, nie symboly, a oba sa negujú prefixom `!`:

```rea
{if story.player.name matches /^[A-Z]/ begin}
{if "sword" !in story.player.inventory begin}
```

### Ternárna podmienka {#ternary-conditional}

<Feature id="ternary" />

Ternárny operátor poskytuje inline podmienené hodnoty:

```rea
{set story.mood = story.player.health < 50 ? "zúfalý" : "odhodlaný"}
Hrdina vyzerá {gold > 0 ? "nádejne" : "skleslo"}.
```

Najprv sa vyhodnotí podmienka; ak je pravdivá, vráti sa výraz pred `:`, inak výraz za `:`. Ternárny operátor má **najnižšiu** prioritu — pri vnáraní použite zátvorky:

```rea
{(is_night ? 2 : 1) * base_damage}
```

**Poznámky:**

- `=` vo výrazoch je rovnosť (nie priradenie). Priraďuje sa príkazom `{set}`.
- `and` a `or` používajú skrátené vyhodnocovanie.
- Unárne `-` neguje číslo: `-story.player.gold`, `-(a + b)`.
- `+` s reťazcovým operandom spája: `"Ahoj, " + story.player.name`
- Reťazce prístupov k vlastnostiam sa vyhodnocujú zľava doprava: `context.group.readers.0.name`

### Správanie reťazcov {#string-behavior}

Reťazce sú **nepriehľadné hodnoty** — syntax `{výraz}` sa vnútri reťazcových literálov NEinterpretuje. Dynamické reťazce sa skladajú spájaním:

```rea
{set msg.greeting = "Ahoj, " + context.reader.name + "!"}
```

Syntax `{výraz}` funguje len v **naratívnom texte** (mimo reťazcových literálov), kde sa vyhodnotí a jej výsledok sa vloží priamo do textu.

### Pretypovanie vo výrazoch {#type-coercion-in-expressions}

<Feature id="type-coercion" />

Keď majú operandy rôzne typy, Rea uplatní implicitné pretypovanie:

- **Sčítanie a spájanie** (`+`): ak je čo len jeden operand reťazec, výsledkom je reťazec (spojenie). Inak číselné sčítanie
- **Aritmetika** (`-`, `*`, `/`, `%`): operandy sa pretypujú na čísla. Nečíselné reťazce dajú `undefined`
- **Porovnanie** (`<`, `>`, `<=`, `>=`): oba sa podľa možnosti pretypujú na čísla, inak sa porovnávajú ako reťazce
- **Rovnosť** (`=`, `!=`): bez pretypovania — typy sa musia zhodovať, okrem `""`, ktoré sa rovná `false` (oboje nepravdivé)
- **Logický kontext** (`if`, `and`, `or`, `!`): nepravdivé hodnoty sú `false`, `0`, `""`, `undefined` a prázdne pole `[]`

**Základné pravidlo: reťazec + čokoľvek = reťazec.** Keď `+` narazí na reťazcový operand, druhý operand sa prevedie na svoju reťazcovú podobu a výsledok sa spojí.

| Výraz                | Výsledok          | Prečo                                       |
| -------------------- | ----------------- | ------------------------------------------- |
| `"zlato: " + 42`     | `"zlato: 42"`     | Reťazec + číslo → spojenie                  |
| `"má kľúč: " + true` | `"má kľúč: true"` | Reťazec + logická hodnota → spojenie        |
| `42 + 8`             | `50`              | Číslo + číslo → sčítanie                    |
| `"3" + "7"`          | `"37"`            | Reťazec + reťazec → spojenie                |
| `"3" * 2`            | `6`               | Aritmetika pretypuje na číslo               |
| `"ahoj" * 2`         | `undefined`       | Nečíselný reťazec → aritmetika zlyhá        |

### Explicitná konverzia typov {#explicit-type-conversion}

Na explicitný prevod medzi typmi slúžia konverzné funkcie:

| Funkcia      | Popis                                                                        |
| ------------ | ---------------------------------------------------------------------------- |
| `number(x)`  | Prevod na číslo. `number("42")` → `42`, `number("abc")` → `undefined`        |
| `string(x)`  | Prevod na reťazec. `string(42)` → `"42"`, `string(true)` → `"true"`          |
| `boolean(x)` | Prevod na logickú hodnotu. Nepravdivé hodnoty → `false`, všetko ostatné → `true` |
| `integer(x)` | Prevod na celé číslo (oreže). `integer(3.7)` → `3`                           |

```rea
{set total = number(reader_input) + story.player.gold}
{set label = "Skóre: " + string(story.player.score)}
{set has_items = boolean(length(story.player.inventory))}
```

### Príklady {#examples}

```rea
{story.player.gold * 2 + combat.bonus}
{story.player.level >= 10 and story.quest.has_key}
{story.player.name matches /^[A-Z]/}
{"sword" in story.player.inventory}
{!door.is_locked or story.quest.has_master_key}
{story.player.health < 50 ? "utekaj" : "bojuj"}
{-combat.penalty + combat.bonus}
{context.reader.name + " — " + upper(story.player.class)}
```

---

## 13. Riadenie toku {#_13-control-flow}

### If / Else if / Else {#if-else-if-else}

<Feature id="if-else" />

```rea
{if story.player.gold > 100 begin}
  Kupec sa chamtivo usmeje.
{else if story.player.gold > 50}
  Kupec zdvorilo prikývne.
{else}
  Kupec sa na teba pozrie s ľútosťou.
{end if}
```

### Switch / Case {#switch-case}

<Feature id="switch-case" />

```rea
{switch story.player.class begin}
{case "warrior"}
  Vytasíš meč.
{case "mage"}
  Zdvihneš palicu.
{case "rogue"}
  Roztopíš sa v tieňoch.
{default}
  Zostaneš stáť na mieste.
{end switch}
```

### Cyklus for {#for-loop}

<Feature id="for-loop" />

```rea
{for item in story.player.inventory begin}
  Máš: {item}
{end for}
```

S premennou indexu (definovanou za čiarkou pred `begin`):

```rea
{for item in story.player.inventory, index begin}
  {index + 1}. {item}
{end for}
```

Premenná indexu začína na 0 a s každou iteráciou sa zvyšuje.

### Cyklus while {#while-loop}

<Feature id="while-loop" />

```rea
{while lock.attempts > 0 begin}
  Znova skúsiš zámok…
  {set lock.attempts = lock.attempts - 1}
{end while}
```

S počítadlom iterácií (definovaným za čiarkou pred `begin`):

```rea
{while lock.attempts > 0, tryNumber begin}
  Pokus {tryNumber + 1}: znova skúsiš zámok…
  {set lock.attempts = lock.attempts - 1}
{end while}
```

Premenná počítadla začína na 0 a s každou iteráciou sa zvyšuje.

### Break a continue {#break-continue}

<Feature id="break-continue" />

```rea
{for item in story.player.inventory begin}
  {if item = "cursed_ring" begin}
    {continue}
  {end if}
  Prezrieš si {item}.
  {if item = "golden_key" begin}
    Toto je ono! {break}
  {end if}
{end for}
```

### Stavové automaty {#state-machines}

<Feature id="state-machines" />

Formálne stavové automaty modelujú entity, ktoré prechádzajú medzi pomenovanými stavmi na základe udalostí a podmienok. Hodia sa na dvere, postavy, systémy počasia či akúkoľvek entitu s odlišnými režimami správania:

```rea
{state_machine door, initial="locked" begin}
  {state locked begin}
    Dvere sú pevne zamknuté.
    {on unlock when has_key begin}
      Otočíš kľúčom. Cvak!
      {-> closed}
    {end on}
  {end state}

  {state closed begin}
    Dvere sú zatvorené, ale odomknuté.
    {on open begin}
      Dvere sa rozletia.
      {-> open}
    {end on}
    {on lock begin}
      Zamkneš za sebou.
      {-> locked}
    {end on}
  {end state}

  {state open begin}
    Dverný otvor stojí pred tebou dokorán.
    {on close begin}
      Pritiahneš dvere.
      {-> closed}
    {end on}
  {end state}
{end state_machine}
```

**Atribúty stavového automatu:**

| Atribút   | Popis                                          |
| --------- | ---------------------------------------------- |
| `initial` | Počiatočný stav (povinný)                      |
| `persist` | `true` na uloženie stavu medzi reláciami       |
| `shared`  | `true` na zdieľanie stavu medzi čitateľmi      |

Prístup k stavu a spúšťanie prechodov:

Aktuálny stav automatu sa dá čítať na `story.<id>.state` — je to bežný stav príbehu, len ho zapisuje automat, nie `{set}`:

```rea
{if story.door.state = "locked" begin}
  Potrebuješ kľúč.
{end if}

{trigger door.unlock}
```

Strážne podmienky na prechodoch bránia neplatným zmenám stavu:

```rea
{on unlock when story.quest.has_key and !alarm.active begin}
  {-> closed}
{end on}
```

---

## 14. Funkcie {#_14-functions}

<Feature id="functions" />

Vlastné funkcie definované pomocou `{function}…{end function}` — klasifikácie čistá, šablónová,
hybridná a s vedľajším účinkom, správanie podľa kontextu volania, parametre s predvolenými
hodnotami a to, ktoré klasifikácie smie exportovať súbor `.rext` — majú teraz vlastnú stránku:
pozri [Vlastné funkcie](/sk/spec/functions).

---

## 15. Udalosti {#_15-events}

<Feature id="events" />

Udalosti reagujú na spúšťače platformy. Definujú sa pomocou `{on nazov_udalosti begin}`:

```rea
{on story_start begin}
  {set story.player.gold = 100}
  {set story.player.health = 100}
{end on}

{on chapter_start begin}
  Začína sa ďalšia kapitola tvojej cesty…
{end on}

{on shake begin}
  Zem sa ti chveje pod nohami!
{end on}
```

### Vstavané udalosti {#built-in-events}

| Udalosť          | Spúšťač                                    |
| ---------------- | ------------------------------------------ |
| `story_start`    | Príbeh sa otvoril prvýkrát                 |
| `story_resume`   | Príbeh sa znovu otvoril po zatvorení       |
| `chapter_start`  | Začína nová kapitola                       |
| `chapter_end`    | Kapitola je dokončená                      |
| `timer`          | Časovač dosiahol nulu                      |
| `shake`          | Zariadením sa zatriaslo                    |
| `screenshot`     | Čitateľ urobil snímku obrazovky            |
| `idle`           | Čitateľ je istý čas nečinný                |
| `proximity`      | Neďaleko je iný čitateľ (kooperatívne)     |
| `location_enter` | Čitateľ vstúpil do geografickej oblasti    |
| `location_exit`  | Čitateľ opustil geografickú oblasť         |
| `time_match`     | Reálny čas zodpovedá vzoru                 |
| `weather_match`  | Poveternostná podmienka zodpovedá vzoru    |
| `scan`           | Čitateľ naskenoval QR alebo čiarový kód    |

### Parametrizované udalosti {#parameterized-events}

Niektoré udalosti prijímajú parametre, ktoré filtrujú, kedy sa spustia:

```rea
{on time_match datetime("*-12-25T*") begin}
  Veselé Vianoce!
{end on}

{on weather_match "snow" begin}
  Za oknom sa znášajú snehové vločky.
{end on}

{on shake, intensity=3 begin}
  Zem sa prudko otriasa!
{end on}
```

Parameter spúšťač zužuje. Bez parametrov sa udalosť spustí pri akejkoľvek zhode (napr. `{on scan begin}` sa spustí pri každom skenovaní, `{on scan "CODE-42" begin}` len vtedy, keď sa naskenuje „CODE-42").

### Uloženie a kontrolné body {#save-checkpoints}

<Feature id="checkpoints" />

Platforma automaticky ukladá postup čitateľa po každej voľbe. Autori môžu definovať pomenované kontrolné body ako výslovné miesta uloženia a obnovenia:

```rea
{checkpoint name="before_boss"}
```

Čitatelia sa môžu vrátiť ku ktorémukoľvek kontrolnému bodu cez rozhranie platformy. Autori môžu kontrolné body obnoviť aj programovo:

```rea
{restore name="before_boss"}
```

#### Čo snímka zachytáva {#what-a-snapshot-captures}

Snímka (či už automatické uloženie, alebo pomenovaný kontrolný bod) zachytáva **kompletný stav čitateľa**:

| Kategória            | Čo sa ukladá                                                                       |
| -------------------- | ---------------------------------------------------------------------------------- |
| Premenné             | Všetky hodnoty `{set}` vrátane vnorených vlastností a premenných v rozsahu nadpisu |
| Pozícia              | Aktuálna pasáž, posun v riadku, zásobník aktívnych volieb                          |
| Počty návštev        | Koľkokrát bola každá kotva či nadpis navštívená                                    |
| Atribúty čitateľa    | Jazyk, meno, rola, vlastné metadáta                                                |
| Stavové automaty     | Aktuálny stav každého `{state_machine}`                                            |
| Príznaky blokov once | Ktoré bloky `{once}` sa už spustili                                                |
| Indexy cyklov        | Aktuálna pozícia v každom `{cycle}`                                                |
| Text návestí         | Aktuálny text každého `{label}` (po prípadnom `{replace}`)                          |
| Inventár kariet      | Predmety pridané a odobrané cez `{give}` / `{take}`                                |
| Stav balíčka         | Ktoré storylety už boli vytiahnuté a čo ostáva vo výbere                           |
| Stav časovačov       | Aktívne časovače sa pri uložení **pozastavia** a pri obnovení **pokračujú**        |
| Prehrávanie médií    | Pozície zvuku a videa sa **neukladajú** — médiá sa pri obnovení spustia odznova    |

Pri kooperatívnom čítaní snímka navyše zachytáva:

| Kategória              | Čo sa ukladá                                                     |
| ---------------------- | ---------------------------------------------------------------- |
| Zdieľané premenné      | Všetky hodnoty `shared.*`                                        |
| Stav jednotlivých čitateľov | Individuálny stav každého čitateľa (premenné, pozícia, inventár) |
| Priradenie rolí        | Aktuálne naviazania `{define role}`                              |
| Stav zámkov            | Ktoré bloky `{lock}` sú aktívne a kto ich drží                   |
| Výsledky hlasovaní a pretekov | Dokončené výsledky hlasovaní a pretekov                   |

Kontrolné body v kooperatívnom čítaní vyžadujú pred obnovením súhlas **všetkých pripojených čitateľov**. Ak je čitateľ odpojený, jeho súhlas potrebný nie je — platforma mu stav obnoví, keď sa znovu pripojí.

#### Ručné uloženie {#manual-save}

Čitatelia môžu ručne uložiť **kedykoľvek počas čítania** (nielen v kontrolných bodoch definovaných autorom). Ručné uloženia zachytávajú tie isté údaje ako kontrolné body. Autori môžu ručné ukladanie pre konkrétne sekcie vypnúť:

```rea
{save enabled=false}
{comment Automatické ukladanie stále beží, ale čitateľ nemôže ručne uložiť ani načítať}
```

Keď je `{save enabled=false}` aktívne, rozhranie platformy skryje tlačidlo uloženia. Automatické ukladanie pri voľbách pokračuje, aby sa postup nestratil pri páde aplikácie.

#### Prenositeľnosť uložení medzi verziami príbehu {#save-portability-across-story-versions}

Uloženia sú **viazané na konkrétnu verziu príbehu** (pole metadát `version`). Keď sa príbeh aktualizuje:

- **Zmena verzie patch** (napr. `1.0.0` → `1.0.1`): uloženia sa načítajú normálne. Chýbajúce nové premenné použijú svoje predvolené hodnoty. Odstránené premenné sa ticho ignorujú.
- **Zmena verzie minor** (napr. `1.0` → `1.1`): platforma sa pokúsi uloženie načítať. Ak aktuálna pozícia čitateľa už neexistuje (pasáž bola odstránená alebo premenovaná), platforma sa vráti k najbližšiemu platnému kontrolnému bodu alebo na začiatok aktuálnej kapitoly.
- **Zmena verzie major** (napr. `1.x` → `2.x`): uloženia sú **nekompatibilné**. Platforma to čitateľovi oznámi a ponúkne začať odznova.

Platforma ukladá uloženia ako JSON. Schéma obsahuje pole `spec_version` (verzia jazyka Rea) a pole `story_version` (verzia autora), vďaka čomu runtime dokáže zistiť kompatibilitu.

---
