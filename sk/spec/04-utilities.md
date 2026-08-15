# Utility: Médiá, formátovanie a pomocníci

> [Úvod](/sk/spec/) · [Index funkcií](features) · [Ťahák](REA-CHEATSHEET)
>
> Lokalizačné vstavané funkcie a model chýb na tejto stránke sú vydané. Ochrana obsahu, popisky a autorská diagnostika sú **draft** — špecifikované tak, aby sa okolo nich dal príbeh navrhnúť, ale nepostavené. Každá sekcia nesie vlastnú značku.

---

## 22. Skloňovanie podľa počtu a lokalizácia {#_22-pluralization-localization}

Rea poskytuje vstavané funkcie pre gramaticky správny text vo všetkých jazykoch. Nahrádzajú akúkoľvek potrebu vlastnej syntaxe podmienok tým, že využívajú pravidlá množného čísla CLDR a štandardné rozhrania internacionalizácie.

> **Požiadavka:** **lokál a politiku formátovania dodáva hostiteľ**. Kategórie množného čísla a radových čísloviek, zoskupovanie číslic aj štýly dátumu a času sa rozlišujú z CLDR cez `Intl` pre lokál dodaný hostiteľom — jadro v sebe nemá zapečenú žiadnu tabuľku pre jednotlivé jazyky. Príbeh sa vykreslí rovnako všade tam, kde hostiteľ deklaruje ten istý lokál.

### Skloňovanie pomocou `plural()` {#pluralization-with-plural}

<Feature id="plural" />

Funkcia `plural()` mapuje počet na správny gramatický tvar pomocou kategórií množného čísla CLDR. Kategórie sa líšia podľa jazyka — angličtina má 2 (`one`, `other`), slovenčina 4 (`one`, `few`, `many`, `other`), arabčina 6.

```rea
{plural(gold, zero="žiadne mince", one="{} minca", other="{} mincí")}
```

Pre 0: „žiadne mince", pre 1: „1 minca", pre 5: „5 mincí". Zástupný znak `{}` vloží hodnotu počtu.

**Slovenčina (4 kategórie):**

```rea
{plural(count, one="{} pero", few="{} perá", other="{} pier")}
```

Pre 1: „1 pero", pre 3: „3 perá", pre 5: „5 pier".

**Kategórie množného čísla CLDR:**

| Kategória | Príklad v angličtine | Používajú                                |
| --------- | -------------------- | ---------------------------------------- |
| `zero`    | 0 položiek           | arabčina, lotyština, waleština           |
| `one`     | 1 položka            | väčšina jazykov                          |
| `two`     | 2 položky            | arabčina, hebrejčina, slovinčina         |
| `few`     | 2 – 4 položky        | čeština, slovenčina, poľština, ruština   |
| `many`    | 5 a viac položiek    | poľština, ruština, arabčina              |
| `other`   | predvolená           | všetky jazyky (povinná záloha)           |

Runtime rozlišuje kategórie cez `Intl.PluralRules` pre lokál dodaný hostiteľom. Autori uvádzajú len tie kategórie, ktoré ich jazyk vyžaduje — `other` je povinná záloha a výslovná šablóna `zero` vždy vyhráva pre počet 0 (ústretovosť voči autorovi, ktorú CLDR pre väčšinu lokálov nemodeluje).

### Výber textu pomocou `select()` {#text-selection-with-select}

<Feature id="select" />

Funkcia `select()` mapuje reťazcovú hodnotu na varianty textu. Použite ju pre rod, zámená, roly alebo akúkoľvek variáciu textu podľa kľúča:

```rea
{select(pronoun, he="Vytasí svoj meč", she="Vytasí svoj meč", other="Vytasia svoj meč")}
```

`other` je záloha pre hodnoty, ktorým nič nesedí.

**Variácia podľa roly:**

```rea
{select(reader.class, warrior="Zaženieš sa čepeľou", mage="Zošleš kúzlo", other="Konáš")}
```

### Formátovanie čísel pomocou `formatNumber()` {#number-formatting-with-formatnumber}

<Feature id="format-number" />

Funkcia `formatNumber()` deleguje na formátovanie čísel podľa lokálu (`Intl.NumberFormat`). Predvolene používa **lokál jadra dodaný hostiteľom**; voliteľný druhý pozičný argument ho prebije konkrétnou značkou BCP 47:

