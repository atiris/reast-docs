# Kde sa pravidlá líšia v `.rext` súboroch

Súbor `.rext` obsahuje Rea kód napísaný v tej istej gramatike ako súbor `.rea`,
ale platí preň prísnejšia podmnožina. Táto stránka pokrýva iba to, čo sa mení,
keď sa Rea parsuje ako rozširujúci modul; pre rozloženie archívu, kľúče
manifestu a mechaniku načítavania okolo `.rext` súborov pozri referenciu
enginu [formát balíčka `.reast`](/engine/package-format#packaged)
a [Rozširovanie enginu](/engine/extending).

## Iba deklarácie

Súbor `.rext` smie obsahovať len:

- bloky `{function …}`…`{end function}`,
- konštanty `{set}` na najvyššej úrovni,
- importy `{use}`,
- komentáre.

Akýkoľvek prozaický uzol — odsek, nadpis, skupina volieb, médium, blokový
citát, dialóg alebo definícia karty — kdekoľvek v `.rext` je **chyba pri
načítaní**. Každý `.rext` v archíve sa skompiluje a overí pri načítaní, ešte
pred spustením akejkoľvek prózy, takže pokazené rozšírenie zlyhá pri
publikovaní, nie na zariadení čitateľa.

Príkazy riadenia toku (`{if}`, `{return}`, …) sú povolené len **vnútri** tiel
funkcií — holý `{if}` na najvyššej úrovni `.rext` je v tomto zmysle próza a je
odmietnutý rovnako, ako by bol odmietnutý odsek.

## `{use}` je povinné — samotná prítomnosť modul neaktivuje

`.rext` prítomný v archíve sa skompiluje a overí, ale nie je **aktívny**, kým
ho príbeh nenaviaže `{use}`. Ide o skutočnú požiadavku za behu, nie o zastaranú
dokumentáciu: iba `{use}` naplní väzby rozšírení interpretera a volanie cez
meno, ktoré nikdy neprešlo `{use}`, sa ticho vyrieši na `undefined` — loader
nevyhlási žiadnu chybu. Väzby sú modulové a netranzitívne: časť, ktorá sama
zavolá `{use}`, automaticky nesprístupní alias inej časti, ktorá chce zavolať
to isté rozšírenie — každá časť si `{use}` volá nezávisle.

```rea
{use "extensions/inventory" as inv}

Tvoj batoh váži {inv.total_weight()} kg.
```

Pravidlá, ktoré loader vynucuje nad grafom `{use}`:

- **Iba rozlíšenie v rámci balíčka** — cesta `{use}` sa rozlišuje vnútri
  balíčka, nikdy v súborovom systéme, nikdy v sieti.
- **Graf `{use}` musí byť acyklický** — cyklus zlyhá pri načítaní a pomenuje
  daný cyklus.
- **Duplicitné mená exportov sú chyba**, nie „vyhráva prvý".
- **`{use}` chýbajúcej cesty zlyhá načítanie**, rovnako ako položka
  `manifest.extensions`, ktorá nie je prítomná v archíve.

## Konštanta `{set}` na najvyššej úrovni je súkromná, nie premenná príbehu

Vnútri `.rext` deklaruje `{set}` na najvyššej úrovni modulu **súkromnú
konštantu**. Jeho funkcie ju vedia čítať, ale nikdy sa nestane premennou
príbehu: nikdy sa neobjaví v exportovanom stave čítania, dva moduly môžu
deklarovať rovnaké meno konštanty bez kolízie a modul nikdy nemôže prepísať
premennú, ktorú autor deklaroval inde. Parameter funkcie s rovnakým menom
konštantu zatieni.

`{set}` **vnútri** tela funkcie sa riadi bežným rozsahom platnosti Rea funkcií
a zapisuje premennú príbehu presne tak, ako by to urobil v súbore `.rea` — stav
cyklu preto akumulujte rekurziou, nie počítadlom, ktoré unikne do uloženého
stavu čitateľa.

## Funkcie príbehu (`.rea`) zostávajú súkromné

Súbor `.rea` môže naďalej deklarovať `{function}`, ale tie sú **súkromné a
platné len v danom dokumente** — exportujú iba funkcie z `.rext`. Ak chcete
zdieľať funkciu naprieč časťami, presuňte ju do `.rext` a naviažte ju `{use}`
z každej časti, ktorá ju potrebuje.
