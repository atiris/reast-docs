# Návrh príbehov

Ako štruktúrovať a zabaliť príbeh pre platformu Reast — či už ho píšete vo vstavanom editore, alebo vlastnými nástrojmi.

## Dva spôsoby tvorby príbehu

- **Editor platformy** (odporúčaný pre väčšinu autorov) — píšte Rea so živým náhľadom, spravujte metadáta a médiá cez formuláre a publikujte na jedno kliknutie. Editor za vás zostaví balík `.reast`; pozrite [Pre autorov](../for-authors) pre samotný proces písania.
- **Ľubovoľný textový editor** — píšte `.rea` súbory priamo a potom ich sami zabaľte do balíka `.reast`: ZIP archív so súbormi príbehu v `story/`, médiami v `assets/` a súborom `manifest.json` popisujúcim názov, autora, časti a ďalšie metadáta v koreni archívu. Hotový súbor `.reast` nahrajte na publikovanie. Celé rozloženie archívu a všetky polia manifestu sú zdokumentované v referencii enginu [formát balíčka `.reast`](/engine/package-format) — táto stránka je kanonický zdroj pre to, čo musí platný balík obsahovať.

Obe cesty vytvárajú rovnaký typ balíka; ktorú použijete, je otázka pracovného postupu, nie požiadavka platformy.

## Základné princípy

Príbeh, ktorý využíva platformovo-špecifické schopnosti — interakcie s reálnym svetom, kooperatívne čítanie, viacdielnu štruktúru — profituje z naplánovania týchto prvkov ešte pred písaním prózy:

- **Začnite štruktúrou.** Rozhodnite, či je váš príbeh jednodielny alebo viacdielny, ešte pred písaním; viacdielne príbehy používajú brány a medzičastové odkazy (pozri sekciu [Naratív a interakcia](/sk/spec/03-narrative-interaction) v špecifikácii) a je ťažšie ich reštruktúrovať dodatočne než naplánovať vopred.
- **Premenné sú pamäť vášho príbehu.** Premenné s doménovým prefixom (`player.*`, `quest.*`) umožňujú neskorším kapitolám reagovať na skoršie rozhodnutia — určite si doménové priestory premenných včas, aby pomenovanie zostalo konzistentné naprieč časťami.
- **Platformové funkcie používajte cielene.** GPS, kooperatívne čítanie a senzory sú voliteľné — použite ich tam, kde slúžia príbehu, nie ako zoznam požiadaviek. Príbeh, ktorý v manifeste deklaruje `sensors` alebo `readers > 1`, žiada od zariadenia či skupiny čitateľa reálnu schopnosť — žiadajte iba to, čo skutočne využijete.

## Externý prístup, vlastné funkcie a bezpečnosť

Príbeh môže v manifeste deklarovať `allowed_urls` na volanie malej, explicitne uvedenej sady externých endpointov, a môže rozšíriť vlastnú logiku pomocou rozširovacích modulov `.rext` (pozri [Rozširovanie enginu](/engine/extending) a [Kde sa pravidlá líšia v `.rext` súboroch](/sk/spec/rext-differences)). Oba mechanizmy sú zámerne úzke:

- **`allowed_urls` je whitelist, nie univerzálna sieťová brána.** Dosiahnuteľné sú iba endpointy, ktoré autor uvedie; všetko ostatné je blokované. Ku každému uvedenému URL pristupujte tak, akoby ho zariadenie čitateľa skutočne kontaktovalo, a vyhýbajte sa endpointom, ktoré vracajú čokoľvek, čo by ste nechceli vidieť vykreslené ako text príbehu.
- **Rozšírenia `.rext` sú Rea v sandboxe, nie ľubovoľný kód.** Nemajú prístup k súborovému systému, k sieti nad rámec vstavaných funkcií enginu, ani k žiadnemu API mimo jazyka Rea — pozri [Obmedzenia sandboxu](/sk/spec/05-reference#31-extensibility). Príbeh nemôže vložiť JavaScript ani žiadny iný jazyk.
- **Čokoľvek, čo má byť skutočne nesfalšovateľné — odpoveď v súťaži, platené odomknutie — musí byť overené na strane servera.** Šifrovanie kapitoly `.rea` odradí náhodné nazeranie, no dešifrovací kľúč sa nutne dostane na zariadenie čitateľa, aby sa dala kapitola vykresliť — takže to nie je bezpečnostná hranica; pozri [Ochrana obsahu](/sk/spec/04-utilities#23-content-protection-lock).
