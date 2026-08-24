# Naratív a interakcia: Dialóg, tok a vstup

> [Úvod](/sk/spec/) · [Index funkcií](features) · [Ťahák](REA-CHEATSHEET)
>
> Táto stránka má najširší rozptyl zrelosti v celej špecifikácii. Voľby, storylety, karty a voľný textový vstup sú **experimental** — vydané a dnes použiteľné. Kooperatívne čítanie a väčšina senzorových funkcií sú **development** alebo **draft**: úplne špecifikované, aby ste okolo nich mohli navrhovať, ale zatiaľ sa proti nim príbeh písať nedá. Skôr než sa na čokoľvek tu spoľahnete, pozrite si značku pod nadpisom.

---

## 16. Voľby a vetvenie {#_16-choices-branching}

Voľby sú srdcom interaktívnych príbehov. Rea podporuje jednoduché aj zložité vetvenie.

### Jednoduché voľby {#simple-choices}

<Feature id="choices" />

Použite `*` pre jednorazové voľby a `+` pre opakovateľné (trvalé) voľby:

```rea
Cesta sa pred tebou rozdvojuje.

* [Vyber ľavú cestu]
  Ľavá cesta vedie hlbšie do lesa.
  -> dark_forest

* [Vyber pravú cestu]
  Pravá cesta sleduje rieku.
  -> river_bank

+ [Rozhliadni sa]
  Pozorne si prezrieš okolie.
  -> the_crossroads
```

::: warning `{if}` vo vetve ukončí celú skupinu Blokový príkaz odsadený pod voľbou zavrie skupinu volieb, takže každá ďalšia možnosť zmizne a čitateľovi zostanú len tie nad ňou. Nastavte vo vetve príznak a podmienený text dajte až za gather:

```rea
{comment ZLE — „Vydať sa doprava" sa nikdy nezobrazí}
* [Vydať sa doľava]
  {if story.hrdina.lampas begin}
  Lampáš ti ukáže korene.
  {end if}

* [Vydať sa doprava]
  Rieka je tu hlasnejšia.

{comment DOBRE}
* [Vydať sa doľava]
  {set story.hrdina.smer = "vlavo"}

* [Vydať sa doprava]
  {set story.hrdina.smer = "vpravo"}

- {if story.hrdina.smer = "vlavo" and story.hrdina.lampas begin}
Lampáš ti ukázal korene.
{end if}
```

`{set}`, `{give}`, `{take}`, `{earn}`, `{spend}` aj `{play}` sú vo vetve v poriadku — skupinu zatvárajú blokové príkazy. :::

**Pravidlá textu voľby:**

```text
* PRED [NÁVESTIE] PO
  ╰─┬─╯  ╰───┬───╯ ╰┬╯
    │        │      └── zobrazí sa až po výbere (rozprávanie)
    │        └── zobrazí sa ako klikateľný text voľby
    └── zobrazí sa AJ vo voľbe, AJ v rozprávaní
```

- Text v `[ ]` sa zobrazí ako návestie voľby
- Text za `[ ]` je rozprávanie zobrazené po výbere voľby
- Text pred `[ ]` sa objaví vo voľbe aj v rozprávaní

```rea
* „Musím si to premyslieť[."]," povedal si.
  Kupec trpezlivo čakal.
```

Po výbere sa zobrazí: `„Musím si to premyslieť," povedal si. Kupec trpezlivo čakal.`  
Ako voľba sa zobrazí: `„Musím si to premyslieť."`

### Podmienené voľby {#conditional-choices}

<Feature id="conditional-choices" />

Voľby môžu mať podmienky:

```rea
* {has_key} [Odomkni dvere]
  Kľúč sadne dokonale. Dvere sa rozletia.

* {gold >= 50} [Podplať strážcu]
  Strážca si vrecká tvoje zlato a ustúpi nabok.

* [Odíď]
  Otočíš sa a potichu odídeš.
```

### Skryté voľby {#hidden-choices}

<Feature id="hidden-choices" />

