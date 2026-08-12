# Changelog

## v1.0.0 (aktuálna)

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
