# Špecifikácia jazyka Rea — Časť 1: Základy (Sekcie 1–9)

> [Späť na hlavnú špecifikáciu](/sk/)
>
> **Stav implementácie:** Sekcie 1–9 sú implementované v klientskom parseri. Extrakcia metadát, formátovanie textu, nadpisy, blokové citáty, horizontálne čiary, odkazy, médiá, kotvy, rozšírené formátovacie príkazy (podčiarknutie, prečiarknutie, neproporcionálne písmo), poznámky pod čiarou (pomenované a automaticky číslované), vnorené inline formátovanie a podpora premenných fungujú podľa špecifikácie. Pozrite [REA-CHEATSHEET.md](REA-CHEATSHEET.md) pre podrobný stav.

---

## 1. Štruktúra dokumentu

Rea príbehy existujú v hierarchii:

```txt
Séria → Reast → Časť → Kapitola → Sekcia → Scéna → Odsek
```

Každý príbeh sa distribuuje ako balík `.reast` — ZIP archív obsahujúci jeden alebo viac `.rea` súborov s obsahom, manifest (`reast.json`) a voliteľné assety (pozri [Formát súboru a balenie](05-reference.md#28-file-format--packaging)). Samostatný `.rea` súbor je možné použiť počas písania, ale platforma vždy pracuje s `.reast` balíkmi.

Séria zoskupuje viaceré reasty pod spoločný názov (napr. „Priatelia"). V rámci série voliteľné pole metadát **season** zoskupuje reasty do logických blokov (číslovaných alebo pomenovaných). Samostatný príbeh nepotrebuje ani jedno — je jednoducho reast.

Minimálny `.rea` súbor s obsahom je len text:

```rea
Raz dávno, v ďalekej krajine, mladý cestovateľ sa vydal na cestu.

Cesta sa pred ním tiahla donekonečna.
```

Žiadne hlavičky, žiadna špeciálna syntax — obyčajná próza je platný obsah. Na publikovanie autor zabalí tento `.rea` súbor do archívu `.reast` s minimálnym manifestom `reast.json`. Autorské nástroje to robia automaticky.

### Metadáta

Súbor `.rea` je **čistý text** — neobsahuje žiadne metadáta. Všetky metadáta (názov, autor, žáner, senzory, oprávnenia atď.) sú uložené v manifeste `reast.json` balíka `.reast` (pozri [Sekcia 28](05-reference.md#28-file-format--packaging)).

Toto oddelenie udržiava `.rea` súbory čisté a prenosné: `.rea` súbor je vždy len obsah príbehu, čitateľný akýmkoľvek textovým editorom. Manifest v `reast.json` deklaruje všetko, čo platforma potrebuje vedieť pred spustením príbehu: info o príbehu, oprávnenia a požiadavky.

---

## 2. Text a odseky

**Odseky** sú oddelené jedným alebo viacerými prázdnymi riadkami:

```rea
Les bol tmavý a tichý.

Niekde v diaľke zavyl vlk.
```

**Jednoduchý zlom riadku** je tvrdý zlom (text pokračuje na novom riadku v tom istom odseku):

```rea
Nápis hovoril:
V tieni čakám,
Vo svetle bledniem.
```

**Potlačenie zlomu riadku** pomocou `\` na konci riadku (spojenie s nasledujúcim):

```rea
Toto je veľmi dlhá veta, ktorú chcem \
napísať cez dva riadky v zdrojovom kóde.
```

Toto sa vykreslí ako jeden súvislý riadok.

---

## 3. Formátovanie textu

| Syntax     | Vykreslí sa ako     | Príklad              |
| ---------- | ------------------- | -------------------- |
| `_text_`   | _Kurzíva_           | `_zašepkal potichu_` |
| `*text*`   | **Tučné**           | `*dvere buchli*`     |
| `_*text*_` | **_Tučná kurzíva_** | `_*nemožné!*_`       |

Existujú iba dva inline značky: `_` (kurzíva) a `*` (tučné). Tučná kurzíva sa dosahuje ich kombináciou — `_*text*_` alebo `*_text_*`. Obidva poradia sú platné; preferovaná forma je `_*text*_`.

Formátovacie značky musia byť priľahlé k textu (žiadne medzery medzi značkou a textom).

Formátovanie sa dá **vnoriť**:

```rea
_Starodávna *zakázaná* kapitola *zväzku*_
```

### Rozšírené formátovanie

Podčiarknutie, prečiarknutie a monospace sú dostupné ako príkazy (zriedka potrebné v naratívnej fikcii):

```rea
{underline begin}podpis{end underline}
{strike begin}starý plán{end strike}
{mono begin}kód:X7F2{end mono}
```

**Bloky kódu/plaintextu** používajú osamotený backtick na vlastnom riadku:

```rea
`
Tento text sa vykreslí presne ako je napísaný.
Žiadne formátovanie sa tu neuplatňuje.
`
```

Inline kód používa backticky v riadku: `` `nazov_premennej` ``.

**Vnorenie:** Ak samotný raw text obsahuje osamotený backtick riadok, použite dvojité backticky na ohraničenie bloku. Trojité backticky umožňujú dvojité backticky vnútri, atď:

```rea
``
Tento blok môže obsahovať osamotený ` na vlastnom riadku.
``
```

---

## 4. Nadpisy

Nadpisy používajú jeden alebo viac znakov `#`. Slúžia ako štrukturálne značky pre **kapitoly**, **sekcie** a **scény**.

```rea
# Začiatok

## Lesná cesta

### Čistinka

#### Zvláštny strom

##### Nápis
```

Platforma vykreslí každú úroveň s odlišným vizuálnym štýlom. Za podporovanou hĺbkou platformy sa ďalšie úrovne vykresľujú identicky ako najhlbšia podporovaná úroveň.

**Kotvy nadpisov** sa automaticky generujú z textu nadpisu:

1. Prevod na malé písmená
2. Odstránenie diakritiky (prízvuky)
3. Nahradenie nealfanumerických znakov znakom `_`
4. Zlúčenie po sebe idúcich `_` do jedného
5. Orezanie úvodných/koncových `_`

Príklad: `## Okraj lesa!` → kotva: `okraj_lesa`

---

## 5. Zarovnanie a odsadenie

Riadky sa dajú zarovnať začatím špeciálnym znakom:

| Prefix    | Zarovnanie                                            |
| --------- | ----------------------------------------------------- |
| `=`       | Na stred                                              |
| `>`       | Doprava                                               |
| `<`       | Doľava (vynútené — užitočné v pravostranných textoch) |
| (default) | Doľava                                                |

```rea
= Koniec

> — Neznámy autor

< vynútené doľava v pravo-doľava kontexte
```

**Odsadenie** používa opakované zarovnávacie znaky. Každý ďalší znak pridáva jednu úroveň odsadenia z príslušnej strany:

```rea
= centrované
== centrované s 1 odsadením z oboch strán
=== centrované s 2 odsadeniami z oboch strán

> zarovnané doprava
>> zarovnané doprava s 1 odsadením sprava
>>> zarovnané doprava s 2 odsadeniami sprava

< zarovnané doľava (vynútené)
<< zarovnané doľava s 1 odsadením zľava
<<< zarovnané doľava s 2 odsadeniami zľava
```

Medzera po zarovnávacom prefixe je povinná. Platforma vykreslí každú úroveň odlišne až po svoju podporovanú hĺbku; za ňou sa ďalšie úrovne vykresľujú identicky ako najhlbšia.

---

## 6. Blokové citáty a horizontálne čiary

### Blokové citáty

Blokové citáty používajú `|` na začiatku riadku. Viaceré `|` znaky vnárajú citáty:

```rea
| Starý muž hovoril pomaly:
|| Zapamätaj si: každá cesta niekam vedie.
|| Aj tie, čo sa zdajú nikam neviesť.
| Jeho slová zotrvali v tichu.
```

Platforma vykreslí každú úroveň vnorenia s odlišným vizuálnym štýlom až po svoju podporovanú hĺbku.

### Horizontálne čiary

Horizontálne čiary sú riadky pozostávajúce výhradne z pomlčiek. Rôzne počty produkujú rôzne vizuálne váhy:

```rea
-
--
---
----
-----
```

**Princíp konzistentnosti:** Tak ako `#` je najvyššia (najväčšia) hlavička pre štruktúru dokumentu, `-` je najvyššia (najťažšia) oddeľovacia čiara. Viac pomlčiek = ľahšia/jemnejšia čiara:

| Čiara   | Vizuálna váha          | Typické použitie             |
| ------- | ---------------------- | ---------------------------- |
| `-`     | **Ťažká** (najhrubšia) | Veľký zlom časti/aktu        |
| `--`    | Stredne ťažká          | Zlom kapitoly                |
| `---`   | Stredná                | Zlom sekcie                  |
| `----`  | Ľahká                  | Prechodová scéna             |
| `-----` | **Jemná** (najtenšia)  | Zlom myšlienky / mäkká pauza |

Vizuálny vzhľad každej úrovne je plne riadený témou platformy. Autori vyberajú sémantickú váhu; téma určuje vizuálny štýl (plná, bodkovaná, ornamentálna, gradientová atď.).

---

## 7. Odkazy

Odkazy používajú jednotnú zátvorkovú syntax so šípkou `>` smerujúcou k cieľu:

```rea
[čítať ďalej > #čistinka]
[ďalšia kapitola > chapter2.rea]
```

**Štruktúra:** `[zobrazovaný text > cieľ]`

**Interné odkazy** na kotvy používajú `#`:

```rea
[vrátiť sa > #zaciatok]
```

**Odkazy medzi príbehmi:**

```rea
[pokračovať v dobrodružstve > reast://ABC123]
```

> **Poznámka:** Externé URL (http/https) nie sú povolené v `.rea` texte. Všetok externý prístup sa deklaruje cez `allowed_urls` v manifeste `reast.json` a odkazuje sa aliasmi (pozri [Externý prístup k API](04-utilities.md#external-api-access)).

---

## 8. Médiá

Mediálne príkazy používajú zátvorkovú syntax s typovo špecifickými prefixmi. Šípka `<` indikuje, že zdroj prúdi **do** zobrazovacieho elementu:

| Typ     | Syntax                | Príklad                               |
| ------- | --------------------- | ------------------------------------- |
| Obrázok | `[!alt text < zdroj]` | `[!Tmavý les < media/forest.jpg]`     |
| Video   | `[>titulok < zdroj]`  | `[>Brána sa otvára < media/gate.mp4]` |
| Audio   | `[?titulok < zdroj]`  | `[?Vtáčí spev < media/birds.ogg]`     |

**Pamäťová pomôcka:**

- `!` = obrázok (symbol pre štetec; ako pozornosť/vizuálny dopad)
- `>` = video (symbol pre tlačidlo play)
- `?` = audio (symbol pre ucho; počúvaj/otáznik — „počuješ?")

### Atribúty médií

Atribúty nasledujú za zdrojom, oddelené čiarkami:

```rea
[!Hrad < media/castle.jpg width=800, height=600]
[>Intro cinematik < media/intro.mp4 autoplay, loop, muted]
[?Hudba pozadia < media/theme.ogg volume=0.5, loop]
```

### Inline mediálne referencie

Pre médiá zabalené v `.reast` balíku použite číselné referencie:

```rea
[!Tajná mapa < :1]
[>Rituál < :2]
```

Číslo sa mapuje na záznam v [manifeste balíka](05-reference.md#28-file-format--packaging).

---

## 9. Kotvy a poznámky pod čiarou

### Vlastné kotvy

Umiestnite vlastnú kotvu kdekoľvek pomocou:

```rea
[#nazov_kotvy]
```

Prejdite na ňu cez odkaz:

```rea
[vrátiť sa do bezpečia > #nazov_kotvy]
```

### Poznámky pod čiarou

Poznámky pod čiarou používajú `[^identifikátor]` pre referenciu a zodpovedajúci obsah neskôr:

```rea
Starodávny dialekt[^dialekt] bol takmer zabudnutý.

[^dialekt]: Forma starej elfčiny hovorená iba v severných územiach.
```

Automaticky číslované poznámky používajú `[^]` (priraďované sekvenčne):

```rea
Rituál[^] vyžadoval tri zložky[^].

[^]: Podrobne opísané v Časti II.
[^]: Oheň, voda a ochotné srdce.
```

---
