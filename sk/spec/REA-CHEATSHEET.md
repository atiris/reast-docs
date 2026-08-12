# Jazyk Rea — ťahák

> Čistý text je platný obsah. Jednoducho píšte.

Tento ťahák ukazuje syntax, nie jej zrelosť. Časť z toho, čo nasleduje, je `draft` alebo `development` — špecifikované, ale zatiaľ nepoužiteľné. Skôr než sa na čokoľvek tu spoľahnete, pozrite [index funkcií](features).

## Dva jadrové symboly

Celý jazyk Rea stojí na dvoch znakoch:

| Symbol | Účel                                                                 | Zapamätajte si         |
| ------ | -------------------------------------------------------------------- | ---------------------- |
| `{ }`  | **Príkazy** — všetko, čo „koná" (logika, premenné, riadenie toku)    | Zložené = kód          |
| `[ ]`  | **Odkazy** — všetko, čo „ukazuje" (odkazy, médiá, kotvy)             | Hranaté = odkaz        |

Všetko ostatné je text príbehu.

---

## Text a formátovanie

```rea
Čistý text. Jednoducho píšte.

_kurzíva_     *tučné*     _*tučná kurzíva*_     `neproporcionálne`
{underline begin}podčiarknuté{end underline}
{strike begin}prečiarknuté{end strike}
```

**Štruktúra:**

```rea
# Kapitola       ## Sekcia        ### Scéna
= na stred      > doprava        < vynútene doľava
| citácia        || vnorená citácia
---              Vodorovná čiara (1 – 5 pomlčiek = 5 váh)
```

---

## Odkazy a médiá `[ ]`

Prvý znak za `[` určuje typ:

| Prefix    | Typ              | Príklad                                       |
| --------- | ---------------- | --------------------------------------------- |
| _(žiadny)_ | Odkaz            | `[Pokračovať > #forest]`                      |
| `!`       | Obrázok          | `[!Mapa lesa < media/map.jpg]`                |
| `>`       | Video            | `[>Úvod < media/intro.mp4]`                   |
| `?`       | Zvuk             | `[?Dážď < media/rain.ogg, volume=0.5, loop]`  |
| `#`       | Kotva (definícia) | `[#forest]`                                  |
| `[[`      | Brána časti      | `[[ story/0005-forest.rea ]]` (ukončí časť)   |

Pri odkaze (`[text > cieľ]`) vyberá cieľové miesto prvý znak **cieľa** (za `>`):

| Prefix cieľa   | Typ                | Príklad                                     |
| -------------- | ------------------ | ------------------------------------------- |
| `#`            | Kotva              | `[späť > #forest]`                          |
| _(súbor/cesta)_ | Časť              | `[ďalej > story/0004-kingdom.rea]`          |
| `^`            | Poznámka pod čiarou | `[dialekt > ^Stará elfčina, takmer stratená.]` |
| `*`            | Nápoveda           | `[veža > *Postrčenie.**Priamejšia nápoveda.]` |

**Smer šípky:** `>` = kam odkaz vedie, `<` = odkiaľ prichádza zdroj.

---

## Premenné a tlač `{set}` `{nazov}`

```rea
{set player.gold = 100}              Číslo
{set player.name = "Aria"}           Reťazec (vždy v dvojitých úvodzovkách)
{set player.items = ["sword", "map"]} Pole
{set stats = [hp=100, dex=8]}        Pomenované položky

Ahoj, {player.name}! Máš {player.gold} zlata.
{player.gold > 50 ? "bohatý" : "chudobný"}
```

**Prefixy domén** (údaje platformy len na čítanie):
`reader.*` `story.*` `world.*` `device.*` `group.*`

---

## Riadenie toku

```rea
{if player.gold > 10 begin}         {for item in player.items begin}
  Máš dosť zlata.                      - {item}
{else if player.gold > 0}           {end for}
  Ešte niečo máš.
{else}                               {while fuel > 0 begin}
  Si na mizine.                        Pokračuj…
{end if}                               {set fuel = fuel - 1}
                                     {end while}
{switch weapon begin}
  {case "sword"} Zblízka.            {case "bow"} Na diaľku.
  {default} Päste.
{end switch}
```

---

## Voľby a vetvenie

