# Formát balíčka `.reast`

Súbor `.reast` je štandardný **ZIP archív**, ktorý spája jeden alebo viac Rea
príbehov spolu s ich médiami a metadátami. Je to distribuovateľná, sebestačná
jednotka, ktorú prehrávač načíta na vykreslenie interaktívneho príbehu aj
offline.

Táto stránka popisuje rozloženie na disku a schému `manifest.json`, aby tretie
strany mohli vytvárať vlastné baličky, validátory či alternatívne prehrávače bez
nutnosti čítať zdrojový kód enginu.

## Rozloženia archívu

Čitateľ akceptuje presne dve rozloženia:

### S manifestom

`manifest.json` v koreni archívu nesie všetky metadáta a usporiadaný zoznam
častí príbehu. Súbory príbehu sú v `story/`; médiá (obálky, obrázky, zvuk, video)
sú v `assets/`, odkazované cestou relatívnou k archívu.

```text
my-story.reast              (ZIP kontajner)
├── manifest.json           metadáta + usporiadané časti + schopnosti
├── reast.json              voliteľné nastavenia relácie / prednastavené premenné
├── story/
│   ├── 0001-prva-cast.rea  vstupná časť (prvá v manifest.parts)
│   └── 0002-druha-cast.rea ďalšie časti (v poradí podľa manifestu)
├── extensions/             voliteľné Rea rozširovacie moduly (.rext)
│   ├── inventory.rext
│   └── dice_tables.rext
└── assets/
    ├── cover.webp
    ├── scene.webp
    └── theme.mp3
```

Rozširovacie moduly (`.rext`) sú iba deklaratívny Rea kód, ktorý autor `{use}`
z príbehu — pozri [Rozširovanie](extending). Podľa konvencie žijú v
`extensions/`. Ich prítomnosť ich nikdy neaktivuje (viaže ich až `{use}`) a
**`.rext` nikdy nemôže byť vstupným príbehom**.

### Plochý

Bez `manifest.json`. Všetky `.rea` aj mediálne súbory sú v koreni archívu.
Vstupný príbeh je **abecedne prvý** `*.rea` súbor. Plochý balíček nenesie žiadne
metadáta (žiadny názov, autor, štítky, žáner, obálka, odkazy…) — keď je čokoľvek
z toho potrebné, použite rozloženie s manifestom.

```text
quick.reast                 (ZIP kontajner)
├── story.rea               vstupný príbeh (abecedne prvý .rea)
├── cover.webp
└── theme.mp3
```

Každý jazykový preklad je **samostatný** archív `.reast` — preklady sa nikdy
nebalia dohromady. Neexistuje priečinok `lib/` ani `plugins/`; opakovane
použiteľná logika ide do rozširovacích modulov `.rext` pod `extensions/` (pozri
[Rozširovanie](extending)) a funkcie závislé od senzora sa načítavajú podmienene
podľa poľa manifestu `sensors`.

### Importovanie z verejného GitHub repozitára

Balíček môže tiež žiť nezabalený vo verejnom GitHub repozitári: koreň
repozitára funguje ako koreň balíčka (`manifest.json`, `story/`, voliteľný
`README.md`). Platforma prijme URL repozitára a načíta ho, akoby to bol súbor
`.reast`:

```text
https://github.com/<owner>/<repo>            → predvolená vetva
https://github.com/<owner>/<repo>/tree/<ref> → konkrétna vetva, tag alebo commit
```

Loader stiahne ZIP archív repozitára z
`https://api.github.com/repos/<owner>/<repo>/zipball[/<ref>]`, odstráni jediný
obalový priečinok, ktorý GitHub pridáva ku každej položke, a výsledné súbory
posunie cez bežný pipeline pre balíčky. Prijímajú sa iba URL `github.com` cez
HTTPS — zoznam povolených hostiteľov chráni loader pred presmerovaním na
ľubovoľné interné endpointy (SSRF) — a archív stále podlieha limitom
extraktora na veľkosť, počet položiek a path traversal. Bežné Git tagy a
vetvy sa prirodzene stávajú mechanizmom verzionovania pre príbehy hostené na
GitHube, pričom `README.md` sa vykreslí na stránke repozitára.

Pravidlá, ktoré kompatibilný čitateľ vynucuje:

