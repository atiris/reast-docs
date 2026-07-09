# Špecifikácia jazyka Rea — Časť 5: Referencia (Sekcie 28–31)

> [Späť na hlavnú špecifikáciu](/sk/)
>
> **Stav implementácie:** Formát súboru a balenie (28) sú plne implementované. Pozrite [REA-CHEATSHEET.md](REA-CHEATSHEET.md) pre podrobný stav.

---

## 28. Formát súboru a balenie

### Súbor `.rea`

Čistý textový súbor obsahujúci obsah príbehu. Kódovanie UTF-8. Žiadne metadáta — iba naratívny obsah.

### Balík `.reast`

ZIP archív. Čitateľ akceptuje dve rozloženia.

**S manifestom** — `manifest.json` v koreni nesie všetky metadáta a usporiadaný
zoznam `parts`; súbory príbehu sú v `story/`, médiá v `assets/`:

```text
my-story.reast (ZIP)
├── manifest.json       (manifest — metadáta, usporiadané časti)
├── reast.json          (voliteľný — nastavenia session / premenné)
├── README.md           (voliteľný — pre GitHub verzionovanie)
├── META-REA/
│   ├── checksum.sha256
│   ├── signature.sig   (voliteľný, Ed25519)
│   └── author.pub      (voliteľný)
├── story/
│   ├── part-00001.rea  (vstupná časť — prvá v manifest.parts)
│   ├── part-00002.rea  (druhá časť)
│   └── ...
└── assets/
    ├── cover.webp
    ├── forest.webp
    └── theme.ogg
```

**Plochý** — bez `manifest.json`. Všetky `.rea` aj mediálne súbory sú v koreni;
vstup je abecedne prvý `*.rea`. Plochý balíček nenesie žiadne metadáta — keď je
potrebný názov, autor, štítky, obálka, odkazy či poradie častí, použite
rozloženie s manifestom:

```text
quick.reast (ZIP)
├── story.rea           (vstup — abecedne prvý .rea)
└── cover.jpg
```

`reast.json`, ak je prítomný, sú voliteľné nastavenia session — nikdy nie
manifest.

### Manifest `manifest.json`

```json
{
  "rea": "1.0",
  "manifest": "1.0",
  "type": "story",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Môj príbeh",
  "intro": "Ráno prišlo v tichu — žiadne vtáky, žiadny vietor.",
  "cover": "assets/cover.webp",
  "authors": [{ "name": "Meno autora" }],
  "language": "sk",
  "genre": ["fantasy", "adventure"],
  "parts": [
    { "file": "story/part-00001.rea", "name": "Úvod" },
    { "file": "story/part-00002.rea", "name": "Druhá kapitola" }
  ],
  "assets": ["assets/cover.webp", { "file": "assets/theme.mp3", "name": "Hlavná téma" }],
  "sensors": [],
  "allowed_urls": []
}
```

### Povinné polia manifestu

| Pole       | Typ    | Popis                                       |
| ---------- | ------ | ------------------------------------------- |
| `rea`      | string | Verzia jazyka Rea (aktuálne "1.0")          |
| `manifest` | string | Verzia schémy manifestu (aktuálne "1.0")    |
| `type`     | string | "story" (predvolené) alebo "instruction"    |
| `id`       | string | UUID identifikátor diela                    |
| `title`    | string | Názov príbehu                               |
| `authors`  | array  | Zoznam autorov `{name, id?}` — `name` je voľný text, voliteľné `id` je autorov slug na rea.st (odkaz na profilovú stránku) |
| `language` | string | BCP 47 kód jazyka                           |
| `parts`    | array  | Zoznam častí `{file, name}` v poradí        |

### Voliteľné polia manifestu

