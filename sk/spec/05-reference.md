# Referencia: Gramatika, chyby a hraničné prípady

> [Úvod](/sk/spec/) · [Index funkcií](features) · [Ťahák](REA-CHEATSHEET)
>
> Identifikátory, úrovne zhody a pravidlá verziovania na tejto stránke sú **stable** — zmrazené s vydaním 1.0, pretože implementátor sa na ne musí vedieť spoľahnúť. Knižnica vstavaných funkcií a úrovne rozšírení sú **experimental**. Každá sekcia nesie vlastnú značku.

---

## 28. Formát súboru a balenie {#_28-file-format-packaging}

### Samostatné súbory: `.rea` {#single-files-rea}

<Feature id="rea-file" />

Súbor `.rea` je textový súbor v kódovaní UTF-8, ktorý obsahuje prózu a syntax jedného príbehu. Nenesie žiadne vlastné metadáta — tie všetky žijú v manifeste balíka.

### Balíky: `.reast` {#packages-reast}

<Feature id="reast-package" />

Súbor `.reast` je ZIP archív (podobne ako EPUB), ktorý zväzuje jednu alebo viac častí s ich médiami a metadátami, buď v štruktúre riadenej manifestom, alebo v plochej štruktúre. Štruktúru archívu na disku, celú schému `manifest.json`, import z GitHub repozitára, panel kariet čitačky, nastavenia relácie (`reast.json`), postupné načítavanie, rozdielové aktualizácie, podpisovanie balíkov, minifikáciu aj stav čítania viacdielnych príbehov popisuje v plnom rozsahu [referencia formátu balíka `.reast`](/sk/engine/package-format) v dokumentácii jadra — táto sekcia pokrýva len pravidlá na úrovni jazyka, ktoré z tohto formátu vyplývajú.

Pravidlá na úrovni jazyka špecifické pre moduly rozšírení `.rext` (ktoré konštrukcie sú vnútri nich prípustné a prečo je na ich naviazanie potrebný `{use}`) nájdete v časti [Kde sa pravidlá líšia v súboroch `.rext`](rext-differences).

## 29. Identifikátory a pomenovanie {#_29-identifiers-naming}

<Feature id="identifiers" />

### Konvencie pomenovania {#naming-conventions}

| Prvok            | Konvencia      | Príklad                        |
| ---------------- | -------------- | ------------------------------ |
| Premenné         | `domena.nazov` | `player.gold`, `quest.has_key` |
| Funkcie          | `snake_case`   | `calculate_damage`, `greet`    |
| Kotvy            | `snake_case`   | `#the_clearing`                |
| Príkazy          | `snake_case`   | `{voice}`, `{wait}`            |
| Identifikátory kariet | `snake_case` | `[@dark_elf]`, `[$magic_ring]` |
| Kľúče metadát    | `snake_case`   | `title`, `draft_date`          |

### Pravidlá pomenovania premenných {#variable-naming-rules}

Všetky trvalé premenné (v rozsahu príbehu aj globálne) **musia** mať aspoň jeden prefix domény oddelený bodkou `.`:

```rea
{set player.gold = 100}
{set quest.has_key = true}
{set tool.knife = "rusty"}
{set role.king.power = 9}
```

Prefixy domén organizujú premenné do logických menných priestorov, vďaka ktorým je stav príbehu sám o sebe zrozumiteľný. Názvy domén si autori volia voľne — bežné vzory zahŕňajú mená postáv, kategórie objektov alebo pojmy príbehu.

**Výnimka z požiadavky domény:** premenné v rozsahu nadpisu (jednoduchý názov bez bodky), premenné cyklov (`{for}`) a parametre funkcií — tie používajú jednoduché názvy bez bodiek.

### Pravidlá identifikátorov {#identifier-rules}

Každý úsek bodkovanej cesty (doména alebo názov) sa riadi týmito pravidlami:

- Môže obsahovať ľubovoľný znak Unicode **okrem** medzery (` `) a bodky (`.`)
- Musí obsahovať aspoň jeden nečíselný znak (na odlíšenie od čísel)
- Rozlišuje veľkosť písmen

To znamená, že neanglicky píšuci autori môžu voľne používať vlastnú abecedu:

```rea
{set hráč.zlato = 100}
{set 道具.剣 = "katana"}
{set игрок.здоровье = 80}
```

**Jednoduché identifikátory** (funkcie, príkazy, kotvy, identifikátory kariet) sa riadia rovnakými pravidlami znakov, ale bodku nevyžadujú.

---

## 30. Vstavané funkcie {#_30-built-in-functions}

### Funkcie pre reťazce {#string-functions}

| Funkcia                  | Popis                                     |
| ------------------------ | ----------------------------------------- |
| `length(str)`            | Počet znakov                              |
| `upper(str)`             | Prevod na veľké písmená                   |
| `lower(str)`             | Prevod na malé písmená                    |
| `trim(str)`              | Odstránenie medzier na začiatku a konci   |
| `contains(str, sub)`     | Overí, či obsahuje podreťazec             |
| `replace(str, old, new)` | Nahradí výskyty                           |
| `split(str, delimiter)`  | Rozdelí na pole                           |
| `join(array, delimiter)` | Spojí pole do reťazca                     |

### Matematické funkcie {#math-functions}

| Funkcia                  | Popis                                       |
| ------------------------ | ------------------------------------------- |
| `abs(n)`                 | Absolútna hodnota                           |
| `min(a, b)`              | Menšia z dvoch hodnôt                       |
| `max(a, b)`              | Väčšia z dvoch hodnôt                       |
| `round(n)`               | Zaokrúhlenie na najbližšie celé číslo       |
| `floor(n)`               | Zaokrúhlenie nadol                          |
| `ceil(n)`                | Zaokrúhlenie nahor                          |
| `random(min, max)`       | Náhodné celé číslo v rozsahu (vrátane hraníc) |
| `clamp(value, min, max)` | Obmedzí hodnotu na rozsah                   |