- Kontajner je ZIP súbor. Dekompresia je z bezpečnostných dôvodov obmedzená:
  **max. 50 MB rozbalených, max. 500 položiek**, a každá položka, ktorej cesta
  uniká mimo koreňa archívu (path traversal), je odmietnutá.
- **Vstupný príbeh** je prvá položka v `manifest.parts` (s manifestom) alebo
  abecedne prvý `*.rea` súbor (plochý). Rozširovací modul `.rext` nikdy nie je
  spôsobilý ako vstupný. V balíčku s manifestom sa časti načítajú v poradí
  uvedenom v `manifest.parts`.
- Médiá sa z príbehu odkazujú cestou relatívnou k archívu a pri načítaní sa
  mapujú na blob URL v pamäti — žiadne médium sa nesťahuje zo siete.
- `reast.json`, ak je prítomný, sú voliteľné nastavenia relácie (prednastavené
  premenné) — nikdy nie manifest.

## `manifest.json`

Manifest má **jednu kanonickú podobu** — žiadne pole nemá „skrátený" tvar. `id`
je vždy prítomné (generuje sa pri vytvorení projektu), `author` je vždy pole
objektov a `parts` je vždy pole objektov `{ file, name }`. Referenčný loader
voľnejší ručne písaný vstup (napr. časť ako holý reťazec) pri načítaní
normalizuje do tejto podoby, ale každý nástroj, ktorý manifest vytvára, zapisuje
kanonickú podobu. Okrem identity je každé pole voliteľné okrem
prípadov, keď od neho závisí nejaká schopnosť; neznáme pole sa zachová a ignoruje.

```json
{
  "id": "019e03f6-f9ec-7000-801c-fd76eb1968dd",
  "rea": "1.0",
  "manifest": "1.0",
  "type": "story",
  "title": "Maják",
  "intro": "Búrka odrezala ostrov. Lampa zhasla a strážca je preč.",
  "cover": "assets/cover.webp",
  "author": [{ "name": "Jana Nováková", "id": "jana" }],
  "version": "1.2.0",
  "language": "sk",
  "direction": "ltr",
  "date": "2026-05-30",
  "description": "Vetviaca sa záhada na ostrove zovretom búrkou.",
  "genre": "mystery",
  "tags": ["branching", "mystery"],
  "license": "CC-BY-4.0",
  "parts": [{ "file": "story/0001-prva-cast.rea", "name": "Prvá časť" }],
  "assets": ["assets/cover.webp", { "file": "assets/theme.mp3", "name": "Hlavná téma" }],
  "instruction": "the-lighthouse-guide",
  "readers": [1],
  "age": { "min": 13 },
  "content_warnings": ["mierne nebezpečenstvo"],
  "series": "island-tales",
  "season": 1,
  "entry": 1,
  "duration": 25,
  "sensors": ["geolocation"],
  "accessibility": ["reduced-motion"],
  "allowed_urls": [{ "alias": "map", "url": "https://example.com/map" }],
  "offline": true,
  "preview": false,
  "integrity": { "story/0001-prva-cast.rea": "sha256-…" }
}
```

### Referencia polí

