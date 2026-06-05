# Formát balíčka `.reast`

Súbor `.reast` je štandardný **ZIP archív**, ktorý spája jeden alebo viac Rea
príbehov spolu s ich médiami a metadátami. Je to distribuovateľná, sebestačná
jednotka, ktorú prehrávač načíta na vykreslenie interaktívneho príbehu aj
offline.

Táto stránka popisuje rozloženie na disku a schému `manifest.json`, aby tretie
strany mohli vytvárať vlastné baličky, validátory či alternatívne prehrávače bez
nutnosti čítať zdrojový kód enginu.

## Rozloženie archívu

Moderný (v2) balíček používa nasledovnú štruktúru:

```text
my-story.reast              (ZIP kontajner)
├── manifest.json           metadáta + schopnosti (povinné pre v2)
├── reast.json              voliteľné nastavenia relácie / prednastavené premenné
├── story/
│   ├── main.rea            vstupný Rea súbor príbehu
│   └── chapter-2.rea       ďalšie časti (voliteľné)
├── media/
│   ├── cover.jpg
│   ├── scene.png
│   └── theme.mp3
└── moderator/              voliteľný obsah len pre moderátora (nikdy sa nenačíta automaticky)
```

Pravidlá, ktoré kompatibilný čitateľ vynucuje:

- Kontajner je ZIP súbor. Dekompresia je z bezpečnostných dôvodov obmedzená:
  **max. 50 MB rozbalených, max. 500 položiek**, a každá položka, ktorej cesta
  uniká mimo koreňa archívu (path traversal), je odmietnutá.
- **Vstupný príbeh** sa rozlišuje v tomto poradí: prvá položka v
  `manifest.parts`, potom prvý `*.rea` v `story/`, potom `parts/` (staršia
  verzia), potom akýkoľvek `*.rea` v koreni. Súbory v `moderator/` sa nikdy
  nevyberú ako vstup.
- Médiá sa z príbehu odkazujú cestou relatívnou k archívu a pri načítaní sa
  mapujú na blob URL v pamäti — žiadne médium sa nesťahuje zo siete.

### Staršie (v1) rozloženie

Staršie balíčky umiestňujú manifest do `reast.json` a časti príbehu do `parts/`.
Čitatelia akceptujú oboje: keď `manifest.json` chýba, `reast.json` sa považuje
za manifest; keď je `manifest.json` prítomný, `reast.json` sa namiesto toho
považuje za voliteľné nastavenia relácie.

## `manifest.json`

Manifest je jeden JSON objekt. Každé pole je voliteľné okrem prípadov, keď od
neho závisí nejaká schopnosť; neznáme pole sa zachová a ignoruje. Pole `rea`
deklaruje verziu schémy — podporované hodnoty sú `"1"`, `"1.0"`, `"1.1"` a
`"2.0"`.

```json
{
  "rea": "2.0",
  "id": "the-lighthouse",
  "title": "Maják",
  "author": [{ "name": "Jana Nováková", "id": "jana", "initials": "JN" }],
  "version": "1.2.0",
  "language": "sk",
  "direction": "ltr",
  "date": "2026-05-30",
  "description": "Vetviaca sa záhada na ostrove zovretom búrkou.",
  "cover": "media/cover.jpg",
  "genre": "mystery",
  "tags": ["branching", "mystery"],
  "license": "CC-BY-4.0",
  "parts": [{ "file": "story/main.rea", "name": "Prvá časť" }],
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
  "integrity": { "story/main.rea": "sha256-…" }
}
```

### Referencia polí

- `rea` — string — Verzia schémy manifestu (`"1"`–`"2.0"`).
- `id` — string — Stabilný identifikátor príbehu.
- `title` — string — Zobrazovaný názov.
- `author` — `{ name, id?, initials? }[]` — Jeden alebo viac autorov.
- `version` — string — Verzia príbehu definovaná autorom.
- `language` — string — Primárny jazyk podľa BCP-47.
- `direction` — string — Smer textu (`ltr` / `rtl`).
- `date` — string — Dátum publikovania.
- `description` — string — Krátka anotácia.
- `cover` — string — Cesta k obálke relatívna k archívu.
- `genre`, `tags` — string / string[] — Klasifikácia.
- `license` — string — Licencia distribúcie (napr. SPDX id).
- `parts` — `string[]` alebo `{ file, name }[]` — Usporiadané časti; prvá je vstupná.
- `readers` — number[] — Podporované počty čitateľov; hodnota > 1 značí kooperatívny príbeh.
- `age` — `{ min?, max? }` — Odporúčaný vekový rozsah čitateľa.
- `content_warnings` — string[] — Upozornenia na citlivý obsah.
- `series`, `season`, `entry` — string / number — Zoskupenie a poradie v sérii.
- `duration` — number — Odhadovaný čas čítania v minútach.
- `sensors` — string[] — Schopnosti zariadenia, ktoré príbeh požaduje (napr. `geolocation`).
- `accessibility` — string[] — Tipy prístupnosti, ktoré príbeh ctí.
- `allowed_urls` — `{ alias, url, params? }[]` — Povolené externé endpointy, ktoré príbeh môže volať.
- `offline` — boolean — Či je príbeh plne hrateľný offline.
- `preview` — boolean — Označuje náhľadové/ukážkové zostavenie.
- `integrity` — `Record<path, hash>` — SHA-256 hashe jednotlivých súborov pre detekciu manipulácie.

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