| Pole           | Typ      | Popis                                       |
| -------------- | -------- | ------------------------------------------- |
| `genre`        | string[] | Zoznam žánrov                               |
| `description`  | string   | Krátky popis príbehu (max 500 znakov)       |
| `intro`        | string   | Úvodný text na obálke príbehu               |
| `cover`        | string   | Cesta k obálke, napr. `assets/cover.webp`   |
| `visibility`   | string   | "private" / "unlisted" / "public"           |
| `tier`         | string   | "basic" / "premium" / "paid" / "commercial" |
| `version`      | string   | Semver verzia obsahu                        |
| `audience`     | object   | `{min, max}` vekový rozsah                  |
| `assets`       | array    | Médiá v `assets/`: každá položka je holá cesta (`"assets/gate.webp"`) alebo `{ "file": "assets/theme.mp3", "name": "Hlavná téma" }` — loader normalizuje holý reťazec na `{ file }`; chýbajúce `name` znamená bez zobrazovaného názvu |
| `sensors`      | string[] | Vyžadované hardvérové senzory               |
| `duration`     | number   | Odhadovaný čas čítania v minútach           |
| `allowed_urls` | array    | `{alias, url}` povolené externé URL         |
| `extensions`   | string[] | Poradie načítania `.rext` — iba metadáta; prítomnosť súboru modul neaktivuje |
| `requires`     | string[] | Menné priestory hostiteľských rozšírení, ktoré príbeh vyžaduje |
| `cooperative`  | boolean  | Podpora pre kooperatívne čítanie            |
| `season`       | string   | Sezóna v rámci série                        |
| `series`       | string   | Názov série                                 |
| `tags`         | string[] | Vyhľadávacie tagy                           |
| `instruction`  | string   | Pre `story`: prepojený `instruction` reast  |
| `stories`      | string[] | Pre `instruction`: pokryté `story` reasty   |

### Inštrukčné reasty

`story` reast môže mať sprievodný **inštrukčný reast** (`type: "instruction"`) —
samostatný reast, ktorý vysvetľuje, ako pripraviť a viesť príbeh pre moderátora.
Inštrukčný reast má vlastný `manifest.json`, časti aj médiá a číta sa ako každý
iný reast, no nikdy sa nezobrazuje v zoznamoch katalógu — dá sa otvoriť len z
príbehu, ku ktorému patrí.

Oba reasty sa odkazujú navzájom: `story` deklaruje svoj jediný inštrukčný reast
cez `instruction`, `instruction` uvádza pokryté príbehy cez `stories`. Príbeh má
najviac jednu inštrukciu, no jedna inštrukcia môže pokrývať viac príbehov série.
Keď má príbeh inštrukčný reast, čítačka ho označí a ponúkne akciu „Otvoriť
inštrukčný reast".

### Rozšírenia (`.rext`)

Súbor `.rext` je Rea **rozširujúci modul** — Rea kód obsahujúci iba deklarácie
(funkcie, konštanty `{set}` na najvyššej úrovni, `{use}` a komentáre; žiadna
próza). Podľa konvencie rozšírenia sídlia v priečinku `extensions/` v archíve.