```rea
Skóre: {formatNumber(player.score)}
Lokalizované: {formatNumber(1234567, "sk")}
```

| Parameter                | Hodnoty                            | Predvolené        |
| ------------------------ | ---------------------------------- | ----------------- |
| _(2. pozičný)_           | Značka lokálu BCP 47               | lokál jadra       |
| `style`                  | `decimal`, `percent`, `currency`   | `decimal`         |
| `currency`               | Kód ISO 4217 (napr. `EUR`, `USD`)  | —                 |
| `minimumFractionDigits`  | celé číslo (minimum desatinných miest) | predvolené `Intl` |
| `maximumFractionDigits`  | celé číslo (maximum desatinných miest) | predvolené `Intl` |

Zoskupovanie (oddeľovače tisícov), počet desatinných miest a symboly sa riadia údajmi CLDR pre daný lokál. Pri akejkoľvek chybe `Intl` (chybná značka, neplatná kombinácia možností) hodnota padne späť na svoj jednoduchý reťazcový tvar.

```rea
Cena: {formatNumber(item.price, style="currency", currency="EUR")}
Šanca: {formatNumber(hit_rate, style="percent")}
Vzdialenosť: {formatNumber(meters, maximumFractionDigits=1)} m
```

### Fantasy kalendáre pomocou `calendar()` {#fantasy-calendars-with-calendar}

<Feature id="calendar" />

Funkcia `calendar()` mapuje reálne zložky dátumu na vlastné názvy — ideálne na budovanie fantasy sveta:

```rea
Mesiac {calendar(world.date, month="Mráz,Kvet,Oheň,Dážď,Vietor,Slnko,Búrka,Žatva,Hmla,Tieň,Ľad,Hviezda")}
```

Pre január: „Mráz", pre marec: „Oheň", pre december: „Hviezda".

| Parameter | Popis                                                        |
| --------- | ------------------------------------------------------------ |
| `month`   | Čiarkami oddelený zoznam 12 názvov mesiacov                  |
| `weekday` | Čiarkami oddelený zoznam 7 názvov dní (pondelok je prvý)     |
| `era`     | Výraz definujúci výpočet éry                                 |

```rea
Deň {calendar(world.date, weekday="Mesiacok,Ohnivec,Vodnik,Zemedeň,Vetrovec,Svetlodeň,Temnodeň")},
{calendar(world.date, month="Mráz,Kvet,Oheň,Dážď,Vietor,Slnko,Búrka,Žatva,Hmla,Tieň,Ľad,Hviezda")}
{ordinal(world.date.day)}
```

### Radové číslovky pomocou `ordinal()` {#ordinal-numbers-with-ordinal}

<Feature id="ordinal" />

```rea
Skončil si na {ordinal(position)} mieste.
```

Kategória radovej číslovky (one/two/few/other) pochádza z `Intl.PluralRules(locale, { type: "ordinal" })` pre lokál dodaný hostiteľom. Bez pomenovaných argumentov pripája `ordinal()` anglické prípony `st`, `nd`, `rd` a `th` **len pre lokály `en*`**; každý iný lokál dostane číslo naformátované podľa lokálu bez prípony, pretože `Intl` neobsahuje dáta na vypísanie radových čísloviek a vymýšľať prípony pre jednotlivé jazyky by bolo nesprávne. Autori, ktorí chcú prípony v inom jazyku, odovzdajú šablóny pre jednotlivé kategórie, kde sa `{}` nahradí naformátovaným číslom:

```rea
{ordinal(position, one="{}.", other="{}.")}
```

Takže `ordinal(1)` je `1st` v angličtine a `1` v nemčine; šablónový tvar dá v oboch prípadoch `1.`.

---

## 23. Ochrana obsahu (zámok) {#_23-content-protection-lock}

<Feature id="content-lock" />

Príkaz `{lock}` chráni obsah príbehu a bráni čitateľom v prístupe ku kapitolám, kým nie sú splnené podmienky. Podporuje model postupného sťahovania a speňaženia na platforme.

### Mäkký zámok {#soft-lock}

Obsah je súčasťou balíka, ale skrytý, kým čitateľ nevyrieši hádanku alebo nesplní podmienku. Kľúč sa odvodzuje zo správnej odpovede pomocou PBKDF2 a AES-GCM:

```rea
{lock type="soft", key="a1b2c3d4e5f6g7h8i9j0" begin}
  Táto kapitola sa odomkne len vtedy, keď čitateľ zadá správnu odpoveď.
{end lock}
```