```rea
* [Jednorazová voľba]                Po výbere zmizne
  Text po výbere.

+ [Trvalá voľba]                     Vždy dostupná
  Text po výbere.

* {player.gold >= 10} [Kúp elixír]   Podmienená voľba
  {set player.gold = player.gold - 10}

* * [Vnorená voľba]                  Druhá úroveň

- Bod zberu                          Vetvy sa tu opäť zbiehajú
-> nazov_kotvy                       Odbočka (skok)
->-> nazov_sekcie                    Tunel (skok a automatický návrat)
* ->                                 Záloha (vyberie sa, keď nič iné nezostane)

* hidden [&card_id] …                Skrytá voľba — bez tlačidla; spustí ju voľný text alebo scan/mark/listen

{menu select=2 begin}                Menu objavovania — čaká na 2 výbery
* hidden [&qr_door] …                Skrytá možnosť — bez tlačidla, zobudí ju len aktivácia
{end menu}

{storylet bench_secret begin}        Spúšťaný storylet — kartu rozdáva svet
  trigger: scan                        Druh vstupu: scan, listen, text, nfc, … (otvorená množina)
  match: "^REAST-BENCH-.*"             Voliteľný regulárny výraz na hodnotu vstupu
  …                                    Prehrá sa ako vedľajšia cesta a vráti sa do hlavného príbehu
{end storylet}
```

---

## Funkcie

```rea
{function greet(name, title = "dobrodruh") begin}
  Ahoj, {name}, {title}!
{end function}

{greet("Aria")}                      Volanie (vykreslí text)
{set dmg = damage(10, 1.5)}         Volanie (vráti hodnotu)
```

**Vstavané:** `abs` `min` `max` `round` `random(1,6)` `clamp` `length` `upper` `lower` `trim` `contains` `replace` `split` `join` `append` `remove` `shuffle` `sort`

---

## Rozšírenia (`.rext`)

```rea
{use "extensions/inventory" as inv}   Import priloženého rozšírenia (cesta bez .rext)
{inv.total_weight()}                  Volanie exportovanej funkcie
{use "std/dice" as dice}              Štandardná knižnica — vždy dostupná, offline
{dice.roll(2, 6)}                     std/dice: d(sides) roll(n,sides) advantage/disadvantage
```

