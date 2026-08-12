# Index funkcií

Každá funkcia jazyka Rea, zoskupená podľa toho, na čo slúži, a označená tým, ako ďaleko sa v skutočnosti dostala. Táto stránka odpovedá na jedinú otázku, ktorú si treba položiť skôr, než napíšete riadok: **môžem sa na to dnes spoľahnúť?**

Tá istá značka sa objavuje pod vlastným nadpisom funkcie v špecifikácii, takže stav sa nikdy nečíta z dvoch miest.

## Čo jednotlivé stavy znamenajú

| Stav               | Môžem to použiť?                      | Čo to znamená                                                                                                                                              |
| ------------------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`stable`**       | Áno — stavajte na tom                 | Vydané a zmrazené. Zmeniť to môže len nová verzia MAJOR jazyka. Patrí sem všetko, čo používa bežný odsek prózy.                                            |
| **`experimental`** | Áno — s poznámkou vo vašom changelogu | Vydané a použiteľné a na tejto úrovni je dnes väčšina jazyka. Syntax sa v rámci 1.x ešte môže upraviť, takže aktualizácia si od vás môže vyžiadať zásah.  |
| **`development`**  | Zatiaľ nie                            | Navrhnuté, odsúhlasené a práve sa stavia. Syntax nižšie je taká, aká bude, ale jadro ju zatiaľ neprijíma.                                                  |
| **`draft`**        | Nie                                   | Špecifikované a prediskutované, aby bol tvar myšlienky zaznamenaný. Implementácia sa nezačala a návrh sa ešte môže úplne zmeniť.                           |
| **`cancelled`**    | Nikdy                                 | Zvážené a zámerne vylúčené. Zdokumentované preto, aby rozhodnutie zostalo viditeľné a nebolo objavené a preberané znovu.                                   |

**Značka verzie** sprevádza stav len tam, kde je čo verziovať: funkcie `stable` a `experimental` nesú verziu špecifikácie, v ktorej sa stali dostupnými. Funkcia `development` alebo `draft` verziu zatiaľ nemá a `cancelled` ju mať nikdy nebude.

Všetko označené ako `stable` alebo `experimental` v súčasnom jadre funguje. Čokoľvek pod tým nie — ak to príbeh použije, runtime uplatní [elegantnú degradáciu](/sk/spec/04-utilities#_27-error-handling) a čitateľ to jednoducho nikdy neuvidí.

<FeatureIndex />

## Ako index čítať

- **Kliknutím na stav** v legende zoznam zúžite; opätovným kliknutím alebo voľbou „zobraziť všetko" filter zrušíte.
- **Názov skupiny** odkazuje na tú časť špecifikácie, ktorá ju popisuje v plnom rozsahu.
- **Názov funkcie** odkazuje na jej vlastnú sekciu, kde sa objavuje tá istá značka s tým istým znením. Výnimkou sú položky `cancelled`: nemajú žiadnu syntax na zdokumentovanie, takže žijú spolu v časti [Čo Rea zámerne neobsahuje](05-reference#what-rea-intentionally-omits).

Ak je funkcia, ktorú potrebujete, `draft` alebo `development`, sekcia špecifikácie ju napriek tomu popisuje úplne — práve to umožňuje navrhnúť príbeh okolo jej budúceho príchodu. Len proti nej nevydávajte.
