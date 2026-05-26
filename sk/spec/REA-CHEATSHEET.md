# Jazyk REA — Ťahák

> Čistý text je platný obsah. Jednoducho píšte.

## Dva základné symboly

Celý jazyk REA stojí na dvoch znakoch:

| Symbol | Účel | Pamätaj si |
| ------ | ---- | ---------- |
| `{ }` | **Príkazy** — všetko čo „robí" (logika, premenné, riadenie) | Kučeravé = kód |
| `[ ]` | **Odkazy** — všetko čo „ukazuje" (linky, médiá, kotvy) | Hranaté = odkaz |

Všetko ostatné je text príbehu.

---

## Text a formátovanie

```rea
Obyčajný text. Stačí písať.

_kurzíva_     *tučné*     _*tučná kurzíva*_     `monospace`
{underline begin}podčiarknuté{end underline}
{strike begin}prečiarknuté{end strike}
```

**Štruktúra:**

```rea
# Kapitola       ## Sekcia       ### Scéna
= centrované     > doprava       < doľava
| blokový citát  || vnorený citát
---              Horizontálna čiara (1–5 pomlčiek = 5 hrúbok)
```

---

## Odkazy a médiá `[ ]`

Prvý znak za `[` určuje typ:

| Prefix | Typ | Príklad |
| ------ | --- | ------- |
| *(žiadny)* | Odkaz | `[Choď ďalej > #les]` |
| `!` | Obrázok | `[!Mapa lesa < media/mapa.jpg]` |
| `>` | Video | `[>Intro < media/intro.mp4]` |
| `?` | Audio | `[?Dážď < media/rain.ogg volume=0.5, loop]` |
| `#` | Kotva (definícia) | `[#les]` |
| `^` | Poznámka pod čiarou | `[^1]: Vysvetlenie` |

**Smer šípok:** `>` = kam smeruje odkaz, `<` = odkiaľ pochádza zdroj.

---

## Premenné a tlač `{set}` `{meno}`

```rea
{set player.gold = 100}              Číslo
{set player.name = "Aria"}           Text (vždy v úvodzovkách)
{set player.items = ["meč", "štít"]} Pole
{set stats = [hp=100, sila=8]}       Pomenované položky

Ahoj, {player.name}! Máš {player.gold} zlatých.
{player.gold > 50 ? "bohatý" : "chudobný"}
```

**Doménové prefixy** (read-only platformové dáta):
`reader.*` `story.*` `world.*` `device.*` `group.*`

---

## Riadenie toku

```rea
{if player.gold > 10 begin}         {for item in player.items begin}
  Máš dosť zlata.                     - {item}
{else if player.gold > 0}           {end for}
  Ešte niečo máš.
{else}                               {while fuel > 0 begin}
  Si na mizine.                        Idem ďalej...
{end if}                               {set fuel = fuel - 1}
                                     {end while}
{switch weapon begin}
  {case "meč"} Blízky boj.          {case "luk"} Streľba.
  {default} Päste.
{end switch}
```

---

## Voľby a vetvenie

```rea
* [Jednorazová voľba]               Zmizne po výbere
  Text po výbere.

+ [Lepivá voľba]                     Zostáva vždy dostupná
  Text po výbere.

* {player.gold >= 10} [Kúp lektvar]  Podmienená voľba
  {set player.gold = player.gold - 10}

* * [Vnorená voľba]                  Druhá úroveň

- Zhromažďovací bod                  Vetvy sa tu zbiehajú
-> nazov_kotvy                       Odklon (skok)
->-> nazov_sekcie                    Tunel (skok + návrat)
* ->                                 Fallback (auto-výber keď nič nezostalo)
```

---

## Funkcie

```rea
{function pozdrav(meno, titul = "dobrodruh") begin}
  Vitaj, {meno} — {titul}!
{end function}

{pozdrav("Aria")}                    Volanie (vykreslí text)
{set dmg = damage(10, 1.5)}         Volanie (vráti hodnotu)
```