`.rext` sa **nikdy** nestane vstupným príbehom: rozlišovač vstupu berie do úvahy
iba súbory `.rea`. Každý `.rext` v archíve sa napriek tomu pri načítaní
skompiluje a overí — ešte pred spustením akejkoľvek prózy —, takže pokazené
rozšírenie zlyhá pri publikovaní, nie na zariadení čitateľa. Samotná prítomnosť
`.rext` v archíve ho neaktivuje; viaže ho až `{use}` (pozri
[Rozšíriteľnosť](#31-extensibility)).

Rozšírení sa týkajú dva voliteľné kľúče manifestu:

- **`extensions`** — usporiadané pole ciest k `.rext` relatívnych voči archívu.
  Sú to **iba metadáta**: určujú poradie načítania, keď na ňom záleží. Kľúč
  nikdy modul neaktivuje — iba usporiada tie, ktoré sa aj tak skompilujú. Cesta
  uvedená v zozname, ktorá nie je v archíve, spôsobí zlyhanie načítania.
- **`requires`** — menné priestory hostiteľských (JavaScript) rozšírení, od
  ktorých príbeh závisí. Embedder, ktorý taký menný priestor nezaregistroval,
  odmietne príbeh načítať, namiesto toho, aby uprostred kapitoly odpovedal zle.

---

## 29. Bezpečnostný model

### Sandbox

Player vykonáva Rea príbehy v izolovanom sandboxe:

- Žiadny prístup k súborovému systému hostiteľa
- Žiadne sieťové požiadavky okrem deklarovaných v `allowed_urls`
- Limit pamäte a výpočtového času
- Žiadne spúšťanie natívneho kódu

### Validácia

Parser validuje:

- Veľkosť súboru (max 50 MB pre `.reast`)
- Počet súborov v archíve (max 500)
- Hĺbka vnorenia (max 100 úrovní)
- Počet iterácií cyklov (max 1000)
- Cesty súborov (žiadna traversácia)

---

## 30. Vstavané funkcie

### Matematické

| Funkcia           | Popis                        |
| ----------------- | ---------------------------- |
| `min(a,b)`        | Minimum dvoch hodnôt         |
| `max(a,b)`        | Maximum dvoch hodnôt         |
| `abs(n)`          | Absolútna hodnota            |
| `round(n)`        | Zaokrúhlenie                 |
| `floor(n)`        | Zaokrúhlenie nadol           |
| `ceil(n)`         | Zaokrúhlenie nahor           |
| `random()`        | Náhodné číslo 0–1            |
| `random(min,max)` | Náhodné celé číslo v rozsahu |

### Reťazcové

| Funkcia           | Popis                   |
| ----------------- | ----------------------- |
| `len(s)`          | Dĺžka reťazca           |
| `upper(s)`        | Prevod na veľké písmená |
| `lower(s)`        | Prevod na malé písmená  |
| `trim(s)`         | Orezanie bielych znakov |
| `contains(s,sub)` | Obsahuje podreťazec?    |
| `replace(s,a,b)`  | Nahradenie podreťazca   |
| `split(s,delim)`  | Rozdelenie na pole      |

### Typové

| Funkcia     | Popis                   |
| ----------- | ----------------------- |
| `type(val)` | Typ hodnoty ako reťazec |
| `number(s)` | Prevod na číslo         |
| `string(n)` | Prevod na reťazec       |
| `bool(val)` | Prevod na boolean       |

### Poľové

| Funkcia           | Popis               |
| ----------------- | ------------------- |
| `len(arr)`        | Počet prvkov        |
| `push(arr,item)`  | Pridanie na koniec  |
| `pop(arr)`        | Odstránenie z konca |
| `includes(arr,v)` | Obsahuje prvok?     |
| `join(arr,sep)`   | Spojenie do reťazca |
| `sort(arr)`       | Zoradenie           |
| `reverse(arr)`    | Obrátenie poradia   |
| `slice(arr,s,e)`  | Výrez poľa          |

### Lokalizačné a dátumové

| Funkcia                             | Popis                                                                       |
| ----------------------------------- | --------------------------------------------------------------------------- |
| `plural(n, one=, other=, ...)`      | CLDR pluralizácia; kategória z `Intl.PluralRules` pre locale hostiteľa       |
| `select(val, k1=v1, k2=v2)`         | Výber podľa hodnoty                                                          |
| `ordinal(n)`                        | Radová číslovka; anglická prípona iba pre `en*`, inak číslo podľa locale     |
| `formatNumber(value, locale?, ...)` | Formátovanie čísla podľa locale (predvolene locale enginu)                   |
| `formatDate(value, style?)`         | Formát dátumu; `style ∈ iso \| short \| medium \| long \| full`              |
| `formatTime(value, style?)`         | Formát času dňa (rovnaké štýly)                                              |
| `formatDateTime(value, style?)`     | Formát dátumu a času (rovnaké štýly)                                         |

> Kategórie množného čísla a radových čísloviek pochádzajú z CLDR cez `Intl`,
> riadené **locale dodaným hostiteľom** — nie z tabuľky zabudovanej v engine.
> Starý tokenový formát dátumu `YYYY-MM-DD` zanikol; celý povrch tvorí enum
> `style`. `calendar()` je špecifikovaný, ale zatiaľ neimplementovaný.

---

## 31. Rozšíriteľnosť

Rea sa rozširuje v dvoch úrovniach. **Úroveň 1 — Rea rozšírenia** sú prenosný,
sandboxovaný Rea kód cestujúci v balíku (súbory `.rext`) plus vyhradená
štandardná knižnica `std/*` dodaná so samotným jazykom. **Úroveň 2 — hostiteľské
rozšírenia** sú JavaScript dodaný embedderom; sú mimo samotného jazyka Rea a
dostupné len vtedy, keď ich embedder poskytne.

### Úroveň 1 — Rea rozšírenia (autorský priestor, prenosné, v sandboxe)

Rea rozšírenie je súbor `.rext` (pozri [Rozšírenia](#extension-modules-rext))
obsahujúci iba **deklarácie**: bloky `{function}`…`{end function}`, konštanty
`{set}` na najvyššej úrovni, `{use}` a komentáre. Akýkoľvek prozaický uzol
kdekoľvek v `.rext` je **chyba načítania**. Práve toto obmedzenie robí
rozšírenie preskúmateľným okom aj mechanicky overiteľným.

Rozšírenie sa importuje cez `{use}` s aliasom (zapísaná cesta vynecháva príponu
`.rext`); jeho exportované funkcie sa potom volajú cez alias:

```rea
{use "extensions/inventory" as inv}

Tvoj batoh váži {inv.total_weight()} kg.
```

Pravidlá:

- Cesta `{use}` sa rozlišuje **iba v rámci balíka** — nikdy nie v súborovom
  systéme ani na sieti.
- **Graf `{use}` musí byť acyklický** — cyklus spôsobí zlyhanie načítania.
- **Duplicitné exportované názvy sú chyba**, nie „vyhráva prvý".
- **`{use}` chýbajúcej cesty zlyhá pri načítaní.**

Súbory príbehu (`.rea`) môžu tiež deklarovať `{function}`, ale tie sú **súkromné a
viazané na dokument** — exportujú iba rozširujúce súbory. Ak chcete funkciu
zdieľať medzi časťami, dajte ju do `.rext` a použite `{use}`.

### `std/*` — štandardná knižnica

`std/*` je vyhradený menný priestor riešený **vnútri enginu**, nie z archívu ani
od hostiteľa. `{use "std/dice" as dice}` preto funguje na ľubovoľnom hostiteľovi,
offline, bez podpory embeddera — dodáva sa priamo s jazykom, nie je vstreknutý
platformou. `std/dice` exportuje:

| Funkcia               | Popis                                        |
| --------------------- | -------------------------------------------- |
| `d(sides)`            | Hod jednou kockou s daným počtom stien       |
| `roll(count, sides)`  | Súčet `count` kociek so `sides` stenami      |
| `advantage(sides)`    | Hoď dvomi kockami, ponechaj vyššiu           |
| `disadvantage(sides)` | Hoď dvomi kockami, ponechaj nižšiu           |

```rea
{use "std/dice" as dice}

Divoko sa oháňaš a spôsobíš {dice.roll(2, 6)} zranenia.
```

### Úroveň 2 — hostiteľské rozšírenia (JavaScript, dodané embedderom)

Hostiteľské rozšírenia sú JavaScript registrovaný embedderom **na inštanciu**
elementu (na jeden engine element), nikdy globálne. Dvaja čitatelia na jednej
stránke môžu mať odlišné hostiteľské rozšírenia. Prispievajú:

- **Funkciami** volateľnými z Rea výrazov ako `{ns.fn()}`.
- **Príkazmi** pre menné priestory `{ns.command args}`. Príkaz **vyžaduje
  argumenty**: samotné `{ns.name}` bez argumentov je bodkovaná premenná, nie
  príkaz.
- **Renderermi uzlov**, ktoré **nahradia** vstavané vykreslenie typu uzla, nielen
  ho zakážu.

Tvrdé pravidlo: hostiteľské rozšírenie, ktoré potrebuje zariadenie, **emituje
event** — engine nikdy nevolá zariadenie zaň.

Príbeh deklaruje potrebné hostiteľské menné priestory cez
[`manifest.requires`](#extension-modules-rext); embedder, ktorý požadovaný menný
priestor nezaregistroval, odmietne príbeh načítať, namiesto toho, aby zlyhal
uprostred kapitoly.

### Vlastné typy kariet

> **Stav implementácie:** Neimplementované. Syntax vlastného typu karty
> `{define card_type}` nižšie je špecifikovaná, ale zatiaľ nie je postavená.

Rozšírenia môžu v budúcnosti definovať nové typy kariet nad rámec vstavaných `@`,
`$`, `&`:

```rea
{define card_type location, prefix="📍" begin}
  color: #4a7c59
  icon: pin
{end define}
```

### Šifrovanie kódu rozšírenia

**Kód rozšírenia sa nikdy nešifruje.** Loader odmietne zašifrovaný `.rext`.
Šifrovanie je ochrana obsahu, nie bezpečnostná hranica — sandbox obmedzuje
rozšírenie rovnako tak či tak —, takže zákaz nič nestojí a získava tri veci:

1. **Overenie pred spustením prózy.** Odomykací kód môže prísť uprostred príbehu;
   kód, ktorý sa zhmotní, až keď je čitateľ zaviazaný, by zlyhal v najhoršej
   možnej chvíli. Rozšírenia v čistom texte sa pri načítaní skompilujú a overia.
2. **Auditovateľnosť bez kľúča** — cez `reast validate`, editor aj moderáciu
   platformy.
3. **Spustiteľnosť cudzím embedderom**, ktorý nemá kľúč.

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

{input name=attempt, placeholder="Vysloviť heslo"}
{if unlocked(attempt, crypt.passphrase) begin}
  Brána sa otvára.
{end if}
```

Upozornenie, povedané naplno: zašifrovaná `.rea` **nie je** tajomstvom pred
odhodlaným čitateľom. Kľúč sa musí dostať na jeho zariadenie, aby sa kapitola
vykreslila, takže `crypt.passphrase` je extrahovateľná. Chráni pred spoilermi,
náhodným nazretím a prehľadávaním archívu — nie pred motivovaným útočníkom.
Čokoľvek, čo musí byť skutočne nefalšovateľné (súťažná odpoveď, platené
odomknutie), sa overuje **na serveri**, a to je úloha platformy, nie enginu.

### Obmedzenia sandboxu

Rea rozšírenia bežia v tom istom sandboxe ako bežný Rea kód:

- Žiadny prístup k súborovému systému nad rámec balíka
- Žiadne sieťové požiadavky (iba deklarované platformové API)
- Žiadne spúšťanie ľubovoľného kódu — príbeh nemôže vložiť JavaScript ani iný
  jazyk; Rea rozšírenie je Rea v sandboxe a hostiteľské rozšírenie je vlastný kód
  embeddera, nikdy nevložený príbehom
- Limity pamäte a výpočtu vynucuje runtime — napr. hĺbka rekurzie obmedzuje
  `roll` v `std/dice` na 64 kociek
- Kód rozšírenia sa nikdy nešifruje (pozri vyššie), takže zostáva auditovateľný

---
