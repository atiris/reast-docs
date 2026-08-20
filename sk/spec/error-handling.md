# Spracovanie chýb

> [Úvod](/sk/spec/) · [Index funkcií](features) · [Ťahák](REA-CHEATSHEET)

Rea má dve publiká a nikdy nezdieľajú tú istú rúru.

**Čitateľ** dostáva text. Každé zlyhanie má definované, tiché náhradné správanie a na stránku sa nikdy nedostane žiadny text chyby — ani správa, ani zástupný token, ani holý identifikátor. Toto je záruka jazyka, nie detail runtime.

**Autor** dostáva *záznamy*: štruktúrované dáta s kódom a pozíciou, bez vykresliteľnej podoby. Záznam sa čitateľovi nikdy nezobrazí, v žiadnej závažnosti. Vypisuje ich `reast validate`, podčiarkuje ich editor a hostiteľ ich formátuje z `code + args + locale`.

Tieto dva kanály sú celý návrh. Zlyhanie vytvorí náhradné správanie **aj** záznam a ani jedno nenahrádza druhé.

### Závažnosti {#severities}

Každý kód nesie práve jednu závažnosť, pevne danú v registri enginu. Miesto volania si ju nikdy nevyberá, takže dve miesta, ktoré si všimnú tú istú podmienku, sa nemôžu nezhodnúť na tom, aká je vážna.

| Závažnosť  | Čo znamená                                                                     | Zhodí CI              |
| ---------- | ------------------------------------------------------------------------------ | --------------------- |
| `fatal`    | Artefakt sa vôbec nedá načítať. Len chyby balíka a rozšírení.                   | áno                   |
| `error`    | Autorská chyba s dôsledkom viditeľným pre čitateľa: obsah sa stratí, je mŕtvy alebo nesprávny. | áno    |
| `warning`  | Autorská chyba, ktorá zatiaľ nemá dôsledok viditeľný pre čitateľa.              | pri `--strict`        |
| `degraded` | *Správne* správanie v obmedzenom prostredí alebo na nižšej úrovni zhody.        | **nikdy**             |
| `info`     | Hygiena, štýl a autorské poznámky.                                             | nie                   |

`degraded` sa nikdy nepovyšuje, ani pri `--strict`. Povýšenie by poprelo dôvod, prečo je to samostatná závažnosť: autor musí vedieť rozlíšiť „moja funkcia úrovne Platform tu nespravila nič, a tak to má byť" od „urobil som chybu".

Nič v `parse/` nie je `fatal`. Ľubovoľný text v UTF-8 je platný dokument Rea — súbor `.rea` nikdy nezlyhá na parsovaní.

### Oblasti kódov {#code-partitions}

Kód je reťazec malými písmenami rozdelený lomkou; predpona *je* oblasť, takže kódy sa dajú triediť, grepovať aj filtrovať vzorom.

| Oblasť    | Vyvoláva                                                        |
| --------- | --------------------------------------------------------------- |
| `pkg/`    | Archív, manifest, integrita, dešifrovanie                       |
| `ext/`    | Dôvera a gramatika `.rext` pri načítaní, rozklad `{use}`        |
| `parse/`  | Čítanie jedného súboru                                          |
| `link/`   | Rozklad mien naprieč celým balíkom                              |
| `eval/`   | Vyhodnotenie výrazu                                             |
| `flow/`   | Beh príbehu: limity, riadenie toku, uloženia                    |
| `env/`    | Prostredie, v ktorom sa príbeh číta: médiá, senzory, čitatelia  |
| `style/`  | Hygiena a autorské poznámky                                     |
| `meta/`   | Samotný prúd záznamov                                           |

### Pravidlo úniku {#the-escape-rule}

Brána, ktorá závisí od stavu mimo kontroly autora aj čitateľa, potrebuje cestu von, a toto pravidlo patrí každej čakajúcej podmienke, nie jednému bloku. `{wait}` alebo `{waypoint}`, ktorého výraz číta `context.*` a nedeklaruje ani `escape=`, ani `escape_to=`, dostane `link/wait-no-escape`, resp. `link/waypoint-no-escape` — varovanie, nie chybu, lebo zámerná tvrdá fyzická brána bez digitálneho obchádzania je legitímny návrh.

Jej protipol v režime **teraz** je `link/context-no-fallback`: `{if}` nad zdrojom reálneho sveta bez `{else}` nevykreslí vôbec nič, keď je zdroj zamietnutý alebo ešte nič nedoručil — prázdna strana tam, kde autor čakal jednu z dvoch scén. A podmienka, ktorá číta podstrom `context.`, aký neposkytuje žiadna platforma, dostane `link/unknown-context-source` — nikdy by sa nemohla stať pravdivou, takže príbeh by sa tam natrvalo zastavil.

### Čo dostane čitateľ {#what-the-reader-gets}

<Feature id="error-handling" />