**Vstavané:** `abs` `min` `max` `round` `random(1,6)` `clamp` `length` `upper` `lower` `trim` `contains` `replace` `split` `join` `append` `remove` `shuffle` `sort`

---

## Dialóg

```rea
@elena: "Poď za mnou!"              Reč postavy (s úvodzovkami)
@rozprávač: Cesta stmavla.          Rozprávač (bez úvodzoviek)
```

---

## Naratívne nástroje

```rea
{once begin} Prvá návšteva. {then} Opakovaná návšteva. {end once}

{first|druhý|tretí}                  Sekvencia (zastaví na poslednom)
{&a|b|c}                             Cyklus (opakuje dookola)
{!raz|dva|hotovo}                    Jednorazové (potom prázdne)
{~opt1|opt2|opt3}                    Náhodné (shuffle)
```

---

## Kooperatívne čítanie

```rea
{define role prieskumník begin}      Definícia role
  max: 1
{end define}

{vote timeout=60 begin}              Hlasovanie skupiny
  * [Doľava]   * [Doprava]
{end vote}

{whisper to="kapitán" begin}         Tajná správa
  Vidím strážcov.
{end whisper}

{broadcast begin} Všetci počujú. {end broadcast}
{wait readers=all begin} Čakáme... {end wait}
{set shared.score = shared.score + 1}  Zdieľaná premenná
```

---

## Interakcie s reálnym svetom

```rea
{require gps}                         Vyžaduje senzor
{require nfc optional}                Voliteľný senzor

{waypoint most, @@48.14;17.10/50 begin}
  Stojíš na starom moste.
{end waypoint}

{timer duration=30, on_expire="-> timeout" begin}
  Ponáhľaj sa!
{end timer}
```

---

## Hlas a audio

```rea
{voice speed=5, pitch=5, emotion="whisper" begin}
  Jaskyňa ozvučila šepot.
{end voice}

{stop ambient_music}
```

---

## Karty (postavy, predmety)

```rea
{define character elena begin}
  name: Elena Voss
  image: media/elena.png
{end define}

[@elena]                    Referencia na postavu
[$zlatý_kľúč]              Referencia na predmet
{give zlatý_kľúč}          Daj predmet čitateľovi
{take zlatý_kľúč}          Odobrať predmet
```

---

## Vstup a interakcia

```rea
{input name=meno_hraca, placeholder="Tvoje meno"}
{input name=tip, type="number", min=1, max=100}
{button label="Pokračovať", target=dalsia_kapitola}
```

---

## Komentáre a nástroje autora

```rea
{// Jednoriadkový komentár}
{comment begin}
  Viacriadkový komentár — čitatelia nevidia.
{end comment}

\{nie je príkaz\}                    Escapovanie
{raw begin} Doslova všetko. {end raw}

{todo: Opraviť túto scénu}          Upozornenie v dev móde
{strict on}                          Zobraziť varovania
```

---

## Pravidlá na zapamätanie

1. **`{ }` = akcia**, **`[ ]` = odkaz** — nič viac nepotrebujete
2. **`begin` / `end`** — všetky blokové príkazy používajú tento pár
3. **Jedno `=` na porovnanie** (nie `==`), priradenie je vždy `{set x = ...}`
4. **Doménové prefixy** oddeľujú autor-premenné (`player.*`) od platformy (`reader.*`)
5. **`*` = jednorazová voľba**, **`+` = lepivá voľba**, **`-` = zbiehanie vetiev**
6. **`->` = skok**, **`->->` = tunel (skok + automatický návrat)**
7. **Prvý znak v `[ ]`** rozhoduje: `!` obrázok, `>` video, `?` audio, `#` kotva
8. **Čistý text je platný príbeh** — syntaxu pridávate len keď ju potrebujete