Viacero platných odpovedí:

```rea
{lock type="soft", key=["hash_answer_1", "hash_answer_2"] begin}
  Tento obsah odomkne ktorákoľvek z odpovedí.
{end lock}
```

**Ako mäkký zámok funguje vnútri:**

1. Autor pri tvorbe príbehu zadá odpoveď v čistom texte
2. Platforma odvodí kľúč AES-256-GCM pomocou PBKDF2 (SHA-256, 100-tisíc iterácií) z odpovede a náhodnej soli
3. Zamknutý obsah sa zašifruje odvodeným kľúčom
4. Soľ a IV (12 bajtov) sa uložia vedľa šifrovaného textu
5. Keď čitateľ odošle odpoveď, platforma kľúč znovu odvodí a pokúsi sa o dešifrovanie
6. Vstavaná autentifikačná značka AES-GCM overí, že odpoveď je správna (odolné voči manipulácii)

### Tvrdý zámok {#hard-lock}

Obsah je uložený na serveri a stiahne sa až po tom, čo čitateľ odošle správny kľúč. Bráni to jeho vytiahnutiu z miestneho balíka:

```rea
{lock type="hard", key="server_stored_hash" begin}
  Táto kapitola sa stiahne až po správnom overení.
{end lock}
```

Tvrdé zámky používajú overenie na strane servera: odpoveď čitateľa sa zahašuje na klientovi a odošle na server, ktorý ju porovná s uloženým odtlačkom a zašifrovaný obsah vráti len pri zhode.

### Podmienený zámok {#conditional-lock}

Zamknutie obsahu za podmienky príbehu:

```rea
{lock condition="player.level >= 10 and has_dragon_scale" begin}
  Starodávny text sa odhalí len hodným.
{end lock}
```

### Model šifrovania {#encryption-model}

Všetko šifrovanie obsahu v Rea používa **Web Crypto API** pre kryptografiu bezpečnú v prehliadači a v súlade so štandardmi:

| Komponent          | Algoritmus / štandard                             |
| ------------------ | ------------------------------------------------- |
| Šifrovanie         | AES-256-GCM (autentifikované šifrovanie)          |
| Odvodenie kľúča    | PBKDF2 (SHA-256, 100-tisíc a viac iterácií)       |
| IV                 | 12 náhodných bajtov (na blok, nikdy sa neopakuje) |
| Autentifikačná značka | 128-bitová (súčasť AES-GCM)                    |
| Výmena kľúčov      | X25519 (kooperatívni čitatelia, server – klient)  |
| Hašovanie          | SHA-256 (kontrolné súčty, overenie odpovede)      |
| Podpisovanie       | Ed25519 (podpisy balíkov, identita autora)        |

Model šifrovania zaisťuje:

- **Žiadny čistý text v balíkoch** — zamknutý obsah je v súbore `.reast` vždy šifrovaný
- **Dopredné utajenie** — každý blok zámku používa jedinečný IV; prelomenie jedného neodhalí ostatné
- **Kompatibilita s prehliadačmi** — všetky algoritmy fungujú v Chrome, Firefoxe, Safari aj Edge cez `SubtleCrypto`
- **Funkčnosť offline** — mäkké zámky sa dešifrujú miestne bez kontaktu so serverom

### Kód rozšírenia sa nikdy nešifruje {#extension-code-is-never-encrypted}

