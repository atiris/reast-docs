# Jazyk Rea — Ťahák

> Čistý text je platný obsah. Jednoducho píšte.

## Stav implementácie

Funkcie označené indikátormi stavu odrážajú aktuálny stav proof-of-concept parsera.

| Stav | Význam                                                        |
| ---- | ------------------------------------------------------------- |
| ✅   | Plne implementované a otestované v parseri/platforme          |
| 🔶   | Čiastočne implementované (základná podpora, niektoré chýbajú) |
| 📋   | Špecifikované, ale zatiaľ neimplementované (plánované)        |

## Formátovanie

| Syntax       | Výsledok      | Príklad              |
| ------------ | ------------- | -------------------- |
| `_text_`     | Kurzíva       | `_zašepkal potichu_` |
| `*text*`     | Tučné         | `*dvere buchli*`     |
| `_*text*_`   | Tučná kurzíva | `_*nemožné!*_`       |
| `` `text` `` | Inline kód    | `` `premenná` ``     |

## Nadpisy

```rea
# Kapitola (úroveň 1)
## Sekcia (úroveň 2)
### Scéna (úroveň 3)
#### Podscéna (úroveň 4)
##### Detail (úroveň 5)
```

## Zarovnanie

```rea
= Centrovaný text
> Text zarovnaný doprava
< Vynútene doľava
```

## Horizontálne čiary

| Syntax  | Váha               |
| ------- | ------------------ |
| `-`     | Ťažká (najhrubšia) |
| `--`    | Stredne ťažká      |
| `---`   | Stredná            |
| `----`  | Ľahká              |
| `-----` | Jemná (najtenšia)  |

## Odkazy a médiá

```rea
[text odkazu > #kotva]
[text odkazu > subor.rea]
[!alt text < media/obr.jpg]
[>titulok < media/video.mp4]
[?titulok < media/audio.ogg]
```

## Premenné

```rea
{set player.name = "Aria"}
{set player.gold = 100}
{set player.items = ["meč", "štít"]}
Ahoj, {player.name}!
```

## Riadenie toku

```rea
{if podmienka}
  ...
{else if ina_podmienka}
  ...
{else}
  ...
{end if}

{for item in pole}
  {item}
{end for}

{while podmienka}
  ...
{end while}

{switch vyraz}
  {case "hodnota"} ...
  {default} ...
{end switch}
```

## Voľby

```rea
* [Jednorazová voľba]
  Obsah po výbere.

+ [Lepivá voľba (opakovateľná)]
  Obsah po výbere.

- Zhromažďovací bod (vetvy sa zbiehajú)

-> odklon_na_kotvu
->-> tunel (vráti sa späť)
```

## Podmienené voľby

```rea
* {if player.key} [Odomknúť dvere]
  Dvere sa otvárajú.
```

## Funkcie

```rea
{function heal(amount = 10)}
  {set player.health = player.health + amount}
  {return player.health}
{end function}

{heal(25)}
```

## Dialóg

```rea
@Aria: Vitaj, cestovateľ!
@Obchodník: Máš záujem o moje tovary?
```

## Premenný text

```rea
{first|druhý|tretí}
{cycle "ráno"|"večer"}
{once}Prvá návšteva.{then}Ďalšia návšteva.{end once}
```

## Lokalizácia

```rea
{plural(n, one="1 minca", few="{n} mince", other="{n} mincí")}
{select(gender, male="hrdina", female="hrdinka")}
```
