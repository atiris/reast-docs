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
Ahoj, {player.name}! Máš {player.gold} zlata.
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
{plural(player.gold, zero="žiadne mince", one="{} minca", other="{} mincí")}
{formatNumber(player.score, style="decimal", maximumFractionDigits=0)}
{max(a, b)}
```

`{}` vnútri hodnoty pomenovaného parametra vloží hodnotu prvého pozičného argumentu.

### Pomenovanie príkazov {#command-naming}

Príkazy sa dajú pomenovať pre neskoršie použitie pomocou `name=`:

```rea
{if player.gold > 100, name=rich_check begin}
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

Všetky trvalé premenné musia mať **prefix domény** — bodkami oddelený menný priestor, ktorý organizuje stav do logických kategórií:

```rea
{set player.name = "Aiden"}
{set player.gold = 100}
{set quest.has_key = true}
{set player.inventory = ["meč", "fakľa", "mapa"]}
```

Názvy domén si autori volia voľne. Bežné vzory:

| Vzor domény         | Použitie                    | Príklad                         |
| ------------------- | --------------------------- | ------------------------------- |
| Meno postavy        | Stav postavy                | `player.gold`, `elena.location` |
| Kategória objektu   | Predmety, nástroje, prostredie | `tool.knife`, `door.state`   |
| Pojem príbehu       | Príznaky, úlohy, postup     | `quest.has_key`, `flag.visited` |
| Viacúrovňové vnorenie | Jemnejšie členenie        | `role.king.power`, `map.zone.3` |

### Rozsahy platnosti {#scoping}

<Feature id="scopes" />

Premenné existujú v troch rozsahoch:

| Rozsah      | Syntax                          | Popis                                                                                                                     |
| ----------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **príbeh**  | `{set domena.premenna = hod}`   | Predvolený. Dostupný v celom reaste.                                                                                      |
| **zdieľaný** | `{set shared.domena.premenna = hod}` | Zdieľaný medzi všetkými čitateľmi v skupine. Pretrváva medzi reastami v sérii.                                     |
| **nadpis**  | `{set jednoducha = hod}`        | Platný v aktuálnom nadpise a jeho podnadpisoch. Prestáva existovať, keď sa začne nadpis rovnakej alebo vyššej úrovne.     |

```rea
{set player.gold = 50}
{set shared.player.name = "Aiden"}
```

Prefix `shared.` je modifikátor rozsahu — `shared.player.name` znamená „premenná `player.name` zdieľaná medzi všetkými čitateľmi v skupine a medzi reastami".

**Premenné v rozsahu nadpisu** používajú jednoduché názvy **bez** bodky (bez prefixu domény):

```rea
## Hrad

{set strength = 50}

### Brána
{comment begin}strength je tu stále 50 — podnadpis dedí rozsah rodiča{end comment}

## Po obliehaní
{comment begin}strength už neexistuje — nový nadpis rovnakej úrovne{end comment}
```

Premenné v rozsahu nadpisu sú ideálne pre dočasný stav miestny pre príbeh, ktorý nemá pretrvať za hranicu aktuálnej naratívnej sekcie. Premenné cyklu (`{for}`) a parametre funkcií majú podobný rozsah bez domény.

### Vstavané menné priestory premenných {#built-in-variable-namespaces}

<Feature id="builtin-namespaces" />

Platforma poskytuje menné priestory len na čítanie (alebo na čítanie aj zápis tam, kde je to uvedené):

| Menný priestor | Popis                        | Príklady                                                                                                              |
| -------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `reader.*`     | Informácie o čitateľovi      | `reader.name`, `reader.language`, `reader.age`                                                                        |
| `story.*`      | Informácie o príbehu         | `story.title`, `story.chapter`, `story.progress`                                                                      |
| `world.*`      | Kontext reálneho sveta       | `world.time`, `world.date`, `world.hour`, `world.day`, `world.month`, `world.year`, `world.location`, `world.weather` |
| `device.*`     | Schopnosti zariadenia        | `device.camera`, `device.gps`, `device.vibration`                                                                     |
| `group.*`      | Kooperatívne čítanie         | `group.size`, `group.readers`, `group.role`                                                                           |

### Dátové typy {#data-types}

<Feature id="data-types" />

| Typ         | Príklad          | Popis                                        |
| ----------- | ---------------- | -------------------------------------------- |
| `string`    | `"ahoj"`         | Textová hodnota, vždy v dvojitých úvodzovkách |
| `integer`   | `42`             | Celé číslo                                   |
| `float`     | `3.14`           | Desatinné číslo                              |
| `boolean`   | `true`, `false`  | Logická hodnota                              |
| `array`     | `[1, 2, "adam"]` | Usporiadaná kolekcia                         |
| `regex`     | `/^[a-z]+$/i`    | Regulárny výraz                              |
| `undefined` | `undefined`      | Prázdna hodnota                              |