Ochrana obsahu sa týka **len prózy**. Zavádzač zašifrované rozšírenie `.rext` rovno odmietne. Šifrovanie je ochrana obsahu, nie bezpečnostná hranica — sandbox rozšírenie obmedzuje rovnako, či je jeho zdroj zašifrovaný alebo nie — takže jeho zákaz nič obranné nestojí a prináša tri veci: kód sa overí **skôr**, než sa spustí próza (odomykací kód môže doraziť uprostred príbehu a kód, ktorý sa objaví, až keď je čitateľ zaviazaný, zlyhá v najhoršej chvíli); kód je **auditovateľný bez kľúča** (`reast validate`, editor, moderácia platformy); a tretí vkladateľ bez kľúča stále dokáže spustiť logiku príbehu. Celé pravidlo nájdete v [Rozšíriteľnosti](05-reference.md#_31-extensibility).

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
```

Výhrada, povedaná otvorene: zašifrovaná `.rea` **nie je** tajomstvom pred odhodlaným čitateľom. Kľúč sa na jeho zariadenie dostane preto, aby sa kapitola vykreslila, takže `crypt.passphrase` sa dá vytiahnuť. Chráni pred prezradením zápletky, letmým nahliadnutím a prehľadaním archívu — nie pred motivovaným útočníkom. Čokoľvek, čo musí byť skutočne nefalšovateľné (odpoveď v súťaži, platené odomknutie), sa musí overiť **na strane servera** (pozri [Tvrdý zámok](#hard-lock)), a to je práca platformy, nie jadra.

---

## 24. Popisky {#_24-captions}

<Feature id="captions" />

Príkaz `{caption}` pridáva popisné titulky k predchádzajúcemu obsahu (obrázkom, blokom kódu alebo textovým sekciám):

```rea
[!Starodávna mapa < media/map.jpg]
{caption "Ručne kreslená mapa nájdená v čarodejníkovej veži"}

{voice speaker="elena", emotion="sad" begin}
  Nikdy som si nemyslela, že to takto skončí.
{end voice}
{caption "Elenine posledné slová"}
```

---

## 25. Únikové sekvencie a surový text {#_25-escaping-raw-text}

### Únik pred zvláštnymi znakmi {#escaping-special-characters}

<Feature id="escaping" />

Pomocou `\` uniknete pred ľubovoľným znakom so zvláštnym významom:

```rea
Cena je \{nie je to príkaz\}.
Použi \_podčiarkovníky\_ bez kurzívy.
Cesta \*nebola\* taká, ako sa zdalo.
```

### Surové bloky {#raw-blocks}

Obsah vnútri `{raw begin}` sa vykreslí tak, ako je, bez akéhokoľvek spracovania:

```rea
{raw begin}
  Tento {text} sa *nespracúva*.
  Neuplatňuje sa tu žiadne _formátovanie_ ani {príkazy}.
{end raw}
```

---

## 26. Komentáre {#_26-comments}

<Feature id="comments" />

### Autorské komentáre (skryté pred čitateľom) {#author-comments-hidden-from-reader}

```rea
{comment Toto je jednoriadkový komentár}

{comment begin}
  Toto je viacriadkový komentár.
  Čitatelia ho nikdy neuvidia.
{end comment}
```

Obsah komentára je čistý text až po uzatváraciu zátvorku — bez úvodzoviek. Blok otvára len presné `{comment begin}`, takže slovo `begin` vnútri komentára je len slovo: `{comment oprav to skôr, než začneme begin}` je jednoriadkový komentár.

Viacriadkové komentáre používajú blokovú syntax `{comment begin}…{end comment}`, v súlade so všetkými ostatnými párovými príkazmi.

### Značky TODO {#todo-markers}

<Feature id="todo" />

```rea
{todo Sem napísať bojovú scénu}

{todo begin}
  Prepísať záver.
  Potom aj stred.
{end todo}
```

TODO je komentár, ktorý sa sám ohlási: pred čitateľom je skrytý presne ako
`{comment}` a na autorskom kanáli vyvolá `style/todo`, takže ho `reast validate`
aj editor vypíšu. Rovnako ako komentár má čistý textový obsah a blok otvára len
`{todo begin}`.

---

## 27. Spracovanie chýb {#_27-error-handling}

Rea má dve publiká a nikdy nezdieľajú tú istú rúru.

**Čitateľ** dostáva text. Každé zlyhanie má definované, tiché náhradné
správanie a na stránku sa nikdy nedostane žiadny text chyby — ani správa, ani
zástupný token, ani holý identifikátor. Toto je záruka jazyka, nie detail
runtime.

**Autor** dostáva *záznamy*: štruktúrované dáta s kódom a pozíciou, bez
vykresliteľnej podoby. Záznam sa čitateľovi nikdy nezobrazí, v žiadnej
závažnosti. Vypisuje ich `reast validate`, podčiarkuje ich editor a hostiteľ ich
formátuje z `code + args + locale`.

Tieto dva kanály sú celý návrh. Zlyhanie vytvorí náhradné správanie **aj**
záznam a ani jedno nenahrádza druhé.

### Závažnosti {#severities}

Každý kód nesie práve jednu závažnosť, pevne danú v registri enginu. Miesto
volania si ju nikdy nevyberá, takže dve miesta, ktoré si všimnú tú istú
podmienku, sa nemôžu nezhodnúť na tom, aká je vážna.

| Závažnosť  | Čo znamená                                                                     | Zhodí CI              |
| ---------- | ------------------------------------------------------------------------------ | --------------------- |
| `fatal`    | Artefakt sa vôbec nedá načítať. Len chyby balíka a rozšírení.                   | áno                   |
| `error`    | Autorská chyba s dôsledkom viditeľným pre čitateľa: obsah sa stratí, je mŕtvy alebo nesprávny. | áno    |
| `warning`  | Autorská chyba, ktorá zatiaľ nemá dôsledok viditeľný pre čitateľa.              | pri `--strict`        |
| `degraded` | *Správne* správanie v obmedzenom prostredí alebo na nižšej úrovni zhody.        | **nikdy**             |
| `info`     | Hygiena, štýl a autorské poznámky.                                             | nie                   |

`degraded` sa nikdy nepovyšuje, ani pri `--strict`. Povýšenie by poprelo dôvod,
prečo je to samostatná závažnosť: autor musí vedieť rozlíšiť „moja funkcia
úrovne Platform tu nespravila nič, a tak to má byť" od „urobil som chybu".

Nič v `parse/` nie je `fatal`. Ľubovoľný text v UTF-8 je platný dokument Rea —
súbor `.rea` nikdy nezlyhá na parsovaní.

### Oblasti kódov {#code-partitions}

Kód je reťazec malými písmenami rozdelený lomkou; predpona *je* oblasť, takže
kódy sa dajú triediť, grepovať aj filtrovať vzorom.

| Oblasť    | Vyvoláva                                                        |
| --------- | --------------------------------------------------------------- |
| `pkg/`    | Archív, manifest, integrita, dešifrovanie                       |
| `ext/`    | Dôvera a gramatika `.rext` pri načítaní, rozklad `{use}`        |
| `parse/`  | Čítanie jedného súboru                                          |
| `link/`   | Rozklad mien naprieč celým balíkom                              |
| `eval/`   | Vyhodnotenie výrazu                                             |
| `flow/`   | Beh príbehu: limity, riadenie toku, uloženia                    |
| `env/`    | Prostredie, v ktorom sa príbeh číta: médiá, senzory, čitatelia  |
| `style/`  | Hygiena a autorské poznámky                                     |
| `meta/`   | Samotný prúd záznamov                                           |

### Čo dostane čitateľ {#what-the-reader-gets}

<Feature id="error-handling" />

| Zlyhanie                                     | Čo čitateľ uvidí                                  | Záznam                     |
| -------------------------------------------- | ------------------------------------------------- | -------------------------- |
| Nenastavená premenná `{gold}`                | Nič — prázdny reťazec                             | `eval/undefined-variable`  |
| Delenie nulou `{1 / 0}`                      | Nič — výraz nemá hodnotu                          | `eval/division-by-zero`    |
| Chýbajúci obrázok                            | Zástupný obsah s alternatívnym textom             | `env/missing-image`        |
| Chýbajúci zvuk                               | Ticho; čítanie pokračuje                          | `env/missing-audio`        |
| Chýbajúce video                              | Náhľadový snímok, ak je, inak zástupný obsah      | `env/missing-video`        |
| Nedostupná syntéza reči                      | Rozprávanie sa preskočí                           | `env/tts-unavailable`      |
| Neuzavretý `{if begin}` na konci súboru      | Blok sa automaticky uzavrie                       | `parse/unterminated-block` |
| Neznámy príkaz `{magic begin}`               | Celý blok sa preskočí                             | `parse/unknown-command`    |
| Neznámy menný priestor `{ns.cmd a}`          | Celý blok sa preskočí                             | `parse/unknown-namespace`  |
| Odbočka na neexistujúcu kotvu                | Čítanie pokračuje za odbočkou                     | `link/undefined-anchor`    |
| Nedostupný senzor                            | `world.has("sensor")` vráti `false`               | `env/sensor-unavailable`   |

Táto tabuľka je **len ilustratívna** — 11 reprezentatívnych riadkov z celého
registra. Normatívny je úplný, generovaný zoznam všetkých 175 kódov v
anglickej verzii, [§27 „What the reader gets"](../../spec/04-utilities.md#what-the-reader-gets):
`scripts/check-spec-fallback-table.mjs` ho generuje priamo z registra, takže
nemôže so zdrojovým kódom rozísť. Táto slovenská tabuľka sa negeneruje a
neaktualizuje automaticky, preto pri rozpore platí anglická verzia.

Neznámy príkaz sa **preskočí celý** — vrátane bloku, ak nejaký otvára.
Nevytlačí sa ako výraz. Vytlačenie by dostalo autorov zápis na stránku
čitateľa, čomu má čitateľský kanál práve zabrániť.

Delenie nulou nedáva **nič**, čo sa vykreslí ako nič. Predtým dávalo `0` —
hodnotu, ktorú čitateľ nevedel odlíšiť od skutočného výsledku.

### Čo smie záznam niesť {#what-a-record-may-carry}

Záznam smie pomenovať identifikátor, ktorý autor napísal, odcitovať to, čo autor
doslova napísal, a opísať *typ* hodnoty za behu. Nikdy nesmie niesť hodnotu za
behu.

Toto pravidlo vynucuje tvar API, nie kontrola pri revízii: neexistuje
konštruktor, ktorý by prijal reťazec od volajúceho. Citovaný zdroj sa spätne
načíta zo súboru na danej pozícii. Zlyhané `{set gold = "abc"}` teda smie
ohlásiť `"abc"`, lebo to autor napísal do súboru, kým to isté zlyhanie na
hodnote, ktorá prišla cez `{input}`, môže ohlásiť len názov typu.

Tým sa záruky súkromia pre voľný text a zvuk zo
[Sekcie 19](03-narrative-interaction.md#_19-input-interaction) a
[Sekcie 21](03-narrative-interaction.md#_21-real-world-interactions) vzťahujú aj
na diagnostické záznamy, nielen na stav príbehu. `{listen}`, ktoré sa
nezhoduje, zaznamená, že sa nezhodovalo — nikdy to, čo bolo povedané.

### Ako sa záznamy čítajú {#reading-the-records}

```bash
reast validate                 # každý .rea a .rext pod data/seed
reast validate path/ --json    # prúd záznamov, pre CI
reast validate path/ --strict  # zostavenie zhodia aj varovania
```

```text
story/0001.rea:124:1 error link/undefined-anchor Divert to "the_vault" — no such anchor
```

Návratový kód je nenulový pri akomkoľvek `fatal` alebo `error`, v každom
výstupnom režime.

Rea **nemá** `try/catch`. Všetko spracovanie chýb je implicitné — runtime sa
zotaví, zážitok čitateľa sa nikdy nepreruší a autor si prečíta záznam.

### Náhradné hodnoty {#fallback-values}

<Feature id="fallback-values" />

Tam, kde to dáva zmysel, syntax podporuje voliteľné inline náhradné hodnoty:

```rea
[!map < media/map.png, fallback="media/map-lowres.png"]
[?thunder < sounds/thunder.mp3, fallback="sounds/rain.mp3"]
```

Ak primárny zdroj zlyhá, použije sa náhrada. Ak zlyhá aj náhrada, platforma uplatní svoje predvolené elegantné správanie (zástupný obsah pri obrázkoch, ticho pri zvuku a podobne).

### Prístup k externým API {#external-api-access}

<Feature id="external-api" />

Volania externých rozhraní (sieťové požiadavky z vnútra príbehu) sa musia deklarovať v `manifest.json` cez `allowed_urls`. URL adresy sa nesmú objaviť nikde v texte `.rea` — autori sa na rozhrania odkazujú výhradne aliasom. Tým je každý externý prístup deklarovaný, auditovateľný a riadený povoleniami.

```json
{
  "title": "Príbeh o počasí",
  "allowed_urls": [
    {
      "alias": "weather",
      "url": "https://api.weather.example.com",
      "params": ["lat", "lng"]
    },
    { "alias": "maps", "url": "https://maps.example.com" }
  ]
}
```

Každá položka v `allowed_urls` je objekt s poľami:

| Pole     | Typ      | Popis                                                    |
| -------- | -------- | -------------------------------------------------------- |
| `alias`  | string   | Krátky názov, ktorým sa na toto rozhranie odkazuje v .rea |
| `url`    | string   | Predpona základnej URL, ku ktorej príbeh smie pristupovať |
| `params` | string[] | Voliteľný zoznam povolených názvov parametrov dopytu     |

Autori sa na povolené rozhrania v kóde príbehu odkazujú aliasom. Ak požiadavka zlyhá, runtime vráti `undefined` a príbeh pokračuje.

---
