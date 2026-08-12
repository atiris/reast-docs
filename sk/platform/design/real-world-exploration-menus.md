# Menu objavovania v reálnom svete

Menu na preskúmanie miestnosti premení scénu na miesto, ktoré môže čitateľ prehľadať, namiesto zoznamu tlačidiel na klepnutie. Táto príručka prevedie stavbou takého menu, kreslením a tlačou značiek, ktoré potrebuje, testovaním pred publikovaním aj tým, ako ho udržať férové voči čitateľovi. Samotné mechanizmy jazyka nájdete v častiach [Menu objavovania](/sk/spec/03-narrative-interaction#exploration-menus) a [Aktivácia v reálnom svete](/sk/spec/03-narrative-interaction#real-world-activation) v špecifikácii.

## Príklad s miestnosťou

Predstavte si scénu, v ktorej čitateľ fyzicky stojí v miestnosti — hádanková miestnosť, rekvizita únikovej hry, muzeálna expozícia — a môže nájsť tri veci: QR nálepku na služobných dverách, ručne maľovaný strom na stene a gauč, ktorý stojí za prehľadanie. Ani jedna z nich sa nemusí nájsť v konkrétnom poradí a čitateľ môže jednu úplne minúť a príbeh aj tak dokončiť.

```rea
V miestnosti je ticho. Niekde tu je cesta ďalej, ak ju budeš hľadať.

{menu select=2 begin}
* hidden [&qr_door] Služobné dvere na zvuk tvojho skenu cvaknú a otvoria sa…
* hidden [&painted_tree] Namaľovaný strom na stene sa zaligoce, akoby ťa spoznával…
* hidden [&couch_secret] Pod gaučom nájdeš obálku prilepenú tak, aby nebola vidieť…
* [Vzdaj to a skús recepciu]
{end menu}

{define action qr_door begin}
  name: Služobné dvere
  scan: ^REAST-DOOR-.*
{end define}

{define action painted_tree begin}
  name: Namaľovaný strom
  mark: emb1:Zk3q…
{end define}

{define action couch_secret begin}
  name: Pod gaučom
  description: pozri sa pod gauč; nadvihni pohovku; prehľadaj priestor pod sedadlom
  listen: pod gaučom
{end define}
```

`select=2` udržiava menu otvorené, kým čitateľ nenájde dve z troch skrytých možností, alebo kým to nevzdá cez viditeľnú možnosť „skús recepciu". Každá možnosť sa zobúdza iným kanálom: `qr_door` reaguje len na naskenovaný kód zodpovedajúci vzoru, `painted_tree` len na fotografiu zodpovedajúcej značky a `couch_secret` na napísanie „pozri sa pod gauč" aj na jeho vyslovenie. Nech sa spustí ktorýkoľvek kanál, rozprávanie za možnosťou sa prehrá presne tak, ako keby čitateľ klepol na bežnú voľbu.

## Kreslenie a tlač značiek

**Značka** je kresba — smajlík, krížik, namaľovaný strom, čokoľvek výrazné — ktorú čitateľ odfotí, aby možnosť aktivoval. Netreba QR kód ani vytlačený vzor; kódom je samotná značka.

V editore otvorte z panela nástrojov **Nakresli značku** alebo použite pole kreslenej značky v dialógu **Vložiť aktivačné menu**. Kreslite priamo na plátno alebo nahrajte fotografiu niečoho, čo ste už namaľovali alebo nakreslili na papier, drevo či stenu — kdekoľvek. Editor z kresby vypočíta podpis a zapíše ho do poľa `mark:` karty automaticky; túto hodnotu nikdy nepíšete ani neupravujete ručne. Dialóg vás zároveň upozorní, ak je nová značka priveľmi podobná inej značke už použitej v príbehu, aby dve skryté možnosti omylom neodpovedali na tú istú kresbu.

Keď je značka uložená, dialóg „Nakresli značku" vám poskytne tlačiteľný obrázok PNG. Vytlačte ho alebo ho použite ako šablónu a značku namaľujte naozaj — na rekvizitu, na stenu, na kartón nechaný na mieste. Fotoaparát čitateľa priradí fotografiu fyzickej značky späť k podpisu priamo na zariadení; na dosiahnutie zhody sa nikam nič nenahráva.

## Testovanie menu

- **Otestujte každý kanál osobitne.** Naskenujte vytlačený QR kód, odfoťte vytlačenú alebo namaľovanú značku a napíšte (potom vyslovte) frázu voľného textu — overte, že každý aktivuje svoju vlastnú možnosť a žiadnu inú.
- **Otestujte netrafenie.** Naskenujte nesúvisiaci kód, odfoťte niečo nesúvisiace, napíšte nesúvisiacu frázu — čitateľ by mal dostať jemné „nič sa nestalo", nie chybu ani spustenie nesprávnej možnosti.
- **Prejdite celé menu.** Objavujte možnosti pri každom prechode v inom poradí a overte, že `select=N` menu správne predkladá znovu a zatvorí sa, keď sa počet naplní alebo keď sa výber vyčerpá.
- **Skontrolujte krok späť.** Krok späť po objave by sa mal vrátiť presne o jeden objav a skoršie nálezy ponechať na mieste — pozri [Krok späť a uloženia vnútri menu](/sk/spec/03-narrative-interaction#undo-and-saves-inside-a-menu).
- **Ak môžete, vyskúšajte to priamo na mieste.** Osvetlenie, vzdialenosť aj veľkosť výtlačku ovplyvňujú, či fotoaparát spoľahlivo prečíta QR kód alebo priradí značku; značka, ktorá sa čisto odfotí na monitore, sa nemusí rovnako čisto odfotiť na stene tri metre ďaleko.

## Férovosť: vždy nechajte viditeľnú cestu ďalej

Skryté možnosti sú odmenou pre zvedavých čitateľov, nikdy nie podmienkou dokončenia príbehu. Menu objavovania udržia férovým dve pravidlá:

- **Vždy poskytnite viditeľnú cestu ďalej.** Menu by malo vždy obsahovať aspoň jednu možnosť, ktorá nie je `hidden` — ako „Vzdaj to a skús recepciu" v príklade vyššie — aby čitateľ, ktorý nenájde nič, mohol pokračovať. Nikdy nepodmieňujte hlavný príbeh výhradne skrytou možnosťou.
- **Na skrytý obsah naznačte v próze, nie v návestí voľby.** Klasická výčitka voči starej interaktívnej fikcii postavenej na parseri znie „háda sa sloveso" — obsah skrytý tak dobre, že si čitateľ nikdy neuvedomí, že existuje. Návestie skrytej možnosti sa objaví až *po* jej aktivácii, takže pozvánka na hľadanie musí žiť v okolitom rozprávaní: „Niekde tu je cesta ďalej, ak ju budeš hľadať" povie čitateľovi, že sa dá niečo nájsť, bez toho, aby prezradilo čo. Popis miestnosti napíšte tak, aby si pozorný čitateľ všimol dvere, namaľovaný strom aj podozrivý gauč — rozprávanie o objave vnútri samotnej možnosti je miesto, kam patrí odmena aj prípadné ďalšie nápovedy.
