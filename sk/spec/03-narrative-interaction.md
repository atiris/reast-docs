# Naratív a interakcia: Dialóg, tok a vstup

> [Úvod](/sk/spec/) · [Späť na hlavnú špecifikáciu](/sk/)
>
> **Stav implementácie:** Voľby a vetvenie (16) vrátane vnorených, podmienených, lepivých a záložných volieb sú plne implementované. Dialógová atribúcia (cez `@hovoriaci:`) funguje. Obsah prvej návštevy (`{once}`/`{then}`/`{end once}`) je implementovaný. Naratívne utility v Sekcii 16 (`{cycle}`/`{replace}`), Karty (17), Hlas a Audio (18), Vstup a Interakcia (19), Kooperatívne čítanie (20) a Interakcie s reálnym svetom (21) sú špecifikované, ale zatiaľ neimplementované. Pozrite [REA-CHEATSHEET.md](REA-CHEATSHEET.md) pre podrobný stav.

---

## 16. Voľby a vetvenie

Voľby sú srdcom interaktívnych príbehov. Rea podporuje jednoduché aj komplexné vetvenie.

### Jednoduché voľby

Použite `*` pre jednorazové voľby a `+` pre opakovateľné (lepivé) voľby:

```rea
Cesta sa pred tebou rozdeľuje.

* [Vydať sa ľavou cestou]
  Ľavá cesta vedie hlbšie do lesa.
  -> tmavy_les

* [Vydať sa pravou cestou]
  Pravá cesta sleduje rieku.
  -> breh_rieky

+ [Rozhliadnuť sa]
  Starostlivo si prezeráš okolie.
  -> krizovatka
```

**Pravidlá textu voľby:**

```text
* PRED [POPIS] PO
  ╰─┬──╯  ╰─┬─╯ ╰─┬─╯
    │       │      └── zobrazené iba po výbere (narácia)
    │       └── zobrazené ako klikateľný text voľby
    └── zobrazené v OBOCH voľbe AJ narácii
```

### Vnorené voľby

```rea
* [Otvorte dvere]
  Vstúpite do miestnosti. Je tmavá.
  ** [Zapáliť fakľu]
     Miestnosť sa osvieti. Vidíte poklad!
  ** [Pokračovať v tme]
     Narazíte do niečoho...
```

### Podmienené voľby

```rea
* {if player.key} [Odomknúť dvere]
  Kľúč pasuje. Dvere sa otvárajú.
* [Kopnúť do dverí]
  To nepomohlo.
```

### Záložné voľby

Keď nie sú dostupné žiadne voľby (všetky podmienky zlyhali):

```rea
* {if false} [Nemožná voľba]
  Toto sa nikdy neobjaví.
- Automaticky pokračuješ po jedinom dostupnom smere.
```

### Zhromažďovacie body (Gathers)

Znak `-` na začiatku riadku slúži ako bod, kde sa vetvy opäť zbiehajú:

```rea
* [Doľava]
  Ideš doľava.
* [Doprava]
  Ideš doprava.
- Obidve cesty ťa nakoniec dovedú k mostu.
```

### Odklony (Diverts)

Použite `->` na presmerovanie toku príbehu:

```rea
-> nazov_kotvy
```

### Tunely

Tunely (`->->`) fungujú ako volania podprogramov — vrátia sa tam, odkiaľ boli zavolané:

```rea
->-> popis_miestnosti
```

### Príbehy z viacerých častí

Dlhší príbeh možno rozdeliť na **časti príbehu** — samostatné `.rea` súbory uvedené v
manifeste ako `parts`. Čitateľ prechádza časťami: živý je vždy len **aktuálna
časť**, posun nahor odhalí **predtým navštívené časti** — skutočnú prejdenú cestu,
nikdy nevybranú vetvu. Medzi časťami sa dá presunúť dvoma spôsobmi.

**Brána `[[ cieľ ]]`** — automatický prechod bez textu. Zaberá vlastný riadok a je
koncová: keď k nej tok dôjde, nič po nej v aktuálnej časti sa nevykreslí a brána
označuje pokračovanie. Posun za koniec aktuálnej časti odhalí cieľovú časť ako
plynulé pokračovanie. Obsah za bránou je nedosiahnuteľný — editor naň upozorní.

```rea
Vojdeš pod oblúk; niet cesty späť.

[[ story/0005-forest.rea ]]
```

Brána môže cieliť na scénu v časti cez `[[ cast.rea:scena ]]` (pokračuje pri
kotve `[#scena]`). Brány vnútri `{if}` vyjadrujú vetvenie riadené premennými bez
manuálnej voľby.

**Odkaz medzi časťami** — bežný navigačný odkaz, ktorého cieľom je súbor časti,
umožní čitateľovi presunúť sa ťuknutím:

```rea
[vojdi do hradu > story/0006-castle.rea] sa týči pred tebou.
```

Premenné prechádzajú medzi časťami: príkazy `{set}` na najvyššej úrovni každej
časti sa vykonajú raz pri jej vstupe. Uložený stav zaznamenáva usporiadanú cestu
navštívených častí, aktuálnu časť aj pozíciu v nej, takže pokračovanie prehrá
navštívené časti pre posun späť a plynule nadviaže tam, kde čitateľ skončil.

---

## 17. Karty

Karty sú štruktúrované dátové bloky pre postavy, predmety a akcie:

```rea
{card character "Aria"}
  health: 100
  strength: 15
  class: "bojovníčka"
{end card}
```

---

## 18. Hlas a audio

Príkazy pre hlasovú naráciu a zvukové efekty:

```rea
{voice narrator begin}
  Temný les skrýval mnoho tajomstiev.
{end voice}

{sound "kroky.ogg" volume=0.8}
{music "tema.ogg" loop}
```

---

## 19. Vstup a interakcia

Príkazy pre zber vstupu od čitateľa:

```rea
{input type="text" target=player.name}
  Ako sa voláš, cestovateľ?
{end input}

{input type="number" target=player.age min=1 max=150}
  Koľko máš rokov?
{end input}
```

---

## 20. Kooperatívne čítanie

Podpora pre viacerých čitateľov zažívajúcich príbeh spoločne:

```rea
{broadcast}
  Všetci vidia túto správu.
{end broadcast}

{whisper target="rola_1"}
  Iba hráč s rolou 1 vidí toto.
{end whisper}

{vote timeout=30}
  * [Ísť do jaskyne]
  * [Obísť horu]
{end vote}

{wait for="all_ready"}
```

---

## 21. Interakcie s reálnym svetom

Príkazy pre GPS, NFC a ďalšie hardvérové interakcie:

```rea
{waypoint lat=48.1486 lon=17.1077 radius=50}
  Dosiahli ste Bratislavský hrad!
{end waypoint}

{nfc tag="quest_item_1"}
  Naskenovali ste tajomný artefakt.
{end nfc}
```

---
