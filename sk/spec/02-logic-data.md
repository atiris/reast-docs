# Špecifikácia jazyka Rea — Časť 2: Logika a dáta (Sekcie 10–15)

> [Späť na hlavnú špecifikáciu](/sk/)
>
> **Stav implementácie:** Príkazy (10), premenné (11) a základné riadenie toku (13: `if`/`else`/`for`) sú implementované. Tlač výrazov (12) je čiastočná — jednoduché referencie premenných fungujú, ale aritmetika, ternárne operátory a volania funkcií ešte nie sú vyhodnocované v čase parsovania. Funkcie (14), `while`, `switch/case` a udalosti (15) sú špecifikované, ale zatiaľ neimplementované. Pozrite [REA-CHEATSHEET.md](REA-CHEATSHEET.md) pre podrobný stav.

---

## 10. Príkazy

Príkazy sú jadrovým mechanizmom pre interaktivitu. Sú uzavreté v `{ }` zložených zátvorkách.

Každý príkaz je **vždy buď samouzatvárajúci alebo párový** — nikdy oboje. Neexistuje „voliteľné párovanie".

### Samouzatvárajúce príkazy

```rea
{nazov_prikazu atribut=hodnota}
```

### Párové príkazy

Použite `begin` na otvorenie, zatvorte s `{end nazov_prikazu}`:

```rea
{nazov_prikazu atribut=hodnota begin}
  Obsah ovplyvnený príkazom.
{end nazov_prikazu}
```

Obsah vnútri párového príkazu je ekvivalentný atribútu `content`:

```rea
{format color="#00f" begin}formátovaný text{end format}
{format color="#00f", content="formátovaný text"}
```

Obidve formy produkujú identické výsledky. Atribút `content` je nastavený parserom na vnútorný text každého párového bloku, dávajúc autorovi voľbu medzi inline alebo blokovým štýlom bez potreby špeciálnych pravidiel parsera.

### Skrátená tlač

Výraz vo vnútri `{ }` sa vytlačí:

```rea
Ahoj, {player.name}! Máš {player.gold} zlata.
```

Toto je konceptuálne ekvivalentné vytlačeniu hodnoty výrazu.

### Atribúty

Atribúty príkazov sú páry kľúč=hodnota oddelené čiarkami:

```rea
{set player.name = "Aria"}
{set player.gold = 100}
{set player.inventory = ["meč", "štít", "eliksír"]}
```

---

## 11. Premenné

Premenné uchovávajú stav počas relácie čítania.

### Typy

| Typ     | Príklad                         |
| ------- | ------------------------------- |
| Číslo   | `{set score = 0}`               |
| Reťazec | `{set name = "Aria"}`           |
| Boolean | `{set alive = true}`            |
| Pole    | `{set items = ["meč", "štít"]}` |

### Menný priestor s prefixom domény

Premenné používajú prefixové domény pre organizáciu:

```rea
{set player.health = 100}
{set world.time = "noc"}
{set quest.status = "aktívna"}
```

### Operácie

```rea
{set player.gold = player.gold + 50}
{set player.health = player.health - 10}
{set player.level = player.level + 1}
```

---

## 12. Výrazy

Výrazy sa dajú tlačiť inline a podporujú aritmetiku, porovnanie, logiku a ternárne operátory:

```rea
Máš {player.gold} zlatých mincí.
Tvoja sila je {player.strength > 10 ? "veľká" : "slabá"}.
Celkom: {player.attack + player.bonus}
```

### Podporované operátory

| Operátor                    | Popis           |
| --------------------------- | --------------- |
| `+` `-` `*` `/` `%`         | Aritmetika      |
| `==` `!=` `<` `>` `<=` `>=` | Porovnanie      |
| `&&` `\|\|` `!`             | Logika          |
| `? :`                       | Ternárny        |
| `in`                        | Členstvo v poli |
| `()`                        | Zoskupenie      |

---

## 13. Riadenie toku

### Podmienky

```rea
{if player.health > 0}
  Stále žiješ! Bojuj ďalej.
{else if player.lives > 0}
  Stratil si život, ale máš ďalšie šance.
{else}
  Koniec hry.
{end if}
```

### Cyklus For

```rea
{for item in player.inventory}
  - {item}
{end for}
```

S indexom:

```rea
{for item, i in player.inventory}
  {i + 1}. {item}
{end for}
```

### Cyklus While

```rea
{while player.energy > 0}
  Bojuješ s nepriaťeľom! Energia: {player.energy}
  {set player.energy = player.energy - 10}
{end while}
```

Bezpečnostný limit: 1000 iterácií.

### Switch/Case

```rea
{switch player.class}
  {case "bojovník"}
    Máš vysokú silu a odolnosť.
  {case "mág"}
    Ovládaš mocné kúzla.
  {default}
    Si bežný dobrodruh.
{end switch}
```

---

## 14. Funkcie

### Definovanie

```rea
{function heal(amount = 10)}
  {set player.health = player.health + amount}
  Bol si vyliečený o {amount} bodov.
  {return player.health}
{end function}
```

### Volanie

```rea
{heal(25)}
Aktuálne zdravie: {heal()}
```

---

## 15. Udalosti

Udalosti umožňujú reaktívne správanie príbehu:

```rea
{on player.health <= 0}
  Tvoje videnie sa zatmie...
  -> game_over
{end on}
```

Udalosti sa kontrolujú po každej zmene premennej a spúšťajú sa raz za splnenie podmienky, pokiaľ nie sú explicitne resetované.

---
