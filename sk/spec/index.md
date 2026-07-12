# Jazyk Rea

Rea je jazyk s čistým textom pre interaktívne príbehy. Jeho určujúca vlastnosť je, že **obyčajný text je už platný Rea dokument** — bežný odsek prózy je úplný, vykresliteľný príbeh. Formátovanie, voľby, premenné, logika, multimédiá, kooperatívne čítanie a interakcia s reálnym svetom sú voliteľné nadstavby vrstvené na próze. Nič nie je povinné; po syntaxi siahnete, len keď ju potrebujete.

Rea existuje pre vetviace sa rozprávanie, ktoré človek napíše v textovom editore a verzuje v gite, a ktoré stroj dokáže overiť, vykresliť a izolovať v sandboxe. Ten istý súbor je čitateľný pre človeka aj spustiteľný enginom — neexistuje samostatná skompilovaná podoba.

Nasledujúce tri fázy sú všetky platné Rea. Prvý riadok je už úplný príbeh; druhý pridáva jednu premennú, tretí jednu voľbu:

```rea
Cesta sa vetvila pri starom dube.

{set player.torch = true}

* [Vydaj sa ľavou cestou]
* [Vydaj sa pravou cestou]
```

## Súborové typy

- **`.rea`** — súbor príbehu: próza plus ľubovoľná voliteľná Rea syntax.
- **`.rext`** — Rea *rozšírenie*: iba deklarácie (funkcie, konštanty `{set}` na najvyššej úrovni, `{use}` a komentáre — žiadna próza). Pozri [Kde sa pravidlá líšia v `.rext` súboroch](rext-differences).
- **`.reast`** — distribuovateľný ZIP balík: jeden alebo viac súborov `.rea`, voliteľné rozšírenia `.rext` a médiá, plus `manifest.json`. Pozri referenciu enginu [formát balíčka `.reast`](/engine/package-format).

## Čím Rea nie je

Rea nie je programovací jazyk na všeobecné použitie, nie je HTML a nie je herný engine. Jej funkcie sú izolované v sandboxe a zámerne obmedzené, jej vykresľovanie riadi platforma a nemá žiadny prienik surového značkovania.

## Poradie čítania

Špecifikácia je rozdelená na päť častí, ktoré sa pri prvom čítaní odporúča prejsť v poradí:

1. **[Základy](01-basics)** — štruktúra dokumentu, formátovanie textu, nadpisy, odkazy, médiá, kotvy a voľby.
2. **[Logika a dáta](02-logic-data)** — príkazy, premenné, výrazy a riadenie toku.
3. **[Naratív a interakcia](03-narrative-interaction)** — dialóg, karty, hlas, vstup, kooperatívne čítanie a interakcie s reálnym svetom.
4. **[Utility](04-utilities)** — množné číslo, lokalizácia, ochrana obsahu, titulky a spracovanie chýb.
5. **[Referencia](05-reference)** — identifikátory, vstavané funkcie, rozšíriteľnosť, prístupnosť a úrovne zhody.

Hľadáte skôr rýchly prehľad syntaxe než celú špecifikáciu? Pozrite [Ťahák](REA-CHEATSHEET).