Pravidlá jazyka vnútri `.rext` nájdete v časti [Kde sa pravidlá líšia v súboroch `.rext`](rext-differences) a mechaniku archívu v [referencii formátu balíka `.reast`](/sk/engine/package-format#packaged) v dokumentácii jadra.

---

## Lokalizácia a dátumy

```rea
{plural(count, one="{} minca", other="{} mincí")}   Množné číslo CLDR, lokál hostiteľa
{select(pronoun, he="jeho", she="jej", other="ich")}
{ordinal(3)}                          „3rd" (len en); iné lokály dostanú „3"
{formatNumber(1234567, "sk")}         Formát čísla podľa lokálu (2. argument = lokál)
{formatDate(world.date, "long")}      style: iso | short | medium | long | full
{formatTime(now(), "short")}   {formatDateTime(now(), "iso")}
```

Lokál a politiku formátovania dodáva hostiteľ. `calendar()` je stále vo vývoji — pozri [index funkcií](features#localization).

---

## Dialóg

```rea
@elena: „Poď za mnou!"              Pripísanie hovorcovi (s úvodzovkami)
@narrator: Cesta sa zotmela.        Rozprávač (úvodzovky netreba)
```

---

## Naratívne nástroje

```rea
{once begin} Prvá návšteva. {then} Ďalšia návšteva. {end once}

{prvé|druhé|tretie}                  Sekvencia (zastane na poslednom)
{&a|b|c}                            Cyklus (opakuje sa donekonečna)
{!raz|dvakrát|hotovo}                Len raz (potom prázdne)
{~moz1|moz2|moz3}                    Premiešanie (náhodne)
```

---

## Kooperatívne čítanie

```rea
{define role scout begin}            Definícia roly
  max: 1
{end define}

{vote timeout=60 begin}              Skupinové hlasovanie
  * [Doľava]   * [Doprava]
{end vote}

{whisper to="captain" begin}         Tajná správa
  Vidím strážcov.
{end whisper}

{broadcast begin} Počujú to všetci. {end broadcast}
{wait readers=all begin} Čaká sa… {end wait}
{set shared.score = shared.score + 1}  Zdieľaná premenná
```

---

## Interakcie s reálnym svetom

```rea
{require gps}                        Vyžadovaný senzor
{require nfc optional}               Voliteľný senzor

{waypoint bridge, @@48.14;17.10/50 begin}
  Stojíš na starom moste.
{end waypoint}

{timer duration=30, on_expire="-> timeout" begin}
  Ponáhľaj sa!
{end timer}
```

---

## Hlas a zvuk

```rea
{voice speed=5, pitch=5, emotion="whisper" begin}
  Jaskyňa sa ozývala šepotom.
{end voice}

{stop ambient_music}
```

---

## Karty (postavy, predmety)

```rea
{define character elena begin}
  name: Elena Vossová
  image: media/elena.png
{end define}

[@elena]                    Odkaz na postavu
[$golden_key]               Odkaz na predmet
{give golden_key}           Daj predmet čitateľovi
{take golden_key}           Odober predmet čitateľovi
{play ability_card}         Zahraj kartu → spustí sa jej háčik on_use
```

```rea
{coins gold="Dukát" silver="Groš" bronze="Halier"}  Premenovanie úrovní mincí
{coins silver_per_gold=5 bronze_per_silver=4}        Predefinovanie pomerov
{earn gold 2}               Pridaj 2 zlaté (1 gold = 10 silver = 100 bronze)
{spend bronze 3}            Minie 3 bronzové (podľa potreby rozmení vyššie)
{if reader.coins.total >= 100 begin} … {end if}      Kontrola hodnoty peňaženky
```

```rea
{define cardset ability begin}   Deklarácia vlastnej sady či kategórie kariet
  name: Karty schopností
  use: Zahraním sa uplatní bonus.
  {on_use begin}                 Háčik sa spustí pri každej karte sady
    {set ability_count = ability_count + 1}
  {end on_use}
{end define}

{define ability spinach begin}   Karta patriaca do sady
  name: Špenát
  strength: +2
{end define}
```

```rea
{define action door begin}       Polia aktivácie v reálnom svete
  scan: ^REAST-DOOR-.*             Obsah QR alebo čiarového kódu (regulárny výraz)
  mark: emb1:Zk3q…                 Podpis kreslenej značky (nepriehľadný — nikdy neupravovať ručne)
  listen: otvor dvere              Prepis reči (regulárny výraz)
{end define}
```

---

## Vstup a interakcia

```rea
{input name=player_name, placeholder="Tvoje meno"}
{input name=guess, type="number", min=1, max=100}
{input type="action", placeholder="Čo urobíš?"}   Voľný text priradený k čakajúcim voľbám
{button label="Pokračovať", target=next_chapter}
```

---

## Komentáre a autorské nástroje

```rea
{// Jednoriadkový komentár}
{comment begin}
  Viacriadkový komentár — čitatelia ho nikdy neuvidia.
{end comment}

\{nie je to príkaz\}                 Únik spätnou lomkou
{raw begin} Všetko doslovne. {end raw}

{todo: Opraviť túto scénu}           Varovanie vo vývojovom režime
{strict on}                          Zobrazí všetky varovania
```

---

## Pravidlá, ktoré si treba pamätať

1. **`{ }` = akcia**, **`[ ]` = odkaz** — to je celý jazyk
2. **`begin` / `end`** — všetky blokové príkazy používajú túto dvojicu
3. **Jedno `=` na porovnanie** (nie `==`), priradenie je vždy `{set x = …}`
4. **Prefixy domén** oddeľujú premenné autora (`player.*`) od platformových (`reader.*`)
5. **`*` = jednorazová voľba**, **`+` = trvalá voľba**, **`-` = zber (opätovné zbiehanie)**
6. **`->` = skok**, **`->->` = tunel (skok a automatický návrat)**
7. **Prvý znak v `[ ]`** rozhoduje o médiu či kotve: `!` obrázok, `>` video, `?` zvuk, `#` kotva; v odkaze prefix **cieľa** `^` = poznámka pod čiarou, `*` = nápoveda
8. **Čistý text je platný príbeh** — syntax pridávate, len keď ju potrebujete
