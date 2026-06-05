# Špecifikácia jazyka Rea — Časť 4: Utility (Sekcie 22–27)

> [Späť na hlavnú špecifikáciu](/sk/)
>
> **Stav implementácie:** Pozrite [REA-CHEATSHEET.md](REA-CHEATSHEET.md) pre podrobný stav jednotlivých funkcií.

---

## 22. Storylety a balíčky

Storylety sú krátke, samostatné naratívne segmenty, ktoré sa dajú aktivovať na základe podmienok:

```rea
{storylet priority=5}
  {require player.location == "trh"}
  {require player.gold > 10}

  Obchodník vás zastaví: „Mám dnes špeciálnu ponuku!"
{end storylet}
```

### Balíčky (Decks)

Balíčky organizujú storylety do skupín s definovaným správaním výberu:

```rea
{deck "nahodne_stretnutia" mode="shuffle"}
  {storylet} ... {end storylet}
  {storylet} ... {end storylet}
{end deck}
```

Režimy: `shuffle` (náhodný poriadok), `sequence` (postupne), `weighted` (podľa priority).

---

## 23. Stavové automaty

Stavové automaty definujú komplexné správanie s explicitnými prechodmi:

```rea
{state_machine "dvere"}
  {state "zamknute"}
    Dvere sú zamknuté.
    {transition to="odomknute" when="player.key == true"}
  {end state}

  {state "odomknute"}
    Dvere sú odomknuté.
    {transition to="otvorene" when="true"}
  {end state}

  {state "otvorene"}
    Dvere sú otvorené. Môžeš prejsť.
  {end state}
{end state_machine}
```

---

## 24. Premenný text (Varying text)

Mechanizmy pre text, ktorý sa mení pri opakovaných návštevách:

### Sekvenčný text

```rea
{first|druhý|tretí|posledný}
```

### Cyklický text

```rea
{cycle "ráno"|"poludnie"|"večer"|"noc"}
```

### Náhodný text

```rea
{shuffle "jemný vánok"|"silný vietor"|"búrka"}
```

### Jednorazový obsah

```rea
{once}
  Toto vidíte iba pri prvej návšteve.
{then}
  Toto vidíte pri každej ďalšej návšteve.
{end once}
```

---

## 25. Lokalizácia a pluralizácia

Vstavané funkcie pre viacjazyčný a gramaticky správny text:

### Pluralizácia

```rea
Máš {plural(player.gold, one="1 mincu", few="{player.gold} mince", other="{player.gold} mincí")}.
```

### Výber podľa pohlavia

```rea
{select(player.gender, male="Hrdina", female="Hrdinka", other="Hrdina/ka")} sa vydal{select(player.gender, male="", female="a", other="(a)")} na cestu.
```

### Radové číslovky

```rea
Je to tvoja {ordinal(player.visit)} návšteva.
```

---

## 26. Externý prístup k API

Všetky externé URL sa deklarujú v manifeste a odkazujú sa aliasmi:

```rea
{fetch alias="pocasie" into=world.weather}
Vonku je {world.weather.description}.
```

Povolené URL sú definované v `reast.json`:

```json
{
  "allowed_urls": {
    "pocasie": "https://api.weather.example/current"
  }
}
```

---

## 27. Ochrana obsahu

Príkazy pre správu prístupu k obsahu:

```rea
{lock type="premium"}
  Tento obsah je dostupný iba pre predplatiteľov.
{end lock}

{lock type="purchase" price=2.99}
  Bonusová kapitola za jednorazový nákup.
{end lock}
```

---
