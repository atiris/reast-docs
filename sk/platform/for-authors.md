# Pre autorov

Všetko platformovo-špecifické o písaní a publikovaní na Reast. Pre samotný jazyk Rea pozrite [Cheatsheet](/sk/spec/REA-CHEATSHEET) alebo [úplnú špecifikáciu](/sk/spec/); pre štruktúrovanie a balenie súboru príbehu pozrite [Návrh príbehov](design/).

## Ako písať

Príbehy sa píšu v Rea — jednoduchom značkovacom jazyku navrhnutom pre interaktívne naratívy. Ak viete napísať textovú správu, viete napísať príbeh v Rea. Vopred sa nemusíte učiť žiadne programátorské koncepty — jednoducho začnite písať.

::: tip Vyskúšajte si to naživo
Otvorte editor a píšte popri tomto návode. Živý náhľad sa aktualizuje počas písania, takže presne vidíte, čo zažijú čitatelia.
:::

Platný príbeh je jednoducho text. Žiadna špeciálna syntax nie je potrebná:

```rea
Kedysi dávno, v ďalekej krajine,
sa mladý pútnik vydal na cestu.

Cesta sa pred ním tiahla donekonečna.
```

Pridajte štruktúru pomocou nadpisov (`#`) a volieb (`*`), aby bol príbeh interaktívny:

```rea
# Kapitola prvá

Stojíte na križovatke.

* [Choď doľava]
  Cesta sa vinie do tmavého lesa.
* [Choď doprava]
  Pred vami sa tiahne jasná lúka.

- Vietor za vami šepká.
```

Úplnú sadu syntaxe Rea — premenné, podmienky, dialógy, karty, médiá — nájdete v [Cheatsheet](/sk/spec/REA-CHEATSHEET).

## Vstavaný editor

Platforma ponúka editor v prehliadači so živým náhľadom: na jednej strane píšete Rea, na druhej presne vidíte, čo zažijú čitatelia. Stará sa o metadáta (názov, obálka, štítky, žáner), nahrávanie médií a zabalenie výsledku do súboru `.reast` — archív nikdy neskladáte ručne. Preferujete obyčajný textový editor? Pozrite [Návrh príbehov](design/), ako písať príbeh mimo editora platformy a nahrať hotový balík.

## Publikovanie a viditeľnosť

Príbeh, na ktorom pracujete, je viditeľný iba vám, kým sa nerozhodnete inak. Každý príbeh má nastavenie viditeľnosti:

- **`private`** — viditeľný iba vám. Predvolené nastavenie, kým je príbeh rozpracovaný.
- **`unlisted`** — dostupný komukoľvek s priamym odkazom, ale nezobrazuje sa v katalógu ani vo vyhľadávaní. Užitočné na zdieľanie konceptu s beta čitateľmi.
- **`public`** — uvedený v katalógu a objaviteľný ostatnými čitateľmi.

Cena je nezávislá od viditeľnosti: publikovaný príbeh môže byť bezplatný, prémiový (v rámci predplatného platformy) alebo jednorazovo platený — presné pojmy nájdete v [Slovníku](glossary).

## Vaša autorská stránka

Publikovanie príbehu ho pridá na vašu autorskú stránku — prispôsobiteľný profil prezentujúci vaše publikované diela čitateľom, so základnou analytikou o tom, ako čitatelia s jednotlivými príbehmi interagujú.

## Klávesové skratky

| Klávesa  | Akcia                  |
| -------- | ----------------------- |
| `Ctrl+B` | Tučné písmo             |
| `Ctrl+I` | Kurzíva                 |
| `Ctrl+S` | Uložiť príbeh           |
| `Ctrl+M` | Prepnúť panel metadát    |

## Časté otázky

### Môžem písať príbehy vo vlastnom jazyku?

Rozhodne áno. Jazyk Rea je textový a funguje s akýmkoľvek písmom alebo jazykom.

### Ako fungujú GPS a senzorové funkcie?

Do príbehu môžete vložiť polohové spúšťače a senzorové podmienky. Keď zariadenie čitateľa splní tieto podmienky (napríklad dorazí na konkrétne GPS súradnice), príbeh zareaguje. Pozrite sekciu [Interakcia s reálnym svetom](/sk/spec/03-narrative-interaction) v jazykovej špecifikácii.

### Aký formát súborov príbehy používajú?

Príbehy sa píšu v súboroch `.rea` — obyčajný text so značkovacím jazykom Rea. Platforma pri publikovaní zabalí príbeh (spolu s médiami a metadátami) do archívu `.reast`; presne, čo sa v ňom nachádza, nájdete v referencii enginu [formát balíčka](/engine/package-format).