### Funkcie pre polia {#array-functions}

| Funkcia                  | Popis                       |
| ------------------------ | --------------------------- |
| `length(arr)`            | Počet prvkov                |
| `append(arr, item)`      | Pridá na koniec             |
| `remove(arr, item)`      | Odstráni prvý výskyt        |
| `contains(arr, item)`    | Overí, či obsahuje položku  |
| `shuffle(arr)`           | Náhodne premieša poradie    |
| `sort(arr)`              | Zoradí vzostupne            |
| `slice(arr, start, end)` | Vyberie podpole             |

### Zmena kolekcií {#collection-mutation}

Polia podporujú volania v štýle metód:

```rea
{set player.inventory = ["sword", "shield"]}
{append(player.inventory, "potion")}
{remove(player.inventory, "shield")}
```

### Dopytovacie funkcie {#query-functions}

| Funkcia               | Popis                                            |
| --------------------- | ------------------------------------------------ |
| `visited(anchor)`     | Navštívil už čitateľ túto kotvu?                 |
| `visit_count(anchor)` | Koľkokrát ju navštívil                           |
| `turns()`             | Celkový počet interakcií čitateľa doteraz        |
| `elapsed()`           | Čas od začiatku príbehu (v sekundách)            |
| `choice_count()`      | Počet dostupných volieb v aktuálnom bode         |
| `reader_count()`      | Počet aktívnych čitateľov (kooperatívne čítanie) |

### Funkcie náhodnosti a kociek {#randomness-dice-functions}

