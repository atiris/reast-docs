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
{set story.player.gold = 100}              Číslo
{set story.player.name = "Aria"}           Reťazec (vždy v dvojitých úvodzovkách)
{set story.player.items = ["sword", "map"]} Pole
{set story.stats = [hp=100, dex=8]}   Pomenované položky

Ahoj, {story.player.name}! Máš {story.player.gold} zlata.
{story.player.gold > 50 ? "bohatý" : "chudobný"}
```

**Prefixy domén** (údaje platformy len na čítanie): `reader.*` `story.*` `world.*` `device.*` `group.*`

---

## Riadenie toku

```rea
{if story.player.gold > 10 begin}         {for item in story.player.items begin}
  Máš dosť zlata.                      - {item}
{else if story.player.gold > 0}           {end for}
  Ešte niečo máš.
{else}                               {while fuel > 0 begin}
  Si na mizine.                        Pokračuj…
{end if}                               {set story.fuel = story.fuel - 1}
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

* {story.player.gold >= 10} [Kúp elixír]   Podmienená voľba
  {set story.player.gold = story.player.gold - 10}

* * [Vnorená voľba]                  Druhá úroveň

- Bod zberu                          Vetvy sa tu opäť zbiehajú
-> nazov_kotvy                       Odbočka (skok)
->-> nazov_sekcie                    Tunel (skok a automatický návrat)
* ->                                 Záloha (vyberie sa, keď nič iné nezostane)

* hidden [&card_id] …                Skrytá voľba — bez tlačidla; spustí ju voľný text alebo scan/mark/listen

{menu select=2 begin}                Menu objavovania — čaká na 2 výbery
* hidden [&qr_door] …                Skrytá možnosť — bez tlačidla, zobudí ju len aktivácia
{end menu}

{storylet bench_secret trigger=scan, match="^REAST-BENCH-.*" begin}
  …                                  Spúšťaný storylet — kartu rozdáva svet, prehrá sa
                                     ako vedľajšia cesta a vráti sa do hlavného príbehu
{end storylet}
```

---

## Funkcie

```rea
{function greet(name, title = "dobrodruh") begin}
  Ahoj, {name}, {title}!
{end function}

{greet("Aria")}                      Volanie (vykreslí text)
{set story.dmg = damage(10, 1.5)}    Volanie (vráti hodnotu)
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
{formatDate(context.time.date, "long")}      style: iso | short | medium | long | full
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
{define role scout max=1}            Definícia roly — bez tela, teda bez `begin`

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

## Podmienky: teraz, kým, kedykoľvek

Jeden jazyk výrazov; blok rozhoduje, *kedy* sa naň engine pozrie.

| Režim          | Zápis                                                       | Vyžaduje únik                   |
| -------------- | ----------------------------------------------------------- | ------------------------------- |
| **teraz**      | `{if}`, `condition` voľby, `visible:` špendlíka             | nie                             |
| **kým**        | `{wait when EXPR begin} … {end wait}`, `{waypoint}`         | áno, keď výraz číta `context.*` |
| **kedykoľvek** | `{on EVENT when GUARD}`, `when` storyletu, `{zone}`     | neaplikuje sa                   |

```rea
{zone forest, circle(@(48.14, 17.10), 100)}       Deklaruje oblasť a označí miesto
{on enter zone="forest" begin}                    Vykreslí sa vnútri
  Stromy sa zovrú.
{end on}
{on exit zone="forest" begin}                     Nahradí to po odchode
  Vyjdeš a žmurkáš.
{end on}

{route hunt, waypoints="old_bridge, castle_ruins",  Chodník cez zastávky
       complete="Hon sa skončil.", sequential begin}
{end route}                                         `complete` sa ukáže tu, keď sú všetky
```

```rea
{wait when story.lamp_lit begin}     Pauza, kým nie je pravda
  Čakáš v tme.
{end wait}

{wait escape=duration("PT3H"), escape_to="dry_night" when context.weather = "rain" begin}
  Pozeráš na oblohu.                 Telo = stav počas čakania
{end wait}

between(context.time, "22:00", "06:00")   Časový rozsah, aj cez polnoc
elapsed(story.started) >= duration("PT30M")
within(context.location, "old_bridge")    Oblasť pomenovanej zastávky
```

---

## Interakcie s reálnym svetom

```rea
{require gps}                        Vyžadovaný senzor
{require nfc optional}               Voliteľný senzor

{waypoint bridge, circle(@(48.14, 17.10), 50), hint="Nájdi most." begin}
  Stojíš na starom moste.            Telo = príchod; hint = text čakania
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
{define character elena name="Elena Vossová", image="media/elena.png"}

[@elena]                    Odkaz na postavu
[$golden_key]               Odkaz na predmet
{give golden_key}           Daj predmet čitateľovi
{take golden_key}           Odober predmet čitateľovi
{play ability_card}         Zahraj kartu → spustia sa jej obsluhy {on use}
```

```rea
{coins gold="Dukát" silver="Groš" bronze="Halier"}  Premenovanie úrovní mincí
{coins silver_per_gold=5 bronze_per_silver=4}        Predefinovanie pomerov
{earn gold 2}               Pridaj 2 zlaté (1 gold = 10 silver = 100 bronze)
{spend bronze 3}            Minie 3 bronzové (podľa potreby rozmení vyššie)
{if story.reader.coins.total >= 100 begin} … {end if}      Kontrola hodnoty peňaženky
```

```rea
{define cardset ability name="Karty schopností",   Deklarácia vlastnej sady kariet
        use="Zahraním sa uplatní bonus."}

{on use set="ability" begin}     Vykoná sa pri každej karte sady
  {set story.ability_count = story.ability_count + 1}
{end on}

{on use card="spinach" begin}    Vykoná sa pri jednej karte, po obsluhe sady
  {set story.player.strength = story.player.strength + 2}
{end on}

{define ability spinach name=Špenát, strength="+2"}   Karta patriaca do sady
```

```rea
{define action door scan="^REAST-DOOR-.*",   Polia aktivácie v reálnom svete: obsah QR
        mark="emb1:Zk3q…",                  kódu (regulárny výraz), podpis kreslenej
        listen="otvor dvere"}               značky (nepriehľadný), prepis reči
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
{comment Jednoriadkový komentár}
{comment begin}
  Viacriadkový komentár — čitatelia ho nikdy neuvidia.
{end comment}

\{nie je to príkaz\}                 Únik spätnou lomkou
{raw begin} Všetko doslovne. {end raw}

{todo Opraviť túto scénu}            Skryté pred čitateľom, vypíše reast validate
{todo begin} ... {end todo}          Viacriadkové TODO
```

---

## Pravidlá, ktoré si treba pamätať

1. **`{ }` = akcia**, **`[ ]` = odkaz** — to je celý jazyk
2. **`begin` / `end`** — všetky blokové príkazy používajú túto dvojicu
3. **Jedno `=` na porovnanie** (nie `==`), priradenie je vždy `{set domena.meno = …}`
4. **Prefixy domén** oddeľujú premenné autora (`story.player.*`) od platformových (`reader.*`)
5. **`*` = jednorazová voľba**, **`+` = trvalá voľba**, **`-` = zber (opätovné zbiehanie)**
6. **`->` = skok**, **`->->` = tunel (skok a automatický návrat)**
7. **Prvý znak v `[ ]`** rozhoduje o médiu či kotve: `!` obrázok, `>` video, `?` zvuk, `#` kotva; v odkaze prefix **cieľa** `^` = poznámka pod čiarou, `*` = nápoveda
8. **Čistý text je platný príbeh** — syntax pridávate, len keď ju potrebujete