- `rea` — string — Verzia jazyka Rea, v ktorej je príbeh napísaný (aktuálne `"1.0"`).
- `manifest` — string — Verzia schémy manifestu (aktuálne `"1.0"`).
- `type` — string — `"story"` (čítajú čitatelia, predvolené) alebo `"instruction"` (pozri [Typy reastov](#typy-reastov) nižšie).
- `id` — string — Stabilný identifikátor príbehu (UUID). Vždy prítomný — generuje sa pri vytvorení projektu, nezávisle od neskoršieho nahratia na platformu.
- `title` — string — Zobrazovaný názov.
- `intro` — string — Krátky úvodný text zobrazený na obálke príbehu.
- `cover` — string — Cesta k obálke relatívna k archívu, zvyčajne `assets/cover.webp`.
- `author` — `{ name, id? }[]` — Jeden alebo viac autorov. Vždy tvar objektu; `name` (voľný text) je povinné, `id` je autorov slug na rea.st — prepája autora z manifestu s profilovou stránkou na platforme a je prítomné len pri registrovanom účte.
- `version` — string — Verzia tohto reastu definovaná autorom.
- `language` — string — Primárny jazyk podľa BCP-47.
- `direction` — string — Smer textu (`ltr` / `rtl`).
- `date` — string — Dátum publikovania.
- `description` — string — Krátka anotácia.
- `genre`, `tags` — string / string[] — Klasifikácia.
- `license` — string — Licencia distribúcie (napr. SPDX id).
- `parts` — `{ file, name }[]` — Usporiadané časti; prvá je vstupná a poradie poľa je poradie prehrávania. `file` je cesta v archíve (v `story/`), `name` je zobrazovaný názov časti.
- `assets` — `(string | { file, name? })[]` — Médiá v `assets/`. Každá položka je cesta relatívna k archívu, buď holá (`"assets/gate.webp"`), alebo objekt s voliteľným zobrazovaným názvom `name` pre autorské nástroje (`{ "file": "assets/theme.mp3", "name": "Hlavná téma" }`). Loader normalizuje holý reťazec na `{ file }`; chýbajúce `name` znamená, že médium nemá zobrazovaný názov.
- `instruction` — string — Pre `story`: prepojený `instruction` reast (id/slug).
- `stories` — string[] — Pre `instruction`: `story` reasty, ktoré pokrýva.
- `readers` — number[] — Podporované počty čitateľov; hodnota > 1 značí kooperatívny príbeh.
- `age` — `{ min?, max? }` — Odporúčaný vekový rozsah čitateľa.
- `content_warnings` — string[] — Upozornenia na citlivý obsah.
- `series`, `season`, `entry` — string / number — Zoskupenie a poradie v sérii.
- `duration` — number — Odhadovaný čas čítania v minútach.
- `sensors` — string[] — Schopnosti zariadenia, ktoré príbeh požaduje (napr. `geolocation`).
- `accessibility` — string[] — Tipy prístupnosti, ktoré príbeh ctí.
- `allowed_urls` — `{ alias, url, params? }[]` — Povolené externé endpointy, ktoré príbeh môže volať.
- `extensions` — string[] — Voliteľné. **Iba poradie načítania** `.rext` —
  prítomnosť modul nikdy neaktivuje; viaže ho až `{use}` v príbehu. Uvedená
  položka chýbajúca v archíve zlyhá načítanie. Pri absencii sa rozšírenia
  načítajú v lexikografickom poradí ciest. Pozri [Rozširovanie](extending).
- `requires` — string[] — Menné priestory hostiteľských rozšírení, na ktorých
  príbeh závisí (napr. `["host"]`). Embedder, ktorý nezaregistroval žiadne
  rozšírenie pre vyžadovaný menný priestor, odmietne načítanie, namiesto toho
  aby odpovedal zle uprostred príbehu. Pozri [Rozširovanie](extending).
- `offline` — boolean — Či je príbeh plne hrateľný offline.
- `preview` — boolean — Označuje náhľadové/ukážkové zostavenie.
- `integrity` — `Record<path, hash>` — SHA-256 hashe jednotlivých súborov pre detekciu manipulácie.
- `series_name`, `season_name` — string — Voliteľné zobrazované názvy pre zoskupenie `series` / `season`.
- `solo_mode` — string — Spracovanie rolí v sólo režime: `"all_roles"` (predvolené) alebo `"single_role"`.
- `storage` — string — Nápoveda pre úložisko: `"none"`, `"local"` (predvolené), alebo `"cloud"`.
- `reader` — object — Nastavenia prezentácie čitateľa, napr. lišta záložiek — pozri [Lišta záložiek čitateľa](#lišta-záložiek-čitateľa).
- `build` — object — Metadáta zostavenia pri minifikácii — pozri [Minifikácia a kompresia](#minifikácia-a-kompresia).
- `signed`, `signature` — boolean / string — Či je balíček kryptograficky podpísaný, a náklad podpisu — pozri [Integrita a podpisovanie](#integrita-a-podpisovanie).

## Typy reastov

Každý reast s manifestom deklaruje `type`:

- **`story`** — predvolené; reast, ktorý čítajú čitatelia.
- **`instruction`** — sprievodný reast, ktorý vysvetľuje, ako pripraviť a viesť
  jeden alebo viac príbehov (pre moderátora / game mastera). Inštrukčný reast sa
  nikdy nezobrazuje v zoznamoch katalógu; dá sa otvoriť len z príbehu, ku ktorému
  patrí.

`story` odkazuje na svoj jediný inštrukčný reast cez `instruction` (id/slug
inštrukcie). `instruction` uvádza príbehy, ktoré pokrýva, cez `stories` — takže
viac príbehov série môže zdieľať jednu inštrukciu, no každý príbeh má najviac
jednu inštrukciu. Oba konce sa odkazujú navzájom: príbeh ukazuje na svoju
inštrukciu a inštrukcia späť na svoje príbehy.

```json
// manifest.json príbehu
{ "type": "story", "id": "the-keepers-trial", "instruction": "the-keepers-trial-guide" }

// manifest.json inštrukcie
{ "type": "instruction", "id": "the-keepers-trial-guide", "stories": ["the-keepers-trial"] }
```

Inštrukčný reast sa nikdy nezobrazí v katalógu ani v žiadnom zozname príbehov —
platforma zaznamená odkaz na príbehu, nie ako samostatnú položku katalógu. Keď
ho príbeh má, čitateľ ponúkne akciu „Otvoriť inštrukčný reast", ktorá ho otvorí
ako samostatný príbeh. Vďaka tomu, že ide o samostatný, neuvedený reast
otvárateľný na požiadanie, sa predchádza prezradeniu spoilerov (mená postáv,
výsledky vetiev, riešenia hádaniek), na ktoré sa inštrukcia môže potrebovať
odvolávať pre moderátora.

## Lišta záložiek čitateľa

Mobilní čitatelia môžu zobraziť palcom dosiahnuteľnú spodnú lištu záložiek s
najviac piatimi sekciami. Lišta je **predvolene vypnutá**; autori sa prihlasujú
a zapínajú jednotlivé sekcie pod `reader.tabBar` v manifeste:

```json
{
  "reader": {
    "tabBar": {
      "enabled": true,
      "priorityHand": "reader",
      "help": { "enabled": true },
      "map": { "enabled": true, "image": "assets/map.webp" },
      "pocket": { "enabled": true },
      "character": { "enabled": true },
      "actions": { "enabled": true, "qrScan": true, "photo": true, "audio": true }
    }
  }
}
```

Sekcie, v sémantickom poradí podľa vzdialenosti od palca (`actions` najbližšie
k prioritnému palcu, `help` najďalej):

| Sekcia      | Účel                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------- |
| `actions`   | Dynamický interakčný hub — zahrať akčnú kartu, naskenovať QR kód, zachytiť fotku či zvuk |
| `character` | Životné funkcie čitateľa (HP/energia), RPG štatistiky a karty vlastností                  |
| `pocket`    | Inventár — mince, predmety a karty schopností                                             |
| `map`       | Mapa (obrázok alebo živá mapa) s polohou čitateľa, navigáciou a časom hry                 |
| `help`      | Pomoc a nápovedy v rámci príbehu                                                           |

`enabled` je hlavný vypínač celej lišty (predvolene `false`). `priorityHand` je
`"reader"` (predvolené — riadi sa nastavením rukosti čitateľa), `"left"`, alebo
`"right"` — rozhoduje iba o tom, ktorá strana obrazovky sa počíta ako
„najbližšia"; poradie sekcií je vždy pevne dané vzdialenosťou od palca. Každý
objekt sekcie akceptuje `enabled`, voliteľné prepísanie `label`/`icon` a voľné
atribúty špecifické pre danú sekciu (napr. `map.image`, alebo možnosti
`qrScan`/`photo`/`audio` pri `actions`).

## Nastavenia relácie: `reast.json`

`reast.json`, ak je prítomný, nesie **nastavenia prípravy relácie** — premenné a
konfiguráciu na spustenie príbehu v konkrétnom kontexte (napr. počet hráčov,
obtiažnosť, zvolený variant scenára) — nikdy nie dáta manifestu:

```json
{
  "players": 4,
  "difficulty": "hard",
  "scenario": "night-forest",
  "custom_npc_names": ["Aria", "Theron", "Kael"]
}
```

Platforma číta `reast.json` na začiatku relácie a vloží jeho hodnoty do
priestoru premenných príbehu. Autori definujú, aké nastavenia sa očakávajú,
cez direktívy `@config` v príbehu.

## Progresívne načítavanie

Veľké príbehy sa môžu načítavať po častiach namiesto naraz. Manifest deklaruje
stratégiu:

```json
{
  "loading": "progressive",
  "parts": ["0001-the-silence.rea", "0002-the-lantern.rea", "0003-epilogue.rea"],
  "preload": ["0001-the-silence.rea"],
  "locked": ["0003-epilogue.rea"]
}
```

Časti uvedené v `preload` sa stiahnu okamžite; ostatné sa sťahujú, keď je
čitateľ na 80 % aktuálnej časti; časti uvedené v `locked` sa stiahnu až po
splnení podmienky uzamknutia.

## Delta aktualizácie

Keď sa príbeh aktualizuje, čitatelia môžu stiahnuť iba zmenené súbory namiesto
celého balíčka. Manifest na to nesie hashe obsahu jednotlivých súborov:

```json
{
  "files": {
    "0001-the-silence.rea": { "hash": "sha256:abc123...", "size": 45012 },
    "0002-the-lantern.rea": { "hash": "sha256:def456...", "size": 12300 }
  }
}
```

## Schopnosti

Čitateľ skúma manifest, aby rozhodol, čo musí hostiteľská platforma poskytnúť
pred vykreslením:

- **Senzory** — položky v `sensors` (napr. `geolocation`) musí používateľ
  povoliť; čitateľ sa pri zamietnutí spýta alebo elegantne degraduje.
- **Kooperatívny** — akákoľvek hodnota väčšia ako `1` v `readers` signalizuje
  príbeh pre viac čitateľov, ktorý potrebuje synchronizačný kanál.
- **Offline** — `offline: true` potvrdzuje, že balíček obsahuje všetko potrebné
  na čítanie bez sieťového pripojenia.
- **Externé URL** — kontaktovať možno len endpointy uvedené v `allowed_urls`;
  všetko ostatné je blokované.

## Integrita a podpisovanie

Keď je prítomné pole `integrity`, čitateľ prepočíta SHA-256 hash každého
uvedeného súboru a pri nezhode odmietne balíček načítať. Balíčky môžu navyše
niesť polia `signed` / `signature` pre overenie pôvodu na úrovni autora.
Šifrované balíčky sa pred rozbalením dešifrujú (AES); dešifrovací kľúč sa
dodáva mimo archívu, nikdy nie v ňom.

Autor podpíše balíček tak, že raz vygeneruje pár kľúčov Ed25519 a bezpečne ho
uchová. `META-REA/checksum.sha256` potom nesie SHA-256 hashe každého súboru,
`META-REA/signature.sig` je Ed25519 podpis tohto súboru s hashmi a
`META-REA/author.pub` nesie verejný kľúč (alebo odkaz na identitu overenú
platformou). Čitateľ overí podpis pred načítaním a pri nezhode upozorní.

**Kód rozšírenia (`.rext`) sa nikdy nešifruje** — musí zostať auditovateľný bez
kľúča (validácia, linting, moderovanie) a nesmie sa objaviť uprostred príbehu za
odomykacím kódom (pozri [Kde sa pravidlá líšia v `.rext` súboroch](../spec/rext-differences)).

## Minifikácia a kompresia

Pred zabalením do `.reast` možno súbory príbehu pred distribúciou minifikovať a
skomprimovať. **Minifikácia** (bezstratová transformácia zdroja `.rea`)
odstráni všetky komentáre, zbytočné medzery, skráti mená premenných
(`player.health` → `p.h`) cez tabuľku mapovania mien a zlúči viacriadkové
príkazy na jeden riadok, kde je to možné. Mapovanie sa zapíše do
`META-REA/names.json` pre potreby ladenia:

```json
{
  "p.h": "player.health",
  "p.g": "player.gold",
  "e.s": "enemy.strength"
}
```

Samotný ZIP archív `.reast` používa štandardnú deflate **kompresiu** (rovnako
ako EPUB); už skomprimované mediálne formáty (JPEG, OGG) sa ukladajú bez
ďalšej kompresie, aby sa predišlo réžii dvojitej kompresie. Pipeline zostavenia
vyzerá takto: autor píše čitateľné, okomentované súbory `.rea` → build nástroj
ich voliteľne minifikuje → build nástroj všetko zabalí do ZIP archívu `.reast`
→ platforma pri behu rozbalí a načíta. Minifikácia je voliteľná —
neminifikované balíčky sú platné — a pole manifestu `build` zaznamenáva, či
bola použitá:

```json
{
  "build": {
    "minified": true,
    "names_map": "META-REA/names.json"
  }
}
```

## Číslované súbory príbehu

Pomenovávanie častí príbehu ako `0001-intro.rea`, `0002-forest.rea`, … je
**odporúčané, nie povinné**. Zaručí to deterministický, ľudsky čitateľný vstup
pre ploché archívy (vstupom je abecedne prvý `*.rea`) a pripraví projekt na
budúce ploché viacdielne usporiadanie. Nerieši tým **pomenovanie rozšírení** —
na to slúži `.rext` — a samo osebe neurčuje poradie častí balíčka s manifestom:
v balíčku s manifestom pochádza poradie častí z poľa manifestu `parts`, nie z
názvov súborov. Usporiadanie viacerých plochých častí podľa názvu súboru dnes
neexistuje; plochý archív rozlišuje iba svoj jediný vstupný súbor.

## Kolaboratívne autorstvo

Textový, riadkovo orientovaný formát Rea je navrhnutý pre tímové workflow:

- **Priateľský k verzovaniu** — súbory `.rea` sú čistý UTF-8 text; štandardné
  `git diff` a nástroje na zlučovanie fungujú bez špeciálnych driverov.
- **Jedna časť na súbor** — štruktúra `story/NNNN-nazov.rea` umožňuje viacerým
  autorom pracovať súčasne na oddelených častiach s minimom konfliktov pri
  zlučovaní.
- **Žiadny binárny stav** — logika príbehu žije v texte, nie v nepriehľadných
  projektových súboroch (na rozdiel od JSON-ového úložiska Twine).

## Prechod medzi časťami a stav čítania

Časti (`parts`) balíčka s manifestom sa prechádzajú na požiadanie, nie
zreťazené. Čitateľ začína vo vstupnej časti a posúva sa cez **bránu**
`[[ cieľ ]]` (automatická, koncová) alebo **odkaz medzi časťami**
`[text > cast.rea]` (čitateľ ťukne) — pozri sekciu *Viacdielne príbehy* v
jazykovej špecifikácii. Cieľ (`target`) je súbor časti (`story/####-nazov.rea`
alebo plochý `nazov.rea`), voliteľne s príponou `:scena` pre pokračovanie pri
kotve `[#scena]` v cieľovej časti. Načítajú sa len skutočne navštívené časti;
príkazy `{set}` na najvyššej úrovni časti sa vykonajú raz pri vstupe, takže
premenné sa hromadia pozdĺž prejdenej cesty.

**Stav čítania**, ktorý platforma uchováva medzi reláciami, zachytáva všetko
potrebné na zreprodukovanie tejto cesty:

| Pole                   | Význam                                                               |
| ----------------------- | --------------------------------------------------------------------- |
| `variables`             | Všetky premenné v rozsahu príbehu/nadpisu v bode uloženia             |
| `choices`               | Vybraná možnosť pre každú vyriešenú skupinu volieb                    |
| `visitedChoiceGroups`   | Skupiny volieb, ktorými čitateľ prešiel (pre nelepivé filtrovanie)     |
| `rng`                   | Seed PRNG + stav generátora, aby hody pokračovali deterministicky     |
| `currentPart`           | Súbor časti, v ktorej sa čitateľ práve nachádza (chýba pri jednodielnom príbehu) |
| `visitedParts`          | Usporiadané súbory častí navštívených pred aktuálnou                  |
| `renderedParagraph`     | Posledný videný blok, aby sa pri pokračovaní vykreslilo po neho bez znovu-animovania |

Pri pokračovaní platforma prehrá navštívené časti v poradí (obnoví posun
späť), znovu vstúpi do aktuálnej časti a obnoví premenné aj stav PRNG —
čitateľ pokračuje presne tam, kde skončil. Jednodielne príbehy nechávajú
`currentPart`/`visitedParts` prázdne a správajú sa ako predtým.
