# Karty a balíčky

> [Úvod](/sk/spec/) · [Index funkcií](features) · [Ťahák](REA-CHEATSHEET)

**Balíček** je pomenovaná zásoba **kariet**. Karta je kus príbehu — text, `{set}`, volania, možnosti — s lícom (meno, ilustrácia, popis) a s podmienkou. Na mieste, ktoré si autor zvolí, príbeh rozdá z balíčka ruku; čitateľ si jednu alebo viac vyberie; každá vybraná karta sa zahrá presne ako tunel a príbeh pokračuje tam, kde bol.

Karta bez balíčka je staršia predstava *storyletu*: obsah, ktorý zobudí svet, nie obsah, ktorý rozdá balíček. Je to tá istá deklarácia, a preto majú obe jednu stránku.

### Deklarácia balíčka {#declaring-a-deck}

<Feature id="define-deck" />

Balíček je líce a súbor predvolieb, takže je nepárový — jeden príkaz, žiadne `begin`:

```rea
{define deck roles name="Karty rolí", back="assets/cards/card-role-background.webp",
                   scope="group", play="consumed", face="down"}
```

| Atribút balíčka                    | Význam                                                                                                                                    | Predvolené |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| `name`, `back`, `description`      | Líce samotného balíčka (názov, rub)                                                                                                       | —          |
| `scope`                            | `reader` (kópia pre každého) alebo `group` (jeden balíček pre celú kooperatívnu reláciu)                                                   | `reader`   |
| `play`                             | Čo sa stane so zahranou kartou: `reusable` (späť do balíčka), `exhausted` (odložená, kým ju niekto nevráti), `consumed` (preč pre toto čítanie) | `reusable` |
| `deal`, `pick`, `face`, `optional` | Predvolby pre príkazy `{draw}` / `{play}`, ktoré tento balíček používajú                                                                   | `all`, `1`, `up`, `false` |
| `reclaim`                          | Sekundy po odpojení držiteľa, kým sa jeho karta vráti do balíčka; `never` ju necháva držanú (len `scope="group"`)                          | odkladová lehota platformy |

### Deklarácia karty {#declaring-a-card}

<Feature id="define-card" />

Karta má telo — to, čo sa zahrá, keď je aktivovaná — takže je párová a zatvára sa vlastným druhom:

```rea
{define card king deck="roles", name="Kráľ", image="assets/cards/card-role-king.webp",
                  role="king" begin}
  Zobudíš sa v kráľovskej spálni. Okenice už niekto otvoril.
  * [Zvolaj radu] -> council_chamber
  * [Prejdi sa po hradbách sám]
    Kameň je studený a stráže predstierajú, že ťa nevidia.
{end card}
```

Karta vstupuje do balíčka tým, že ho **pomenuje**, nie tým, že v ňom sedí — rovnako ako vstupuje do sady kariet. Hierarchia žije v dátach, takže karta otvorená uprostred súboru stále hovorí, kam patrí.

Karta berie `deck=`, atribúty líca, ktoré berie každá definícia karty (`name`, `image`, `description` a vlastnosti zvolené autorom), vlastné `play=` prekrývajúce balíček a výberové atribúty nižšie. Jej použiteľnosť je koncová klauzula `when` v hlavičke.