| Zlyhanie                                     | Čo čitateľ uvidí                                  | Záznam                     |
| -------------------------------------------- | ------------------------------------------------- | -------------------------- |
| Nenastavená premenná `{gold}`                | Nič — prázdny reťazec                             | `eval/undefined-variable`  |
| Delenie nulou `{1 / 0}`                      | Nič — výraz nemá hodnotu                          | `eval/division-by-zero`    |
| Chýbajúci obrázok                            | Zástupný obsah s alternatívnym textom             | `env/missing-image`        |
| Chýbajúci zvuk                               | Ticho; čítanie pokračuje                          | `env/missing-audio`        |
| Chýbajúce video                              | Náhľadový snímok, ak je, inak zástupný obsah      | `env/missing-video`        |
| Nedostupná syntéza reči                      | Rozprávanie sa preskočí                           | `env/tts-unavailable`      |
| Neuzavretý `{if begin}` na konci súboru      | Blok sa automaticky uzavrie                       | `parse/unterminated-block` |
| Neznámy príkaz `{magic begin}`               | Celý blok sa preskočí                             | `parse/unknown-command`    |
| Neznámy menný priestor `{ns.cmd a}`          | Celý blok sa preskočí                             | `parse/unknown-namespace`  |
| Odbočka na neexistujúcu kotvu                | Čítanie pokračuje za odbočkou                     | `link/undefined-anchor`    |
| Nedostupný senzor                            | `has("sensor")` vráti `false`               | `env/sensor-unavailable`   |

Táto tabuľka je **len ilustratívna** — 11 reprezentatívnych riadkov z celého registra. Normatívny je úplný, generovaný zoznam všetkých 175 kódov v anglickej verzii, [„What the reader gets"](../../spec/error-handling.md#what-the-reader-gets): `scripts/check-spec-fallback-table.mjs` ho generuje priamo z registra, takže nemôže so zdrojovým kódom rozísť. Táto slovenská tabuľka sa negeneruje a neaktualizuje automaticky, preto pri rozpore platí anglická verzia.

Neznámy príkaz sa **preskočí celý** — vrátane bloku, ak nejaký otvára. Nevytlačí sa ako výraz. Vytlačenie by dostalo autorov zápis na stránku čitateľa, čomu má čitateľský kanál práve zabrániť.

Delenie nulou nedáva **nič**, čo sa vykreslí ako nič. Predtým dávalo `0` — hodnotu, ktorú čitateľ nevedel odlíšiť od skutočného výsledku.

### Čo smie záznam niesť {#what-a-record-may-carry}

Záznam smie pomenovať identifikátor, ktorý autor napísal, odcitovať to, čo autor doslova napísal, a opísať *typ* hodnoty za behu. Nikdy nesmie niesť hodnotu za behu.

Toto pravidlo vynucuje tvar API, nie kontrola pri revízii: neexistuje konštruktor, ktorý by prijal reťazec od volajúceho. Citovaný zdroj sa spätne načíta zo súboru na danej pozícii. Zlyhané `{set story.gold = "abc"}` teda smie ohlásiť `"abc"`, lebo to autor napísal do súboru, kým to isté zlyhanie na hodnote, ktorá prišla cez `{input}`, môže ohlásiť len názov typu.

Tým sa záruky súkromia pre voľný text a zvuk zo [Sekcie 19](03-narrative-interaction.md#_19-input-interaction) a [Sekcie 21](03-narrative-interaction.md#_21-real-world-interactions) vzťahujú aj na diagnostické záznamy, nielen na stav príbehu. `{listen}`, ktoré sa nezhoduje, zaznamená, že sa nezhodovalo — nikdy to, čo bolo povedané.

### Ako sa záznamy čítajú {#reading-the-records}

```bash
reast validate                 # každý .rea a .rext pod data/seed
reast validate path/ --json    # prúd záznamov, pre CI
reast validate path/ --strict  # zostavenie zhodia aj varovania
```

```text
story/0001.rea:124:1 error link/undefined-anchor Divert to "the_vault" — no such anchor
```

Návratový kód je nenulový pri akomkoľvek `fatal` alebo `error`, v každom výstupnom režime.

Rea **nemá** `try/catch`. Všetko spracovanie chýb je implicitné — runtime sa zotaví, zážitok čitateľa sa nikdy nepreruší a autor si prečíta záznam.

### Náhradné hodnoty {#fallback-values}

<Feature id="fallback-values" />

Tam, kde to dáva zmysel, syntax podporuje voliteľné inline náhradné hodnoty:

```rea
[!map < media/map.png, fallback="media/map-lowres.png"]
[?thunder < sounds/thunder.mp3, fallback="sounds/rain.mp3"]
```

Ak primárny zdroj zlyhá, použije sa náhrada. Ak zlyhá aj náhrada, platforma uplatní svoje predvolené elegantné správanie (zástupný obsah pri obrázkoch, ticho pri zvuku a podobne).

### Prístup k externým API {#external-api-access}

<Feature id="external-api" />

Volania externých rozhraní (sieťové požiadavky z vnútra príbehu) sa musia deklarovať v `manifest.json` cez `allowed_urls`. URL adresy sa nesmú objaviť nikde v texte `.rea` — autori sa na rozhrania odkazujú výhradne aliasom. Tým je každý externý prístup deklarovaný, auditovateľný a riadený povoleniami.

```json
{
  "title": "Príbeh o počasí",
  "allowed_urls": [
    {
      "alias": "weather",
      "url": "https://api.weather.example.com",
      "params": ["lat", "lng"]
    },
    { "alias": "maps", "url": "https://maps.example.com" }
  ]
}
```

Každá položka v `allowed_urls` je objekt s poľami:

| Pole     | Typ      | Popis                                                    |
| -------- | -------- | -------------------------------------------------------- |
| `alias`  | string   | Krátky názov, ktorým sa na toto rozhranie odkazuje v .rea |
| `url`    | string   | Predpona základnej URL, ku ktorej príbeh smie pristupovať |
| `params` | string[] | Voliteľný zoznam povolených názvov parametrov dopytu     |

Autori sa na povolené rozhrania v kóde príbehu odkazujú aliasom. Ak požiadavka zlyhá, runtime vráti `undefined` a príbeh pokračuje.

---