**Reťazce vždy vyžadujú dvojité úvodzovky** — neexistujú reťazcové literály bez úvodzoviek. Holé slovo vo výraze je vždy odkaz na premennú, nikdy nie reťazec. Tým sa odstraňuje nejednoznačnosť:

```rea
{set player.name = "Aiden"}
{set player.weapon = "sword"}
{if player.weapon = "sword" begin}
```

Tu je `"sword"` reťazcová hodnota a `player.weapon` premenná — jediné, čo ich odlišuje, sú úvodzovky, a tie nie sú nikdy voliteľné.

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
{set player.inventory = ["meč", "fakľa", "mapa"]}
{set stats = [strength=10, dexterity=8, wisdom=12]}
{set mixed = ["prvá pozičná", 12.345, shift=true]}
```

K pozičným položkám sa pristupuje **indexom od nuly** (prvá položka je `.0`, druhá `.1` atď.), k pomenovaným kľúčom:

```rea
{player.inventory.0}
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
{set home = @48.14;17.10}
{set park = @@48.14;17.10/500}
{set forest = @@48.14;17.10@48.15;17.10@48.15;17.11@48.14;17.11}
{set donut = @@48.14;17.10/1000 - @@48.14;17.10/200}
```

Jediné miesto, kde jadro dnes súradnicu číta, je príkaz [`{waypoint}`](03-narrative-interaction.md#waypoints), ktorý si ju parsuje sám. Priradenie súradnice do premennej alebo test `world.location` proti oblasti si vyžaduje, aby sa gramatika výrazov naučila `@` — presne to znamená značka `draft` vyššie.

### Zástupné znaky v dátume a čase {#datetime-wildcards}

Zástupné znaky umožňujú vzory podľa času pomocou reťazcov konštruktora `datetime()`:

```rea
{if world.time matches datetime("*-12-24T*") begin}
  Veselé Vianoce, {reader.name}!
{end if}

{if world.time matches datetime("*-*-*T22:*:*") begin}
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
| Premenná           | `player.gold`, `quest.has_key`      | Cesta k premennej s prefixom domény     |
| Volanie funkcie    | `max(a, b)`, `length(inv.items)`    | Volanie s argumentmi oddelenými čiarkou |
| Zoskupený výraz    | `(player.gold + bonus) * 2`         | Zátvorky prebijú prioritu               |

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
{if player.name matches /^[A-Z]/ begin}
{if "sword" !in player.inventory begin}
```

### Ternárna podmienka {#ternary-conditional}

<Feature id="ternary" />

Ternárny operátor poskytuje inline podmienené hodnoty:

```rea
{set mood = health < 50 ? "zúfalý" : "odhodlaný"}
Hrdina vyzerá {gold > 0 ? "nádejne" : "skleslo"}.
```

Najprv sa vyhodnotí podmienka; ak je pravdivá, vráti sa výraz pred `:`, inak výraz za `:`. Ternárny operátor má **najnižšiu** prioritu — pri vnáraní použite zátvorky:

```rea
{(is_night ? 2 : 1) * base_damage}
```

**Poznámky:**

- `=` vo výrazoch je rovnosť (nie priradenie). Priraďuje sa príkazom `{set}`.
- `and` a `or` používajú skrátené vyhodnocovanie.
- Unárne `-` neguje číslo: `-player.gold`, `-(a + b)`.
- `+` s reťazcovým operandom spája: `"Ahoj, " + player.name`
- Reťazce prístupov k vlastnostiam sa vyhodnocujú zľava doprava: `group.readers.0.name`

### Správanie reťazcov {#string-behavior}

Reťazce sú **nepriehľadné hodnoty** — syntax `{výraz}` sa vnútri reťazcových literálov NEinterpretuje. Dynamické reťazce sa skladajú spájaním:

```rea
{set msg.greeting = "Ahoj, " + reader.name + "!"}
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
{set total = number(reader_input) + player.gold}
{set label = "Skóre: " + string(player.score)}
{set has_items = boolean(length(player.inventory))}
```

### Príklady {#examples}

```rea
{player.gold * 2 + combat.bonus}
{player.level >= 10 and quest.has_key}
{player.name matches /^[A-Z]/}
{"sword" in player.inventory}
{!door.is_locked or quest.has_master_key}
{player.health < 50 ? "utekaj" : "bojuj"}
{-combat.penalty + combat.bonus}
{reader.name + " — " + upper(reader.class)}
```

---

## 13. Riadenie toku {#_13-control-flow}

### If / Else if / Else {#if-else-if-else}

<Feature id="if-else" />

```rea
{if player.gold > 100 begin}
  Kupec sa chamtivo usmeje.
{else if player.gold > 50}
  Kupec zdvorilo prikývne.
{else}
  Kupec sa na teba pozrie s ľútosťou.
{end if}
```

### Switch / Case {#switch-case}

<Feature id="switch-case" />

```rea
{switch player.class begin}
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
{for item in player.inventory begin}
  Máš: {item}
{end for}
```

S premennou indexu (definovanou za čiarkou pred `begin`):

```rea
{for item in player.inventory, index begin}
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
{for item in player.inventory begin}
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

