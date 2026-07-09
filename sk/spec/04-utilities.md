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

> **Požiadavka:** hostiteľ dodáva locale a politiku formátovania. Kategórie
> množného čísla a radových čísloviek, zoskupovanie čísel aj štýly dátumu a času
> sa riešia z CLDR cez `Intl` pre locale dodané hostiteľom — engine nemá
> zabudovanú tabuľku pre konkrétny jazyk.

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

`ordinal(n)` bez pomenovaných argumentov pripája anglické prípony iba pre `en*`
locale; ostatné locale dostanú číslo naformátované podľa locale bez prípony, lebo
`Intl` radové číslovky nevypisuje. Autori, ktorí chcú prípony v inom jazyku,
odovzdajú šablóny pre jednotlivé kategórie, kde `{}` nahradí naformátované číslo:

```rea
{ordinal(position, one="{}.", other="{}.")}
```

### Formátovanie čísel a dátumov

`formatNumber(value, locale?, …)` formátuje čísla podľa locale
(`Intl.NumberFormat`) a štandardne používa locale enginu; voliteľný druhý pozičný
argument ho prepíše konkrétnym BCP 47 tagom:

```rea
Skóre: {formatNumber(player.score)}
Lokalizované: {formatNumber(1234567, "sk")}
```

Dátumy a časy: `formatDate(value, style?)`, `formatTime` a `formatDateTime` so
`style ∈ iso | short | medium | long | full` (predvolene `medium`). Starý tokenový
formát `YYYY-MM-DD` zanikol — celý povrch tvorí enum `style`.

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

### Kód rozšírenia sa nikdy nešifruje

Ochrana obsahu pokrýva **iba prózu**. Loader odmietne zašifrovaný `.rext`.
Šifrovanie je ochrana obsahu, nie bezpečnostná hranica — sandbox obmedzuje
rozšírenie rovnako tak či tak —, takže zákaz nič nestojí a získava tri veci: kód
sa overí **pred** spustením prózy (odomykací kód môže prísť uprostred príbehu);
kód je **auditovateľný bez kľúča** (`reast validate`, editor, moderácia); a cudzí
embedder bez kľúča dokáže logiku príbehu spustiť. Úplné pravidlo pozri v
[Rozšíriteľnosti](05-reference.md#31-extensibility).

Aby tajomstvo zostalo mimo rozšírenia a predsa sa dalo overiť, ponechajte funkciu
všeobecnú a v čistom texte a tajomstvo nastavte cez `{set}` v **zašifrovanej
`.rea` kapitole**; funkcia potom overuje *proti* tej premennej, neobsahuje ju:

```rea
{// extensions/gate.rext — čistý text, všeobecné, neobsahuje tajomstvo}
{function unlocked(given, expected) begin}
  {return given = expected}
{end function}
```

```rea
{// zašifrovaná .rea kapitola nesie tajomstvo}
{set crypt.passphrase = "mesačný-paroh"}
```

Upozornenie, povedané naplno: zašifrovaná `.rea` **nie je** tajomstvom pred
odhodlaným čitateľom — kľúč sa musí dostať na jeho zariadenie, aby sa kapitola
vykreslila, takže premenná je extrahovateľná. Chráni pred spoilermi a náhodným
nazretím, nie pred motivovaným útočníkom. Čokoľvek, čo musí byť skutočne
nefalšovateľné (súťažná odpoveď, platené odomknutie), sa overuje na serveri — a
to je úloha platformy, nie enginu.

---
