# Špecifikácia jazyka Rea — Časť 5: Referencia (Sekcie 28–31)

> [Späť na hlavnú špecifikáciu](/sk/)
>
> **Stav implementácie:** Formát súboru a balenie (28) sú plne implementované. Pozrite [REA-CHEATSHEET.md](REA-CHEATSHEET.md) pre podrobný stav.

---

## 28. Formát súboru a balenie

### Súbor `.rea`

Čistý textový súbor obsahujúci obsah príbehu. Kódovanie UTF-8. Žiadne metadáta — iba naratívny obsah.

### Balík `.reast`

Súbor `.reast` je ZIP archív (podobne ako EPUB), ktorý spája jednu alebo viac
častí spolu s ich médiami a metadátami, v rozložení s manifestom alebo v
plochom rozložení. Rozloženie archívu na disku, celá schéma `manifest.json`,
import z GitHub repozitára, lišta záložiek čitateľa, nastavenia relácie
(`reast.json`), progresívne načítavanie, delta aktualizácie, podpisovanie
balíčkov, minifikácia a viacdielny stav čítania sú plne zdokumentované v
[referencii formátu balíčka `.reast`](/engine/package-format) enginu — táto
sekcia pokrýva iba jazykové pravidlá, ktoré z tohto formátu vyplývajú.

Jazykové pravidlá špecifické pre rozširovacie moduly `.rext` (ktoré
konštrukcie sú vnútri platné, a prečo je na ich naviazanie potrebný `{use}`)
nájdete v [Kde sa pravidlá líšia v `.rext` súboroch](rext-differences).

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

**Náhodnosť je zaseedovaná a čítanie sa dá prehrať znova.** `random()`,
`shuffle()` a všetko, čo na nich stojí (vrátane `std/dice`), čerpá z generátora,
ktorý vlastní runtime, nie z globálneho zdroja hostiteľa. Príbeh si pri štarte
vylosuje seed; stav čítania nesie tento seed aj aktuálnu pozíciu generátora,
takže obnovenie záznamu pokračuje v tej istej postupnosti a vrátenie voľby
zopakuje hody, ktoré po nej nasledovali. Reštart príbehu si vylosuje nový seed —
opakované čítanie je naozaj nové hranie.

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

Rea rozšírenie je súbor `.rext` (pozri [Kde sa pravidlá líšia v `.rext` súboroch](rext-differences))
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
[`manifest.requires`](/engine/package-format#field-reference); embedder, ktorý požadovaný menný
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
