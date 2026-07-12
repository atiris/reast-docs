# Slovník

Kľúčové pojmy používané naprieč platformou Reast. Hľadáte internú/vývojársku terminológiu? Pozrite `docs/internal/glossary.md` v orchestrátorovom repozitári (len pre vývojárov, tu sa nepublikuje).

## Pojmy platformy

| Pojem                  | Popis                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| **Reast**              | Zabalený interaktívny príbeh — súborový formát (`.rea` / `.reast`) a obsah, ktorý obsahuje. |
| **Rea**                | Značkovací jazyk na písanie interaktívnych príbehov.                                        |
| **Príbeh**             | Kompletný interaktívny naratív napísaný v Rea, publikovaný na platforme.                    |
| **Kapitola**           | Sekcia najvyššej úrovne príbehu, definovaná nadpisom `#` v Rea.                             |
| **Scéna**              | Podsekcia v rámci kapitoly, definovaná nadpismi `##` alebo hlbšími.                         |
| **Voľba**              | Rozhodovací bod, kde čitateľ vyberá z možností ovplyvňujúcich naratív.                      |
| **Príkaz**             | Inštrukcia `{kľúčové_slovo}` v Rea, ktorá riadi logiku, médiá alebo správanie.              |
| **Premenná**           | Pomenovaná hodnota (`{set meno = hodnota}`), ktorá uchováva stav počas čítania.             |
| **Čitateľ**            | Osoba konzumujúca/hrajúca interaktívny príbeh.                                              |
| **Autor**              | Osoba, ktorá píše a publikuje interaktívne príbehy na platforme.                            |
| **Player**             | Runtime komponent, ktorý vykresľuje a vykonáva Rea príbehy v prehliadači.                   |
| **Polička**            | Osobná kolekcia uložených/záložkovaných príbehov čitateľa.                                  |
| **Čitateľská skupina** | Viacero čitateľov zažívajúcich rovnaký príbeh spolu so synchronizovanými rozhodnutiami.     |
| **Rola**               | Priradenie postavy v kooperatívnom čítaní — každý čitateľ preberá inú rolu.                 |
| **Postup**             | Aktuálna pozícia a stav čitateľa v príbehu (automaticky ukladaný).                          |
| **Záložka**            | Pomenovaný bod uloženia v príbehu, ku ktorému sa čitateľ môže vrátiť.                       |

## Úrovne príbehov

| Pojem              | Popis                                               |
| ------------------ | --------------------------------------------------- |
| **Voľný príbeh**   | Príbeh dostupný všetkým čitateľom bez platby.       |
| **Premium príbeh** | Príbeh vyžadujúci predplatné platformy pre prístup. |
| **Platený príbeh** | Príbeh s jednorazovou cenou nastavenou autorom.     |

## Technické pojmy

| Pojem        | Popis                                                                              |
| ------------ | ---------------------------------------------------------------------------------- |
| **Parser**   | Komponent, ktorý číta zdrojový text Rea a produkuje štruktúrovaný strom dokumentu. |
| **Runtime**  | Vykonávací engine spracúvajúci príkazy, spravujúci stav a riadiaci naratív.        |
| **Renderer** | Komponent konvertujúci sparsovaný Rea obsah na viditeľné HTML/UI elementy.         |