```rea
{if door.state = "locked" begin}
  Potrebuješ kľúč.
{end if}

{trigger door.unlock}
```

Strážne podmienky na prechodoch bránia neplatným zmenám stavu:

```rea
{on unlock when quest.has_key and !alarm.active begin}
  {-> closed}
{end on}
```

---

## 14. Funkcie {#_14-functions}

<Feature id="functions" />

### Definovanie funkcií {#defining-functions}

Funkcie sa definujú na začiatku súboru alebo v zdieľanom knižničnom súbore:

```rea
{function greet(name, time_of_day) begin}
  {if time_of_day = "morning" begin}
    Dobré ráno, {name}!
  {else}
    Dobrý večer, {name}!
  {end if}
{end function}
```

Funkcie môžu vracať hodnoty:

```rea
{function max(a, b) begin}
  {if a > b begin}
    {return a}
  {else}
    {return b}
  {end if}
{end function}
```

### Volanie funkcií {#calling-functions}

```rea
{greet("Aiden", "morning")}

Silnejší bojovník má {max(player.strength, enemy.strength)} sily.
```

### Správanie funkcie podľa kontextu volania {#function-behavior-by-calling-context}

Funkcie môžu vykresľovať text, vracať hodnoty alebo oboje. Správanie závisí od kontextu:

| Kontext                             | Vykreslí sa text? | Použije sa návratová hodnota? |
| ----------------------------------- | ----------------- | ----------------------------- |
| Samostatne: `{greet("Aiden")}`      | Áno               | Zahodí sa                     |
| Vo výraze: `{max(a, b) + 10}`       | Áno (ak nejaký je) | Áno                          |
| V priradení: `{set x = fn()}`       | Áno (ak nejaký je) | Priradí sa do `x`            |
| V podmienke: `{if fn() begin}`      | Áno (ak nejaký je) | Vyhodnotí sa ako logická hodnota |

**Klasifikácia funkcií:**

- **Čistá funkcia** — len `{return}`, žiadny naratívny text. Správa sa ako tradičná funkcia (`max`, `damage`)
- **Šablónová funkcia** — len naratívny text, bez `{return}`. Správa sa ako znovupoužiteľný blok textu (`greet`)
- **Hybridná funkcia** — vykreslí text A vráti hodnotu. Mocné, ale potenciálne mätúce; kontrolné nástroje by mali varovať
- **Funkcia s vedľajším účinkom** — žiadny text, žiadny `{return}`. Len mení premenné alebo spúšťa príkazy (`reset_stats`)

```rea
{function reset_stats() begin}
  {set player.health = 100}
  {set player.gold = 0}
{end function}
```

Textové telo funkcie sa pri volaní vykreslí vždy — aj v kontexte výrazu. `{return}` je voliteľný; ak chýba, hodnotou funkcie vo výrazoch je `undefined`.

### Parametre {#parameters}

Parametre podporujú predvolené hodnoty:

```rea
{function damage(base, multiplier = 1.0) begin}
  {return base * multiplier}
{end function}
```

---

## 15. Udalosti {#_15-events}

<Feature id="events" />

Udalosti reagujú na spúšťače platformy. Definujú sa pomocou `{on nazov_udalosti begin}`:

```rea
{on story_start begin}
  {set player.gold = 100}
  {set player.health = 100}
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
{// Automatické ukladanie stále beží, ale čitateľ nemôže ručne uložiť ani načítať}
```

Keď je `{save enabled=false}` aktívne, rozhranie platformy skryje tlačidlo uloženia. Automatické ukladanie pri voľbách pokračuje, aby sa postup nestratil pri páde aplikácie.

#### Prenositeľnosť uložení medzi verziami príbehu {#save-portability-across-story-versions}

Uloženia sú **viazané na konkrétnu verziu príbehu** (pole metadát `version`). Keď sa príbeh aktualizuje:

- **Zmena verzie patch** (napr. `1.0.0` → `1.0.1`): uloženia sa načítajú normálne. Chýbajúce nové premenné použijú svoje predvolené hodnoty. Odstránené premenné sa ticho ignorujú.
- **Zmena verzie minor** (napr. `1.0` → `1.1`): platforma sa pokúsi uloženie načítať. Ak aktuálna pozícia čitateľa už neexistuje (pasáž bola odstránená alebo premenovaná), platforma sa vráti k najbližšiemu platnému kontrolnému bodu alebo na začiatok aktuálnej kapitoly.
- **Zmena verzie major** (napr. `1.x` → `2.x`): uloženia sú **nekompatibilné**. Platforma to čitateľovi oznámi a ponúkne začať odznova.

Platforma ukladá uloženia ako JSON. Schéma obsahuje pole `spec_version` (verzia jazyka Rea) a pole `story_version` (verzia autora), vďaka čomu runtime dokáže zistiť kompatibilitu.

---
