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
my-story.reast (ZIP)
├── reast.json          (manifest — povinný)
├── story.rea           (hlavný príbeh — povinný)
├── part2.rea           (voliteľné ďalšie časti)
├── media/              (voliteľné médiá)
│   ├── cover.jpg
│   ├── forest.jpg
│   └── theme.ogg
└── moderator/          (voliteľné inštrukcie pre DM)
    └── notes.md
```

### Manifest `reast.json`

```json
{
  "version": "1.0",
  "title": "Môj príbeh",
  "author": "Meno autora",
  "language": "sk",
  "genre": ["fantasy", "adventure"],
  "parts": ["story.rea", "part2.rea"],
  "media": {
    "1": "media/cover.jpg",
    "2": "media/forest.jpg"
  },
  "sensors": [],
  "permissions": [],
  "allowed_urls": {}
}
```

### Povinné polia manifestu

| Pole      | Typ      | Popis                           |
| --------- | -------- | ------------------------------- |
| `version` | string   | Verzia formátu (aktuálne „1.0") |
| `title`   | string   | Názov príbehu                   |
| `parts`   | string[] | Zoznam `.rea` súborov v poradí  |

### Voliteľné polia manifestu

| Pole           | Typ      | Popis                                     |
| -------------- | -------- | ----------------------------------------- |
| `author`       | string   | Meno autora                               |
| `language`     | string   | ISO 639-1 kód jazyka                      |
| `genre`        | string[] | Zoznam žánrov                             |
| `media`        | object   | Mapovanie číselných ID na cesty médií     |
| `sensors`      | string[] | Vyžadované hardvérové senzory             |
| `permissions`  | string[] | Vyžadované povolenia zariadenia           |
| `allowed_urls` | object   | Mapovanie aliasov na povolené externé URL |
| `season`       | string   | Sezóna v rámci série                      |
| `series`       | string   | Názov série                               |
| `description`  | string   | Krátky popis príbehu                      |
| `cover`        | string   | Cesta k obrázku obálky                    |
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
