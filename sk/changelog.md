# Changelog

## v1.1.0 (aktuálna)

### Podmienky: jeden jazyk, tri režimy

- **`{wait EXPR begin} … {end wait}` teraz blokuje.** Príbeh sa zastaví, kým sa výraz nestane pravdivým; telo je to, čo čitateľ vidí počas čakania, a príbeh pokračuje za `{end wait}`. `escape=` sa po uplynutí trvania vzdá a `escape_to=` pošle čitateľa na kotvu. Holé `{wait begin}` ostáva nezmenené — je to pauza, nie brána.
- **`{waypoint}` je podobou `{wait}`.** `{waypoint name, AREA, require=EXPR}` je `{wait context.location matches AREA and EXPR}` plus metaúdaje mapy, takže `hint=` je jej text počas čakania a telo je obsah po príchode. Po prvý raz má behové prostredie na strane čitateľa.
- **Podstromy `context.` sú zdroje s vlastnou kadenciou.** Čas je odvodený a zobudí sa presne raz na najbližšej hranici, ktorú podmienka vie zbadať; poloha je prúd s doručovaním; počasie je jedno zdieľané dopytovanie s obmedzenou frekvenciou. Zdroj sa spustí, keď naň začne čakať prvá podmienka, a zastaví sa, keď odíde posledná — obrazovka súhlasu sa preto počíta z príbehu, nie sa preberá z jeho manifestu.
- **Podmienka môže byť `unknown`**, keď je zdroj, ktorý číta, zamietnutý alebo nedostupný. Čakanie čaká ďalej; `{if}` ho berie ako nepravdu, a práve preto `link/context-no-fallback` pýta od autora `{else}`.
- **Termíny sú absolútne a zmeškané okno sa ráta.** Príbeh zavretý na lavičke a otvorený o tri hodiny neskôr sa obnoví so správnou odpoveďou a množina čakajúcich podmienok cestuje v stave čítania (schéma v3; staršie uloženia sa obnovia bez čakajúcich podmienok). Obnovenie navýše prehrá okamihy, ktoré príbeh prespal, takže `{wait context.time.hour = 22}` sa spustí čitateľovi, ktorý bol preč od deviatej do pol dvanástej, namiesto čakania ďalší deň.
- **Čítanie nezávisí od žiadneho servera.** O čakaní rozhoduje zariadenie, podľa vlastných hodín a stavu, ktorý už drží; o tom, na čo ktorý čitateľ čaká, sa nikde inde nič neukladá ani nevyhodnocuje. Cena je povedená nahlas, nie zamlčaná: čitateľ nedostane upozornenie, kým je príbeh zatvorený, a `escape=` je poistkou pre toho, kto sa už nevráti.

### Prichádzajú `{zone}` a `{route}`

- **`{zone ID, AREA begin}`** je forma `kedykoľvek` bloku wait a odteraz beží. `{on enter}` / `{on exit}` sú bežné prechody — nesú stráž ako každá iná hrana — a blok vykreslí obsah hrany, ktorú čitateľ naposledy prekročil, na mieste samotného bloku. Príkazy hrany sa vykonajú pri jej spustení a `story.<zóna>.inside` sa dá čítať kdekoľvek.
- **`{route ID[, sequential] begin}`** pomenúva zastávky deklarované inde a ukáže svoj riadok `complete:` tam, kde stojí blok, keď sú hotové všetky etapy. Postup (`story.<trasa>.done` / `.total` / `.complete`) sa odvodzuje z týchto zastávok, nevedie sa osobitne, takže uloženie s ním nikdy nemôže nesúhlasiť. Etapa bez zastávky je `link/unknown-route-waypoint`.

### Nové funkcie

- `duration("PT30M")` — trvanie ISO 8601 v milisekundách
- `between(time, from, to)` — rozsah denného času vrátane rozsahu cez polnoc
- `elapsed(timestamp)` — milisekundy od okamihu, podľa hodín hostiteľa
- `within(point, area)` / `within(point, "nazov_zastavky")` — obsiahnutie, s opätovným použitím vlastnej oblasti pomenovanej zastávky

### Nové diagnostiky

