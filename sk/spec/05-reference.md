# Špecifikácia jazyka Rea — Časť 5: Referencia (Sekcie 28–30)

> [Späť na hlavnú špecifikáciu](/sk/)
>
> **Stav implementácie:** Formát súboru a balenie (28) sú plne implementované. Pozrite [REA-CHEATSHEET.md](REA-CHEATSHEET.md) pre podrobný stav.

---

## 28. Formát súboru a balenie

### Súbor `.rea`

Čistý textový súbor obsahujúci obsah príbehu. Kódovanie UTF-8. Žiadne metadáta — iba naratívny obsah.

### Balík `.reast`

ZIP archív s nasledujúcou štruktúrou:

```text
my-story.reast (ZIP — formát v2, rea: "2.0")
├── manifest.json       (manifest — povinný)
├── reast.json          (voliteľný — nastavenia session / premenné)
├── README.md           (voliteľný — pre GitHub verzionovanie)
├── META-REA/
│   ├── checksum.sha256
│   ├── signature.sig   (voliteľný, Ed25519)
│   └── author.pub      (voliteľný)
├── story/
│   ├── part-00001.rea  (prvá časť)
│   ├── part-00002.rea  (druhá časť)
│   └── ...
├── media/
│   ├── cover.jpg
│   ├── forest.jpg
│   └── theme.ogg
└── moderator/
    ├── instructions.rea (hlavné inštrukcie pre moderátora)
    └── media/
        └── session-map.png
```

**Legacy formát** (rea: "1.0" / "1.1") je stále podporovaný:

```text
my-story.reast (ZIP — legacy)
├── reast.json          (manifest — legacy umiestnenie)
├── part-00001.rea
└── assets/
    └── cover.jpg
```

### Manifest `manifest.json`

```json
{
  "rea": "2.0",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Môj príbeh",
  "authors": [{"name": "Meno autora"}],
  "language": "sk",
  "genre": ["fantasy", "adventure"],
  "parts": [
    {"file": "story/part-00001.rea", "name": "Úvod"},
    {"file": "story/part-00002.rea", "name": "Druhá kapitola"}
  ],
  "sensors": [],
  "allowed_urls": []
}
```

### Povinné polia manifestu

| Pole       | Typ      | Popis                                     |
| ---------- | -------- | ----------------------------------------- |
| `rea`      | string   | Verzia špecifikácie (napr. "2.0")         |
| `id`       | string   | UUID identifikátor diela                  |
| `title`    | string   | Názov príbehu                             |
| `authors`  | array    | Zoznam autorov `{name, id?}`              |
| `language` | string   | BCP 47 kód jazyka                         |
| `parts`    | array    | Zoznam častí `{file, name}` v poradí      |

### Voliteľné polia manifestu

| Pole           | Typ      | Popis                                     |
| -------------- | -------- | ----------------------------------------- |
| `genre`        | string[] | Zoznam žánrov                             |
| `description`  | string   | Krátky popis príbehu (max 500 znakov)     |
| `cover`        | string   | Cesta k obrázku obálky v archíve          |
| `visibility`   | string   | "private" / "unlisted" / "public"         |
| `tier`         | string   | "basic" / "premium" / "paid" / "commercial" |
| `version`      | string   | Semver verzia obsahu                      |
| `audience`     | object   | `{min, max}` vekový rozsah               |
| `sensors`      | string[] | Vyžadované hardvérové senzory             |
| `duration`     | number   | Odhadovaný čas čítania v minútach         |
| `allowed_urls` | array    | `{alias, url}` povolené externé URL       |
| `cooperative`  | boolean  | Podpora pre kooperatívne čítanie          |
| `season`       | string   | Sezóna v rámci série                      |
| `series`       | string   | Názov série                               |
| `tags`         | string[] | Vyhľadávacie tagy                         |

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

### Lokalizačné

| Funkcia                      | Popis                     |
| ---------------------------- | ------------------------- |
| `plural(n, one=, few=, ...)` | Pluralizácia podľa jazyka |
| `select(val, k1=v1, k2=v2)`  | Výber podľa hodnoty       |
| `ordinal(n)`                 | Radová číslovka           |

---