Voľba označená ako `hidden` nevykreslí žiadne tlačidlo. Zostáva vo výbere skupiny — podmienky, jednorazové spotrebovanie aj rozprávanie fungujú ako obvykle — ale spustiť sa dá len niečím iným než klepnutím: tým, že ju čitateľ opíše vo [voľnom textovom vstupe](#free-text-action-input), alebo vstupom z reálneho sveta, ktorý sedí na [aktivačné polia](#real-world-activation) jej karty (naskenovaný kód, odfotená značka, vyslovená fráza):

```rea
* hidden [&look_under_sofa] Jozef sa zohol a pozrel pod starú pohovku, kde našiel záhadnú obálku s nápisom _Tajné!_
  {give secret_envelope}
```

Kľúčové slovo `hidden` stojí na riadku voľby ako prvé; podmienka môže nasledovať za ním:

```rea
* hidden {story.player.curious} [&look_under_sofa] …
```

Skryté voľby sa zvyčajne viažu na kartu akcie cez `[&card_id]` — pole `description=` karty je to, s čím sa porovnáva voľný text, a jej polia `scan=`, `mark=` a `listen=` sú to, na čo sedia vstupy z reálneho sveta. Keďže sa návestie objaví až po spustení voľby, na skrytý obsah naznačte v okolitej próze; návestie a rozprávanie sú odmena, nie pozvánka. Skupiny zložené prevažne zo skrytých volieb popisujú [Menu objavovania](#exploration-menus).

### Odbočky {#diverts}

<Feature id="diverts" />

Pomocou `->` skočíte na pomenovanú sekciu (kotvu):

```rea
-> the_clearing

[#the_clearing]
Prichádzaš na malú čistinku zaliatu mesačným svetlom.
```

### Vnorené voľby {#nested-choices}

<Feature id="nested-choices" />

Voľby sa dajú vnárať pribúdajúcimi `*` alebo `+`:

```rea
* [Prihovor sa cudzincovi]
  „Kto si?" opýtaš sa.
  * * [Zatlač viac]
    „Povedz mi svoje pravé meno!"
  * * [Nechaj to tak]
    „To nič. Zabudni, že som sa pýtal."
  - - Cudzinec sa nepokojne pomrví.
* [Ignoruj cudzinca]
  Prejdeš okolo bez slova.
- Noc pokračovala v tichu.
```

`- -` slúži ako **bod zberu** — miesto, kde sa vnorené vetvy opäť zbiehajú (inšpirované systémom weave v jazyku Ink).

### Body zberu {#gather-points}

Zbery používajú `-` na príslušnej úrovni vnorenia a zhromažďujú všetky vetvy späť dokopy:

```rea
Čo urobíš?

* [Bojuj]
  Vytasíš zbraň!
* [Uteč]
  Otočíš sa a bežíš!
* [Vyjednávaj]
  „Nemôžeme sa o tom porozprávať?"

- Nech si zvolil čokoľvek, výsledok bol rovnaký: problémy si ťa našli.
```

### Záložné voľby {#fallback-choices}

<Feature id="fallback-choices" />

Voľba bez textu funguje ako záložná (vyberie sa automaticky, keď neostanú žiadne iné možnosti):

```rea
* [Opýtaj sa na počasie]
  „Pekný deň, však?"
* [Opýtaj sa na novinky]
  „Počul si niečo zaujímavé?"
* ->
  Rozhovor vyšumel. -> leave_tavern
```

::: warning Rozparsuje sa, ale zatiaľ sa nevyberá sama Záložná voľba sa rozpozná ako možnosť a nevykreslí žiadne tlačidlo, ale runtime ju zatiaľ nevyberie, keď ostatné dôjdu — `flow/fallback-choice-taken` nemá emitor. Skupina, ktorá sa na ňu spolieha, jednoducho skončí bez čohokoľvek, na čo sa dá kliknúť. Dovtedy nechajte čitateľovi viditeľnú cestu ďalej. :::

### Tunely (odboč a vráť sa) {#tunnels-divert-and-return}

<Feature id="tunnels" />

Tunel odbočí do sekcie a po jej skončení sa automaticky vráti volajúcemu. Do tunela vstúpite pomocou `->->`:

```rea
Blížiš sa k zamknutým dverám.
->-> examine_lock
Po prehliadke zvažuješ možnosti.

* [Vylom zámok]
  ->-> pick_lock_sequence
  Dvere sú otvorené!
* [Nájdi inú cestu]
  -> alternative_path
```

Tunelovaná sekcia sa vracia pomocou `->->` na svojom konci (alebo jednoducho tým, že dosiahne posledný riadok):

```rea
[#examine_lock]
Zámok je starý a hrdzavý. Železný, s jednoduchým mechanizmom.
->->

[#pick_lock_sequence]
Vytiahneš náradie a pustíš sa do práce.
{if dexterity > 5 begin}
  Kolíčky hladko zapadnú na miesto.
{else}
  Trvá to niekoľko pokusov, ale nakoniec…
{end if}
->->
```

Tunely sa hodia na znovupoužiteľné pasáže (napr. opakované obhliadky, spoločné dialógové sekvencie) bez ručného smerovania späť.

Tunel a storylet riešia odlišné problémy a siahnite po každom zámerne: tunel je znovupoužiteľný blok obsahu viazaný na aktuálnu kapitolu — autor explicitne píše miesto volania (`->->`) a tunel sa vždy vráti presne na to miesto. [Storylet](/sk/spec/storylets) vyberá jadro, autor ho nevolá: ťahá sa z celopríbehového zásobníka cez `{deck}` alebo ho zobudí vstup z reálneho sveta cez `trigger=`, na základe `require`/`priority`/`cooldown`, nie pevného miesta volania v texte.

### Obsah pri prvej návšteve {#first-visit-content}

<Feature id="once-then" />

Zobrazte obsah len pri prvej návšteve pasáže, s voliteľnou náhradou pre ďalšie návštevy:

```rea
[#the_tavern]
{once begin}
  V krčme je teplo a rušno. V rohu hrá bard.
  Nič také si ešte nevidel.
{then}
  Známa krčma. Bard pri tvojom príchode prikývne.
{end once}

Krčmár ti kýva, aby si prišiel.
```

Blok `{once begin}` vykreslí svoj hlavný obsah pri prvom stretnutí a náhradu `{then}` pri všetkých ďalších návštevách. Ak `{then}` chýba, po prvej návšteve sa nezobrazí nič.

### Nahrádzanie textu (živé návestia) {#text-replacement-live-labels}

<Feature id="labels-replace" />

Návestia označujú text, ktorý sa dá počas príbehu nahradiť priamo na mieste:

```rea
Dvere sú {label door_state begin}zamknuté{end label}.

{comment Neskôr, po odomknutí}
{replace door_state = "otvorené"}
```

V kombinácii s voľbami pre interaktívne odhalenie:

```rea
Na stene vidíš {label clue begin}záhadný symbol{end label}.

* [Prezri si symbol]
  {replace clue = "runu ochrany"}
  Samozrejme — je to runa ochrany!
```

### Cyklický text (klepnutím ďalej) {#cycling-text-tap-to-cycle}

<Feature id="cycling-text" />

Text v riadku, ktorým môže čitateľ klepaním prechádzať medzi možnosťami; hodí sa na prispôsobenie postavy alebo objaviteľské rozprávanie:

```rea
Vybral si si {cycle color begin}červený|modrý|zelený|čierny{end cycle} plášť.
```

Čitateľ klepe na zvýraznené slovo a cyklí: `červený` → `modrý` → `zelený` → `čierny` → `červený` → …

Vybraná hodnota je dostupná ako premenná: `{color}` vráti aktuálny výber.

### Meniaci sa text {#varying-text}

<Feature id="varying-text" />

Text sa môže meniť podľa počtu návštev pomocou `|` vnútri `{ }`:

```rea
{Vstúpiš do krčmy.|Vraciaš sa do krčmy.|Zase krčma. Začína to byť zvyk.}
```

Režimy:

| Prefix  | Správanie                                            |
| ------- | ---------------------------------------------------- |
| (žiadny) | **Sekvencia** — prehráva po poradí, zastane na poslednom |
| `&`     | **Cyklus** — opakuje sa donekonečna                  |
| `!`     | **Raz** — každý prehrá raz, potom nič                |
| `~`     | **Premiešanie** — náhodné poradie                    |

```rea
Bol {&pondelok|utorok|streda|štvrtok|piatok|sobota|nedeľa}.

Zasmial sa. {!Úprimný smiech.|Zdvorilé zachichotanie.|Tentoraz sa nezasmial.}

Minca padla na {~hlavu|znak}.
```

### Vzor rozbočovač a lúče {#hub-and-spoke-pattern}

Centrálna kotva rozbočovača, do ktorej sa čitatelia vracajú po preskúmaní vetiev. V spojení s `{once begin}` každá vetva pridá rozbočovaču nový kontext:

```rea
[#town_square]
Stojíš na námestí.

{once name=visit_market begin}
  * [Navštív trh]
    Preskúmaš rušné trhové stánky.
    {set story.flag.visited_market = true}
    -> town_square
{end once}

{once name=visit_temple begin}
  * [Vstúp do chrámu]
    V chráme je ticho a chlad.
    {set story.flag.temple_blessing = true}
    -> town_square
{end once}

{if story.flag.visited_market and story.flag.temple_blessing begin}
  * [Vyraz k hradu]
    So zásobami aj požehnaním si pripravený.
    -> castle_gates
{end if}
```

### Paralelné dejové línie {#parallel-storylines}

<Feature id="parallel-storylines" />

Viaceré dejové línie, ktoré napredujú nezávisle a v kľúčových chvíľach sa zbiehajú:

```rea
{parallel begin}
  {thread elena_thread begin}
    [#elena_journey]
    Elena putuje na západ cez les.
    {set story.elena.location = "forest"}
    {wait gareth_thread.reached("bridge") begin}{end wait}
    Stretnú sa pri moste.
  {end thread}

  {thread gareth_thread begin}
    [#gareth_journey]
    Gareth sa vydá horskou cestou.
    {set story.gareth.location = "mountain"}
    [#bridge]
    Dorazí k starému kamennému mostu.
  {end thread}
{end parallel}
```

V kooperatívnom čítaní môžu rôzni čitatelia sledovať rôzne vlákna súčasne a zažívať príbeh z pohľadu rôznych postáv.

### Karty a balíčky (naratív riadený kvalitami) {#storylets-quality-based-narrative}

<Feature id="storylets" />

Karta je líce plus telo a balíček je ich pomenovaná zásoba. Výber beží na `when`, `priority`, `repeatable`, `cooldown`, `weight` a `tags`; `{draw}` alebo `{play}` rozdá ruku a kartu bez balíčka môže zobudiť vstup z reálneho sveta cez `trigger=` ako vedľajšiu cestu, ktorá sa vráti presne tam, kde čitateľ prestal. Karty majú vlastnú stránku: pozri [Karty a balíčky](/sk/spec/storylets).

### Menu objavovania {#exploration-menus}

<Feature id="exploration-menus" />

Skupina volieb môže byť aj **skrytým menu objavovania** — množinou [skrytých volieb](#hidden-choices), ktoré sa zobudia, až keď čitateľ vytvorí zodpovedajúci vstup z reálneho sveta: naskenuje QR kód, odfotí ručne kreslenú značku, vysloví frázu alebo napíše opis:

```rea
{menu select=2 begin}
* hidden [&qr_door] Služobné dvere cvaknú a otvoria sa…
* hidden [&painted_tree] Namaľovaný strom sa zaligoce…
* hidden [&couch_secret] Pod gaučom nájdeš obálku…
* [Vzdaj to a pokračuj]
{end menu}
```

Obalenie skupiny volieb do `{menu select=N begin} … {end menu}` mení, na koľko objavov skupina počká, kým príbeh pôjde ďalej:

| Hodnota `select=` | Správanie                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| _(vynechané)_     | Bežná skupina s jedným výberom — bez zmeny oproti dnešku                                           |
| `N`               | Predkladá skupinu znovu po každej aktivácii, kým sa nevyberie `N` možností alebo kým žiadna nezostane použiteľná |
| `all`             | Zostáva otvorené, kým je použiteľná aspoň jedna možnosť                                            |

Každá aktivácia prehrá rozprávanie a účinky danej možnosti presne ako klepnutá voľba — `{set}`, `{give}`, odbočky, všetko ide tou istou cestou. Jednorazová možnosť (`*`) po výbere z výberu odchádza; opakovateľná (`+`) zostáva dostupná. Viditeľná možnosť môže menu ukončiť skôr odbočením inam, alebo sa jednoducho počíta do `N` ako každý iný výber.

Aktivačné kanály — `scan=`, `mark=`, `listen=` — sa deklarujú na odkazovanej karte (pozri [Aktiváciu v reálnom svete](#real-world-activation) v kapitole Karty), nie na samotnom riadku voľby. Ten istý odkaz `[&card_id]` aj príznak `hidden` fungujú, či sa karta zobudí klepnutím, naskenovaním, značkou alebo hlasom.

#### Krok späť a uloženia vnútri menu {#undo-and-saves-inside-a-menu}

Každý objav je samostatne zaznamenaná voľba, takže krok späť sa vracia po jednom objave — krok späť vnútri menu so `select=2` vráti tesne pred poslednú aktiváciu a skorší objav zostane na mieste. Uloženia vytvorené uprostred menu pokračujú s tou istou množinou zostávajúcich použiteľných možností.

#### Priorita pri spúšťačoch storyletov {#priority-with-storylet-triggers}

Jedno naskenovanie, vyslovená fráza či fotka nakreslenej značky môže znamenať len jednu vec. Ak má čitateľ vo chvíli, keď taký vstup vytvorí, otvorené čakajúce menu objavovania, kontroluje sa najprv menu; len ak v menu nič nesedí, vstup prepadne ďalej a zobudí storylet (pozri [Interakcie s reálnym svetom](#_21-real-world-interactions)).

Pozri [Storylety a balíčky](/sk/spec/storylets) pre výber storyletov, spúšťače a prioritu/váhu.

### Krok späť a spätná navigácia {#undo-back-navigation}

<Feature id="undo" />

Platforma poskytuje vstavanú spätnú navigáciu, ktorá čitateľom umožňuje vrátiť sa k predchádzajúcim pasážam. Autori toto správanie môžu riadiť:

```rea
{undo enabled=false}
```

Predvolene je krok späť **zapnutý** pre sólo čítanie a **vypnutý** pre kooperatívne čítanie (zdieľaný stav sa nedá vrátiť). Autori ho môžu výslovne vypnúť pre hádankové sekcie, kde by krok späť poprel celý zmysel:

```rea
{lock condition="has_key" begin}
  {undo enabled=false}
  Dvere za tebou zapadnú. Niet cesty späť.
  {comment Čitateľ sa nemôže vrátiť za tento bod, kým sa sekcia so zámkom neskončí}
{end lock}
```

Krok späť funguje na **úrovni volieb** — každá voľba čitateľa vytvára bod obnovenia. Krok späť vráti všetky zmeny premenných od poslednej voľby.

#### Krok späť pri kooperatívnom čítaní {#undo-in-cooperative-reading}

Krok späť je v kooperatívnom režime **predvolene vypnutý**, pretože zdieľaný stav sa nedá vrátiť jednostranne. Ak autor krok späť v kooperatívnom čítaní výslovne zapne (`{undo enabled=true}`):

- Krok späť ovplyvňuje **len miestny stav jednotlivého čitateľa** — jeho premenné, pozíciu a inventár.
- **Zdieľané premenné** (`shared.*`) sa krokom späť **nikdy** nevracajú. Keď je zdieľaná premenná raz nastavená, zostáva nastavená pre všetkých.
- Ak sa čitateľ vráti za blok `{exclusive}`, ktorý si nárokoval, výhradný zámok sa **neuvoľní** — závisí od neho stav ostatných čitateľov.
- Ak sa čitateľ vráti za `{vote}`, ktorého sa zúčastnil, jeho hlas sa **nestiahne** — výsledok hlasovania platí.
- Zásobník krokov späť je obmedzený na **aktuálnu kapitolu**. Čitatelia sa nemôžu vrátiť cez hranicu kapitoly.

### Kontrolné body {#checkpoints}

Automatické ukladanie prebieha pri každej voľbe a autor môže výslovné body obnovenia označiť príkazom `{checkpoint}`. Keďže kontrolný bod je vecou stavu, nie rozprávania, je celý špecifikovaný — vrátane toho, čo presne snímka zachytáva a ako uloženia prežijú aktualizáciu príbehu — v časti [Uloženie a kontrolné body](02-logic-data.md#save-checkpoints).

### Viacdielne príbehy {#multi-part-stories}

<Feature id="multi-part-stories" />

Dlhší príbeh sa dá rozdeliť na **časti príbehu** — samostatné súbory `.rea` uvedené v manifeste balíka ako `parts` (schému manifestu nájdete v časti 5). Čitateľ prechádza postupnosťou častí: živým dokumentom je len **aktuálna časť** a posúvanie nahor odhaľuje **už navštívené časti** — skutočne prejdenú cestu, nikdy nezvolenú vetvu. Medzi časťami sa dá presúvať dvoma spôsobmi.

<Feature id="part-gates" />

**Brána `[[ cieľ ]]`** — automatický prechod bez textu. Zaberá vlastný riadok a je koncová: keď k nej tok dorazí, nič za ňou sa v aktuálnej časti nevykreslí a brána označuje, kde príbeh pokračuje. Posunutím za koniec aktuálnej časti sa odhalí ohraničená časť priamo v texte, ako plynulé pokračovanie.

```rea
Prejdeš cez oblúk; niet cesty späť.

[[ story/0005-forest.rea ]]
```

Keďže brána časť ukončuje, obsah umiestnený za ňou je nedosiahnuteľný — editor to označí ako varovanie. Brána môže mieriť na scénu v rámci časti pomocou `[[ part.rea:scene ]]` a pokračovať pri kotve `[#scene]`. Brány vnútri `{if}` vyjadrujú vetvenie riadené premennou bez ručnej voľby:

```rea
{if has_key begin}
[[ story/0006-castle.rea ]]
{end if}
{if not has_key begin}
[[ story/0006-bush.rea ]]
{end if}
```

<Feature id="cross-part-links" />

**Odkaz medzi časťami** — bežný navigačný odkaz, ktorého cieľom je súbor časti, dovolí čitateľovi posunúť sa ďalej klepnutím:

```rea
Pred tebou sa dvíha [vstúp do hradu > story/0006-castle.rea].
```

Premenné sa prenášajú medzi časťami: príkazy `{set}` najvyššej úrovne každej časti sa spustia raz pri jej vstupe, navrch stavu nahromadeného doteraz. Uložený postup zaznamenáva usporiadanú cestu navštívených častí plus aktuálnu časť a pozíciu v nej, takže pokračovanie prehrá navštívené časti pre históriu čítania a v aktuálnej časti nadviaže tam, kde čitateľ prestal (pozri časť 5, _Stav čítania_).

---

## 17. Karty: postavy, predmety a akcie {#_17-cards-characters-items-actions}

Karty sú interaktívne prvky príbehu, na ktoré môže čitateľ klepnúť a prezrieť si ich. Oživujú svet príbehu za hranicou obyčajného textu.

### Karty postáv `[@]` {#character-cards}

<Feature id="character-cards" />

```rea
[@elena]
Pri fontáne vidíš stáť [@elena].
```

Karty postáv sa definujú v metadátach alebo vo vyhradenom bloku:

```rea
{define character elena name="Elena Vossová", title="Potulná učenkyňa", image="media/elena.png", description="Vysoká žena so striebrom pretkanými vlasmi a od atramentu zafarbenými prstami."}
```

Keď čitateľ klepne na `[@elena]`, uvidí kartu postavy s portrétom, menom, titulom a popisom.

### Karty predmetov `[$]` {#item-cards}

<Feature id="item-cards" />

```rea
Na zemi nájdeš [$golden_key].

{define item golden_key name="Zlatý kľúč", image="media/golden_key.png", description="Zdobený kľúč, na dotyk teplý. Zdá sa, akoby ticho hučal.", rarity=rare}
```

Predmety sa dajú pridať do inventára čitateľa:

```rea
{give golden_key}
{take golden_key}
{if "golden_key" in story.reader.inventory begin}
  Kľúč ti vo vrecku hreje.
{end if}
```

Viac kusov sa zadáva cez `count=`. Holé číslo nie je počet — ignoruje sa a nedá sa nič:

```rea
{give sip count=12}   {comment 12 šípov}
{give sip}            {comment 1 šíp}
{give sip 12}         {comment ZLE — nedá vôbec nič}
```

### Mince a peňaženka {#coins-wallet}

<Feature id="coins" />

Príbehy, ktoré potrebujú peniaze, používajú vstavanú peňaženku mincí. Má tri úrovne — `gold`, `silver`, `bronze` — s pevným základným pomerom **1 gold = 10 silver = 100 bronze**. Interné názvy úrovní sa nikdy nemenia (aby súbory uložení zostali prenosné), ale autori môžu premenovať označenia zobrazené čitateľovi a upraviť prepočtové pomery:

```rea
{coins gold="Dukát" silver="Groš" bronze="Halier"}
{coins silver_per_gold=5 bronze_per_silver=4}

{earn gold 2}
{earn silver 5}
{spend bronze 3}

{if story.reader.coins.total >= 100 begin}
  Na začarovanú čepeľ máš.
{end if}
```

`{spend}` automaticky rozmieňa vyššie nominály, keď čitateľ nemá presnú úroveň, a odmietne (bez akejkoľvek zmeny), keď peňaženka na cenu nestačí. Zostatok sa zrkadlí do premenných dostupných čitateľovi a pretrváva medzi uloženiami:

| Premenná             | Obsah                                                 |
| -------------------- | ----------------------------------------------------- |
| `story.reader.coins`       | Normalizovaný zostatok `{gold, silver, bronze, total}` |
| `story.reader.coins.total` | Celková hodnota v bronzových základných jednotkách    |
| `story.reader.coinNames`   | Autorské označenia `{gold, silver, bronze}`           |

### Karty akcií `[&]` {#action-cards}

<Feature id="action-cards" />

Karty akcií predstavujú body vetvenia príbehu s vizuálnym dôrazom:

```rea
[&open_the_gate] Otvor starodávnu bránu
[&climb_the_wall] Radšej prelez múr
```

> **Poznámka:** Karty akcií používajú `&` (ampersand), aby sa odlíšili od vlastných kotiev, ktoré používajú `[#nazov]`.

Podobne ako karty postáv a predmetov môže aj akcia niesť blok `{define action}` s názvom a popisom:

```rea
{define action open_the_gate name="Starodávna brána", description="otvor hrdzavú bránu; násilím otvor starú bránu; pretlač sa cez vchod"}
```

`description=` sa zobrazí na karte a zároveň slúži ako sémantický cieľ pre [voľný textový vstup akcie](#free-text-action-input) — teda to, čo môže čitateľ napísať, aby akciu pomenoval.

#### Aktivácia v reálnom svete {#real-world-activation}

<Feature id="real-world-activation" />

Karta akcie sa môže zobudiť aj vstupom z reálneho sveta namiesto klepnutia — alebo popri ňom. Vedľa `description=` stoja tri voliteľné polia:

```rea
{define action qr_door name="Služobné dvere", scan="^REAST-DOOR-.*"}

{define action painted_tree name="Namaľovaný strom", mark="emb1:Zk3q…                      // podpis vypočítaný editorom z kresby"}

{define action couch_secret name="Pod gaučom", description="pozri sa pod starý gauč; nadvihni pohovku; prehľadaj priestor pod sedadlom", listen="pod gaučom"}
```

| Pole      | Porovnáva sa s                        | Porovnanie                                     |
| --------- | ------------------------------------- | ---------------------------------------------- |
| `scan=`   | Obsahom naskenovaného QR alebo kódu   | Regulárny výraz bez ohľadu na veľkosť písmen   |
| `listen=` | Prepisom reči                         | Regulárny výraz bez ohľadu na veľkosť písmen   |
| `mark=`   | Odfotenou ručne kreslenou značkou     | Presná zhoda podpisu                           |

Karta môže tieto polia ľubovoľne kombinovať — `couch_secret` vyššie odpovedá na napísaný opis aj na vyslovenú frázu.

> **`mark=` je nepriehľadné.** Jeho hodnota je podpis, ktorý nástroj editora „Nakresli značku" vypočíta z kresby alebo fotografie — nikdy ho nepíšte ani neupravujte ručne. Ak chcete značku vytvoriť alebo zmeniť, prekreslite ju v editore; pracovný postup nájdete v [Menu objavovania v reálnom svete](/sk/platform/design/real-world-exploration-menus).

Tieto polia vyniknú, keď je možnosť prehrávajúca kartu `hidden` — pozri [Menu objavovania](#exploration-menus) v kapitole Voľby a vetvenie. Viditeľná možnosť s aktivačnými poľami odpovedá na oboje: čitateľ môže klepnúť na jej tlačidlo alebo vytvoriť zodpovedajúci vstup z reálneho sveta.

### Sady a kategórie kariet {#card-sets-categories}

<Feature id="card-sets" />

`character`, `item` a `action` sú tri **vstavané sady kariet**. Autori môžu deklarovať ďalšie sady a zoskupiť tak karty, ktoré zdieľajú rovnaké pravidlá získania, straty a použitia — napríklad sadu `ability`, sadu `attribute` alebo tematickú sadu `relic`. Sada sa deklaruje blokom `{define cardset <id> begin}`:

```rea
{define cardset ability name="Karty schopností", description="Karty udeľujúce vlastnosti, ktoré si hrdina môže vybaviť.", acquire="Získavajú sa dokončením úloh.", lose="Strácajú sa, keď je postava porazená.", use="Zahraním sa uplatní uvedený bonus k vlastnosti."}
```

Sada môže niesť ľudsky čitateľné polia pravidiel `acquire`, `lose` a `use` plus ľubovoľné ďalšie vlastnosti `kľúč: hodnota`. `id` sady sa stáva **druhom** každej karty, ktorá do nej patrí.

Karta do sady vstúpi tým, že sa použije id sady tam, kde by inak stálo `character`, `item` alebo `action`:

```rea
{define ability spinach name=Špenát, strength=+2}
```

#### Obsluhy udalostí {#event-handlers}

To, čo karta *robí*, sa píše ako vrcholový blok `{on <udalosť> <predmet> begin} ... {end on}`. Predmet je jediný atribút — `card=`, `item=`, `deck=` alebo `set=` — takže pravidlo pre jednu kartu, pre celý balíček aj pre celú sadu sa píše rovnako a obsluha sa dá prečítať bez toho, aby čitateľ vedel, v ktorom bloku leží. Karta, balíček a sada rozumejú udalostiam `acquire`, `lose`, `use` a `missed`.

Obsluha na sade sa vykoná pri **každej** karte danej sady:

```rea
{define cardset ability name="Karty schopností"}

{on acquire set="ability" begin}
  {set story.ability_count = story.ability_count + 1}
{end on}

{on use set="ability" begin}
  {set story.last_ability_used = event.card_id}
{end on}
```

Karta pridáva svoje pravidlo vedľa pravidla svojej sady, nenahrádza ho:

```rea
{define ability ginko name=Ginko, intelligence=+2}

{on use card="ginko" begin}
  {set story.player.intelligence = story.player.intelligence + 2}
{end on}
```

Obsluha môže niesť klauzulu `when`, ktorá beží až po `begin}`, takže podmienka si ponechá vlastné čiarky a úvodzovky:

```rea
{on lose set="ability" when story.act >= 3 begin}
  Vedomosť sa nadobro stratí.
{end on}
```

> **Poradie rozlíšenia:** vykoná sa každá zodpovedajúca obsluha, od najmenej konkrétnej — najprv sada, potom balíček, nakoniec samotná karta. Prekrytie sa píše ako stráž `when`, nie ako predefinícia.

#### Zahranie karty {#playing-a-card}

<Feature id="play-card" />

`{play <card_id>}` spustí použitie karty. Vykoná každú obsluhu `{on use}`, ktorá karte zodpovedá — najprv obsluhu jej sady, potom jej vlastnú — takže karta vlastnosti uplatní svoju vlastnosť a karta akcie spustí svoj účinok tým istým príkazom:

```rea
{play ginko}        Spustí obsluhu sady ability, potom vlastnú obsluhu karty ginko
{play spinach}      Spustí samotnú obsluhu sady ability
```

**`play=` rozhoduje, či sa karta dá zahrať znovu.** Karta, jej balíček aj jej sada môžu deklarovať jeden z troch životných cyklov a vyhráva vlastný cyklus karty, potom balíčka, potom sady:

| Hodnota     | Čo sa stane po zahraní                                                            |
| ----------- | ----------------------------------------------------------------------------------- |
| `reusable`  | Karta sa vráti a dá sa zahrať ľubovoľne veľakrát (predvolené)                       |
| `exhausted` | Karta je odložená, kým ju niečo nevráti — nové kolo, nová scéna                     |
| `consumed`  | Karta je pre toto čítanie preč                                                      |

Opakované zahranie spotrebovanej alebo odloženej karty nespraví nič a udalosť `card-played` nesie životný cyklus, takže hostiteľ môže kartu ukázať ako minutú. `consumed` znamená preč *pre toto čítanie*, nikdy nie navždy: príbeh, ktorý schová obsah za neopakovateľné ťahanie, je vzorec, ktorý čitatelia neznášajú najviac, a preto prehľad zbierky ukazuje, čo existuje, vedľa toho, s čím sa tento čitateľ stretol.

Identifikátory kariet môžu obsahovať písmená, číslice, spojovníky a podčiarkovníky. Zahranie neznámej karty nespraví nič. Každé úspešné zahranie vyšle behovú udalosť `card-played` nesúcu id karty a druh jej sady, ktorú môžu hostitelia sledovať a aktualizovať podľa nej rozhranie.

#### Predefinovanie vstavaných sád {#redefining-built-in-sets}

Tri vstavané sady sa dajú predefinovať a pripojiť im spoločné pravidlá bez zmeny toho, ako sa ich karty píšu. Predefinovanie `action` s pridaním ceny za použitie platí pre každú kartu akcie `[&]`:

```rea
{define cardset action name="Bojové akcie", use="Na zahranie minie akčný bod."}

{on use set="action" begin}
  {set story.actions_played = story.actions_played + 1}
{end on}
```

Keď sa autorská redefinícia zrazí s implicitnou vstavanou sadou, vyhráva deklarácia autora.

### Hodnoty vlastností kariet {#card-property-values}

Vlastnosť karty je jedna z dvoch vecí a **rozhoduje o tom úvodzovkovanie**. Hodnota bez úvodzoviek, ktorá je úplným literálom jazyka Rea — číslo, pravdivostná hodnota, bod `@(lat, lng)`, pole — je [typovaná vlastnosť](#typed-card-properties): skutočná hodnota, s ktorou vie príbeh porovnávať a počítať. Všetko ostatné je **doslovný text**, uložený presne tak, ako je napísaný, s jedinou úpravou: zástupný symbol `{premenná}` sa pri každom dopyte na kartu nahradí aktuálnou hodnotou tejto premennej — práve to umožňuje karte zobraziť živú štatistiku alebo odomknutú úroveň ilustrácie.

```rea
{define character elena name="Elena Voss", level="{story.elena.level}", home="@(48.14, 17.10)"}
```

`level` je *text* vzniknutý nahradením premennej, nie číslo. `home` je v úvodzovkách, takže je to text `@(48.14, 17.10)`, nie bod — pripomína literál súradnice bez toho, aby ním bol. Bez úvodzoviek by ním bol.

### Typované vlastnosti kariet {#typed-card-properties}

<Feature id="typed-card-properties" />

Karta je pre príbeh jediným zdrojom pravdy o narratívnej entite a typovaná vlastnosť je spôsob, ako si príbeh tú pravdu prečíta späť. `weight=3` na predmete je číslo `3`, nie text `3`, takže vstúpi do porovnania alebo do súčtu bez toho, aby sa najprv zduplikovalo do premennej — a zduplikovaná hodnota je hodnota, ktorá sa rozíde: karta a logika si prestanú odpovedať v momente, keď sa upraví jedna z nich.

**Rozhoduje úvodzovkovanie a obe čítania sa nikdy neprekrývajú.**

| Napísané                      | Výsledok                                                                        |
| ----------------------------- | --------------------------------------------------------------------------------- |
| `weight=3`                    | číslo `3` — typované                                                            |
| `weight=-1.5`                 | číslo `-1.5` — typované                                                         |
| `lit=false`                   | pravdivostná hodnota `false` — typované                                         |
| `home=@(48.14, 17.10)`        | bod — typované                                                                  |
| `sizes=[1, 2, 3]`             | pole čísel — typované                                                           |
| `traits=[brave, literate]`    | zoznam reťazcov — `traits`/`tags` spracúva jazyk sám ako zoznam                  |
| `weight="3"`                  | text `3` — iba na zobrazenie                                                    |
| `level="{story.elena.level}"` | text, nahrádzaný pri každom čítaní                                              |
| `rarity=rare`                 | text `rare` — holé slovo je identifikátor, nie literál                          |
| `home="@(48.14, 17.10)"`      | text, ktorý pripomína súradnicu                                                 |

Zástupný symbol `{premenná}` nie je literál, takže hodnota, ktorá ho nesie, nemôže byť nikdy typovaná a typovaná hodnota ho nemôže nikdy niesť. Neexistuje hodnota, na ktorú by platili obe čítania, a teda ani pravidlo prednosti, ktoré by sa bolo treba učiť. Úvodzovky okolo čísla sú zároveň spôsob, ako si autor udrží zobrazovaný reťazec ako `"007"` alebo `"3+"`.

**Typovaná vlastnosť sa číta ako `story.card.<id>.<prop>`**, rovnako ako sa počítadlá balíčka čítajú ako `story.deck.<id>.remaining`:

```rea
{define item lantern name="Brass Lantern", weight=3, lit=false}
{define character elena name="Elena Voss", home=@(48.14, 17.10), traits=[brave, literate]}

{if story.card.lantern.weight > 2 begin} Ťahá ti opasok nadol. {end if}
{set story.load = story.load + story.card.lantern.weight}
{if distance(story.reader.position, story.card.elena.home) < 500 begin} Je blízko. {end if}
{if "brave" in story.card.elena.traits begin} Ide prvá. {end if}
```

Pre túto cestu platia tri pravidlá:

- **Iba na čítanie.** `{set story.card.…}` je odmietnutý a ohlásený. Zdrojom pravdy je definícia; zapisovateľná kópia by znovu otvorila presne to rozchádzanie, ktoré táto funkcia zatvára.
- **Iba typované vlastnosti.** Textová vlastnosť nemá cestu: `story.card.elena.name` neexistuje. Zobrazovaný text karty je zobrazovaný text a jeho sprístupnenie by spravilo z prózy každej karty premennú a z každého premenovania rozbitý výraz.
- **Meno sa overuje voči karte, nie voči vzoru.** Neznáme id karty aj karta bez takej typovanej vlastnosti sa hlásia samostatne, takže `story.card.lantern.wieght` sa zachytí a nerozplynie sa ticho do prázdna.

Karta definovaná až nižšie v súbore sa stále vyrieši: vlastnosti sa zrkadlia pri registrácii karty, čo je priechod v poradí dokumentu a beží pred čítaním.

**Typovaná hodnota je literál, nie výraz.** Je pevne daná v čase definície: `weight={story.base_weight}` je text a `weight=story.base_weight` je tiež text, pretože holý identifikátor nie je literál. Karta, ktorá musí ukazovať živé číslo, si ponechá textový tvar so `{premennou}` alebo blok `{face begin}`, ktorý sa vyhodnocuje priamo pri každom čítaní. Holý príznak (`mandatory`) je pravdivostná hodnota `true`, ako bol vždy. Hodnota, ktorá má tvar literálu, ale nedá sa z nej hodnotu postaviť — zemepisná šírka mimo rozsahu — zostáva textom.

Vlastné polia jazyka sa nikdy netypujú: `name`, `title`, `image`, `description`, `scan`, `mark`, `listen`, `play`, `deck`, `role`, `require`, `trigger` a `match` majú vlastné spracovanie, takže `name=3` je reťazec `3`. `traits` a `tags` sa dostanú do `story.card.<id>.traits` (alebo `.tags`) zo zoznamu, ktorý jazyk už spracoval, pod menom, ktoré napísal autor.

### Pripísanie repliky {#dialogue-attribution}

<Feature id="dialogue" />

Repliku pripíšete pomocou `@id_postavy:` na začiatku riadku. Spája reč s kartou postavy a umožňuje automatické priradenie hlasu:

```rea
@elena: „Mapa vedie k severnej veži. Musíme sa ponáhľať."
@gareth: „Si si tým istá? Tú oblasť hliadkujú strážcovia."
@elena: „Ver mi. Poznám cestu cez záhrady."
```

Platforma použije nastavenia hlasu definované pri postave (z `{define character}`) a syntézu reči vykreslí automaticky. Keď hlas definovaný nie je, platforma priradí odlišný hlas na základe vlastností postavy.

Pripísanie repliky funguje aj s rozprávaním v tom istom riadku:

```rea
@elena: „Poď za mnou," zašepkala a vkĺzla do tieňov.
@gareth: Zaváhal. „Mám z toho zlý pocit."
```

Anonymní alebo nepomenovaní hovoriaci používajú opis:

```rea
@stranger: „Tu by si nemal byť."
@crowd: „Nech žije kráľ!"
```

---

## 18. Hlas a zvuk {#_18-voice-audio}

### Prevod textu na reč {#text-to-speech}

<Feature id="voice-output" />

Príkaz `{voice}` riadi vykreslenie syntézy reči:

```rea
{voice speaker="narrator", speed=5, pitch=5 begin}
  Na počiatku nebolo nič, len ticho.
{end voice}

{voice speaker="elena", emotion="whisper", speed=3 begin}
  Počuješ to? Steny počúvajú.
{end voice}
```

**Atribúty hlasu:**

| Atribút       | Rozsah/Hodnoty | Predvolené   | Popis                                                                                          |
| ------------- | -------------- | ------------ | ------------------------------------------------------------------------------------------------ |
| `description` | reťazec        | —            | Voľný opis želaného hlasu (napr. `"Hlboký, melancholický mužský hlas"`)                        |
| `speaker`     | reťazec        | `"narrator"` | Identita hlasu alebo opis postavy                                                              |
| `speed`       | 1–9            | 5            | Tempo reči                                                                                     |
| `volume`      | 1–9            | 5            | Hlasitosť                                                                                      |
| `pitch`       | 1–9            | 5            | Výška hlasu                                                                                    |
| `emotion`     | reťazec        | (neutrálne)  | Emocionálne zafarbenie (v jazyku textu): `whisper`, `shout`, `sad`, `excited`, `angry`, `calm` |
| `tone`        | reťazec        | —            | Celkový tón reči: `formal`, `informal`, `friendly`, `authoritative`, `narrative`               |
| `pause`       | 1–9            | —            | Pauza pred prehovorením (1 = najkratšia, 9 = najdlhšia)                                        |

Na predvolené hodnoty sa vrátite zavolaním `{voice}` bez atribútov.

### Prehrávanie zvuku {#audio-playback}

<Feature id="audio-playback" />

```rea
{audio src="media/thunder.ogg", volume=0.8}
{audio src="media/ambient.ogg", loop, volume=0.3, name=ambient_music}
{stop ambient_music}
```

---

## 19. Vstup a interakcia {#_19-input-interaction}

### Textový vstup {#text-input}

<Feature id="text-input" />

```rea
{input name=player_name, placeholder="Zadaj svoje meno"}
Ahoj, {player_name}!
```

**Správanie vstupu:** Vykonávanie sa pri `{input}` pozastaví, kým čitateľ neodošle hodnotu. Hodnota sa uloží do premennej určenej v `name`. Ak čitateľ odošle prázdnu hodnotu, premenná sa nastaví na prázdny reťazec `""`.

### Číselný vstup {#numeric-input}

```rea
{input name=guess, type="number", min=1, max=100, placeholder="Hádaj číslo"}
```

Číselný vstup sa overuje proti obmedzeniam `min` a `max`. Hodnoty mimo rozsahu sa orežú na najbližšiu hranicu. Nečíselný vstup padne na `0`.

### Voľný textový vstup akcie {#free-text-action-input}

<Feature id="action-input" />

`{input type="action"}` mení scénu z menu na miesto: čitateľ vlastnými slovami napíše, čo chce urobiť, a príbeh aktivuje voľbu, ktorá to najlepšie vystihuje — aj keď sa formulácia líši od čohokoľvek na obrazovke:

```rea
Izba je malá a zaprášená. V rohu sa prehýba starý gauč.

{input type="action", placeholder="Čo urobíš?"}

* [Otvor okno]
  Dnu prúdi čerstvý vzduch.
* hidden [&look_under_sofa] Jozef sa zohol a pozrel pod starú pohovku, kde našiel záhadnú obálku s nápisom _Tajné!_

{define action look_under_sofa name="Pozri sa pod pohovku", description="nadvihni alebo sa pozri pod starý gauč v rohu; skontroluj priestor pod pohovkou; prehľadaj pod sedadlom"}
```

Na rozdiel od obyčajného textového vstupu sa odoslaný text neuloží do premennej — porovná sa s použiteľnými možnosťami čakajúcej skupiny volieb, viditeľnými aj [skrytými](#hidden-choices), s už uplatnenými podmienkami a bez spotrebovaných jednorazových možností. Pri možnostiach viazaných na kartu akcie je sémantickým cieľom `description=` karty — píšte ju ako stručný zoznam zámerov, synonymá vítané, v jazyku príbehu; do úvahy sa berie aj `name=` karty a návestie možnosti.

Zhoda aktivuje možnosť presne tou istou cestou ako klepnutie — rozprávanie, účinky, krok späť, uloženia aj analytika sa správajú rovnako. Odoslanie, ktorému nič nesedí, zobrazí v poli jemnú správu o nezhode a skupina zostane otvorená, takže hádať je vždy bezpečné.

Porovnávanie beží výhradne na zariadení čitateľa: čitateľská aplikácia poskytuje malý viacjazyčný model vnorení a vstavané porovnávanie prekryvu slov odpovie vtedy, keď model nie je dostupný (alebo kým sa ešte načítava), takže voľný textový vstup funguje vždy — offline, súkromne, bez nákladov na jednotlivú interakciu. Keďže je model viacjazyčný, formulácia čitateľa sa v rozumnej miere môže odchýliť aj od jazyka autorovho popisu.

Samotná napísaná veta nikdy neopustí zariadenie a neukladá sa do stavu príbehu; zaznamená sa len výsledná voľba. To viaže aj autorský kanál: odoslanie, ktoré sa s ničím nezhoduje, vyvolá `env/no-match` a záznam nenesie **žiadne argumenty** — ani vetu, ani jej dĺžku, ani to, s čím sa porovnávala. Diagnostika je dáta, ktoré opustia zariadenie vo chvíli, keď autor spustí `reast validate` v CI, takže platí pre ňu to isté pravidlo ako pre stav príbehu. Pozri [Spracovanie chýb](error-handling.md).

### Tlačidlá {#buttons}

<Feature id="buttons" />

```rea
{button label="Pokračovať v ceste", target=next_chapter}
{button label="Otvoriť inventár", action=show_inventory}
```

Tlačidlá s `target` navigujú na kotvy (ekvivalent `-> kotva`). Tlačidlá s `action` spúšťajú pomenované udalosti, ktoré môžu obslúžiť bloky `{on nazov_akcie begin}`.

### Časovač {#timer}

<Feature id="timer" />

```rea
{timer duration=30, on_expire="-> times_up" begin}
  Máš 30 sekúnd na rozhodnutie!
  * [Prestrihni červený drôt]
    -> red_wire
  * [Prestrihni modrý drôt]
    -> blue_wire
{end timer}
```

**Správanie časovača:** Keď časovač vyprší, odbočka `on_expire` sa spustí okamžite — aj keď je čitateľ uprostred voľby. Čakajúce voľby sa zrušia a príbeh pokračuje na cieli odbočky. Ak `on_expire` nastavené nie je, blok časovača sa jednoducho skončí a čítanie pokračuje za `{end timer}`. Časovače sa pozastavia, keď aplikácia prejde na pozadie, a pokračujú po návrate do popredia. Vnorené časovače nie sú povolené — nový `{timer}` vnútri aktívneho časovača nahradí ten vonkajší.

### Interakcia sloveso — cieľ {#verb-target-interaction}

<Feature id="verb-target" />

Interakcia sloveso — cieľ, inšpirovaná mechanikou slovo na slovo z jazyka Texture, dovoľuje čitateľom ťahať slová akcií na zvýraznené ciele v texte. Vytvára hmatateľný zážitok poháňaný objavovaním:

```rea
{verbs begin}
  examine: "Pozri sa zblízka na"
  use: "Použi"
  talk: "Prihovor sa"
{end verbs}

Vidíš {target chest begin}drevenú truhlicu{end target} a
{target old_man begin}starého muža{end target} sediaceho neďaleko.

{on use chest begin}
  Otvoríš truhlicu a nájdeš v nej striebornú dýku.
  {give silver_dagger}
{end on}

{on examine chest begin}
  Truhlica je zo starého duba, obitá železnými pásmi. Zvnútra presakuje slabá žiara.
{end on}

{on talk old_man begin}
  „Ale, dobrodruh! Tá truhlica čakala na niekoho odvážneho."
{end on}

{on examine old_man begin}
  Napriek veku má bystré oči. Z vrecka kabáta vykúka mapa.
{end on}
```

**Ako to funguje:** Dostupné slovesá sa vznášajú ako ťahateľné prvky. Čitateľ ťahá sloveso na zvýraznené cieľové slovo. Spustí sa zodpovedajúci blok `{on sloveso ciel begin}`. Nespárované kombinácie zobrazia predvolenú odpoveď:

```rea
{on default begin}
  Zdá sa, že to nefunguje.
{end on}
```

Slovesá môžu byť podmienené a citlivé na kontext:

```rea
{verbs begin}
  unlock: "Odomkni" {if has_key}
  pick: "Vylom zámok" {if dexterity > 5}
{end verbs}
```

---

## 20. Kooperatívne čítanie {#_20-cooperative-reading}

Rea natívne podporuje **zážitky pre viacerých čitateľov**, kde ten istý príbeh číta viac ľudí súčasne.

### Roly čitateľov {#reader-roles}

<Feature id="roles" />

```rea
{define role captain name=Kapitán, description="Vodca výpravy. Robí konečné rozhodnutia.", max=1}

{define role crew name="Člen posádky", description="Plní rozkazy. Má jedinečné zručnosti.", max=4}
```

### Obsah pre konkrétnu rolu {#role-specific-content}

```rea
{if context.group.role = "captain" begin}
  Tajnú mapu vidíš len ty. Čo povieš posádke?
{else}
  Kapitán niečo študuje. Čakáš na rozkazy.
{end if}
```

### Synchronizované voľby {#synchronized-choices}

<Feature id="vote" />

```rea
{vote timeout=60 begin}
  Posádka sa musí rozhodnúť spoločne:
  * [Na sever cez hory]
  * [Na juh pozdĺž pobrežia]
  * [Zostať a postaviť tábor]
{end vote}

Väčšina si zvolila: {vote.result}
```

### Komunikácia medzi čitateľmi {#reader-to-reader-communication}

<Feature id="whisper-broadcast" />

```rea
{whisper to="captain" begin}
  Toto vidí len kapitán: poklad je ukrytý pod tretím kameňom.
{end whisper}

{broadcast begin}
  Toto vidia všetci: blíži sa búrka!
{end broadcast}
```

### Čakanie na čitateľov {#waiting-for-readers}

<Feature id="wait" />

```rea
{wait readers=all begin}
  Čaká sa, kým na toto miesto dorazia všetci čitatelia…
{end wait}
```

### Zdieľaný stav {#shared-state}

<Feature id="shared-state" />

Čitatelia zdieľajú spoločný menný priestor stavu. Zdieľané premenné môže meniť ktorýkoľvek čitateľ a zmeny sa šíria k ostatným:

```rea
{set shared.torch_lit = true}
{set shared.door_opened_by = context.reader.name}

{if shared.torch_lit begin}
  Fakľa osvetľuje chodbu pre všetkých.
  (Zapálil ju {shared.door_opened_by})
{end if}
```

### Synchronizácia stavu {#state-synchronization}

<Feature id="synchronize" />

Predvolene sa zmeny zdieľaných premenných šíria automaticky v reálnom čase. Príkaz `{synchronize}` dáva autorom výslovnú kontrolu nad tým, kedy sa stav odosiela a prijíma:

```rea
{synchronize out}
```

Odošle zdieľaný stav aktuálneho čitateľa na server — ostatní čitatelia dostanú aktualizáciu.

```rea
{synchronize in}
```

Načíta najnovší zdieľaný stav zo servera do pohľadu aktuálneho čitateľa.

**Režim automatickej synchronizácie** sa dá zapnúť alebo vypnúť. Keď je zapnutý, platforma synchronizuje v pravidelných intervaloch bez výslovných volaní `{synchronize}`:

```rea
{synchronize auto="on", interval=5}
```

Zapne automatickú synchronizáciu každých 5 sekúnd. Návrat k ručnému riadeniu:

```rea
{synchronize auto="off"}
```

Po `auto=off` sa zmeny šíria len vtedy, keď sa výslovne zavolá `{synchronize out}` alebo `{synchronize in}`.

| Atribút    | Popis                                                    | Predvolené        |
| ---------- | -------------------------------------------------------- | ----------------- |
| `out`      | Odoslať miestny zdieľaný stav na server                  | —                 |
| `in`       | Načítať najnovší zdieľaný stav zo servera                | —                 |
| `auto`     | Zapnúť alebo vypnúť pravidelnú synchronizáciu (`on`/`off`) | `on`            |
| `interval` | Sekundy medzi automatickými synchronizáciami (pri `auto=on`) | určuje platforma |

**Vzory použitia:**

- **Ťahové hry**: `auto=off`, výslovné `{synchronize out}` po ťahu každého hráča
- **Spolupráca v reálnom čase**: `auto=on` s krátkym intervalom (predvolené správanie)
- **Kritické sekcie**: `{synchronize out}` po blokoch `{exclusive}`, aby sa zmena rozšírila okamžite

### Riešenie konfliktov {#conflict-resolution}

<Feature id="conflict-resolution" />

Keď sa viacerí čitatelia pokúsia o protichodné akcie súčasne, platforma konflikty vyrieši:

```rea
{exclusive action="open_chest" begin}
  {comment Truhlicu môže otvoriť len jeden čitateľ}
  K truhlici sa dostaneš prvý a vypáčiš ju.
  {set shared.chest_opened = true}
{end exclusive}

{race timeout=10 begin}
  {comment Vyhráva prvý čitateľ, ktorý to dokončí}
  * [Chyť drahokam]
    Schmatneš drahokam skôr než ktokoľvek iný!
    {give ruby}
{end race}
```

### Živá prítomnosť {#live-presence}

<Feature id="presence" />

Čitatelia môžu v reálnom čase vidieť polohu a reakcie ostatných:

```rea
{presence show="cursor" begin}
  {comment Ukáž, kde sa v texte nachádza každý čitateľ}
{end presence}

{react options=["😮", "😂", "😢", "❤️"] begin}
  {comment Plávajúce emoji reakcie viditeľné pre všetkých čitateľov}
{end react}
```

### Udalosti čitateľov {#reader-events}

```rea
{on reader_join begin}
  {broadcast begin}K družine sa pridal nový dobrodruh!{end broadcast}
{end on}

{on reader_leave begin}
  {broadcast begin}{event.reader_name} opustil družinu.{end broadcast}
{end on}

{on reader_idle, timeout=120 begin}
  {whisper to=event.reader begin}Si tam ešte?{end whisper}
{end on}
```

### Hraničné prípady a správanie platformy {#edge-cases-and-platform-behavior}

#### Odpojenie {#disconnection}

Keď sa čitateľ odpojí (strata siete, zatvorenie aplikácie, pád):

- **Počas `{wait}`**: platforma upraví požadovaný počet čitateľov. Pri `readers=all` sa odpojení čitatelia po ochrannej lehote (predvolene 30 sekúnd) vylúčia. Zvyšní pokračujú.
- **Počas `{vote}`**: hlas odpojeného čitateľa sa zo sčítania vylúči. Ak už hlasoval, jeho hlas platí.
- **Počas `{race}`**: odpojený čitateľ je diskvalifikovaný. Ak neostane nikto, preteky sa skončia bez víťaza a platforma vykoná vetvu `{else}` (ak nejaká je) alebo blok preskočí.
- **Počas `{exclusive}`**: ak odpojený čitateľ držal výhradný zámok, zámok sa po ochrannej lehote uvoľní a môže si ho nárokovať iný čitateľ.
- **Vo všeobecnosti**: platforma spustí `{on reader_leave begin}` a zachová miestny stav odpojeného čitateľa. Ak sa pripojí do okna relácie (nastaviteľné v metadátach, predvolene 5 minút), pokračuje z poslednej pozície s nedotknutým stavom.

#### Konflikty zdieľaných premenných {#shared-variable-conflicts}

Keď viacerí čitatelia menia zdieľanú premennú súčasne:

- **Vyhráva posledný zápis** je predvolená stratégia riešenia. Platforma určuje poradie podľa serverových časových značiek.
- Pri číselnom hromadení (napr. `{set shared.gold = shared.gold + 10}`) platforma uplatní **atomické zvýšenie** — `+10` každého čitateľa sa uplatní nezávisle, nie na základe zastaraného načítania.
- Autori si môžu pre kritické sekcie vyžiadať výslovné zamknutie:

```rea
{exclusive action="modify_treasury" begin}
  {set shared.gold = shared.gold + story.player.contribution}
{end exclusive}
```

#### Hraničné prípady hlasovania {#vote-edge-cases}

- **Vypršanie času bez hlasov**: blok `{vote}` sa vyhodnotí ako `undefined`. Autori by to mali ošetriť:

```rea
{if vote.result = undefined begin}
  Nepadlo žiadne rozhodnutie. Rozhodne kapitán.
{end if}
```

- **Remíza**: platforma vyberie náhodne spomedzi remizujúcich možností. `vote.result` odráža zvolenú možnosť; `vote.tied` je `true`.
- **Jediný čitateľ**: ak je prítomný len jeden čitateľ, jeho voľba vyhráva okamžite bez čakania na vypršanie času.

#### Hraničné prípady pretekov {#race-edge-cases}

- **Vypršanie času bez dokončenia**: `race.winner` je `undefined`. Obsah bloku sa preskočí.
- **Súčasné dokončenie**: víťaza určí serverová časová značka.

#### Prerozdelenie rolí {#role-reassignment}

Roly sa pri odpojení čitateľa **neprerozdeľujú automaticky**. Ak kapitán odíde, príbeh pokračuje bez kapitána, kým:

- to autor neošetrí cez `{on reader_leave begin}` s výslovnou logikou prerozdelenia, alebo
- sa nepripojí nový čitateľ a neprihlási sa o uvoľnenú rolu

Autori by mali vždy písať obranné kontroly rolí:

```rea
{if readers_in_role("captain") = 0 begin}
  Posádka je bez vodcu. Niekto sa musí ujať velenia.
{end if}
```

### Správanie v sólo režime {#solo-mode-behavior}

<Feature id="solo-degradation" />

Kooperatívne príbehy musia byť hrateľné jediným čitateľom bez úprav. Platforma automaticky uplatňuje tieto pravidlá degradácie:

| Príkaz / vlastnosť                      | Správanie pri viacerých čitateľoch        | Degradácia pri sólo čítaní                          |
| --------------------------------------- | ----------------------------------------- | ---------------------------------------------------- |
| `{vote timeout=N begin}`                | Všetci hlasujú, vyhráva väčšina           | Voľba čitateľa vyhráva **okamžite** (bez čakania)    |
| `{wait readers=all begin}...{end wait}` | Blokuje, kým nedorazia všetci             | **Okamžitý prechod**                                 |
| `{wait VÝRAZ begin}...{end wait}`        | Blokuje, kým výraz nie je pravdivý        | **Bez zmeny** — podmienka môže závisieť od času či stavu |
| `{exclusive begin}`                     | Akciu si môže nárokovať len jeden čitateľ | **Vždy dostupné** — čitateľ si ju nárokuje okamžite  |
| `{race timeout=N begin}`                | Vyhráva prvý, kto to dokončí              | Čitateľ **vždy vyhráva okamžite** (bez čakania)      |
| `{whisper to=ROLA begin}`               | Text vidí len cieľová rola                | Zobrazí sa ako **bežný text**                        |
| `{broadcast begin}`                     | Správu vidia všetci                       | Zobrazí sa ako **bežný text**                        |
| `{presence show=... begin}`             | Ukazuje pozície ostatných čitateľov       | **Skryté** (nič neurobí)                             |
| `{react options=[...] begin}`           | Emoji reakcie viditeľné pre všetkých      | **Skryté** (niet ďalších čitateľov)                  |
| `{synchronize out/in}`                  | Odoslanie a načítanie zdieľaného stavu    | **Nič neurobí** — jediný čitateľ, netreba server     |
| `{synchronize auto=on/off}`             | Prepína automatickú synchronizáciu        | **Nič neurobí** — stav je vždy miestny               |
| `{on reader_join begin}`                | Spustí sa pri pripojení čitateľa          | **Nikdy sa nespustí**                                |
| `{on reader_leave begin}`               | Spustí sa pri odchode čitateľa            | **Nikdy sa nespustí**                                |
| `{on reader_idle begin}`                | Spustí sa pri nečinnosti čitateľa         | **Môže sa spustiť** — aj sólo čitateľ môže byť nečinný |
| `context.group.size`                            | Počet pripojených čitateľov               | Vráti **1**                                          |
| `context.group.readers`                         | Zoznam objektov čitateľov                 | Vráti **[self]**                                     |
| `context.group.role`                            | Rola aktuálneho čitateľa                  | Vráti prvú definovanú rolu                           |
| `readers_in_role(R)`              | Počet čitateľov v role R                  | Vráti **1** pre všetky roly                          |

**Zásady sólo režimu:**

1. **Žiadne čakanie na neprítomných čitateľov** — vypršania a čakania na počet čitateľov sa preskočia okamžite
2. **Žiadny skrytý obsah** — sólo čitateľ vidí všetok obsah viazaný na roly (hrá všetky roly)
3. **Žiadny rozbitý stav** — `group.*` vracia platné údaje (`size=1`, `readers=[self]`)
4. **Prepísanie autorom** — príbehy sa môžu cez metadáta prihlásiť do režimu jednej roly

#### Zaobchádzanie s rolami v sólo režime {#role-handling-in-solo-mode}

Predvolene je sólo čitateľ priradený **ku všetkým rolám naraz**. Bloky viazané na rolu (`{if context.group.role = "captain" begin}`) sa vyhodnotia ako pravdivé, a keď pre tú istú pasáž existuje viac blokov rolí, zobrazia sa všetky s vizuálnym označením roly (napr. `[Kapitán]`, `[Posádka]`).

Autori, ktorí chcú sólo hru s jednou rolou (čitateľ si vyberie jednu rolu a pre ostatné príbeh prehrá znovu), sa môžu prihlásiť cez manifest:

```json
{ "solo_mode": "single_role" }
```

---

## 21. Interakcie s reálnym svetom {#_21-real-world-interactions}

Rea sa cez menný priestor `context.*` prepája so senzormi a rozhraniami reálneho sveta, čím umožňuje príbehy reagujúce na fyzický kontext čitateľa. Každý prístup k senzoru vyžaduje povolenie čitateľa a elegantne degraduje — ak senzor nie je dostupný, príbeh pokračuje aj bez neho.

### Požiadavky na schopnosti {#capability-requirements}

<Feature id="capability-requirements" />

Deklarujte, ktoré funkcie reálneho sveta príbeh potrebuje. Čitateľská aplikácia dostupnosť overí pred spustením:

```rea
{require gps}
{require camera}
{require accelerometer}
{require nfc optional}
```

Pridanie `optional` znamená, že funkcia príbeh obohatí, ale nie je nutná. Funkcia `has()` overuje za behu:

```rea
{if has("nfc") begin}
  Prilož zariadenie k NFC štítku ukrytému pod lavičkou.
{else}
  Napíš kód vytlačený na lavičke: {input type="text", name=bench_code}
{end if}
```

### Tri slovesá, jeden jazyk {#three-verbs-one-language}

<Feature id="conditional-wait" />

Každá brána v príbehu — `{if}`, `condition` voľby, `when` storyletu, stráž `when` stavového automatu, `visible:` špendlíka na mape, oblasť zastávky — sa píše v **jednom** jazyku výrazov a rozhoduje o nej **jeden** podsystém. Nelíši sa podmienka, ale *kedy sa na ňu engine pozrie*, a to vyjadruje blok, ktorý autor zvolí, nie druhá syntax:

| Režim          | Zápis                                                                          | Význam                                                            | Vyžaduje únik                   |
| -------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------- |
| **teraz**      | `{if}`, `condition` voľby, `visible:` špendlíka                                | vyhodnotí sa vo chvíli, keď k nej čitateľ dôjde                    | nie                             |
| **kým**        | `{wait EXPR begin} … {end wait}`, `{waypoint}`                                 | príbeh sa tu zastaví a pokračuje, keď sa výraz stane pravdivým      | áno, keď výraz číta `context.*` |
| **kedykoľvek** | `{on EVENT when GUARD}`, `when` storyletu, `{zone}` `on enter` / `on exit` | spúšťa sa na hrane, môže sa spustiť opakovane                       | neaplikuje sa                   |

Autor volí sloveso jedinou otázkou — *zastaví sa tu príbeh?* — a vo všetkých troch prípadoch píše ten istý jazyk výrazov. Nové schopnosti preto prichádzajú ako nové podstromy `context.` a nové funkcie, nikdy nie ako nová gramatika.

### Čakanie na podmienku {#waiting-for-a-condition}

<Feature id="conditional-wait" />

`{wait EXPR begin} … {end wait}` zastaví príbeh, kým sa `EXPR` nestane pravdivým. Telo je to, čo čitateľ vidí **počas** čakania; keď sa brána otvorí, telo sa nahradí a príbeh pokračuje za `{end wait}`.

```rea
{wait escape=duration("PT3H"), escape_to="dry_night" when context.weather = "rain" and context.time.hour >= 20 begin}
  Sadneš si na lavičku pod podlubím a pozeráš na oblohu.
{end wait}

Prvé kvapky dopadajú na dlažbu. Pod podlubím už niekto čaká.
```

| Atribút     | Popis                                                              |
| ----------- | ------------------------------------------------------------------ |
| `escape`    | Trvanie, po ktorom sa čakanie samo vzdá (`escape=duration("PT3H")`) |
| `escape_to` | Kotva, na ktorú sa čitateľ presunie namiesto nekonečného čakania    |

Čakanie, ktorého výraz číta `context.*` — stav zariadenia, polohy alebo počasia mimo kontroly autora — MUSÍ deklarovať `escape=` alebo `escape_to=`; autor, ktorý vynechá oboje, dostane `link/wait-no-escape` (varovanie, nie chyba: zámerná tvrdá brána je legitímny návrh). Je to to isté pravidlo, aké `{waypoint}` mal vždy, vyslovené raz pre každú čakajúcu podmienku.

Zo sémantiky vyplývajú tri veci a autor potrebuje všetky tri:

- **Podmienka môže byť `unknown`.** Keď je zdroj, ktorý číta, zamietnutý, nedostupný alebo zastaraný, výraz nie je ani pravdivý, ani nepravdivý. Čakanie berie `unknown` ako *čakaj ďalej* a nechá rozhodnúť únik — zamietnutý senzor nesmie potichu odpovedať „nie“ a zavrieť bránu, o ktorej sa čitateľ nikdy nedozvedel. `{if}` ho berie ako nepravdu, a preto `link/context-no-fallback` pýta `{else}`.
- **Termíny sú absolútne a zmeškané okno sa ráta.** Príbeh sa zavrie na lavičke a otvorí o tri hodiny neskôr; `escape=duration("PT3H")` je dovtedy vyčerpaný bez ohľadu na to, či aplikácia bežala. Navše: čakanie, ktoré sa stalo pravdivým, kým bol príbeh zatvorený, sa všimne pri návrate — `{wait context.time.hour = 22}` sa spustí čitateľovi, ktorý bol preč od deviatej do pol dvanástej, lebo engine prehrá hodiny, ktoré prespal, namiesto toho, aby sa pýtal len na okamih prebudenia. Platí to pre všetko odvodené od hodín; včerajšie počasie si nikto nezaznamenal, takže dopytovaný zdroj sa rozhodne až v okamihu návratu.
- **Čakanie posunie príbeh, keď ho nabudúce otvoríš, nie skôr.** Žiadne čakanie nebeží pri zatvorenej aplikácii — web nemá určovanie polohy na pozadí ani spoľahlivé naplánované miestne upozornenie — takže príbeh nikdy nie je *pred* čitateľom, len dobehnutý k okamihu jeho návratu. O čakaní sa nikam nič neposiela: rozhoduje sa na zariadení, podľa jeho hodín. Čitateľ teda nedostane ťuknutie po pleci a `escape=` je to, čo chráni príbeh pred tým, kto sa už nevráti.

Pre podmienky, s ktorými sa čakanie zvyčajne píše, existujú tri funkcie:

```rea
{wait between(context.time, "22:00", "06:00") begin}     {comment po desiatej večer, vrátane po polnoci}
{wait elapsed(story.started) >= duration("PT30M") begin} {comment o pol hodinu čítania neskôr}
{wait within(context.location, "old_bridge") begin}      {comment vnútri oblasti pomenovanej zastávky}
```

Holé `{wait begin} … {end wait}` bez výrazu ostáva nezmenené: je to pauza, nie brána.

### Zdroje kontextu {#context-sources}

<Feature id="context-sources" />

Každý podstrom `context.` je **zdroj** a zdroje nemajú rovnakú cenu: GPS je prúd, ktorý vyčerpáva batériu, počasie je sieťové volanie s obmedzenou frekvenciou, hodinový čas je zadarmo a presne predvídateľný. Engine si z výrazu podmienky sám odvodí, ktoré zdroje potrebuje — príbeh to nikdy nedeklaruje a obrazovka súhlasu sa počíta z toho, nie z manifestu.

| Zdroj                                                   | Druh       | Kadencia                                                                                                                            |
| ------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `context.time.*`                                        | odvodený   | nikdy sa nedopytuje — engine sa zobudí presne raz, v najbližšej sekunde, minúte, hodine alebo o polnoci, ktorú podmienka vie zbadať |
| `context.location`, `context.heading`, `context.speed`  | doručovaný | zariadenie ho doručuje, kým naň nejaká podmienka čaká                                                                               |
| `context.weather`, `.temperature`, `.wind`, `.humidity` | dopytovaný | jedna zdieľaná požiadavka za interval, nech ho číta koľkokoľvek podmienok                                                           |
| `context.ext.<ns>.*`                                    | hostiteľ   | čokoľvek poskytuje rozšírenie hostiteľa, ktoré ho zaregistrovalo                                                                    |
| `{scan}`, `{listen}`, `{capture}`, NFC                  | ručný      | iba z podnetu čitateľa                                                                                                              |

Zdroj sa spustí, keď začne čakať prvá podmienka, ktorá ho sleduje, a zastaví sa, keď odíde posledná — príbeh si teda pýta povolenie presne vtedy, keď ho potrebuje, a nikdy nedrží senzor otvorený počas kapitoly, ktorá ho nepoužíva.

Riadok **ručný** je pravidlo, nie opomenutie: podmienka smie *čítať* premennú, ktorú vytvoril `{scan}` alebo `{listen}`, ale engine nikdy nespustí fotoaparát ani mikrofón preto, že ich výraz spomenul. Pasívne čakanie na úkon, o ktorý nikto čitateľa nepožiadal, je neviditeľná brána.

Podmienka, ktorá číta podstrom `context.`, aký neposkytuje žiadna platforma, dostane pri linkovaní `link/unknown-context-source` — nikdy by sa nemohla stať pravdivou.

### Poloha {#location}

<Feature id="location" />

Poloha sa zapisuje [bodovým literálom `@(lat, lng)`](02-logic-data.md#coordinate-literals) a operátor `matches` sa pýta, či leží v oblasti:

```rea
{if context.location matches circle(@(48.14, 17.10), 500) begin}
  Cítiš zvláštnu rezonanciu. Toto je to miesto z príbehu!
{end if}
```

**Vlastnosti polohy:**

| Vlastnosť            | Typ   | Popis                                 |
| -------------------- | ----- | ------------------------------------- |
| `context.location`     | bod   | Aktuálna pozícia (lat, lng)           |
| `context.location.lat` | float | Zemepisná šírka                       |
| `context.location.lng` | float | Zemepisná dĺžka                       |
| `context.location.alt` | float | Nadmorská výška v metroch (ak je známa) |
| `context.location.acc` | float | Presnosť v metroch                    |
| `context.heading`      | float | Smer kompasu v stupňoch (0–360)       |
| `context.speed`        | float | Rýchlosť pohybu v m/s                 |

### Zastávky {#waypoints}

<Feature id="waypoints" />

Zastávky, inšpirované geocachingom, definujú pomenované miesta, ktoré musí čitateľ navštíviť. Zastávka je [`{wait}`](#waiting-for-a-condition) plus miesto na mape — `{waypoint name, AREA, require=EXPR}` je `{wait context.location matches AREA and EXPR}` s metaúdajmi mapy — takže `hint=` je jej text počas čakania, telo je obsah po príchode a o oboch rozhoduje ten istý plánovač a to isté pravidlo úniku:

```rea
{waypoint old_bridge, circle(@(48.1432, 17.1056), 50) begin}
  Starý most ti pod nohami zavŕzga. Pod tretím doskou
  nájdeš koženú mešec so zvláštnym symbolom.
  {set story.symbol_found = true}
{end waypoint}

{waypoint castle_ruins, circle(@(48.1510, 17.1120), 100), require=story.symbol_found begin}
  Symbol sa pri približovaní k ruinám rozžiari.
  Vo východnej stene sa odhalí skrytá chodba.
{end waypoint}
```

Zastávky majú voliteľné atribúty:

| Atribút     | Popis                                                      |
| ----------- | ---------------------------------------------------------- |
| `require`   | Podmienka, ktorá musí platiť na aktiváciu                  |
| `hint`      | Text pomáhajúci čitateľovi nájsť miesto                    |
| `proximity` | Vzdialenosť v km, pri ktorej sa nápoveda zobrazí           |
| `icon`      | Ikona značky na mape                                       |
| `hidden`    | Zastávka je na mape neviditeľná, kým nie je splnené require |
| `escape`    | Časový limit (napr. `duration("PT30M")`), po ktorom sa zastávka preskočí |
| `escape_to` | Náhradná kotva, kam sa čitateľ pošle namiesto nekonečného čakania |

Zastávka, ktorej podmienka prechodu závisí od `context.*` (stav zariadenia, polohy alebo času mimo kontroly autora), MUSÍ deklarovať `escape=` alebo `escape_to=` — autor, ktorý vynechá oboje, dostane `link/waypoint-no-escape` (varovanie, nie chyba: zámerná tvrdá fyzická brána bez digitálneho obchádzania je legitímny návrh). To isté platí pre zastávky, z ktorých sa skladá [`{route}`](#multi-stage-routes), keď závisia od `context.*`.

```rea
{waypoint museum_door, circle(@(48.1486, 17.1077), 30), require=context.device.gps, escape=duration("PT2H") begin}
  Dvere povolia. Vnútri je výstava presne taká, ako ju opísal ten list.
{end waypoint}
```

Ide o podmienku, ktorú napísal *autor*. Každú zastávku beh programu porovnáva s polohou čitateľa, takže samotné toto porovnanie varovanie nespustí — spustí ho až `require=context.…` alebo oblasť postavená zo živého čítania, napríklad `circle(context.location, 50)`. `escape_to=` pomenúva kotvu rovnako ako odbočka: tú, ktorú nedefinuje žiadne `[#kotva]` ani `{label}`, hlási `link/undefined-anchor`, a kotva, ku ktorej vedie len `escape_to=`, sa nepovažuje za nepoužitú.

### Obrázky máp a špendlíky {#map-images-pins}

<Feature id="maps" />

Príbeh zasadený do reálneho miesta môže ukázať vlastnú mapu namiesto všeobecnej: obrázok dodaný autorom ukotvený na reálne hranice GPS, so špendlíkmi umiestnenými na súradniciach.

```rea
{map old_town bounds="@(48.152, 17.100), @(48.140, 17.120)" begin}
  image [!Staré mesto < assets/old-town.webp]
  {pin bridge at="@(48.1432, 17.1056)" begin}
    label "Starý most"
  {end pin}
  {pin reader at=context.location begin}
    label "Ty"
  {end pin}
{end map}
```

`bounds=` udáva severozápadný a juhovýchodný roh obrázka ako dva bodové literály a jadro každý špendlík naň premietne ekvidištantne. `at:` špendlíka prijíma ľubovoľný bodový výraz — literál alebo `context.location` pre špendlík, ktorý sleduje čitateľa — takže sa špendlík môže pohybovať s čítaním alebo sa objaviť až po nastavení premennej (`visible`).

Nič z tohto bloku sa zatiaľ nevykresľuje — parser mu rozumie, výpočet projekcie je napísaný a zostávajúcim dielom je plátno na strane čitateľa.

### Viacetapové trasy {#multi-stage-routes}

<Feature id="routes" />

Zreťazte zastávky do postupných alebo voľných trás:

```rea
{route treasure_hunt, waypoints="old_bridge, castle_ruins, hidden_cave", complete="Dokončil si hľadanie pokladu!", sequential begin}
{end route}
```

Trasa pomenúva zastávky deklarované inde; neobsahuje ich, takže zastávka ostáva jednou vecou na jednom mieste a trasa je chodník cez ne. Jej riadok `complete=` sa vykreslí tam, kde stojí samotný blok `{route}`, a až keď sú hotové všetky etapy — autor teda blok umiestni tam, kam patrí odmena, spravidla za chodník. Dovtedy blok neukazuje nič.

`sequential` zaznamenáva, že etapy sa majú navštíviť v poradí. Keďže každá `{waypoint}` zastaví príbeh tam, kde stojí, je toto poradie zároveň poradím čítania; atribút hovorí mape, ukazovateľu postupu či rozhraniu hostiteľa, že preskakovanie nie je zámerom.

Postup čitateľa sa dá čítať ako `story.<trasa>.done`, `.total` a `.complete` a odvodzuje sa zo samotných zastávok, nie z osobitnej evidencie — trasa nedrží stav, s ktorým by uloženie mohlo nesúhlasiť.

Etapa pomenúvajúca zastávku, akú nedeklaruje žiadna časť príbehu, je `link/unknown-route-waypoint`: chodník by sa nikdy nedal dokončiť.

### Geografické zóny {#geo-fencing-zones}

<Feature id="zones" />

Zóna je forma **kedykoľvek** bloku [`{wait}`](#waiting-for-a-condition) — ten istý jazyk výrazov nad tou istou hodnotou oblasti, len sa rozhoduje na každej hrane, nie raz. Príbeh nikdy nezastaví: čitateľ prejde okolo bloku a ten prehovorí, keď vstúpi do oblasti alebo z nej vyjde.

```rea
{zone dark_forest, area(@(48.14, 17.10), @(48.15, 17.10), @(48.15, 17.11))}

{on enter zone="dark_forest" begin}
  Stromy sa okolo teba zomknú. Les pôsobí živo.
  {set story.ui.ambient = "forest"}
{end on}

{on exit zone="dark_forest" begin}
  Vynoríš sa z lesa a žmúriš do slnka.
  {set story.ui.ambient = "default"}
{end on}
```

Zóna vykreslí obsah tej hrany, ktorú čitateľ **naposledy prekročil**, a to na mieste samotného bloku: obsah vstupu, kým je vnútri, a obsah odchodu, keď odíde. Jedna ohraničená odpoveď namiesto záznamu — čitateľ, ktorý sa vráti späť do lesa, uvidí, ako sa stromy zase zovrú, nie rastúci prepis každého prechodu. Kým neprekročí ani jednu hranu, blok neukazuje nič.

Samotná zóna je jediný nepárový príkaz: deklaruje oblasť a označuje miesto, kde sa vykreslí prekročená hrana. Každá hrana je vrcholový blok `{on enter zone="..."}` alebo `{on exit zone="..."}` — tá istá plochá forma, akú má každá iná udalosť v jazyku — takže hrana sa dá prečítať aj bez zóny nad ňou.

Príkazy hrany sa vykonajú vo chvíli, keď sa spustí, presne ako dôsledky zvolenej možnosti — `{set}` vnútri `{on enter}` teda zaberie pri vstupe, nie vtedy, keď sa vykreslí jeho text. Hrana môže niesť stráž ako každé iné **kedykoľvek** — `{on enter zone="dark_forest" when story.has_key begin}` — a `story.<zóna>.inside` sa dá čítať kdekoľvek v príbehu, takže zóna môže podmieniť obsah ďaleko od miesta, kde je deklarovaná, bez opakovania svojej oblasti.

Ako každá podmienka sledujúca polohu čitateľa aj zóna spustí zdroj polohy, keď k nej príbeh dôjde, a uvoľní ho, keď ho už nič nepotrebuje.

### Denná doba {#time-of-day}

<Feature id="time-of-day" />

```rea
{if context.time.hour >= 22 or context.time.hour < 6 begin}
  Tma okolo teba dnes v noci pôsobí skutočne.
{else}
  Denné svetlo robí príbeh menej desivým.
{end if}
```

**Vlastnosti času:**

| Vlastnosť       | Typ     | Popis                            |
| --------------- | ------- | -------------------------------- |
| `context.time.hour`    | integer | Aktuálna hodina (0–23)           |
| `context.time.minute`  | integer | Aktuálna minúta (0–59)           |
| `context.time.weekday` | string  | Názov dňa (malými písmenami)     |
| `context.time.date`    | string  | Dátum ako reťazec ISO            |
| `context.time.season`  | string  | Ročné obdobie podľa pologule     |

### Nočný režim {#night-mode}

Skombinujte čas a svetelný senzor pre atmosféru:

```rea
{if context.time.hour >= 22 and context.light < 50 begin}
  {set story.ui.theme = "dark"}
  Táto kapitola sa dá čítať len v tme. Zhasni svetlá.
{end if}
```

### Počasie {#weather}

<Feature id="weather" />

```rea
{if context.weather = "rain" begin}
  Aké príhodné — prší v príbehu aj za tvojím oknom.
{end if}
```

**Vlastnosti počasia:**

| Vlastnosť           | Typ    | Popis                                                    |
| ------------------- | ------ | -------------------------------------------------------- |
| `context.weather`     | string | Aktuálny stav (clear, rain, snow, fog, storm)            |
| `context.temperature` | float  | Teplota v stupňoch Celzia                                |
| `context.wind`        | float  | Rýchlosť vetra v m/s                                     |
| `context.humidity`    | float  | Vlhkosť v percentách (0–100)                             |

### Skenovanie QR a čiarových kódov {#qr-and-barcode-scanning}

<Feature id="scan" />

```rea
{scan type="qr", target="REAST-SECRET-42" begin}
  Naskenuj QR kód ukrytý v reálnom svete a odomkni túto kapitolu.
{end scan}
```

Podporované typy skenovania:

| Typ          | Popis                                     |
| ------------ | ----------------------------------------- |
| `qr`         | QR kód (najbežnejší)                      |
| `barcode`    | Ľubovoľný podporovaný čiarový kód (EAN, UPC atď.) |
| `aztec`      | Kód Aztec (palubné lístky)                |
| `datamatrix` | Kód Data Matrix                           |

Atribút `target` sa porovnáva s naskenovanou hodnotou. Na zhodu regulárnym výrazom použite `pattern`:

```rea
{scan type="qr", pattern="^REAST-.*" begin}
  Našiel si jeden zo skrytých kódov! {set story.codes_found = story.codes_found + 1}
{end scan}
```

Blok `{scan}` je *blokujúci* — príbeh sa na tom mieste zastaví a čaká na kód. Pre kódy, na ktoré čitateľ môže naraziť kdekoľvek cestou, radšej použite [spúšťané storylety](/sk/spec/storylets#triggered-storylets) (`trigger: scan`) alebo možnosť [menu objavovania](#exploration-menus) s poľom karty `scan=`: tie sú dobrovoľnými prerušeniami, ktoré sa spustia vtedy, keď vstup dorazí.

### NFC štítky {#nfc-tags}

<Feature id="nfc" />

```rea
{nfc target="reast:chapter5" begin}
  Prilož zariadenie k NFC štítku a odhaľ skrytú správu.
{end nfc}

{nfc read, name=tag_data begin}
  Štítok obsahuje: {tag_data}
{end nfc}
```

### Fotoaparát a fotografia {#camera-and-photo}

<Feature id="camera" />

```rea
{capture type="photo", name=reader_photo begin}
  Odfoť svoje okolie a pokračuj.
{end capture}
```

| Typ      | Popis                                              |
| -------- | -------------------------------------------------- |
| `photo`  | Jedna fotografia                                   |
| `video`  | Krátke video (atribút maximálneho trvania)         |
| `selfie` | Fotografia predným fotoaparátom                    |

### Pohyb a orientácia {#motion-and-orientation}

<Feature id="motion" />

Prístup k senzorom zariadenia pre fyzické interakcie:

```rea
{on shake, intensity=2 begin}
  Zatrasieš čarovnou guľou. Objaví sa odpoveď: {~Áno|Nie|Možno|Spýtaj sa znovu}
{end on}

{on tilt, direction="north", threshold=15 begin}
  Ihla kompasu sa otočí na sever. Skryté dvere sa otvoria.
{end on}
```

**Vlastnosti pohybu:**

| Vlastnosť              | Typ   | Popis                                    |
| ---------------------- | ----- | ---------------------------------------- |
| `context.tilt.x`         | float | Náklon dopredu a dozadu (−180 až 180)    |
| `context.tilt.y`         | float | Náklon doľava a doprava (−90 až 90)      |
| `context.orientation`    | float | Otočenie zariadenia (0–360, kompas)      |
| `context.acceleration.x` | float | Zrýchlenie pozdĺž osi X                  |
| `context.acceleration.y` | float | Zrýchlenie pozdĺž osi Y                  |
| `context.acceleration.z` | float | Zrýchlenie pozdĺž osi Z                  |

### Úroveň svetla {#light-level}

<Feature id="light" />

```rea
{if context.light < 10 begin}
  V úplnej tme začne fosforeskujúci text svietiť.
{end if}

{if context.light > 500 begin}
  Jasné slnko odhalí na strane neviditeľný atrament.
{end if}
```

`context.light` vracia okolité svetlo v luxoch (0 = tma, 500 a viac = jasné denné svetlo).

### Vibrácie a haptika {#vibration-and-haptics}

<Feature id="vibration" />

```rea
{vibrate 200}
{vibrate pattern=[100, 50, 100, 50, 300]}
```

Vzor: pole striedajúcich sa dĺžok vibrácie a pauzy v milisekundách.

### Blízkosť {#proximity}

<Feature id="proximity" />

```rea
{on proximity "near" begin}
  Priblížiš zariadenie k predmetu. Objaví sa tajná správa.
{end on}
```

### Hlasový vstup {#voice-input}

<Feature id="listen" />

```rea
{listen language="sk", name=spoken_word begin}
  Vyslov čarovné slovo a otvor dvere.
{end listen}

{if spoken_word = "abrakadabra" begin}
  Dvere sa pomaly so škrípaním otvoria.
{end if}
```

Rovnako ako `{scan}` aj blok `{listen}` zastaví a čaká na jednom mieste. Pre frázy, ktoré čitateľ môže vysloviť kedykoľvek, použite [spúšťané storylety](/sk/spec/storylets#triggered-storylets) (`trigger: listen`) alebo možnosť menu objavovania s poľom karty `listen=`.

### Priorita: menu objavovania verzus spúšťače storyletov {#priority-exploration-menus-vs-storylet-triggers}

Naskenovanie, vyslovená fráza či odfotená značka je jediná fyzická udalosť — nemôže znamenať dve veci naraz. Ak má čitateľ vo chvíli, keď taký vstup vytvorí, otvorené čakajúce [menu objavovania](#exploration-menus), jadro najprv skontroluje možnosti menu s poľami `scan=`, `mark=` a `listen=`. Len keď v menu nič nesedí, ten istý vstup prepadne ďalej a zobudí spúšťač storyletu.

Pozri [Storylety a balíčky](/sk/spec/storylets) pre výber storyletov, spúšťače a prioritu/váhu.

### Kocky a náhodnosť {#dice-and-randomization}

<Feature id="dice" />

Rea podporuje zápis hodov kockou inšpirovaný zvyklosťami stolových hier na hrdinov:

```rea
{set story.combat.roll = dice("2d6+3")}
Hodil si {story.combat.roll}!

{if story.combat.roll >= 10 begin}
  Kritický úspech! Drak uteká.
{else if story.combat.roll >= 7}
  Draka zraníš.
{else}
  Drak ťa odhodí bokom.
{end if}
```

**Zápis hodov kockou:**

| Zápis    | Popis                                          |
| -------- | ---------------------------------------------- |
| `d6`     | Jedna šesťstenná kocka                         |
| `2d6`    | Dve šesťstenné kocky, súčet                    |
| `2d6+3`  | Dve k6 plus modifikátor                        |
| `d20adv` | Hod s výhodou (lepší z dvoch k20)              |
| `d20dis` | Hod s nevýhodou (horší z dvoch k20)            |
| `4d6kh3` | Hoď 4k6, ponechaj tri najvyššie                |
| `d100`   | Percentuálna kocka                             |

### Výzvy v reálnom svete {#real-world-challenges}

<Feature id="challenges" />

Skombinujte viacero senzorov do interakcií v štýle výziev, inšpirovaných geocachingom a dobrodružnými hrami:

```rea
{challenge night_vigil timeout=30m, hint="Nájdi starú kaplnku po polnoci. Neber si svetlo."
            when context.time.hour >= 23 and context.light < 20
                 and context.location matches circle(@(48.14, 17.10), 200) begin}
  Stojíš v tme pred starodávnou kaplnkou.
  Hviezdy nad tebou skladajú odkaz viditeľný len v túto hodinu.
  {set story.star_message = "VERITAS"}
{end challenge}
```

Atribúty výzvy:

| Atribút   | Popis                                                  |
| --------- | ------------------------------------------------------ |
| `when …`  | Jedna alebo viac podmienok, spojených cez `and`        |
| `timeout` | Časový limit (napr. `30m`, `2h`)                       |
| `hint`    | Usmernenie zobrazené pri čiastočnom splnení podmienok  |
| `retry`   | Povolí opakovanie po neúspechu (predvolene true)       |
| `reward`  | Premenná nastavená po dokončení                        |

### Súkromie a nakladanie s údajmi {#privacy-data-handling}

<Feature id="privacy-tiers" />

Príbehy Rea môžu pristupovať k GPS, fotoaparátu, mikrofónu a pohybovým senzorom. Platforma presadzuje prísne pravidlá súkromia:

**Úrovne povolení:**

| Úroveň | Senzory                                        | Správanie                                            |
| ------ | ---------------------------------------------- | ---------------------------------------------------- |
| Žiadna | čas, dátum, ročné obdobie                      | Netreba povolenie — neidentifikuje                   |
| Nízka  | počasie, svetlo, vibrácie                      | Jediná výzva, len približné údaje                    |
| Stredná | GPS (približné), akcelerometer, gyroskop      | Výslovné povolenie, len počas otvoreného príbehu     |
| Vysoká | GPS (presné), fotoaparát, mikrofón, NFC        | Povolenie na jedno použitie s náhľadom snímaného     |

**Pravidlá nakladania s údajmi:**

1. **Predvolene pominuteľné.** Hodnoty senzorov existujú len počas aktuálnej relácie čítania. Žiadna trvalá história polohy, žiadne záznamy senzorov
2. **Autori nemajú prístup k surovým údajom.** Autori dostávajú logické výsledky a udalosti (`context.location matches circle(…)` → `true`/`false`), nie presné súradnice. Výnimka: `{capture}` poskytuje fotografie len na zobrazenie v príbehu
3. **Presná poloha sa neprenáša na server.** V kooperatívnom režime vidia ostatní čitatelia udalosti („Čitateľ A dorazil na waypoint_X"), nikdy nie surové súradnice
4. **Mikrofón len počas relácie.** `{listen}` prepisuje miestne. Zvuk sa nikdy neukladá ani neprenáša — ako premenná je dostupný len rozpoznaný text
5. **Počasie cez približnú geolokáciu.** Volania rozhrania počasia používajú polohu podľa IP adresy, nie súradnice GPS
6. **Diagnostika nenesie dáta čitateľa.** Každé pravidlo vyššie viaže autorský kanál rovnako ako stav príbehu. Záznam smie pomenovať premennú, odcitovať to, čo autor doslova napísal do súboru `.rea`, a opísať *typ* hodnoty za behu — nikdy nie hodnotu. Neexistuje cesta v kóde, ktorou by sa prepis z `{listen}`, fotka z `{capture}`, `reader.*` alebo `context.location` stali argumentom diagnostiky; konštruktory, ktoré ich stavajú, odmietnu reťazec od volajúceho rovno. Pozri [Spracovanie chýb](error-handling.md)

**Záruky pre čitateľa:**

- Pred spustením príbehu: zobrazia sa požiadavky na senzory (z poľa metadát `sensors:`)
- Každá žiadosť o senzor zobrazí opis účelu (dodaný autorom cez atribút `hint`)
- Čitateľ môže ktorýkoľvek senzor odmietnuť — príbeh elegantne degraduje
- Čitateľ môže povolenia odvolať aj počas príbehu
- Všetky zachytené médiá a stav relácie môže čitateľ zmazať

### Dostupnosť senzorov {#sensor-availability}

Nie všetky zariadenia podporujú všetky senzory. Čitateľská aplikácia Reast poskytuje náhradné riešenia:

| Senzor          | Podpora v prehliadačoch | Náhrada                          |
| --------------- | ----------------------- | -------------------------------- |
| Poloha GPS      | Všetky prehliadače      | Ručné zadanie mesta či regiónu   |
| Fotoaparát / QR | Všetky prehliadače      | Ručné zadanie kódu textom        |
| Akcelerometer   | Chrome, Edge            | Gestá klepnutia a potiahnutia    |
| Gyroskop        | Chrome, Edge            | Tlačidlá smeru kompasu           |
| Svetelný senzor | Obmedzená               | Odhad podľa dennej doby          |
| NFC             | Android Chrome          | Alternatíva cez QR kód           |
| Vibrácie        | Chrome, Firefox         | Efekt vizuálneho pulzu           |
| Hlasový vstup   | Chrome                  | Textový vstup                    |
| Počasie         | Cez rozhranie API       | Čitateľ zadá sám alebo preskočí  |

---