| Atribút       | Popis                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------ |
| `when …`      | Podmienka, ktorá musí platiť, aby bola karta použiteľná                                   |
| `priority=`   | Karty s vyššou prioritou sa rozdávajú skôr (predvolene `0`)                               |
| `repeatable=` | `true` povoľuje opakované ťahanie, `false` je jednorazová karta (predvolené)              |
| `cooldown=`   | Najmenší počet ťahov, kým sa karta môže znovu objaviť                                     |
| `weight=`     | Relatívna pravdepodobnosť, keď je použiteľných viac kariet                                |
| `tags=`       | Kategorizácia na filtrovanie                                                              |
| `trigger=`    | Druh vstupu z reálneho sveta, ktorý kartu zobudí (pozri [Spúšťané karty](#triggered-storylets)) |
| `match=`      | Nepovinný regulárny výraz (bez ohľadu na veľkosť písmen), ktorému musí hodnota vstupu vyhovieť |

Tri atribúty niečo **robia**, nie opisujú:

| Atribút správania | Účinok                                                                                     |
| ----------------- | -------------------------------------------------------------------------------------------- |
| `role="king"`     | Ťahanie karty postaví čitateľa do tejto roly — takto sa priraďuje `context.group.role`      |
| `mandatory=true`  | Rozdá sa vždy, keď je použiteľná, bez ohľadu na strop `deal`                                 |
| `alone=true`      | Keď je použiteľná, rozdá sa sama a vytlačí z ruky všetky ostatné karty                       |

`when` je podmienka typu **kedykoľvek**, vyhodnocovaná v čase *výberu* — vždy, keď engine rozdáva, a nikdy medzitým. Balíček preto nikdy nespustí senzor: `when` čítajúce `context.location` sa zodpovie z polohy, ktorú platforma naposledy dodala, a ak polohu nikto nesleduje, odpoveď je `unknown` a karta jednoducho nie je použiteľná. Príbeh, ktorý chce, aby engine ďalej sledoval, píše [`{wait}`](03-narrative-interaction.md#waiting-for-a-condition) — to je sloveso *until* a spustí, čo potrebuje.

### Čo je na karte vytlačené {#card-face}

<Feature id="card-face" />

**Líce** karty je to, čo je na karte vytlačené; jej **telo** je to, čo sa zahrá, keď sa karta zahrá. Tri mince, ktoré vyzerajú rovnako a majú hodnotu 1, 2 a 5, sa líšia iba lícom.

```rea
{define card coin_gold deck="purse", image="assets/cards/coin.webp" begin}
  {face at="15%" begin}**Zlatá**{end face}
  {face at="60%" begin}hodnota **5**{end face}
  {earn gold=5}
  Vsunieš si mincu do dlane.
{end card}
```

`{face}` je blok, nie atribút, pretože jeho obsah je bohatý: tučné písmo, kurzíva, odkazy aj nápovedy fungujú cez ten istý riadkový parser ako próza. Hodnota atribútu nesúca markdown je pasca na úvodzovky.

| Atribút | Popis                                                                                                          |
| ------- | ------------------------------------------------------------------------------------------------------------- |
| `at=`   | Kde text sedí, ako percento **výšky** karty zhora, orezané na `0 %`–`100 %`. Ak chýba, zostane v predvolenom páse vykresľovača, pod obrázkom |

Karta môže deklarovať viac líc, každé s vlastným `at=`, pretože nadpis na 15 % a hodnota na 60 % sú jedna karta, nie dve. Zástupné symboly `{variable}` v líci sa vyhodnocujú voči živému stavu príbehu presne ako v `name` a `description`, takže `{face begin}{story.purse} zlata{end face}` je živé.

`{face}` mimo definície karty sa nahlási a zahodí a `at=`, ktoré nie je percento, sa nahlási a ignoruje — text sa aj tak vytlačí, v predvolenom páse.

### Ťahanie a zahranie {#drawing-and-playing}

<Feature id="draw-play" />

`{draw}` získava, `{play}` aktivuje.

```rea
{draw deck="basic"}               {comment vezmi kartu do Kapsy; zahrá sa neskôr}
{play deck="basic"}               {comment vyber kartu z balíčka a zahraj ju hneď}
{play card="king"}                {comment príbeh vynúti jednu konkrétnu kartu}
{return card="king"}              {comment vráť kartu do jej balíčka}
```

Oba príkazy majú blokovú formu pre chvíľu, ktorá potrebuje výzvu alebo náhradu:

```rea
{play deck="basic", deal=3, pick=1 begin}
  Trh sa rozprestrie. Čo si vezmeš?
  {empty begin}
    Stánky sú prázdne; sezóna sa skončila.
  {end empty}
{end play}
```

| Atribút príkazu | Význam                                     | Predvolené                      |
| --------------- | -------------------------------------------- | ------------------------------- |
| `deck` / `card` | Z čoho ťahať alebo ktorú kartu zahrať        | —                               |
| `count`         | Koľko kariet                                 | `1`                             |
| `deal`          | Koľko sa vyloží na výber                     | z balíčka, inak všetky použiteľné |
| `pick`          | Koľko si čitateľ vezme                       | `1`                             |
| `face`          | `up` (vyberá čitateľ) alebo `down` (náhodne) | z balíčka, inak `up`            |
| `optional`      | Smie si čitateľ nevziať nič                  | z balíčka, inak `false`         |

Ruka s `face="down"` sa zamieša a berie sa zvrchu: rozdanie, ktoré čitateľ nevidí, nie je voľba, takže sa nič nepredkladá. `{empty}` sa spustí, keď v balíčku nie je nič použiteľné — balíček sa musí dať vyčerpať a vyčerpaný balíček musí mať kam ísť.

`{return card="…"}` sa píše s atribútom, pretože `{return VÝRAZ}` sa už vracia z funkcie. Jedno sloveso, dve úlohy, a kartová forma je tá, ktorá pomenúva svoj predmet — presne ako `{draw}` a `{play}`.

### Čítanie stavu balíčka {#reading-deck-state}

```rea
{if drawn("king") begin}          {comment potiahol ju tento čitateľ}
  Stále cítiš ťarchu koruny.
{end if}

{if held("king") begin}           {comment má ju práve teraz v ruke}
  Karta je ešte teplá.
{end if}

Zostáva {story.deck.basic.remaining} zo {story.deck.basic.size} kariet.

{for part.card in eligible("basic") begin}   {comment ruka ako dáta, vyložená ručne}
  - {part.card}
{end for}
```

Počítadlo sa predvolene ukazuje, lebo skrytá veľkosť balíčka je práve to, čo čitatelia čítajú ako podvod. `eligible()` vráti zásobu bez rozdania, takže autor, ktorý chce rozloženie, aké vstavaná ruka nedáva, si karty vykreslí sám — výber zostáva engine, prezentácia zostáva autorovi.

### Karty v balíku {#cards-in-the-package}

Karta je text v Rea a súbor je len jedno z miest, kde môže žiť. Balík môže niesť adresár `deck/`, ktorého podadresáre sú balíčky a súbory `.rea` v nich sú karty:

```
project.reast
├── manifest.json
├── story/0001-the-silence.rea      ← usporiadané časti, bez zmeny
├── deck/roles/deck.rea             ← {define deck roles …}
├── deck/roles/king.rea             ← jedna karta na súbor
└── deck/basic/coin.rea
```

Manifest uvádza **adresáre na načítanie**, nie balíčky — `"decks": ["deck/roles", "deck/basic"]` — pretože čo balíček *je*, hovorí `{define deck}`, a balíček pomenovaný na oboch miestach by bol jednou vecou s dvoma zdrojmi pravdy. Súbor karty, ktorý nedeklaruje `deck=`, vstupuje do balíčka pomenovaného podľa svojho adresára, takže pridať kartu znamená pridať súbor a nikdy nie upraviť manifest. Karty napísané priamo v časti fungujú ďalej a jednoducho deklarujú `deck=`.

### Spúšťané karty {#triggered-storylets}

<Feature id="triggered-storylets" />

Kartu s `trigger=` a bez balíčka zobudí svet namiesto rozdania: takmer v ktorejkoľvek chvíli čítania môže vstup z reálneho sveta — naskenovanie QR nálepky na lavičke, vyslovená fráza, priloženie NFC štítka — prerušiť hlavný príbeh, zahrať kartu ako vedľajšiu cestu a vrátiť čitateľa presne tam, kde skončil:

```rea
{define card bench_secret trigger=scan, match="^REAST-BENCH-.*", weight=2 when story.act >= 2 begin}
  Kód na lavičke ožije. Hlas zašepká: „Našiel si ma."
  * [Nasleduj šepot]
    -> bench_alley
  * [Nevšímaj si to]
{end card}

{define card magic_word trigger=listen, match=abracadabra begin}
  Slovo zostane visieť vo vzduchu — a stena odpovie.
{end card}
```

- **`trigger=`** pomenúva druh vstupu. Množina je otvorená — čitateľská aplikácia rozhoduje, ktoré druhy fyzicky zachytí. Bežné druhy: `scan` (obsah QR/čiarového kódu), `listen` (rozpoznaný prepis reči), `text`, `vision`, `nfc`, `shake`, `location`
- **`match=`** je regulárny výraz bez ohľadu na veľkosť písmen, testovaný proti hodnote vstupu (obsah QR kódu, prepis). Vynechaj ho, ak stačí ľubovoľný vstup daného druhu
- **Karta v balíčku sa rozdáva, nikdy nezobúdza.** Balíček rozhoduje, kedy jeho karty vyjdú, takže `trigger=` patrí karte bez `deck=`
- **Výber** sa riadi bežnými pravidlami kariet: medzi kartami, ktorým sedí druh a `match=`, sa rešpektujú podmienky `when`, stav potiahnutia, `cooldown=` a `priority=`, a potom sa jedna vyberie váženým náhodným výberom. Jeden vstup zobudí presne jednu kartu
- **Vnútri tela** sprístupňujú `event.kind` a `event.value` spúšťací vstup podmienkam aj textu (sú viditeľné aj pre `when` počas výberu), takže naskenovaný obsah alebo vyslovené slová sa dajú citovať späť: `Na štítku stojí {event.value}.`

#### Prerušenie a návrat {#interruption-and-return}

Spúšťaná karta sa zahrá ako autorský tunel (`->->`): engine si zapamätá pozíciu v hlavnom príbehu — vrátane čakajúcej, nezodpovedanej skupiny možností — zahrá kartu a obnoví hlavný príbeh presne tam, kde bol, keď karta skončí (posledným riadkom alebo výslovnou odbočkou von). Zmeny stavu vnútri (`{set}`, `{give}`, mince) pretrvajú do hlavného príbehu. Uloženie počas karty sa obnoví do karty aj s návratovou pozíciou. Nový spúšťač sa ignoruje, kým beží iná spúšťaná karta — vedľajšie cesty sa nikdy nevnárajú.

Keď vstup nezodpovedá ničomu — žiadna použiteľná karta, žiadna čakajúca možnosť [prieskumnej ponuky](/sk/spec/03-narrative-interaction#exploration-menus) — čitateľská aplikácia dá jemnú spätnú väzbu („to zatiaľ nič neurobilo") namiesto chyby, takže skenovať náhodné kódy je vždy bezpečné. Keď na ten istý vstup môže odpovedať aj čakajúca prieskumná ponuka aj spúšťaná karta, vyhráva ponuka — pozri [Priorita pri spúšťačoch storyletov](/sk/spec/03-narrative-interaction#priority-with-storylet-triggers).

#### Ohradenie prerušení {#fencing-interruptions}

Niektoré úseky príbehu sa nesmú prerušiť — filmová scéna, odpočítavanie, výjav, ktorého podstatou je načasovanie. `{triggers off}` ohradu zatvorí, `{triggers on}` ju znova otvorí:

```rea
* [Otvor dvere]
  {triggers off}
  Chodba pohltí zvuk za tebou. Nič, čo teraz urobíš, nikto nepočuje.

- Chodba sa končí.

* [Vyjdi von]
  {triggers on}
  Hluk mesta sa vráti naraz.
```

Kým je ohrada zatvorená, vstup z reálneho sveta nezobudí nič a karta, ktorú čitateľ zahrá z tašky, je odmietnutá. Je to zámerne jedno pravidlo, nie dve: spúšťaná karta a karta zahraná z tašky sú ten istý čin — niečo vstupuje do príbehu medzi dvoma jeho vlastnými krokmi — takže autor ohradí oboje jedným riadkom. Súčasťou toho istého pravidla je aj bežiace prerušenie: vedľajšie cesty sa nikdy nevnárajú, nech ohrada hovorí čokoľvek.

Ohrada putuje s uložením. Uloženie spravené v ohradenom úseku sa v ňom aj obnoví a uloženie spravené pred ním sa doň nikdy nevráti.

## Pozri aj {#see-also}

- [Udalosti kariet](/sk/spec/03-narrative-interaction#event-handlers) — čo karta robí, keď je získaná, stratená alebo použitá, napísané ako plochá obsluha `{on}`.
- [Priorita pri spúšťačoch storyletov](/sk/spec/03-narrative-interaction#priority-with-storylet-triggers) — arbitráž medzi čakajúcou prieskumnou ponukou a spúšťačom karty pre ten istý vstup, v časti Prieskumné ponuky.
- [Priorita: prieskumné ponuky vs. spúšťače storyletov](/sk/spec/03-narrative-interaction#priority-exploration-menus-vs-storylet-triggers) — to isté pravidlo arbitráže, zopakované v časti Interakcie s reálnym svetom.
