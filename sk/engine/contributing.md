# Prispievanie

Jadro Reast sa vyvíja otvorene. Najužitočnejšie príspevky sú práve teraz tie, ktoré nevyžadujú vôbec žiadny prístup k repozitáru.

## Nahláste, čo sa pokazí

Príbeh, ktorý sa vykreslí nesprávne, je tým najcennejším hlásením chyby. Priložte najmenší úryvok `.rea`, ktorý to zopakuje, čo ste čakali a čo ste videli. Ak sa to deje len v balíku, uveďte, ktorú štruktúru archívu ste použili.

Chyby hláste v repozitári jadra: [github.com/atiris/reast-engine](https://github.com/atiris/reast-engine).

## Hádajte sa so špecifikáciou

[Špecifikácia](/sk/spec/) je zmluvou, podľa ktorej sa meria každá implementácia, takže nejednoznačnosť v nej je chybou. Ak sa dá sekcia prečítať dvoma spôsobmi alebo si protirečí s inou sekciou, oplatí sa to nahlásiť presne ako chybu.

[Index funkcií](/sk/spec/features) vám povie, kde ktorá funkcia stojí. Funkcia `draft` je najotvorenejšia prepracovaniu — jej návrh je zapísaný presne preto, aby sa dalo o ňom polemizovať skôr, než ho niekto postaví.

## Postavte druhú implementáciu

Rea definuje tri [úrovne zhody](/sk/spec/05-reference#conformance-levels), aby čiastočná implementácia mohla čestne povedať, čo podporuje. [Referencia formátu balíka `.reast`](package-format) dokumentuje štruktúru archívu aj schému manifestu v plnom rozsahu, takže baliaci nástroj, validátor či alternatívny prehrávač sa dajú napísať bez čítania zdrojov jadra.

Ak nejaký postavíte, dajte nám vedieť — špecifikácia sa zlepšuje najrýchlejšie vtedy, keď ju musí dodržať aj niečo iné než referenčné jadro.

## Kód

Príspevky do jadra sú vítané. Dve veci, ktoré treba vedieť pred začiatkom:

- **Držte sa modulu, v ktorom ste.** Jadro je celé v TypeScripte v prísnom režime a v ESM a každá časť (parser, runtime, zavádzač, prehrávač) má svoje zaužívané vzory.
- **Test prichádza spolu so zmenou.** Zmena parsera alebo runtimu bez testu, ktorý pred ňou zlyhá a po nej prejde, sa vráti späť.