| Funkcia          | Popis                                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `dice(notation)` | Hod kockou štandardným zápisom (napr. `"2d6+3"`). Pozri [Sekciu 21](03-narrative-interaction.md#dice-and-randomization)       |

**Náhodnosť je seedovaná a čítanie sa dá zopakovať.** `random()`, `shuffle()` a všetko, čo je na nich postavené (vrátane `std/dice`), čerpá z generátora, ktorý vlastní runtime, nie z globálneho zdroja náhodnosti hostiteľa. Príbeh si pri spustení vytiahne jeden seed; stav čítania nesie tento seed aj aktuálnu pozíciu generátora, takže obnovenie uloženia pokračuje identickou postupnosťou a krok späť zreprodukuje hody, ktoré po ňom nasledovali. Reštart príbehu vytiahne nový seed — opätovné prečítanie je skutočne novým prechodom.

<Feature id="seeded-randomness" />

### Funkcie zariadenia a sveta {#device-world-functions}

| Funkcia              | Popis                                                              |
| -------------------- | ------------------------------------------------------------------ |
| `world.has(feature)` | Overí schopnosť zariadenia (napr. `"camera"`, `"gps"`, `"nfc"`)    |

### Konštruktory typov a konverzné funkcie {#type-constructor-and-conversion-functions}

| Funkcia                         | Popis                                                                         |
| ------------------------------- | ----------------------------------------------------------------------------- |
| `number(x)`                     | Prevod na číslo. `number("42")` → `42`, `number("abc")` → `undefined`         |
| `string(x)`                     | Prevod na reťazec. `string(42)` → `"42"`, `string(true)` → `"true"`           |
| `boolean(x)`                    | Prevod na logickú hodnotu. Nepravdivé hodnoty → `false`, ostatné → `true`     |
| `integer(x)`                    | Prevod na celé číslo (oreže). `integer(3.7)` → `3`                            |
| `datetime("ISO-8601-string")`   | Vytvorí datetime z reťazca ISO 8601 (podporuje zástupné `*`)                  |
| `duration("ISO-8601-duration")` | Vytvorí trvanie z reťazca trvania ISO 8601                                    |

Súradnicové typy používajú literálovú syntax `@` namiesto konštruktorových funkcií (pozri [Sekciu 11](02-logic-data.md#_11-variables-data-types)): `@lat;lng` pre body, `@@lat;lng/polomer` pre kruhy, `@@p1@p2@p3` pre mnohouholníky a trasy. Oddeľovačom je bodkočiarka, nie čiarka — čiarka už oddeľuje argumenty, medzi ktorými súradnica stojí.

### Funkcie variácie textu a lokalizácie {#text-variation-localization-functions}

| Funkcia                                           | Popis                                                                                                    |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `select(value, he="x", she="y", other="z")`       | Vráti text zodpovedajúci hodnote (záloha cez `other`)                                                    |
| `plural(count, one="y", other="z", ...)`          | Skloňovanie podľa CLDR; kategória z `Intl.PluralRules` pre lokál hostiteľa                               |
| `ordinal(n)` / `ordinal(n, one=..., ...)`         | Radová číslovka; anglická prípona len pre lokály `en*`, inak číslo naformátované podľa lokálu (pozri nižšie) |
| `formatNumber(value, locale?, style=..., ...)`    | Formátovanie čísel podľa lokálu (pozri [Sekciu 22](04-utilities.md#_22-pluralization-localization))       |
| `calendar(date, month=..., weekday=..., era=...)` | Mapovanie fantasy kalendára (pozri [Sekciu 22](04-utilities.md#_22-pluralization-localization))          |

> Kategórie množného čísla a radových čísloviek sa rozlišujú z CLDR cez `Intl.PluralRules`, riadené **lokálom dodaným hostiteľom** — nie tabuľkou pre jednotlivé jazyky zapečenou v jadre. `calendar()` je jediná funkcia tu, ktorá je stále vo vývoji; pozri [index funkcií](features#localization).

### Funkcie dátumu a času {#date-time-functions}

<Feature id="date-functions" />

Vstavané funkcie dátumu a času pracujú s reťazcami ISO 8601 a časovými značkami v milisekundách. Hodiny, lokál a časové pásmo **dodáva hostiteľ**; formátovanie deleguje na `Intl.DateTimeFormat` (údaje CLDR). Neplatný vstup vráti `''` alebo `0`.

| Funkcia                         | Popis                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| `now()`                         | Aktuálna časová značka v milisekundách (hodiny hostiteľa)                          |
| `today()`                       | Aktuálny kalendárny dátum ako `YYYY-MM-DD` v časovom pásme hostiteľa               |
| `formatDate(value, style?)`     | Naformátuje dátum; `style ∈ iso \| short \| medium \| long \| full` (predvolene `medium`) |
| `formatTime(value, style?)`     | Naformátuje dennú dobu rovnakými štýlmi                                            |
| `formatDateTime(value, style?)` | Naformátuje dátum aj čas spolu rovnakými štýlmi                                    |
| `parseDate(value)`              | Rozparsuje reťazec dátumu na časovú značku v milisekundách (`0`, ak je neplatný)   |
| `dateDiff(a, b, unit?)`         | Rozdiel `a − b`; `unit ∈ ms \| s \| m \| h \| d` (predvolene `ms`)                 |
| `dayOfWeek(value)`              | Deň v týždni v časovom pásme hostiteľa (`0` = nedeľa, `6` = sobota)                |
| `dateAdd(value, amount, unit?)` | Pripočíta trvanie (`unit ∈ ms \| s \| m \| h \| d \| M \| y`); vráti reťazec ISO   |

Štýl `iso` dáva `YYYY-MM-DD` (dátum), `HH:mm:ss` (čas) alebo úplný reťazec ISO 8601 (dátum a čas). Neexistuje formátovací reťazec s tokenmi dátumu (`YYYY-MM-DD`) dostupný autorovi — celým rozhraním je enum `style`.

**`select()`** umožňuje variáciu zámen a rodu bez vetvenia:

```rea
{set char.pronoun = "she"}
{select(char.pronoun, he="Vytasí svoj meč", she="Vytasí svoj meč", other="Vytasia svoj meč")}
```

**`plural()`** sa riadi pravidlami množného čísla CLDR pre lokál dodaný hostiteľom:

```rea
Našiel si {plural(gem_count, one="drahokam", few="{} drahokamy", other="{} drahokamov")}.
```

Podrobné použitie všetkých lokalizačných funkcií nájdete v [Sekcii 22](04-utilities.md#_22-pluralization-localization).

### Testovacie funkcie {#testing-functions}

| Funkcia      | Popis                                                                    |
| ------------ | ------------------------------------------------------------------------ |
| `seed(n)`    | Nastaví seed náhodnosti pre deterministické miešanie a `random()`        |
| `snapshot()` | Zachytí aktuálny stav na porovnanie                                      |

```rea
{seed(42)}
Minca padla na {~hlavu|znak}.
```

Pri rovnakom seede je každý náhodný výsledok reprodukovateľný — nevyhnutné pri testovaní a ladení príbehov.

### Stav príkazu {#command-state}

Pomenované príkazy sprístupňujú stav:

```rea
{if rich_check.executed.count > 0 begin}
  Už ťa raz preverovali, či si bohatý.
{end if}

{rich_check.executed.last_time}
```

---

## 31. Rozšíriteľnosť {#_31-extensibility}

<Feature id="rext-extensions" />

Rea sa rozširuje v dvoch úrovniach. **Úroveň 1 — rozšírenia Rea** je prenosný, izolovaný kód Rea, ktorý cestuje vnútri balíka (súbory `.rext`), plus vyhradená štandardná knižnica `std/*` dodávaná so samotným jazykom. **Úroveň 2 — rozšírenia hostiteľa** je JavaScript dodaný vkladajúcou aplikáciou; stoja mimo samotného jazyka Rea a dosiahnuteľné sú len vtedy, keď ich vkladateľ poskytne.

### Úroveň 1 — rozšírenia Rea (priestor autora, prenosné, izolované) {#tier-1-—-rea-extensions-author-space-portable-sandboxed}

<Feature id="rext-file" />

Rozšírenie Rea je súbor `.rext` (pozri [Kde sa pravidlá líšia v súboroch `.rext`](rext-differences)) obsahujúci výhradne **deklarácie**: bloky `{function}`…`{end function}`, konštanty `{set}` najvyššej úrovne, `{use}` a komentáre. Akýkoľvek uzol prózy — odsek, nadpis, skupina volieb, médium, citácia, dialóg či definícia karty — kdekoľvek v `.rext` je **chybou načítania**. Práve toto obmedzenie robí rozšírenie preskúmateľným okom aj strojovo kontrolovateľným.

Hodnoty `{set}` najvyššej úrovne sú **súkromné konštanty** modulu. Jeho funkcie ich čítajú, ale nie sú to premenné príbehu: nikdy sa neobjavia v exportovanom stave čítania, dva moduly môžu deklarovať konštantu s rovnakým názvom bez kolízie a modul nikdy nemôže prepísať premennú deklarovanú autorom. Parameter funkcie s rovnakým názvom konštantu zatieni. `{set}` *vnútri* tela funkcie sa riadi bežným rozsahom funkcií v Rea a premennú príbehu zapisuje — stav cyklu preto hromaďte rekurziou, nie počítadlom.

Rozšírenie naimportujete pomocou `{use}` a dáte mu alias; zapísaná cesta príponu `.rext` vynecháva. Exportované funkcie potom voláte cez alias:

```rea
{use "extensions/inventory" as inv}

Tvoj batoh váži {inv.total_weight()} kg.
```

Pravidlá:

- **Rozlišovanie výhradne v rámci balíka** — cesta `{use}` sa rozlišuje vnútri balíka, nikdy nie v súborovom systéme ani v sieti.
- **Graf `{use}` musí byť acyklický** — cyklus načítanie zhodí a cyklus pomenuje.
- **Duplicitné názvy exportov sú chyba**, nie „vyhráva prvý".
- **`{use}` na chýbajúcu cestu zhodí načítanie** (rovnako ako položka `manifest.extensions`, ktorá v archíve nie je).

Súbory príbehu (`.rea`) môžu naďalej deklarovať `{function}`, ale tie sú **súkromné a v rozsahu dokumentu** — exportujú len súbory rozšírení. Ak chcete funkciu zdieľať medzi časťami, vložte ju do `.rext` a použite `{use}`.

### `std/*` — štandardná knižnica {#std-—-the-standard-library}

<Feature id="std-library" />

`std/*` je vyhradený menný priestor rozlišovaný **priamo v jadre**, nie z archívu a nie od hostiteľa. `{use "std/dice" as dice}` preto funguje na ľubovoľnom hostiteľovi, offline a bez akejkoľvek podpory vkladateľa — dodáva sa s jazykom, namiesto toho, aby ho vkladala platforma. (Keby ho vkladala platforma, príbeh by sa vykreslil na rea.st a rozbil sa v cudzom vložení, čím by prišiel o prenosnosť, kvôli ktorej systém rozšírení existuje.) Archívny `.rext`, ktorý sa rozlišuje pod `std/`, je chyba načítania, a rozšírenie hostiteľa deklarujúce menný priestor `std` sa takisto odmietne.

`std/dice` exportuje:

| Funkcia               | Popis                                                                  |
| --------------------- | ---------------------------------------------------------------------- |
| `d(sides)`            | Hodí jednou kockou s daným počtom stien                                |
| `roll(count, sides)`  | Súčet `count` kociek s `sides` stenami (obmedzené hĺbkou volaní)       |
| `advantage(sides)`    | Hodí dvoma kockami a ponechá vyšší výsledok                            |
| `disadvantage(sides)` | Hodí dvoma kockami a ponechá nižší výsledok                            |

```rea
{use "std/dice" as dice}

Zaženieš sa divoko a spôsobíš {dice.roll(2, 6)} poškodenia.
```

### Úroveň 2 — rozšírenia hostiteľa (JavaScript dodaný vkladateľom) {#tier-2-—-host-extensions-javascript-supplied-by-the-embedder}

<Feature id="host-extensions" />

Rozšírenia hostiteľa sú JavaScript registrovaný vkladateľom **pre každú inštanciu prehrávača** (pre každý prvok jadra), nikdy nie globálne. Dvaja prehrávači na jednej stránke môžu držať rôzne rozšírenia hostiteľa. Prispievajú:

- **Funkciami** volateľnými z výrazov Rea ako `{ns.fn()}`.
- **Obsluhami príkazov** pre príkazy s menným priestorom `{ns.command args}`. Príkaz **vyžaduje argumenty**: holé `{ns.name}` bez argumentov je bodkovaný odkaz na premennú, nie príkaz.
- **Vykresľovačmi uzlov**, ktoré nahrádzajú vstavané vykreslenie daného typu uzla.

Tvrdé pravidlo: rozšírenie hostiteľa, ktoré potrebuje rozhranie zariadenia, **vyšle udalosť na zbernicu**, presne ako to robí vstavaný senzorový príkaz; kód jadra nikdy nevolá rozhranie zariadenia v mene rozšírenia.

Rozšírenia hostiteľa stoja mimo samotného jazyka Rea a dosiahnuteľné sú len vtedy, keď ich vkladateľ poskytne. Príbeh deklaruje menné priestory hostiteľa, ktoré potrebuje, cez [`manifest.requires`](/sk/engine/package-format#field-reference); vkladateľ, ktorý požadovaný menný priestor nezaregistroval, príbeh radšej odmietne načítať, než by mal zlyhať uprostred kapitoly.

### Vlastné typy kariet {#custom-card-types}

<Feature id="custom-card-types" />

Vlastné **sady** kariet (`{define cardset …}`) sú vydané a pokrývajú väčšinu toho, po čom autori siahajú — pozri [Sekciu 17](03-narrative-interaction.md#card-sets-categories). Nad ich rámec môžu rozšírenia v budúcnosti definovať nové *typy* kariet s vlastným prefixom v hranatých zátvorkách, nad rámec vstavaných `@`, `$` a `&`:

```rea
{define card_type location, prefix="📍" begin}
  name: Miesto
  fields: [name, description, image, coordinates]
{end define}

{define location tavern begin}
  name: Hrdzavá kotva
  description: Slabo osvetlená krčma neďaleko prístavu.
  image: assets/tavern.webp
  coordinates: @48.1486;17.1077
{end define}

Prichádzaš do [📍tavern].
```

### Šifrovanie kódu rozšírení {#encryption-of-extension-code}

**Kód rozšírenia sa nikdy nešifruje.** Zavádzač zašifrovaný `.rext` odmietne. Šifrovanie je ochrana obsahu, nie bezpečnostná hranica — sandbox rozšírenie obmedzuje rovnako, či je jeho zdroj zašifrovaný alebo nie — takže jeho zákaz nič obranné nestojí a prináša tri veci:

1. **Overenie skôr, než sa spustí próza.** Odomykací kód môže doraziť uprostred príbehu; kód, ktorý sa objaví, až keď je čitateľ zaviazaný, by zlyhal v najhoršej možnej chvíli. Rozšírenia v čistom texte sa pri načítaní skompilujú a skontrolujú.
2. **Auditovateľnosť bez kľúča** — nástrojom `reast validate`, editorom aj moderáciou platformy.
3. **Spustiteľnosť treťou vkladajúcou aplikáciou**, ktorá kľúč nemá.

Ak chcete udržať tajomstvo mimo rozšírenia a zároveň ho overovať, nechajte funkciu všeobecnú a v čistom texte a tajomstvo vložte cez `{set}` do **zašifrovanej kapitoly `.rea`**, potom overujte *proti* tejto premennej namiesto jeho zapečenia:

```rea
{comment extensions/gate.rext — čistý text, všeobecný, neobsahuje tajomstvo}
{function unlocked(given, expected) begin}
  {return given = expected}
{end function}
```

```rea
{comment zašifrovaná kapitola .rea nesie tajomstvo}
{set crypt.passphrase = "moonlit-antler"}

{input name=attempt, placeholder="Vyslov to slovo"}
{if unlocked(attempt, crypt.passphrase) begin}
  Brána sa otvorí.
{end if}
```

Výhrada, povedaná otvorene: zašifrovaná `.rea` **nie je** tajomstvom pred odhodlaným čitateľom. Kľúč sa na zariadenie čitateľa dostane preto, aby sa kapitola vykreslila, takže `crypt.passphrase` sa dá vytiahnuť. Šifrovanie chráni pred prezradením zápletky, letmým nahliadnutím a prehľadaním archívu — nie pred motivovaným útočníkom. Čokoľvek, čo musí byť skutočne nefalšovateľné (odpoveď v súťaži, platené odomknutie), sa musí overiť **na strane servera**, a to je práca platformy, nie jadra (pozri aj [Ochranu obsahu](04-utilities.md#_23-content-protection-lock)).

### Obmedzenia sandboxu {#sandbox-constraints}

Rozšírenia Rea bežia v tom istom izolovanom prostredí ako bežný kód Rea:

- Žiadny prístup k súborovému systému nad rámec balíka
- Žiadne sieťové požiadavky (len deklarované rozhrania platformy)
- Žiadne spúšťanie ľubovoľného kódu — príbeh nemôže vložiť JavaScript, Python ani iný jazyk; rozšírenie Rea je izolovaná Rea a rozšírenie hostiteľa je vlastný kód vkladateľa, ktorý príbeh nikdy nevkladá
- Limity pamäte a výpočtu presadzované runtimom — napríklad hĺbka rekurzie obmedzuje `roll` z `std/dice` na 64 kociek
- Kód rozšírenia sa nikdy nešifruje (pozri vyššie), takže zostáva auditovateľný

### Úrovne zhody {#conformance-levels}

<Feature id="conformance-levels" />

Rea definuje tri úrovne zhody, aby implementátori mohli stavať čiastočné implementácie bez toho, aby si nárokovali plný súlad so špecifikáciou. Každá úroveň stavia na predchádzajúcej:

| Úroveň        | Sekcie                                    | Popis                                                                                                                                                                                                                                        |
| ------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Core**      | 1 – 7, 9 – 14, 16, 25 – 26, 28 – 29       | Minimálna životaschopná interaktívna fikcia: text, formátovanie, nadpisy, odkazy, kotvy, príkazy, premenné, výrazy, riadenie toku, funkcie, voľby, únikové sekvencie, komentáre, formát súboru, identifikátory. Stačí na písanie vetviacich sa príbehov so stavom. |
| **Standard**  | Core + 8, 15, 17 – 19, 22 – 24, 27, 30 – 31, 32 | Plný zážitok pre jedného čitateľa: médiá, udalosti, karty, hlas, vstup a interakcia, skloňovanie, zámok, popisky, spracovanie chýb, vstavané funkcie, rozšíriteľnosť, prístupnosť.                                                       |
| **Platform**  | Standard + 20 – 21                        | Funkcie pre viacerých čitateľov a reálny svet: kooperatívne čítanie (parallel, vote, whisper, broadcast, race, exclusive, synchronize), interakcie s reálnym svetom (GPS, NFC, QR, fotoaparát, senzory). Vyžaduje sieťovú infraštruktúru a rozhrania zariadení. |

Implementácia MUSÍ deklarovať, ktorú úroveň zhody podporuje. Keď príbeh použije funkcie nad úrovňou implementácie, runtime MUSÍ uplatniť elegantnú degradáciu (pozri [Sekciu 27](04-utilities.md#_27-error-handling)) — neznáme príkazy sa spracujú ako tlačové výrazy, nepodporované bloky sa ticho preskočia.

Implementácia **Core** stačí na textovú interaktívnu fikciu s voľbami a premennými — konkurencieschopná s Ink alebo ChoiceScript. Implementácia **Standard** zodpovedá plnému zážitku Reast pre jedného čitateľa. Implementácia **Platform** vyžaduje serverovú infraštruktúru na synchronizáciu medzi čitateľmi a rozhrania zariadení na interakciu s reálnym svetom.

### Verziovanie špecifikácie {#spec-versioning}

<Feature id="spec-versioning" />

Rea sa riadi schémou verzií **MAJOR.MINOR** (inšpirovanou [YAML](https://yaml.org/spec/1.2.2/)):

- **MAJOR** — nekompatibilné zmeny, ktoré môžu znehodnotiť existujúce príbehy
- **MINOR** — spätne kompatibilné doplnenia (nové príkazy, atribúty, funkcie)

**1.0 je prvé vydanie jazyka.** Všetko, čo je pod ním zverejnené, je autorom dostupné už teraz, na tej úrovni zrelosti, akú deklaruje jeho značka.

Príbeh Rea deklaruje, na ktorú verziu špecifikácie mieri, pomocou poľa `rea` v `manifest.json`:

```json
{
  "rea": "1.0",
  "title": "Posledný lampáš",
  "author": [{ "name": "Elena Vossová" }],
  "version": "2.1"
}
```

Tu `"rea": "1.0"` znamená „tento príbeh používa verziu špecifikácie Rea 1.0", kým `"version": "2.1"` znamená „toto je verzia 2.1 samotného príbehu".

Ak kľúč `rea` chýba, platforma predpokladá najnovšiu podporovanú verziu. Parsery MUSIA odmietnuť príbehy mieriace na vyššiu verziu MAJOR, než akú podporujú. Parsery BY MALI prijať príbehy mieriace na nižšiu verziu MINOR v rámci tej istej verzie MAJOR a neznáme funkcie elegantne ignorovať.

### Stabilita funkcií {#feature-stability}

Každá funkcia v tejto špecifikácii nesie pod vlastným nadpisom výslovnú značku stavu a celá množina je uvedená v [indexe funkcií](features). Stavov je päť:

| Stav               | Dostupné dnes? | Význam                                                                                                                                |
| ------------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **`stable`**       | Áno            | Zmrazené. Zmeniť sa môže len v novej verzii MAJOR. Patrí sem prozaické jadro jazyka.                                                  |
| **`experimental`** | Áno            | Vydané a použiteľné, ale v rámci tejto verzie MAJOR sa ešte môže upraviť. Väčšina Rea je dnes na tejto úrovni.                        |
| **`development`**  | Nie            | Navrhnuté a práve sa stavia. Zdokumentovaná syntax je taká, aká bude, ale jadro ju zatiaľ neprijíma.                                  |
| **`draft`**        | Nie            | Špecifikované a prediskutované, aby bol tvar myšlienky zaznamenaný. Implementácia sa nezačala; návrh sa ešte môže úplne zmeniť.       |
| **`cancelled`**    | Nikdy          | Zvážené a zámerne vylúčené. Zaznamenané preto, aby rozhodnutie zostalo viditeľné a neriešilo sa znovu.                                |

**Značka verzie** sprevádza stav len pri funkciách `stable` a `experimental` — pri tých dvoch, ktoré sú skutočne zverejnené — a pomenúva verziu špecifikácie, v ktorej sa funkcia stala dostupnou. Funkcia `development` alebo `draft` verziu zatiaľ nemá a `cancelled` ju mať nikdy nebude.

Implementácia MÔŽE vydať ľubovoľnú podmnožinu funkcií `development` a `draft`; NESMIE si na ich základe nárokovať [úroveň zhody](#conformance-levels), pretože príbeh sa nemôže spoliehať na niečo, čo žiadna iná implementácia nemá. Funkcie pridané po 1.0 nesú v tej istej značke svoju verziu zavedenia (`since 1.1`), takže autor vždy vie, ktorú verziu špecifikácie príbeh vyžaduje.

Stav nie je sľubom o termíne. `development` hovorí, že práca beží, `draft` hovorí, že myšlienka je zapísaná a nič viac — ani jedno nenaznačuje, kedy a či to dorazí.

### Postup pri zastarávaní {#deprecation-process}

Keď sa funkcia označí za zastaranú:

1. Špecifikácia ju označí textom „(Zastarané od X.Y)" a zdokumentuje náhradu
2. Parsery MUSIA zastarané funkcie podporovať aspoň jednu verziu MAJOR
3. Parsery BY MALI pri použití zastaranej funkcie vydať varovanie
4. Zastaraná funkcia sa odstráni v nasledujúcej verzii MAJOR (alebo neskôr)

### Spätná kompatibilita {#backward-compatibility}

Parsery zhodné s Rea MAJOR.MINOR MUSIA:

1. Prijať každý platný príbeh napísaný pre MAJOR.0 až MAJOR.MINOR
2. Ignorovať neznáme kľúče metadát (už špecifikované v [Sekcii 1](01-basics.md#_1-document-structure))
3. Preskočiť neznámy príkaz celý — aj s jeho blokom — **bez varovania
   viditeľného pre čitateľa** — a zaznamenať `parse/unknown-command` na
   autorskom kanáli
4. Považovať neznáme inline formátovanie za doslovný text

Pravidlo 3 predtým znelo „zobraziť varovanie a blok príkazu preskočiť". Kde sa
varovanie zobrazí, je práve otázka, na ktorú odpovedá dvojkanálový model zo
[Sekcie 27](04-utilities.md#_27-error-handling): čitateľovi nikdy, autorovi
vždy, ako záznam. Čitateľ vidí preskočený blok a nič viac.

Tým je zaistená dopredná kompatibilita: príbeh napísaný pre Rea 1.0 funguje na
parseri Rea 1.3. Príbeh používajúci funkcie Rea 1.3 funguje na parseri Rea 1.0
s elegantnou degradáciou.

### Záznamy a úrovne zhody {#records-and-the-conformance-split}

[Úroveň zhody](#conformance-levels) určuje, čo implementácia *spúšťa*, nie čo
*hlási*. Engine úrovne Core nevydáva žiadne záznamy — autorský kanál je vec
nástrojov a embedder úrovne Core, ktorý nič nezapojí, nevyprodukuje nič.
Nástroje úrovne Standard a Platform hlásia celý register.

Ak príbeh použije funkciu nad úrovňou, ktorú si implementácia nárokuje, funkcia
neurobí nič a autor dostane `meta/above-conformance-level` s názvom funkcie a
potrebnou úrovňou. Ten záznam je `degraded`, nie `error`: implementácia sa
zachovala správne a autor sa dozvedá, ktoré z jeho rozhodnutí sa neprenieslo,
nie že urobil chybu.

---

## 32. Prístupnosť {#_32-accessibility}

<Feature id="accessibility" />

Rea mieri na zhodu s **WCAG 2.2 na úrovni AA**. Technickú implementáciu rieši platforma; špecifikácia definuje, čo musia a čo by mali poskytnúť autori.

### Vstavané funkcie prístupnosti {#built-in-accessibility-features}

Fungujú automaticky, bez akéhokoľvek zásahu autora:

| Funkcia                    | Ako funguje                                                                                     | Pokryté kritériá WCAG |
| -------------------------- | ------------------------------------------------------------------------------------------------ | --------------------- |
| Výstup pre čítačky obrazovky | Všetok naratívny text je asistenčným technológiám sprístupnený v poradí čítania                | 1.3.1, 1.3.2, 4.1.2   |
| Ovládanie klávesnicou      | Voľby, odkazy a interaktívne prvky sa dajú zamerať a aktivovať klávesnicou                      | 2.1.1, 2.1.2          |
| Správa zamerania           | Keď sa objaví nový obsah (napr. po voľbe), zameranie sa presunie naň                            | 2.4.3, 2.4.7          |
| Zameranie nie je zakryté   | Prilepené prvky rozhrania (panely nástrojov, kooperatívne panely) nikdy úplne nezakryjú zameraný obsah | 2.4.11          |
| Vysoký kontrast            | Platforma presadzuje pomery kontrastu WCAG AA (4,5 : 1 text, 3 : 1 veľký text) vo všetkých témach | 1.4.3, 1.4.11       |
| Obmedzený pohyb            | Animácie a prechody rešpektujú `prefers-reduced-motion`                                         | 2.3.3                 |
| Veľkosť cieľa              | Všetky interaktívne ciele (voľby, tlačidlá, odkazy) majú aspoň 24 × 24 CSS pixelov              | 2.5.8                 |
| Alternatívy k ťahaniu      | Každá interakcia založená na ťahaní ponúka alternatívu jedným kliknutím                         | 2.5.7                 |
| Oznamovanie stavu          | Nový naratívny obsah a zmeny stavu používajú živé oblasti ARIA pre čítačky obrazovky            | 4.1.3                 |
| Ovládanie zvuku            | Automaticky prehrávaný zvuk poskytuje viditeľné ovládanie pauzy a zastavenia do 3 sekúnd        | 1.4.2                 |
| Nastaviteľné časovanie     | Časované udalosti (`{timer}`) ponúkajú pred spustením predĺženie, pauzu alebo vypnutie          | 2.2.1                 |
| Konzistentná pomoc         | Mechanizmy pomoci sa objavujú na rovnakom relatívnom mieste na všetkých stránkach platformy     | 3.2.6                 |
| Opakované zadávanie        | Platforma automaticky dopĺňa už zadané údaje v rámci relácie čítania                            | 3.3.7                 |
| Prístupné prihlásenie      | Overenie totožnosti podporuje správcov hesiel a nevyžaduje testy kognitívnych schopností        | 3.3.8                 |
| Kooperatívna prítomnosť    | Ukazovatele prítomnosti čitateľov obsahujú aj nevizuálne signály (zvuk, vibrácia)               | 1.3.3                 |

### Zodpovednosti autora {#author-responsibilities}

Autori prispievajú k prístupnosti existujúcou syntaxou:

- **Alternatívny text pri obrázkoch** — vyžaduje ho syntax obrázka: `[!alternatívny text < zdroj]`. Obrázky bez alternatívneho textu spustia varovanie pri overovaní.
- **Hlasové a zvukové opisy** — obsah `{voice begin}` je automaticky dostupný ako zvukový opis vizuálnych scén.
- **Zmysluplný text volieb** — voľby by mali opisovať akciu, nie len „Možnosť A" alebo „Klikni sem".
- **Popisky pri časových médiách** — príkazom `{caption …}` (pozri [Sekciu 24](04-utilities.md#_24-captions)) poskytnite textové alternatívy k zvuku a videu.

### Cesty prístupnosti k interaktívnym prvkom {#interactive-element-accessibility-paths}

| Prvok Rea                | Cesta klávesnicou                        | Správanie čítačky obrazovky                                       |
| ------------------------ | ---------------------------------------- | ------------------------------------------------------------------- |
| Voľba (štandardná)       | Tab na zameranie, Enter/medzerník na výber | Oznámená ako tlačidlo s textom voľby                              |
| Voľba (sloveso — cieľ)   | Tab na zameranie, Enter/medzerník na výber | Oznámená ako tlačidlo so slovesom a opisom cieľa                  |
| Textové pole `{input}`   | Tab na zameranie, písanie na zadanie     | Oznámené ako textový vstup s návestím z predchádzajúceho textu    |
| Odpočet `{timer}`        | Nedá sa zamerať (dekoratívne)            | Zostávajúci čas oznamovaný v intervaloch cez živú oblasť          |
| Karta (odhalenie/zavretie) | Tab na zameranie, Enter na prepnutie   | Oznámená ako rozbaliteľná oblasť so zhrnutím                      |
| Odkaz `[text > url]`     | Tab na zameranie, Enter na nasledovanie  | Oznámený ako odkaz s viditeľným textom                            |
| Výzva na GPS zastávku    | Zameranie sa presunie na výzvu automaticky | Oznámená ako upozornenie s pokynom k polohe                       |
| Výzva na skenovanie QR   | Zameranie sa presunie na výzvu automaticky | Oznámená ako upozornenie s možnosťou ručného zadania             |

---

## Poznámky k návrhu {#design-notes}

### Čo Rea zámerne neobsahuje {#what-rea-intentionally-omits}

Každá z týchto vecí bola zvážená a vylúčená. V [indexe funkcií](features#omitted) sa objavujú ako `cancelled`, takže rozhodnutie zostáva viditeľné a nie je objavované a preberané znovu.

- **Číslované a odrážkové zoznamy** — zámerne nie sú súčasťou. Interaktívne príbehy formátovanie zoznamov nepoužívajú, `*` a `-` už sú značkami voľby a zberu a voľby túto úlohu plnia prirodzene. Štruktúrované údaje patria do poľa.
- **Značkovanie tabuliek** — nie je súčasťou. Dátová tabuľka nie je rozprávačská konštrukcia a jej podpora by do prozaického jazyka vtiahla zarovnávanie stĺpcov a spájanie buniek.
- **Priepust HTML** — trvalo vylúčené. Vkladanie surového značkovania by z každého príbehu urobilo plochu pre XSS a umožnilo by, aby značkovanie jedného autora rozbilo vykresľovanie u iného hostiteľa.
- **Štýlovanie cez CSS** — trvalo vylúčené. Vizuálna prezentácia je zodpovednosťou platformy, aby príbeh nikdy nemohol prebiť vlastné predvoľby čitateľa — kontrast, veľkosť písma, tmavý režim.
- **Vkladanie programovacích jazykov** — trvalo vylúčené. Príbeh je nedôveryhodný obsah; vloženie JavaScriptu, Pythonu či čohokoľvek iného by zničilo sandbox. Reálnu potrebu pokrývajú izolované [rozšírenia `.rext`](#_31-extensibility) a rozšírenia hostiteľa dodané vkladateľom.
- **`try` / `catch`** — vylúčené spolu s [modelom chýb](04-utilities.md#_27-error-handling). Každé zotavenie je implicitné, pretože čitateľovi sa nikdy nesmie ukázať zlyhanie a autor by ho nikdy nemal musieť písať.

### Vyriešené rozhodnutia o návrhu {#resolved-design-decisions}

| Rozhodnutie              | Riešenie                                             | Zdôvodnenie                                                                                  |
| ------------------------ | ---------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Syntax odkazov           | `[text > url]`                                       | Jednotná syntax hranatých zátvoriek, šípka ukazuje smer                                      |
| Oddeľovač atribútov      | Čiarky                                               | Univerzálny oddeľovač parametrov aj položiek poľa, jednoznačné parsovanie                    |
| Oddeľovač v kotvách      | Podčiarkovník `_`                                    | V súlade s konvenciou pomenovania premenných                                                 |
| Pomenovanie funkcií      | `snake_case`                                         | Zhoduje sa so všetkými ostatnými identifikátormi Rea                                         |
| Úrovne nadpisov          | Neobmedzená hĺbka `#`                                | Platforma odlišne vykresľuje až N úrovní                                                     |
| Domény premenných        | `reader.*`, `story.*`, `world.*` atď.                | Jasné menné priestory, údaje platformy len na čítanie                                        |
| Pomenovanie premenných   | `domena.nazov` povinné pre všetky trvalé premenné    | Sám o sebe zrozumiteľný stav; ľubovoľný Unicode okrem medzery a bodky                        |
| Syntax priradenia        | `{set domena.premenna = hodnota}`                    | Výslovné, jednoznačné, priateľské k začiatočníkom                                            |
| Operátor rovnosti        | `=` (jedno rovná sa)                                 | Jednoduchšie pre neprogramátorov. `{set}` zabraňuje nejednoznačnosti.                        |
| Syntax komentárov        | `{comment text}` a `{comment begin}…{end comment}`         | Jedna syntax, jednoriadková aj párová; blok otvára len presné `{comment begin}`              |
| Značkovanie podčiarknutia | `{underline begin}text{end underline}`              | Syntax príkazu — v súlade s prečiarknutím a neproporcionálnym písmom                         |
| Operátor regulárnych výrazov | Kľúčové slovo `matches` / `!matches`             | Sám o sebe zrozumiteľný, prefix `!` pre negáciu v súlade s `!=` a `!in`                      |
| Spájanie reťazcov        | Operátor `+` (dvojaká aritmetika a spájanie)         | Ak je čo len jeden operand reťazec, `+` spája; inak číselné sčítanie                         |
| Konverzia typov          | `number()`, `string()`, `boolean()`, `integer()`     | Výslovné konverzné funkcie; implicitné pretypovanie len vo výrazoch                          |
| Doménové typy            | Literály `@` a `@@`, `datetime()`, `duration()`      | `@` pre body, `@@` pre oblasti; kompaktná literálová syntax pre súradnice                    |
| Argumenty select a plural | Pomenované parametre `kľúč="hodnota"`               | Zjednotené so syntaxou atribútov príkazov, žiadny zvláštny vzor objektu                      |
| Uloženie a postup        | Príkaz `{checkpoint}`                                | Výslovné body uloženia; platforma ukladá automaticky na hraniciach kapitol a pri voľbách     |
| Indexovanie polí         | Od nuly                                              | V súlade so všetkými bežnými jazykmi (JS, Python, C). Prvá položka má index `0`              |
