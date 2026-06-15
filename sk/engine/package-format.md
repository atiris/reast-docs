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
│   ├── part-00001.rea      vstupná časť (prvá v manifest.parts)
│   └── part-00002.rea      ďalšie časti (v poradí podľa manifestu)
└── assets/
    ├── cover.webp
    ├── scene.webp
    └── theme.mp3
```

### Plochý

Bez `manifest.json`. Všetky `.rea` aj mediálne súbory sú v koreni archívu.
Vstupný príbeh je **abecedne prvý** `*.rea` súbor. Plochý balíček nenesie žiadne
metadáta (žiadny názov, autor, štítky, žáner, obálka, odkazy…) — keď je čokoľvek
z toho potrebné, použite rozloženie s manifestom.

```text
quick.reast                 (ZIP kontajner)
├── story.rea               vstupný príbeh (abecedne prvý .rea)
├── cover.jpg
└── theme.mp3
```

Pravidlá, ktoré kompatibilný čitateľ vynucuje:

- Kontajner je ZIP súbor. Dekompresia je z bezpečnostných dôvodov obmedzená:
  **max. 50 MB rozbalených, max. 500 položiek**, a každá položka, ktorej cesta
  uniká mimo koreňa archívu (path traversal), je odmietnutá.
- **Vstupný príbeh** je prvá položka v `manifest.parts` (s manifestom) alebo
  abecedne prvý `*.rea` súbor (plochý). V balíčku s manifestom sa časti načítajú
  v poradí uvedenom v `manifest.parts`.
- Médiá sa z príbehu odkazujú cestou relatívnou k archívu a pri načítaní sa
  mapujú na blob URL v pamäti — žiadne médium sa nesťahuje zo siete.
- `reast.json`, ak je prítomný, sú voliteľné nastavenia relácie (prednastavené
  premenné) — nikdy nie manifest.

## `manifest.json`

Manifest má **jednu kanonickú podobu** — žiadne pole nemá „skrátený" tvar. `id`
je vždy prítomné (generuje sa pri vytvorení projektu), `author` je vždy pole
objektov a `parts` je vždy pole objektov `{ file, name }`. Referenčný loader
voľnejší ručne písaný vstup (napr. časť ako holý reťazec) pri načítaní
normalizuje do tejto podoby. Okrem identity je každé pole voliteľné okrem
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
  "author": [{ "name": "Jana Nováková", "id": "jana", "initials": "JN" }],
  "version": "1.2.0",
  "language": "sk",
  "direction": "ltr",
  "date": "2026-05-30",
  "description": "Vetviaca sa záhada na ostrove zovretom búrkou.",
  "genre": "mystery",
  "tags": ["branching", "mystery"],
  "license": "CC-BY-4.0",
  "parts": [{ "file": "story/part-00001.rea", "name": "Prvá časť" }],
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
  "integrity": { "story/part-00001.rea": "sha256-…" }
}
```

### Referencia polí

- `rea` — string — Verzia jazyka Rea, v ktorej je príbeh napísaný (aktuálne `"1.0"`).
- `manifest` — string — Verzia schémy manifestu (aktuálne `"1.0"`).
- `type` — string — `"story"` (čítajú čitatelia, predvolené) alebo `"instruction"` (pozri [Typy reastov](#typy-reastov)).
- `id` — string — Stabilný identifikátor príbehu (UUID). Vždy prítomný — generuje sa pri vytvorení projektu, nezávisle od neskoršieho nahratia na platformu.
- `title` — string — Zobrazovaný názov.
- `intro` — string — Krátky úvodný text zobrazený na obálke príbehu.
- `cover` — string — Cesta k obálke relatívna k archívu, zvyčajne `assets/cover.webp`.
- `author` — `{ name, id?, initials? }[]` — Jeden alebo viac autorov. Vždy tvar objektu; `name` je povinné, `id` (platformové id používateľa) je prítomné len pri registrovanom účte.
- `version` — string — Verzia tohto reastu definovaná autorom.
- `language` — string — Primárny jazyk podľa BCP-47.
- `direction` — string — Smer textu (`ltr` / `rtl`).
- `date` — string — Dátum publikovania.
- `description` — string — Krátka anotácia.
- `genre`, `tags` — string / string[] — Klasifikácia.
- `license` — string — Licencia distribúcie (napr. SPDX id).
- `parts` — `{ file, name }[]` — Usporiadané časti; prvá je vstupná a poradie poľa je poradie prehrávania. `file` je cesta v archíve (v `story/`), `name` je zobrazovaný názov časti.
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
- `offline` — boolean — Či je príbeh plne hrateľný offline.
- `preview` — boolean — Označuje náhľadové/ukážkové zostavenie.
- `integrity` — `Record<path, hash>` — SHA-256 hashe jednotlivých súborov pre detekciu manipulácie.

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