- `link/wait-no-escape` — pravidlo úniku, rozšírené zo zastávok na každú čakajúcu podmienku
- `link/unknown-context-source` — podmienka čítajúca podstrom `context.`, aký neposkytuje žiadna platforma
- `link/context-no-fallback` — brána v režime **teraz** nad zdrojom reálneho sveta bez `{else}`

### Opravy

- Uložený výsledok podmienky prežil cestu výsledkov zo senzora, takže poloha, ktorá dorazila po prvom vyhodnotení brány, nechala tú bránu po zvyšok čítania čítať `false`.
- `context.location` sa nikdy nezapisovala ako bod, iba ako jej zložky — takže `context.location matches circle(…)`, porovnanie, ktoré robí každá zastávka, testovalo nedefinovanú ľavú stranu.
- Stráž `when` stavového automatu bola neviditeľná pre každý statický prechod: premenná, ktorú stráž zjavne čítala, sa hlásila ako nepoužitá.

## v1.0.0

Prvé vydanie jazyka Rea a `@reast/engine`.

### Jazyk

- Kompletná špecifikácia Rea: základy, logika a dáta, naratív a interakcia, utility a referencia — plus [index funkcií](/sk/spec/features), ktorý na jednom mieste uvádza zrelosť každej funkcie.
- **Prozaické jadro je stabilné a zmrazené**: odseky, kurzíva a tučné, podčiarknutie, prečiarknutie a neproporcionálne písmo, bloky kódu, nadpisy a ich kotvy, zarovnanie a odsadenie, citácie, vodorovné čiary, odkazy, vlastné kotvy, vložené médiá, poznámky pod čiarou a postupné nápovedy. Zmeniť čokoľvek z toho môže len nová verzia MAJOR.
- Príkazy, premenné, výrazy, riadenie toku, funkcie, voľby, storylety, karty, peňaženka mincí, rozšírenia `.rext` a lokalizačné vstavané funkcie vychádzajú ako **experimental** — vydané a použiteľné, so syntaxou otvorenou úpravám v rámci 1.x.
- Funkcie, ktoré sú zdokumentované, ale zatiaľ nedostupné, nesú značku `development` alebo `draft`. Sú špecifikované preto, aby sa okolo nich dal príbeh navrhnúť, nie preto, aby sa proti nim dal vydať.

### Jadro

- Parser: lexer, blokový parser, inline parser, dodatočné spracovanie, analyzátor
- Runtime: interpreter, vyhodnocovač výrazov, správca stavu, navigátor toku, seedovaný generátor náhodných čísel
- Zavádzač: rozbalenie ZIP, dešifrovanie AES, parsovanie manifestu, mapovanie médií, import z GitHub repozitára
- Prehrávač: vlastný prvok `<reast-engine>` so Shadow DOM
- Validátor: overenie štruktúry príbehu s varovaniami
- Vstavané funkcie: kategórie pre reťazce, matematiku, polia, typy, dátum a lokál, plus štandardná knižnica `std/*`
- Bezpečnosť: zoznam povolených URI schém, ochrana pred prechodom cez cesty, čistenie názvov premenných
- Prístupnosť: živé oblasti ARIA, správa zamerania, sémantické vykresľovanie HTML
- Predvoľby čitateľa: písmo, veľkosť, výška riadku, téma (svetlá, sépiová, tmavá, AMOLED)
- Uloženie a obnovenie pozície čítania s vyraďovaním najdlhšie nepoužitých

### Politika verzií

Jazyk sa riadi verziovaním **MAJOR.MINOR**. Zvýšenie MAJOR môže znehodnotiť existujúce príbehy; zvýšenie MINOR len pridáva. Príbeh deklaruje verziu, na ktorú mieri, poľom `rea` vo svojom manifeste, a parser musí odmietnuť vyššiu verziu MAJOR, než akú podporuje, kým nižšiu verziu MINOR prijme elegantne. Pozri [Verziovanie špecifikácie](/sk/spec/05-reference#spec-versioning).

Skôr publikované príbehy zostávajú čitateľné aj v novších verziách jadra. Prepínač verzií dokumentácie v pätičke uvádza každé zverejnené vydanie; každé staršie je zmrazenou snímkou stránky v podobe, v akej bola pri danej verzii.
