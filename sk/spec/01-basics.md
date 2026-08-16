# Základy: Dokumenty, text a voľby

> [Úvod](/sk/spec/) · [Index funkcií](features) · [Ťahák](REA-CHEATSHEET)
>
> Takmer všetko na tejto stránke je **stable** — prozaické jadro Rea, zmrazené s vydaním 1.0. Každá funkcia nesie vlastnú značku stavu; význam jednotlivých úrovní nájdete v [indexe funkcií](features).

---

## 1. Štruktúra dokumentu {#_1-document-structure}

Príbehy Rea existujú v hierarchii:

```txt
Séria → Reast → Časť → Kapitola → Sekcia → Scéna → Odsek
```

Príbeh sa distribuuje ako balík `.reast` — ZIP archív obsahujúci súbory `.rea` príbehu, voliteľné médiá a (v zabalenej štruktúre) `manifest.json` (pozri [Formát súboru a balenie](05-reference.md#_28-file-format-packaging)). Samostatný súbor `.rea` počas písania stačí, ale publikovaný príbeh je vždy balík `.reast`.

Séria zoskupuje viaceré reasty pod spoločný názov (napr. „Priatelia"). V rámci série voliteľné pole metadát **season** zoskupuje reasty do logických blokov (číslovaných alebo pomenovaných). Samostatný príbeh nepotrebuje ani jedno — je jednoducho reast.

Minimálny obsahový súbor `.rea` je len text:

<Feature id="plain-text" />

```rea
Raz dávno, v ďalekej krajine, sa mladý cestovateľ vydal na cestu.

Cesta sa pred ním tiahla donekonečna.
```

Žiadne hlavičky, žiadna zvláštna syntax — obyčajná próza je platný obsah. Na publikovanie autor zabalí tento súbor `.rea` do archívu `.reast` s minimálnym `manifest.json`. Autorské nástroje to robia automaticky.

### Metadáta {#metadata}

<Feature id="rea-file" />

Súbor `.rea` je **čistý text** — neobsahuje žiadne metadáta. Všetky metadáta (názov, autor, žáner, senzory, oprávnenia atď.) sú uložené v súbore `manifest.json` balíka `.reast` (pozri [Sekciu 28](05-reference.md#_28-file-format-packaging)).

Toto oddelenie udržiava súbory `.rea` čisté a prenosné: súbor `.rea` je vždy len obsah príbehu, čitateľný v ľubovoľnom textovom editore. Manifest v `manifest.json` deklaruje všetko, čo platforma potrebuje vedieť pred spustením príbehu: informácie o príbehu, oprávnenia a požiadavky.

---

## 2. Text a odseky {#_2-text-paragraphs}

<Feature id="paragraphs" />

**Odseky** sú oddelené jedným alebo viacerými prázdnymi riadkami:

```rea
Les bol tmavý a tichý.

Niekde v diaľke zavyl vlk.
```

**Jednoduché zalomenie riadku** je tvrdé zalomenie (text pokračuje na novom riadku v tom istom odseku):

```rea
Nápis hovoril:
V tieni čakám,
Vo svetle bledniem.
```

**Zalomenie riadku potlačíte** znakom `\` na konci riadku (spojí sa s nasledujúcim riadkom):

```rea
Toto je veľmi dlhá veta, ktorú chcem \
napísať cez dva riadky v zdrojovom texte.
```

Vykreslí sa ako jeden súvislý riadok.

---

## 3. Formátovanie textu {#_3-text-formatting}

<Feature id="inline-formatting" />

| Syntax     | Vykreslí sa ako     | Príklad              |
| ---------- | ------------------- | -------------------- |
| `_text_`   | _Kurzíva_           | `_zašepkal potichu_` |
| `*text*`   | **Tučné**           | `*dvere buchli*`     |
| `_*text*_` | **_Tučná kurzíva_** | `_*nemožné!*_`       |

Existujú len dve inline značky: `_` (kurzíva) a `*` (tučné). Tučná kurzíva sa dosahuje ich kombináciou — `_*text*_` alebo `*_text_*`. Obidve poradia sú platné; preferovaný tvar je `_*text*_`.

Formátovacie značky musia priliehať k textu (žiadne medzery medzi značkou a textom).

Formátovanie sa dá **vnárať**:

```rea
_Zakázaná *kapitola* *starodávneho* zväzku_
```

### Rozšírené formátovanie {#extended-formatting}

<Feature id="extended-formatting" />

Podčiarknutie, prečiarknutie a neproporcionálne písmo sú dostupné ako príkazy (v naratívnej fikcii sú potrebné zriedka):

```rea
{underline begin}podpis{end underline}
{strike begin}starý plán{end strike}
{mono begin}kód:X7F2{end mono}
```

### Bohaté formátovanie {#rich-formatting}

<Feature id="format-command" />

`{format}` je všeobecný formátovací blok — farba, veľkosť a hrúbka v jednom príkaze, pre tú zriedkavú chvíľu, keď scéna potrebuje vizuálny efekt, aký tri značky vyššie nedokážu:

```rea
{format color="#00f" begin}chladné modré svetlo{end format}
{format color="#00f", content="chladné modré svetlo"}
```

Obidva tvary sú totožné: parser nastaví `content` na vnútorný text každého párového bloku, takže autor si voľne vyberá inline alebo blokový štýl (pozri [Príkazy](02-logic-data.md#_10-commands)).

Farba je jediný zatiaľ ustálený atribút. Rea nemá CSS a nikdy mať nebude — `{format}` existuje preto, aby zostal dostupný *sémantický* dôraz, ktorý téma môže rešpektovať, nie preto, aby si príbeh diktoval vlastný vzhľad. Téma platformy môže ľubovoľný `{format}` vykresliť inak alebo ignorovať atribút, ktorý sa rozhodne nepodporovať.

### Bloky kódu a čistého textu {#code-plaintext-blocks}

<Feature id="code-blocks" />

**Bloky kódu/čistého textu** používajú jediný spätný apostrof na samostatnom riadku:

```rea
`
Tento text sa vykreslí presne tak, ako je napísaný.
Žiadne formátovanie sa tu neuplatňuje.
`
```

Inline kód používa spätné apostrofy v rámci riadku: `` `nazov_premennej` ``.

**Kód je doslovný, vrátane `{ }`.** V spätných apostrofoch sa nič nedosadzuje, takže premenná napísaná tam sa k čitateľovi dostane presne ako text. `{mono}` sa správa rovnako. Ak potrebujete v prehľade vypísať hodnotu, postavte riadok mimo kódu — citát vyzerá ako panel a dosadzovanie v ňom funguje:

```rea
{comment ZLE — čitateľ uvidí zátvorky}
`PALIVO ..... {story.lod.palivo} %`

{comment DOBRE}
| PALIVO — {story.lod.palivo} %
```

**Vnáranie:** Ak samotný surový text obsahuje riadok s osamoteným spätným apostrofom, ohraničte blok dvojicou spätných apostrofov. Trojica umožňuje dvojicu vnútri, a tak ďalej:

```rea
``
Tento blok môže obsahovať osamotený ` na vlastnom riadku.
``
```

---

## 4. Nadpisy {#_4-headings}

<Feature id="headings" />

Nadpisy používajú jeden alebo viac znakov `#`. Slúžia ako štrukturálne značky pre **kapitoly**, **sekcie** a **scény**.

```rea
# Začiatok

## Lesná cesta

### Čistinka

#### Zvláštny strom

##### Nápis
```

Platforma vykreslí každú úroveň odlišným vizuálnym štýlom. Za hĺbkou, ktorú platforma podporuje, sa ďalšie úrovne vykresľujú rovnako ako najhlbšia podporovaná úroveň.

### Kotvy nadpisov {#heading-anchors}

<Feature id="heading-anchors" />

**Kotvy nadpisov** sa automaticky generujú z textu nadpisu:

1. Prevod na malé písmená
2. Odstránenie diakritiky
3. Nahradenie nealfanumerických znakov znakom `_`
4. Zlúčenie po sebe idúcich `_` do jedného
5. Orezanie úvodných a koncových `_`

Príklad: `## Okraj lesa!` → kotva: `okraj_lesa`

---

## 5. Zarovnanie a odsadenie {#_5-alignment-indentation}

<Feature id="alignment" />

Riadky sa dajú zarovnať tým, že sa začnú zvláštnym znakom:

| Prefix       | Zarovnanie                                             |
| ------------ | ------------------------------------------------------ |
| `=`          | Na stred                                               |
| `>`          | Doprava                                                |
| `<`          | Doľava (vynútené — užitočné v pravostranných textoch)  |
| (predvolené) | Doľava                                                 |

```rea
= Koniec

> — Neznámy autor

< vynútene doľava v kontexte sprava doľava
```

**Odsadenie** používa opakované zarovnávacie znaky. Každý ďalší znak pridáva jednu úroveň odsadenia z príslušnej strany:

```rea
= na stred
== na stred s 1 odsadením z oboch strán
=== na stred s 2 odsadeniami z oboch strán

> zarovnané doprava
>> zarovnané doprava s 1 odsadením sprava
>>> zarovnané doprava s 2 odsadeniami sprava

< zarovnané doľava (vynútene)
<< zarovnané doľava s 1 odsadením zľava
<<< zarovnané doľava s 2 odsadeniami zľava
```

Medzera za zarovnávacím prefixom je povinná. Platforma vykreslí každú úroveň odlišne až po hĺbku, ktorú podporuje; za ňou sa ďalšie úrovne vykresľujú rovnako ako najhlbšia.

---

## 6. Citácie a vodorovné čiary {#_6-blockquotes-horizontal-rules}

### Citácie {#blockquotes}

<Feature id="blockquotes" />

Citácie používajú `|` na začiatku riadku. Viaceré znaky `|` citácie vnárajú:

```rea
| Starý muž hovoril pomaly:
|| Zapamätaj si: každá cesta niekam vedie.
|| Aj tie, čo sa zdajú nikam neviesť.
| Jeho slová zotrvali v tichu.
```

Platforma vykreslí každú úroveň vnorenia odlišným vizuálnym štýlom až po hĺbku, ktorú podporuje.

### Vodorovné čiary {#horizontal-rules}

<Feature id="horizontal-rules" />

Vodorovné čiary sú riadky zložené výhradne z pomlčiek. Rôzne počty dávajú rôzne vizuálne váhy:

```rea
-
--
---
----
-----
```

**Princíp konzistentnosti:** Tak ako `#` je najvyšší (najväčší) nadpis v štruktúre dokumentu, `-` je najvyšší (najťažší) oddeľovač. Viac pomlčiek = ľahšia, jemnejšia čiara:

| Čiara   | Vizuálna váha          | Typické použitie             |
| ------- | ---------------------- | ---------------------------- |
| `-`     | **Ťažká** (najhrubšia) | Veľký zlom časti alebo aktu  |
| `--`    | Stredne ťažká          | Zlom kapitoly                |
| `---`   | Stredná                | Zlom sekcie                  |
| `----`  | Ľahká                  | Prechod medzi scénami        |
| `-----` | **Jemná** (najtenšia)  | Zlom myšlienky / mäkká pauza |

Vizuálny vzhľad každej úrovne plne riadi téma platformy. Autori volia sémantickú váhu; téma určuje vizuálny štýl (plná, bodkovaná, ornamentálna, prechodová atď.).

> **Poznámka k parseru:** Vodorovné čiary sú riadky zložené len z pomlčiek. `-` nasledované textom v kontexte volieb je bod zberu (pozri [Voľby a vetvenie](03-narrative-interaction.md#_16-choices-branching)), nie vodorovná čiara.

---

## 7. Odkazy {#_7-links}

<Feature id="links" />

Odkazy používajú jednotnú syntax hranatých zátvoriek so šípkou `>` smerujúcou k cieľu:

```rea
[čítať ďalej > #cistinka]
[vydali sa do kráľovstva skál > story/0004-kingdom.rea]
```

**Štruktúra:** `[zobrazovaný text > cieľ]`

Odkaz, ktorého cieľom je súbor inej časti, je [odkaz medzi časťami](03-narrative-interaction.md#multi-part-stories) a cieľom je cesta časti relatívna k archívu. Viacdielne príbehy používajú zabalenú štruktúru, kde časti žijú v `story/` a sú uvedené v manifeste; plochý archív rozlišuje len svoj jediný vstupný súbor, takže niet čo prepájať.

**Interné odkazy** na kotvy používajú `#`:

```rea
[vrátiť sa > #zaciatok]
```

**Odkazy medzi príbehmi:**

<Feature id="story-links" />

```rea
[pokračovať v dobrodružstve > reast://autor-slug/pribeh-slug]
```

Odkaz `reast://` otvorí iný reast na platforme, ktorá ho hostí, adresovaný slugom autora a slugom príbehu.

> **Poznámka:** Externé URL (http/https) nie sú v texte `.rea` povolené. Všetok externý prístup sa deklaruje cez `allowed_urls` v `manifest.json` a odkazuje sa naň aliasom (pozri [Prístup k externým API](error-handling.md#external-api-access)).

### Vlastné kotvy {#custom-anchors}

<Feature id="custom-anchors" />

Vlastnú kotvu umiestnite kamkoľvek, aby na ňu odkaz mohol skočiť:

```rea
[#nazov_kotvy]
```

Skočte na ňu odkiaľkoľvek v príbehu:

```rea
[vrátiť sa do bezpečia > #nazov_kotvy]
```

Vlastné kotvy stoja popri automaticky generovaných [kotvách nadpisov](#_4-headings): nadpis definuje svoju kotvu implicitne, kým `[#nazov_kotvy]` označuje ľubovoľné iné miesto.

---

## 8. Médiá {#_8-media}

<Feature id="media-embeds" />

Príkazy médií používajú syntax hranatých zátvoriek s prefixmi podľa typu. Šípka `<` naznačuje, že zdroj prúdi **do** zobrazovacieho prvku:

| Typ     | Syntax                 | Príklad                               |
| ------- | ---------------------- | ------------------------------------- |
| Obrázok | `[!alt text < zdroj]`  | `[!Tmavý les < media/forest.jpg]`     |
| Video   | `[>titulok < zdroj]`   | `[>Brána sa otvára < media/gate.mp4]` |
| Zvuk    | `[?titulok < zdroj]`   | `[?Vtáčí spev < media/birds.ogg]`     |

**Pamäťová pomôcka:**

- `!` = obrázok — výkričník pripomína štetec, ktorým sa maľujú obrázky.
- `>` = video — znak „väčšie než" pripomína tlačidlo prehrávania.
- `?` = zvuk — otáznik pripomína ucho, ktorým sa počúva.

### Atribúty médií {#media-attributes}

<Feature id="media-attributes" />

Parametre vnútri `[ ]` a `{ }` sa oddeľujú čiarkami (s voliteľnými medzerami okolo). Cesta k zdroju je prvým parametrom vloženého média, takže čiarka ju oddeľuje aj od prvého atribútu:

```rea
[!Hrad < media/castle.jpg, width=800, height=600]
[>Úvodná scéna < media/intro.mp4, autoplay, loop, muted]
[?Hudba na pozadí < media/theme.ogg, volume=0.5, loop]
```

Toto pravidlo čiarky platí pre všetky parametre v zátvorkách `[…]` aj `{…}` v celej Rea — cesta k zdroju je jednoducho prvý parameter.

---

## 9. Pomoc a poznámky pod čiarou {#_9-help-footnotes}

Poznámky pod čiarou aj nápovedy vešajú doplňujúcu informáciu na úsek textu pomocou hranatej zátvorky odkazu. Šípka `>` smeruje od zobrazeného textu k anotácii; prvý znak za `>` rozhoduje o tom, o ktorý druh ide — `^` pre poznámku pod čiarou, `*` pre nápovedu. (Vlastné kotvy, ktoré takisto žijú v `[ … ]`, sú popísané v časti [Odkazy](#_7-links).)

### Poznámky pod čiarou {#footnotes}

<Feature id="footnotes" />

Poznámka pod čiarou pripája inline poznámku k úseku textu — poznámka cestuje spolu s textom, niet samostatného bloku definícií:

```rea
[Starodávny dialekt > ^Podoba starej elfčiny, ktorou sa hovorilo len na severe.] bol takmer zabudnutý.
```

Čitateľ vidí text `Starodávny dialekt` označený znakom `^`. Nabehnutím kurzorom (na počítači) alebo klepnutím (na dotykovom zariadení) sa poznámka zobrazí ako bublina. Text poznámky je prostý — bez vnoreného formátovania — a môže obsahovať `>` (text od poznámky oddeľuje len prvý `>`); nesmie obsahovať `]`.

### Nápovedy {#hints}

<Feature id="hints" />

Nápoveda je poznámka pod čiarou, ktorá sa objaví, až keď si čitateľ nápovedy zapne. Môže niesť niekoľko postupných úrovní, takže čitateľ si volí, koľko pomoci odhalí. Úrovne sa číslujú sériou hviezdičiek — jedna `*` je úroveň 1, `**` je úroveň 2, až po deväť — a text každej úrovne trvá po ďalšiu sériu hviezdičiek alebo po zatváraciu `]`:

```rea
Tento kľúč treba [použiť v klenotnici > *Postrčenie na prvej úrovni.**Priamejšia nápoveda na druhej úrovni.].
```

Nápoveda môže začať rovno na vyššej úrovni, keď dáva zmysel len silná nápoveda:

```rea
Tento kľúč treba [použiť v hornej veži > ***Nápoveda tretej úrovne, ktorá prezradí veľa.].
```

Čitateľ si nápovedy zapne a vyberie **povolenú úroveň** (1–9; predvolene vypnuté). Značka nápovedy sa vedľa textu objaví len vtedy, keď nápoveda definuje úroveň na povolenej úrovni alebo pod ňou; kliknutím sa odhalia jej úrovne až po povolenú úroveň. Vždy, keď stránka obsahuje akúkoľvek nápovedu — aj takú nad povolenou úrovňou čitateľa — čitateľ sa dozvie, že na stránke sú nápovedy dostupné, bez toho, aby sa mu ukázalo kde. Text nápovedy sa riadi rovnakými pravidlami čistého textu ako poznámky pod čiarou; keďže séria hviezdičiek vždy otvára novú úroveň, text nápovedy nemôže sám obsahovať holú `*`.

---
