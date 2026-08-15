# Storylety a balíčky

> [Úvod](/sk/spec/) · [Index funkcií](features) · [Ťahák](REA-CHEATSHEET)

### Storylety (naratív riadený kvalitami) {#storylets-quality-based-narrative}

<Feature id="storylets" />

Storylety sú modulárne bloky obsahu s podmienkami a účinkami — stavebné kamene nelineárnych rozprávaní poháňaných objavovaním. Namiesto pevného vetvenia platforma vyberá použiteľné storylety a predkladá ich ako dostupné možnosti.

```rea
{storylet the_merchants_plea begin}
  require: gold > 20 and visited("market")
  priority: 5
  repeatable: false

  Pristúpi k tebe kupec so zúfalým pohľadom.
  „Prosím, potrebujem niekoho, kto doručí tento balík do severnej veže."

  * [Prijmi úlohu]
    {set story.quest.has_merchant_quest = true}
    {set story.player.gold = story.player.gold + 10}
    „Nech ti je odplatou! Tu máš zálohu."
  * [Odmietni]
    Kupcovi klesnú plecia.
{end storylet}

{storylet the_hidden_path begin}
  require: story.quest.has_merchant_quest and context.time.hour >= 20
  priority: 10
  repeatable: false

  Keď padne noc, zbadáš medzi stromami slabú žiaru.
  Odhalí sa cesta, akú si predtým nikdy nevidel.
  -> hidden_path_adventure
{end storylet}
```

**Atribúty storyletu:**

| Atribút      | Popis                                                                                   |
| ------------ | --------------------------------------------------------------------------------------- |
| `require`    | Podmienka, ktorá musí platiť, aby sa storylet objavil                                   |
| `priority`   | Storylety s vyššou prioritou sa objavia skôr (predvolene `0`)                           |
| `repeatable` | `true` povolí opakované prehratie, `false` znamená jednorazový (predvolené)             |
| `cooldown`   | Minimálny počet návštev alebo čas, kým sa môže objaviť znovu                            |
| `weight`     | Relatívna pravdepodobnosť, keď je použiteľných viac storyletov                          |
| `tags`       | Kategorizácia na filtrovanie (`tags: tavern, social`)                                   |
| `trigger`    | Druh vstupu z reálneho sveta, ktorý môže tento storylet zobudiť (pozri [Spúšťané storylety](#triggered-storylets)) |
| `match`      | Voliteľný regulárny výraz bez ohľadu na veľkosť písmen, ktorému musí hodnota vstupu vyhovieť |

<Feature id="storylet-deck" />

**Balíček storyletov** — predloží dostupné storylety ako ruku kariet, z ktorej si čitateľ vyberá:

```rea
{deck from="tavern_stories", max=3, shuffle begin}
  Vyber si, čo ťa zaujme:
{end deck}
```

Predloží až 3 použiteľné storylety označené štítkom `tavern_stories`, premiešané.

Storylety umožňujú organické, nelineárne rozprávanie, kde sa príbeh prispôsobuje stavu čitateľa a povzbudzuje k objavovaniu aj opätovnému prehratiu.

### Spúšťané storylety {#triggered-storylets}

<Feature id="triggered-storylets" />

Storylet s riadkom `trigger:` zobúdza svet namiesto balíčka: takmer v ktorejkoľvek chvíli čítania môže vstup z reálneho sveta — naskenovanie QR nálepky na lavičke, vyslovenie frázy nahlas, priloženie NFC štítku — prerušiť hlavný príbeh, prehrať storylet ako vedľajšiu cestu a vrátiť sa presne tam, kde čitateľ prestal:

```rea
{storylet bench_secret begin}
  trigger: scan
  match: "^REAST-BENCH-.*"
  require: story.act >= 2
  weight: 2
  repeatable: false

  Kód na lavičke ožije. Hlas šepká: „Našiel si ma."
  * [Nasleduj šepot]
    -> bench_alley
  * [Ignoruj ho]
{end storylet}

{storylet magic_word begin}
  trigger: listen
  match: "abrakadabra"

  Slovo visí vo vzduchu — a stena odpovie.
{end storylet}
```

- **`trigger:`** pomenúva druh vstupu. Množina je otvorená — čitateľská aplikácia rozhoduje, ktoré druhy dokáže fyzicky zachytiť. Bežné druhy: `scan` (obsah QR alebo čiarového kódu), `listen` (prepis rozpoznanej reči), `text`, `vision`, `nfc`, `shake`, `location`. Storylet bez `trigger:` sa správa presne ako doteraz (len z balíčka); storylet môže niesť `trigger:` aj `tags:` a objavovať sa aj v balíčkoch
- **`match:`** je regulárny výraz bez ohľadu na veľkosť písmen, testovaný proti hodnote vstupu (obsah QR kódu, prepis reči). Vynechajte ho, ak má prijať akýkoľvek vstup daného druhu
- **Výber** sa riadi bežnými pravidlami storyletov: spomedzi storyletov, ktorým sedí druh aj `match:`, sa rešpektujú podmienky `require:`, stav vytiahnutia, `cooldown:` a `priority:`, a potom sa jeden vyberie váženým náhodným výberom. Jeden vstup zobudí presne jeden storylet
- **Vnútri tela** sprístupňujú `event.kind` a `event.value` spúšťací vstup podmienkam aj textu (sú viditeľné aj pre `require:` počas výberu), takže naskenovaný obsah alebo vyslovené slová možno čitateľovi zopakovať: `Na štítku stojí {event.value}.`

#### Prerušenie a návrat {#interruption-and-return}

Spúšťaný storylet sa prehráva ako autorom napísaný tunel (`->->`): jadro si zapamätá pozíciu v hlavnom príbehu — vrátane čakajúcej, ešte nezodpovedanej skupiny volieb — prehrá storylet a po jeho skončení (posledný riadok alebo výslovná odbočka von) pokračuje v hlavnom príbehu presne tam, kde bol. Zmeny stavu urobené vnútri (`{set}`, `{give}`, mince) pretrvávajú do hlavného príbehu. Uloženia vytvorené uprostred storyletu sa obnovia do storyletu s nedotknutou pozíciou návratu. Kým beží spúšťaný storylet, nový spúšťač sa ignoruje — vedľajšie cesty sa nikdy nevnárajú.

Keď vstupu nič nesedí — žiadny použiteľný storylet, žiadna čakajúca možnosť [menu objavovania](/sk/spec/03-narrative-interaction#exploration-menus) — čitateľská aplikácia dá jemnú spätnú väzbu („to zatiaľ nič neurobilo") namiesto chyby, takže skenovať náhodné kódy je vždy bezpečné. Keď by na ten istý vstup mohlo odpovedať čakajúce menu objavovania aj spúšťaný storylet, vyhráva menu — pozri [Priorita pri spúšťačoch storyletov](/sk/spec/03-narrative-interaction#priority-with-storylet-triggers).

## Pozri tiež

- [Priorita pri spúšťačoch storyletov](/sk/spec/03-narrative-interaction#priority-with-storylet-triggers) — rozhodovanie medzi čakajúcim menu objavovania a spúšťačom storyletu pre ten istý vstup, v časti Menu objavovania.
- [Priorita: menu objavovania verzus spúšťače storyletov](/sk/spec/03-narrative-interaction#priority-exploration-menus-vs-storylet-triggers) — to isté pravidlo, zopakované v časti Interakcie s reálnym svetom.
