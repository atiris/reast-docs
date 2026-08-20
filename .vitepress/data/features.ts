/**
 * Feature status registry — the single source of truth for every Rea feature's
 * maturity.
 *
 * Both the inline `<Feature id="…"/>` badge rendered under a spec heading and
 * the grouped table on `/spec/features` read from this file, so a status is
 * written once and can never drift between the two.
 *
 * A feature's `status` answers "can an author rely on this today?", not "how
 * much of it is coded":
 *
 * - `stable`       — released and frozen. Only a new MAJOR version may change it.
 * - `experimental` — released and usable, but the syntax may still move.
 * - `development`  — designed and being built; not reachable by authors yet.
 * - `draft`        — specified and discussed; no implementation has started.
 * - `cancelled`    — deliberately not part of Rea. The note says why.
 *
 * Every author-facing string is a `Localized` map keyed by locale, and the type
 * requires an entry for every locale in `LOCALES` — so a feature cannot be added
 * in one language only, and adding a locale to `LOCALES` fails the type-check
 * until every entry has been translated. The components resolve a map to one
 * string through `localizeFeature()` / `t()`, from the page's `lang`.
 *
 * `since` is the spec version a feature became available in, and is set only
 * for `stable` and `experimental` features — the two statuses that are actually
 * published. A `development`, `draft` or `cancelled` feature has no version yet
 * (or never will), so its badge shows the status alone.
 */

export type FeatureStatus = 'stable' | 'experimental' | 'development' | 'draft' | 'cancelled';

/**
 * Every locale the registry is written in, in the order a translator should
 * read them — English first, because it is the source the rest translate.
 *
 * Adding one here is deliberately a breaking change: `Localized` requires a key
 * per locale, so the type-check fails on every untranslated entry until the new
 * language is complete. That is the point — a half-translated registry would
 * otherwise render silently in the wrong language.
 *
 * `scripts/check-anchors.mjs` reads this array out of this file, so it validates
 * the registry's links for a new locale without being edited.
 */
export const LOCALES = ['en', 'sk'] as const;

export type FeatureLang = (typeof LOCALES)[number];

/** One author-facing string, written once per locale. All locales required. */
export type Localized = Record<FeatureLang, string>;

/**
 * Where each locale's pages live. A `link` is stored once in its English form
 * and prefixed with this — the translated spec pages carry explicit `{#anchor}`
 * slugs matching the English ones for exactly that reason, so a translated
 * heading never moves a link target.
 */
export const LOCALE_PATHS: Record<FeatureLang, string> = {
  en: '',
  sk: '/sk',
};

export interface FeatureGroup {
  /** Stable slug, used as the anchor on the feature index. */
  id: string;
  /** Group heading on the feature index. */
  title: Localized;
  /** One line describing what this group of features is for. */
  summary: Localized;
  /** Spec page the group is documented on, in its English form. */
  link: string;
}

export interface Feature {
  /** Stable slug referenced by `<Feature id="…"/>`. */
  id: string;
  /** Feature name as it appears in the index. */
  title: Localized;
  /** Group this feature belongs to. */
  group: string;
  /** The syntax an author writes, when the feature has one. */
  syntax?: string;
  status: FeatureStatus;
  /** Spec version the feature shipped in. Only for `stable` / `experimental`. */
  since?: string;
  /** One sentence: what the status means for this feature in particular. */
  note: Localized;
  /** Deep link to the section documenting it, in its English form. */
  link?: string;
}

/** A feature or group with its strings and link resolved for one locale. */
export interface LocalizedFeature extends Omit<Feature, 'title' | 'note'> {
  title: string;
  note: string;
}

export interface LocalizedGroup extends Omit<FeatureGroup, 'title' | 'summary'> {
  title: string;
  summary: string;
}

export const STATUS_ORDER: FeatureStatus[] = [
  'stable',
  'experimental',
  'development',
  'draft',
  'cancelled',
];

/**
 * Not `Localized`, and deliberately so: the status slugs stay English in every
 * language. They are the terms a manifest, a changelog and this specification
 * all use, so translating the label would have a Slovak page naming a status no
 * other document does. Only the explanatory tooltip below is translated.
 */
export const STATUS_LABELS: Record<FeatureStatus, string> = {
  stable: 'stable',
  experimental: 'experimental',
  development: 'development',
  draft: 'draft',
  cancelled: 'cancelled',
};

export const STATUS_DESCRIPTIONS: Record<FeatureStatus, Localized> = {
  stable: {
    en: 'Released and frozen — only a new MAJOR version may change it. Safe to build on.',
    sk: 'Vydané a zmrazené — zmeniť to môže len nová verzia MAJOR. Bezpečné stavať na tom.',
  },
  experimental: {
    en: 'Released and usable, but the syntax may still change within this MAJOR version.',
    sk: 'Vydané a použiteľné, ale syntax sa v rámci tejto verzie MAJOR ešte môže zmeniť.',
  },
  development: {
    en: 'Designed and being built. Not reachable by authors yet — do not write stories against it.',
    sk: 'Navrhnuté a práve sa stavia. Pre autorov zatiaľ nedostupné — nepíšte proti tomu príbehy.',
  },
  draft: {
    en: 'Specified and discussed, but no implementation has started. The design may still change completely.',
    sk: 'Špecifikované a prediskutované, ale implementácia sa nezačala. Návrh sa ešte môže úplne zmeniť.',
  },
  cancelled: {
    en: 'Deliberately not part of Rea. Documented so the decision stays visible.',
    sk: 'Zámerne nie je súčasťou Rea. Zdokumentované preto, aby rozhodnutie zostalo viditeľné.',
  },
};

/**
 * The chrome around the badges — everything `Feature.vue` and `FeatureIndex.vue`
 * write themselves rather than read from an entry. It lives here, in the same
 * `Localized` shape as the data, so adding a locale surfaces these strings in
 * the same type error as the 161 entries below instead of leaving two Vue files
 * quietly rendering English.
 *
 * `{n}` and `{total}` are substituted by `ui()`.
 */
export const UI: Record<string, Localized> = {
  sincePrefix: { en: 'since', sk: 'od' },
  sinceTitle: {
    en: 'Rea spec version this feature became available in',
    sk: 'Verzia špecifikácie Rea, v ktorej sa táto funkcia stala dostupnou',
  },
  unknownFeature: { en: 'unknown feature', sk: 'neznáma funkcia' },
  // Backticks become <code> via renderNote(), which escapes the id first.
  unknownNote: {
    en: 'No feature is registered under the id `{id}` in `.vitepress/data/features.ts`.',
    sk: 'Pod identifikátorom `{id}` nie je v súbore `.vitepress/data/features.ts` zaregistrovaná žiadna funkcia.',
  },
  filterLabel: { en: 'Filter features by status', sk: 'Filtrovať funkcie podľa stavu' },
  showAll: { en: 'show all', sk: 'zobraziť všetko' },
  indexSummary: {
    en: '{total} features across {groups} areas of the language. Select a status below to narrow the list.',
    sk: '{total} funkcií v {groups} oblastiach jazyka. Zoznam zúžite výberom stavu nižšie.',
  },
  indexFiltered: {
    en: 'Showing {n} of {total} features.',
    sk: 'Zobrazených {n} z {total} funkcií.',
  },
};

/** One UI string, resolved for a locale, with `{placeholders}` filled in. */
export function ui(key: keyof typeof UI, lang: FeatureLang, vars: Record<string, string | number> = {}): string {
  return Object.entries(vars).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    t(UI[key], lang),
  );
}

export const GROUPS: FeatureGroup[] = [
  {
    id: 'text',
    title: {
      en: 'Text & prose',
      sk: 'Text a próza',
    },
    summary: {
      en: 'The markup an ordinary paragraph already uses. This is the frozen core of the language.',
      sk: 'Značkovanie, ktoré bežný odsek už používa. Toto je zmrazené jadro jazyka.',
    },
    link: '/spec/01-basics',
  },
  {
    id: 'references',
    title: {
      en: 'Links, anchors & media',
      sk: 'Odkazy, kotvy a médiá',
    },
    summary: {
      en: 'Everything written in square brackets: navigation, embedded media, and notes hung off a span of text.',
      sk: 'Všetko písané v hranatých zátvorkách: navigácia, vložené médiá a poznámky zavesené na úsek textu.',
    },
    link: '/spec/01-basics#_7-links',
  },
  {
    id: 'commands',
    title: {
      en: 'Commands & variables',
      sk: 'Príkazy a premenné',
    },
    summary: {
      en: 'Curly-brace commands, story state, and the data types a variable can hold.',
      sk: 'Príkazy v zložených zátvorkách, stav príbehu a dátové typy, ktoré premenná môže uchovať.',
    },
    link: '/spec/02-logic-data#_10-commands',
  },
  {
    id: 'expressions',
    title: {
      en: 'Expressions & operators',
      sk: 'Výrazy a operátory',
    },
    summary: {
      en: 'Computing values: arithmetic, comparison, pattern matching, and type handling.',
      sk: 'Výpočet hodnôt: aritmetika, porovnávanie, hľadanie vzorov a práca s typmi.',
    },
    link: '/spec/02-logic-data#_12-expressions-operators',
  },
  {
    id: 'control-flow',
    title: {
      en: 'Control flow',
      sk: 'Riadenie toku',
    },
    summary: {
      en: 'Conditionals, loops, and state machines.',
      sk: 'Podmienky, cykly a stavové automaty.',
    },
    link: '/spec/02-logic-data#_13-control-flow',
  },
  {
    id: 'functions',
    title: {
      en: 'Functions & extensibility',
      sk: 'Funkcie a rozšíriteľnosť',
    },
    summary: {
      en: 'Reusable logic inside a story, portable modules that travel in the package, and host-supplied code.',
      sk: 'Znovupoužiteľná logika vnútri príbehu, prenosné moduly cestujúce v balíku a kód dodaný hostiteľom.',
    },
    link: '/spec/functions',
  },
  {
    id: 'choices',
    title: {
      en: 'Choices & branching',
      sk: 'Voľby a vetvenie',
    },
    summary: {
      en: 'How a reader moves through the story, and how the story remembers where they have been.',
      sk: 'Ako sa čitateľ pohybuje príbehom a ako si príbeh pamätá, kde už bol.',
    },
    link: '/spec/03-narrative-interaction#_16-choices-branching',
  },
  {
    id: 'storylets',
    title: {
      en: 'Storylets & exploration',
      sk: 'Storylety a objavovanie',
    },
    summary: {
      en: 'Non-linear, quality-based narrative: content the story deals out instead of routing to.',
      sk: 'Nelineárny naratív riadený kvalitami: obsah, ktorý príbeh rozdáva namiesto toho, aby naň smeroval.',
    },
    link: '/spec/storylets',
  },
  {
    id: 'cards',
    title: {
      en: 'Cards, inventory & dialogue',
      sk: 'Karty, inventár a dialóg',
    },
    summary: {
      en: 'Characters, items, actions, custom card sets, the coin wallet, and speaker attribution.',
      sk: 'Postavy, predmety, akcie, vlastné sady kariet, peňaženka mincí a pripisovanie repliky hovorcovi.',
    },
    link: '/spec/03-narrative-interaction#_17-cards-characters-items-actions',
  },
  {
    id: 'input',
    title: {
      en: 'Input & interaction',
      sk: 'Vstup a interakcia',
    },
    summary: {
      en: 'Getting something back from the reader: typed answers, buttons, timers, and voice output.',
      sk: 'Získanie odpovede od čitateľa: napísané odpovede, tlačidlá, časovače a hlasový výstup.',
    },
    link: '/spec/03-narrative-interaction#_19-input-interaction',
  },
  {
    id: 'cooperative',
    title: {
      en: 'Cooperative reading',
      sk: 'Kooperatívne čítanie',
    },
    summary: {
      en: 'Several readers in one story: roles, shared state, group decisions, and solo degradation.',
      sk: 'Viacero čitateľov v jednom príbehu: roly, zdieľaný stav, skupinové rozhodnutia a degradácia na sólo čítanie.',
    },
    link: '/spec/03-narrative-interaction#_20-cooperative-reading',
  },
  {
    id: 'world',
    title: {
      en: 'Real-world interaction',
      sk: 'Interakcia s reálnym svetom',
    },
    summary: {
      en: 'Sensors and physical context: location, codes, tags, motion, light, and weather.',
      sk: 'Senzory a fyzický kontext: poloha, kódy, štítky, pohyb, svetlo a počasie.',
    },
    link: '/spec/03-narrative-interaction#_21-real-world-interactions',
  },
  {
    id: 'localization',
    title: {
      en: 'Localization & formatting',
      sk: 'Lokalizácia a formátovanie',
    },
    summary: {
      en: 'Grammatically correct text and locale-aware numbers and dates, driven by CLDR.',
      sk: 'Gramaticky správny text a čísla a dátumy podľa lokálu, riadené štandardom CLDR.',
    },
    link: '/spec/04-utilities#_22-pluralization-localization',
  },
  {
    id: 'authoring',
    title: {
      en: 'Authoring & diagnostics',
      sk: 'Písanie a diagnostika',
    },
    summary: {
      en: 'Comments, escaping, error behaviour, and the tools an author uses while writing.',
      sk: 'Komentáre, únikové sekvencie, správanie pri chybách a nástroje, ktoré autor používa pri písaní.',
    },
    link: '/spec/04-utilities#_25-escaping-raw-text',
  },
  {
    id: 'packaging',
    title: {
      en: 'Packaging & distribution',
      sk: 'Balenie a distribúcia',
    },
    summary: {
      en: 'File types, the archive layout, the manifest, and how a package reaches a reader.',
      sk: 'Typy súborov, štruktúra archívu, manifest a cesta balíka k čitateľovi.',
    },
    link: '/spec/05-reference#_28-file-format-packaging',
  },
  {
    id: 'omitted',
    title: {
      en: 'Deliberately not in Rea',
      sk: 'Zámerne nie je v Rea',
    },
    summary: {
      en: 'Constructs that were considered and ruled out. Listed so the decision stays visible instead of being rediscovered.',
      sk: 'Konštrukcie, ktoré boli zvážené a vylúčené. Uvedené preto, aby rozhodnutie zostalo viditeľné a nebolo objavované znova.',
    },
    link: '/spec/05-reference#what-rea-intentionally-omits',
  },
];

export const FEATURES: Feature[] = [
  // ── Text & prose ──────────────────────────────────────────────────────────
  {
    id: 'plain-text',
    title: {
      en: 'Plain text is a story',
      sk: 'Čistý text je príbeh',
    },
    group: 'text',
    syntax: 'Once upon a time…',
    status: 'stable',
    since: '1.0',
    note: {
      en: 'The defining property of the language — a paragraph of prose is a complete, renderable story with no syntax at all.',
      sk: 'Definujúca vlastnosť jazyka — odsek prózy je kompletný, vykresliteľný príbeh úplne bez syntaxe.',
    },
    link: '/spec/01-basics#_2-text-paragraphs',
  },
  {
    id: 'paragraphs',
    title: {
      en: 'Paragraphs & line breaks',
      sk: 'Odseky a zalomenia riadkov',
    },
    group: 'text',
    syntax: 'blank line · trailing \\',
    status: 'stable',
    since: '1.0',
    note: {
      en: 'Blank-line paragraphs, single-newline hard breaks and the trailing backslash join are part of the frozen prose core.',
      sk: 'Odseky oddelené prázdnym riadkom, tvrdé zalomenie jedným novým riadkom a spojenie koncovou spätnou lomkou sú súčasťou zmrazeného jadra prózy.',
    },
    link: '/spec/01-basics#_2-text-paragraphs',
  },
  {
    id: 'inline-formatting',
    title: {
      en: 'Italic, bold & bold italic',
      sk: 'Kurzíva, tučné a tučná kurzíva',
    },
    group: 'text',
    syntax: '_italic_ · *bold* · _*both*_',
    status: 'stable',
    since: '1.0',
    note: {
      en: 'The only two inline markers in the language; nesting and combination are specified and will not change in 1.x.',
      sk: 'Jediné dva inline znaky formátovania v jazyku; vnorenie aj kombinovanie sú špecifikované a v 1.x sa nezmenia.',
    },
    link: '/spec/01-basics#_3-text-formatting',
  },
  {
    id: 'extended-formatting',
    title: {
      en: 'Underline, strikethrough & monospace',
      sk: 'Podčiarknutie, prečiarknutie a neproporcionálne písmo',
    },
    group: 'text',
    syntax: '{underline begin}…{end underline}',
    status: 'stable',
    since: '1.0',
    note: {
      en: 'Paired commands rather than inline markers, so rarely-used decoration never competes with prose punctuation.',
      sk: 'Párové príkazy namiesto inline značiek, aby zriedka používaná dekorácia nikdy nesúperila s interpunkciou prózy.',
    },
    link: '/spec/01-basics#extended-formatting',
  },
  {
    id: 'format-command',
    title: {
      en: 'Arbitrary text formatting',
      sk: 'Ľubovoľné formátovanie textu',
    },
    group: 'text',
    syntax: '{format color="#00f" begin}…{end format}',
    status: 'development',
    note: {
      en: 'Being built now: a general formatting block for colour, size and weight. The syntax is settled but the parser does not accept it yet, so `{format}` currently renders as plain text.',
      sk: 'Práve sa stavia: všeobecný formátovací blok pre farbu, veľkosť a hrúbku. Syntax je dohodnutá, ale parser ju zatiaľ neprijíma, takže `{format}` sa dnes vykreslí ako čistý text.',
    },
    link: '/spec/01-basics#rich-formatting',
  },
  {
    id: 'code-blocks',
    title: {
      en: 'Code & plaintext blocks',
      sk: 'Bloky kódu a čistého textu',
    },
    group: 'text',
    syntax: 'backtick fence',
    status: 'stable',
    since: '1.0',
    note: {
      en: 'Backtick fences with the escalating-delimiter nesting rule, plus inline code, are frozen.',
      sk: 'Ohraničenie spätnými apostrofmi s pravidlom stupňovaného oddeľovača pri vnáraní, spolu s inline kódom, sú zmrazené.',
    },
    link: '/spec/01-basics#code-plaintext-blocks',
  },
  {
    id: 'headings',
    title: {
      en: 'Headings',
      sk: 'Nadpisy',
    },
    group: 'text',
    syntax: '# · ## · ### …',
    status: 'stable',
    since: '1.0',
    note: {
      en: 'Valid from the first release and unchanged since; unlimited depth, with the platform rendering as many levels as its theme distinguishes.',
      sk: 'Platné od prvého vydania a odvtedy nezmenené; neobmedzená hĺbka, pričom platforma vykreslí toľko úrovní, koľko jej téma rozlišuje.',
    },
    link: '/spec/01-basics#_4-headings',
  },
  {
    id: 'heading-anchors',
    title: {
      en: 'Automatic heading anchors',
      sk: 'Automatické kotvy nadpisov',
    },
    group: 'text',
    syntax: '## The Forest → #the_forest',
    status: 'stable',
    since: '1.0',
    note: {
      en: 'The five-step slug rule is frozen, because changing it would silently break every existing link into a heading.',
      sk: 'Päťkrokové pravidlo tvorby kotvy je zmrazené, pretože jeho zmena by ticho rozbila každý existujúci odkaz na nadpis.',
    },
    link: '/spec/01-basics#heading-anchors',
  },
  {
    id: 'alignment',
    title: {
      en: 'Alignment & indentation',
      sk: 'Zarovnanie a odsadenie',
    },
    group: 'text',
    syntax: '= centre · > right · < left',
    status: 'stable',
    since: '1.0',
    note: {
      en: 'Prefix alignment and its repeat-for-indent rule are part of the frozen prose core.',
      sk: 'Zarovnanie prefixom a jeho pravidlo opakovania pre odsadenie sú súčasťou zmrazeného jadra prózy.',
    },
    link: '/spec/01-basics#_5-alignment-indentation',
  },
  {
    id: 'blockquotes',
    title: {
      en: 'Blockquotes',
      sk: 'Citácie',
    },
    group: 'text',
    syntax: '| quote · || nested',
    status: 'stable',
    since: '1.0',
    note: {
      en: 'Pipe-prefixed quoting with unlimited nesting, frozen since the first release.',
      sk: 'Citovanie prefixom zvislej čiary s neobmedzeným vnáraním, zmrazené od prvého vydania.',
    },
    link: '/spec/01-basics#blockquotes',
  },
  {
    id: 'horizontal-rules',
    title: {
      en: 'Horizontal rules',
      sk: 'Vodorovné čiary',
    },
    group: 'text',
    syntax: '- · -- · --- · ---- · -----',
    status: 'stable',
    since: '1.0',
    note: {
      en: 'Five semantic weights, heaviest first — the same "more characters means lighter" rule headings use.',
      sk: 'Päť sémantických váh, od najťažšej; rovnaké pravidlo „viac znakov znamená ľahšie", aké používajú nadpisy.',
    },
    link: '/spec/01-basics#horizontal-rules',
  },

  // ── Links, anchors & media ────────────────────────────────────────────────
  {
    id: 'links',
    title: {
      en: 'Links',
      sk: 'Odkazy',
    },
    group: 'references',
    syntax: '[display text > target]',
    status: 'stable',
    since: '1.0',
    note: {
      en: 'The unified bracket-and-arrow form is the settled answer for every kind of navigation and will not change in 1.x.',
      sk: 'Jednotný tvar so zátvorkou a šípkou je ustálenou odpoveďou na každý druh navigácie a v 1.x sa nezmení.',
    },
    link: '/spec/01-basics#_7-links',
  },
  {
    id: 'custom-anchors',
    title: {
      en: 'Custom anchors',
      sk: 'Vlastné kotvy',
    },
    group: 'references',
    syntax: '[#anchor_name]',
    status: 'stable',
    since: '1.0',
    note: {
      en: 'Marks any spot in the prose as a link target, alongside the anchors headings define implicitly.',
      sk: 'Označí ľubovoľné miesto v próze ako cieľ odkazu, popri kotvách, ktoré nadpisy definujú implicitne.',
    },
    link: '/spec/01-basics#custom-anchors',
  },
  {
    id: 'story-links',
    title: {
      en: 'Story-to-story links',
      sk: 'Odkazy medzi príbehmi',
    },
    group: 'references',
    syntax: '[text > reast://author/story]',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Resolution depends on the hosting platform, so the scheme is published but not yet frozen.',
      sk: 'Rozlíšenie závisí od hostiteľskej platformy, takže schéma je zverejnená, ale ešte nie zmrazená.',
    },
    link: '/spec/01-basics#_7-links',
  },
  {
    id: 'media-embeds',
    title: {
      en: 'Image, video & audio embeds',
      sk: 'Vloženie obrázka, videa a zvuku',
    },
    group: 'references',
    syntax: '[!alt < src] · [>caption < src] · [?caption < src]',
    status: 'stable',
    since: '1.0',
    note: {
      en: 'The three media prefixes and the `<` source arrow are frozen; what a host does with the file is its own business.',
      sk: 'Tri prefixy médií a šípka zdroja `<` sú zmrazené; čo hostiteľ so súborom urobí, je jeho vec.',
    },
    link: '/spec/01-basics#_8-media',
  },
  {
    id: 'media-attributes',
    title: {
      en: 'Media attributes',
      sk: 'Atribúty médií',
    },
    group: 'references',
    syntax: '[!alt < src, width=800, loop]',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'The comma-separated parameter rule is settled; the set of recognised attributes is still growing.',
      sk: 'Pravidlo parametrov oddelených čiarkou je ustálené; množina rozpoznávaných atribútov ešte rastie.',
    },
    link: '/spec/01-basics#media-attributes',
  },
  {
    id: 'footnotes',
    title: {
      en: 'Footnotes',
      sk: 'Poznámky pod čiarou',
    },
    group: 'references',
    syntax: '[the term > ^A note about it.]',
    status: 'stable',
    since: '1.0',
    note: {
      en: 'Inline notes that travel with the text — no separate definition block to keep in sync.',
      sk: 'Inline poznámky, ktoré cestujú spolu s textom — niet samostatného bloku definícií, ktorý treba udržiavať v súlade.',
    },
    link: '/spec/01-basics#footnotes',
  },
  {
    id: 'hints',
    title: {
      en: 'Progressive hints',
      sk: 'Postupné nápovedy',
    },
    group: 'references',
    syntax: '[the tower > *nudge**firmer hint]',
    status: 'stable',
    since: '1.0',
    note: {
      en: 'Nine hint levels behind a reader-controlled switch; the asterisk-run level syntax is frozen.',
      sk: 'Deväť úrovní nápovedy za prepínačom, ktorý ovláda čitateľ; syntax úrovne pomocou série hviezdičiek je zmrazená.',
    },
    link: '/spec/01-basics#hints',
  },
  {
    id: 'part-gates',
    title: {
      en: 'Part gates',
      sk: 'Brány častí',
    },
    group: 'references',
    syntax: '[[ story/0005-forest.rea ]]',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'The automatic, terminal transition between parts of a multi-part story; released, with the in-part `:scene` suffix still settling.',
      sk: 'Automatický, koncový prechod medzi časťami viacdielneho príbehu; vydané, pričom prípona `:scene` v rámci časti sa ešte ustaľuje.',
    },
    link: '/spec/03-narrative-interaction#multi-part-stories',
  },
  {
    id: 'cross-part-links',
    title: {
      en: 'Cross-part links',
      sk: 'Odkazy medzi časťami',
    },
    group: 'references',
    syntax: '[enter the castle > story/0006-castle.rea]',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'A normal link whose target is another part file, letting the reader choose to move on by tapping.',
      sk: 'Bežný odkaz, ktorého cieľom je súbor inej časti, takže čitateľ sa môže posunúť ďalej klepnutím.',
    },
    link: '/spec/03-narrative-interaction#multi-part-stories',
  },

  // ── Commands & variables ──────────────────────────────────────────────────
  {
    id: 'commands',
    title: {
      en: 'Commands',
      sk: 'Príkazy',
    },
    group: 'commands',
    syntax: '{name attr=value} · {name begin}…{end name}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'The always-self-closing-or-paired rule and the `begin`/`{end …}` pairing are released; individual commands carry their own status.',
      sk: 'Pravidlo „vždy buď samouzatvárajúci, alebo párový" a párovanie `begin` / `{end …}` sú vydané; jednotlivé príkazy majú vlastný stav.',
    },
    link: '/spec/02-logic-data#_10-commands',
  },
  {
    id: 'print-shorthand',
    title: {
      en: 'Print shorthand',
      sk: 'Skrátená tlač',
    },
    group: 'commands',
    syntax: 'You have {player.gold} gold.',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'An expression alone inside braces prints its value; released and widely used, but the surrounding expression grammar may still move.',
      sk: 'Samotný výraz v zložených zátvorkách vytlačí svoju hodnotu; vydané a široko používané, ale okolitá gramatika výrazov sa ešte môže pohnúť.',
    },
    link: '/spec/02-logic-data#print-shorthand',
  },
  {
    id: 'attributes',
    title: {
      en: 'Command attributes',
      sk: 'Atribúty príkazov',
    },
    group: 'commands',
    syntax: '{voice speed=3, emotion="whisper" begin}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'One comma-separated parameter grammar shared by commands, functions, media and arrays.',
      sk: 'Jedna gramatika parametrov oddelených čiarkou, spoločná pre príkazy, funkcie, médiá aj polia.',
    },
    link: '/spec/02-logic-data#attributes',
  },
  {
    id: 'set',
    title: {
      en: 'Variables',
      sk: 'Premenné',
    },
    group: 'commands',
    syntax: '{set story.player.gold = 100}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Available since the first release and in real use, but still in its testing phase — assignment and the mandatory-domain rule may be refined before they are frozen.',
      sk: 'Dostupné od prvého vydania a v reálnom používaní, ale stále v testovacej fáze — priradenie aj povinné pravidlo domény sa môžu pred zmrazením upraviť.',
    },
    link: '/spec/02-logic-data#_11-variables-data-types',
  },
  {
    id: 'scopes',
    title: {
      en: 'Domains',
      sk: 'Domény',
    },
    group: 'commands',
    syntax: 'part. · story. · shared. · context.',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Exactly four mandatory domains — part, story, shared, context — each with its own lifetime; heading-scope no longer exists.',
      sk: 'Presne štyri povinné domény — part, story, shared, context — každá s vlastnou životnosťou; rozsah nadpisu už neexistuje.',
    },
    link: '/spec/02-logic-data#scoping',
  },
  {
    id: 'builtin-namespaces',
    title: {
      en: 'Context domain',
      sk: 'Doména context',
    },
    group: 'commands',
    syntax: 'context.reader.* context.time.* context.device.* context.group.*',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'The read-only platform namespace exists under context.*; how many capabilities it exposes depends on the host and is still growing.',
      sk: 'Menný priestor platformy len na čítanie existuje pod context.*; koľko schopností sprístupní, závisí od hostiteľa a stále rastie.',
    },
    link: '/spec/02-logic-data#context-domain',
  },
  {
    id: 'data-types',
    title: {
      en: 'Data types',
      sk: 'Dátové typy',
    },
    group: 'commands',
    syntax: 'string · integer · float · boolean · array · regex · undefined',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'The type set is released, including the always-double-quoted string rule that keeps bare words unambiguous.',
      sk: 'Množina typov je vydaná vrátane pravidla o vždy dvojito uvádzaných reťazcoch, ktoré udržiava holé slová jednoznačné.',
    },
    link: '/spec/02-logic-data#data-types',
  },
  {
    id: 'arrays',
    title: {
      en: 'Arrays',
      sk: 'Polia',
    },
    group: 'commands',
    syntax: '["sword", "map"] · [hp=100, dex=8]',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'The one collection type, with positional and named items in a single literal; 0-based indexing is settled.',
      sk: 'Jediný kolekčný typ, s pozičnými aj pomenovanými položkami v jedinom literáli; indexovanie od nuly je ustálené.',
    },
    link: '/spec/02-logic-data#arrays',
  },
  {
    id: 'datetime-types',
    title: {
      en: 'Date, time & duration values',
      sk: 'Hodnoty dátumu, času a trvania',
    },
    group: 'commands',
    syntax: 'datetime("2026-06-15T10:30") · duration("P1DT2H")',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'ISO 8601 constructors including `*` wildcards for time-of-day patterns.',
      sk: 'Konštruktory podľa ISO 8601 vrátane zástupných znakov `*` pre vzory dennej doby.',
    },
    link: '/spec/02-logic-data#date-time-duration-values',
  },
  {
    id: 'coordinate-literals',
    title: {
      en: 'Coordinate literals & area algebra',
      sk: 'Literály súradníc a algebra oblastí',
    },
    group: 'commands',
    syntax: '@(lat, lng) · circle(p, m) · area(p1, p2, p3) · path(...) · buffer(shape, m) · a + b · a - b',
    status: 'experimental',
    note: {
      en: 'A point is a literal because a story set in a real place writes a great many of them; everything with an extent is an ordinary call on points, so the shapes compose without syntax of their own. Both arguments of `@(lat, lng)` are expressions, `matches` asks whether a point is inside an area, and `+` / `-` are union and difference. Latitude comes first, radii are in metres.',
      sk: 'Bod je literál, pretože príbeh zasadený do reálneho miesta ich píše veľmi veľa; všetko, čo má rozlohu, je bežné volanie nad bodmi, takže sa tvary skladajú bez vlastnej syntaxe. Oba argumenty `@(lat, lng)` sú výrazy, `matches` sa pýta, či bod leží v oblasti, a `+` a `-` sú zjednotenie a rozdiel. Najprv je zemepisná šírka, polomery sú v metroch.',
    },
    link: '/spec/02-logic-data#coordinate-literals',
  },

  // ── Expressions ───────────────────────────────────────────────────────────
  {
    id: 'operators',
    title: {
      en: 'Operators & precedence',
      sk: 'Operátory a priorita',
    },
    group: 'expressions',
    syntax: '+ - * / % = != < > and or ! matches in',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'The full precedence table is released; single `=` for equality is a settled decision, not a placeholder.',
      sk: 'Celá tabuľka priorít je vydaná; jednoduché `=` pre rovnosť je ustálené rozhodnutie, nie dočasná náhrada.',
    },
    link: '/spec/02-logic-data#operator-precedence-highest-to-lowest',
  },
  {
    id: 'ternary',
    title: {
      en: 'Ternary conditional',
      sk: 'Ternárna podmienka',
    },
    group: 'expressions',
    syntax: '{gold > 0 ? "hopeful" : "dejected"}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Inline conditional values at the lowest precedence, so nesting needs explicit parentheses.',
      sk: 'Inline podmienené hodnoty s najnižšou prioritou, takže vnáranie vyžaduje explicitné zátvorky.',
    },
    link: '/spec/02-logic-data#ternary-conditional',
  },
  {
    id: 'pattern-matching',
    title: {
      en: 'Pattern & membership tests',
      sk: 'Testy vzoru a členstva',
    },
    group: 'expressions',
    syntax: 'matches /regex/ · "x" in array',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Keyword operators rather than symbols, each with a `!`-prefixed negation.',
      sk: 'Operátory ako kľúčové slová namiesto symbolov, každý s negáciou pomocou prefixu `!`.',
    },
    link: '/spec/02-logic-data#operator-precedence-highest-to-lowest',
  },
  {
    id: 'type-coercion',
    title: {
      en: 'Type coercion & conversion',
      sk: 'Pretypovanie a konverzia',
    },
    group: 'expressions',
    syntax: 'number(x) · string(x) · boolean(x) · integer(x)',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Implicit coercion inside expressions plus four explicit conversion functions; the "string + anything = string" rule is settled.',
      sk: 'Implicitné pretypovanie vnútri výrazov plus štyri explicitné konverzné funkcie; pravidlo „reťazec + čokoľvek = reťazec" je ustálené.',
    },
    link: '/spec/02-logic-data#type-coercion-in-expressions',
  },

  // ── Control flow ──────────────────────────────────────────────────────────
  {
    id: 'if-else',
    title: {
      en: 'If / else if / else',
      sk: 'If / else if / else',
    },
    group: 'control-flow',
    syntax: '{if cond begin} … {else} … {end if}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'The most used command in the language; released and stable in practice, still formally experimental with the rest of the command layer.',
      sk: 'Najpoužívanejší príkaz jazyka; vydaný a v praxi stabilný, formálne stále experimentálny spolu so zvyškom vrstvy príkazov.',
    },
    link: '/spec/02-logic-data#if-else-if-else',
  },
  {
    id: 'switch-case',
    title: {
      en: 'Switch / case',
      sk: 'Switch / case',
    },
    group: 'control-flow',
    syntax: '{switch expr begin} {case "x"} … {end switch}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Multi-way branching with a `{default}` fallback.',
      sk: 'Viaccestné vetvenie so záložnou vetvou `{default}`.',
    },
    link: '/spec/02-logic-data#switch-case',
  },
  {
    id: 'for-loop',
    title: {
      en: 'For loop',
      sk: 'Cyklus for',
    },
    group: 'control-flow',
    syntax: '{for item in list, index begin} … {end for}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Iterates arrays with an optional 0-based index variable.',
      sk: 'Prechádza polia s voliteľnou premennou indexu počítanou od nuly.',
    },
    link: '/spec/02-logic-data#for-loop',
  },
  {
    id: 'while-loop',
    title: {
      en: 'While loop',
      sk: 'Cyklus while',
    },
    group: 'control-flow',
    syntax: '{while cond, n begin} … {end while}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Condition-driven repetition with an optional iteration counter; the runtime bounds it against runaway loops.',
      sk: 'Opakovanie riadené podmienkou s voliteľným počítadlom iterácií; runtime ho ohraničuje proti nekonečným cyklom.',
    },
    link: '/spec/02-logic-data#while-loop',
  },
  {
    id: 'break-continue',
    title: {
      en: 'Break & continue',
      sk: 'Break a continue',
    },
    group: 'control-flow',
    syntax: '{break} · {continue}',
    status: 'draft',
    note: {
      en: 'Specified alongside the loops but not implemented — a loop currently runs to its natural end. Authors exit early with a condition instead.',
      sk: 'Špecifikované spolu s cyklami, ale neimplementované — cyklus dnes beží po svoj prirodzený koniec. Autori namiesto toho odchádzajú skôr pomocou podmienky.',
    },
    link: '/spec/02-logic-data#break-continue',
  },
  {
    id: 'state-machines',
    title: {
      en: 'State machines',
      sk: 'Stavové automaty',
    },
    group: 'control-flow',
    syntax: '{state_machine door, initial="locked" begin}',
    status: 'development',
    note: {
      en: 'The parser accepts states, transitions and guards, and the runtime tracks the current state; persistence and sharing across readers are still being built, so it is not offered to authors yet.',
      sk: 'Parser prijíma stavy, prechody aj strážne podmienky a runtime sleduje aktuálny stav; perzistencia a zdieľanie medzi čitateľmi sa ešte stavajú, takže autorom to zatiaľ nie je ponúknuté.',
    },
    link: '/spec/02-logic-data#state-machines',
  },

  // ── Functions & extensibility ─────────────────────────────────────────────
  {
    id: 'functions',
    title: {
      en: 'Functions',
      sk: 'Funkcie',
    },
    group: 'functions',
    syntax: '{function greet(name) begin} … {end function}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Definition, calls, default parameters and `{return}` all work; the four calling-context classifications are released but may gain linting rules.',
      sk: 'Definícia, volania, predvolené parametre aj `{return}` fungujú; štyri klasifikácie kontextu volania sú vydané, ale môžu pribudnúť pravidlá kontroly.',
    },
    link: '/spec/functions',
  },
  {
    id: 'rext-extensions',
    title: {
      en: 'Rea extensions (`.rext`)',
      sk: 'Rozšírenia Rea (`.rext`)',
    },
    group: 'functions',
    syntax: '{use "extensions/inventory" as inv}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Declaration-only modules that travel inside the package and are compiled and validated before any prose runs.',
      sk: 'Moduly obsahujúce len deklarácie, ktoré cestujú vnútri balíka a sú skompilované a overené ešte pred spustením akejkoľvek prózy.',
    },
    link: '/spec/05-reference#_31-extensibility',
  },
  {
    id: 'std-library',
    title: {
      en: 'Standard library (`std/*`)',
      sk: 'Štandardná knižnica (`std/*`)',
    },
    group: 'functions',
    syntax: '{use "std/dice" as dice}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Resolved from inside the engine rather than the archive or the host, so it works offline on any embedder; `std/dice` is the first module.',
      sk: 'Rozlišuje sa priamo v jadre, nie v archíve ani u hostiteľa, takže funguje offline v ľubovoľnom vložení; `std/dice` je prvý modul.',
    },
    link: '/spec/05-reference#std-—-the-standard-library',
  },
  {
    id: 'host-extensions',
    title: {
      en: 'Host extensions',
      sk: 'Rozšírenia hostiteľa',
    },
    group: 'functions',
    syntax: '{ns.command args} · {ns.fn()}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'JavaScript the embedder registers per player instance; outside the Rea language proper, and a story must declare the namespaces it needs.',
      sk: 'JavaScript, ktorý vkladajúca aplikácia registruje pre každú inštanciu prehrávača; stojí mimo samotného jazyka Rea a príbeh musí deklarovať menné priestory, ktoré potrebuje.',
    },
    link: '/spec/05-reference#tier-2-—-host-extensions-javascript-supplied-by-the-embedder',
  },
  {
    id: 'events',
    title: {
      en: 'Events',
      sk: 'Udalosti',
    },
    group: 'functions',
    syntax: '{on story_start begin} … {end on}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'The `{on …}` block and lifecycle events are released; sensor-driven events depend on features that are still in development or draft.',
      sk: 'Blok `{on …}` a udalosti životného cyklu sú vydané; udalosti riadené senzormi závisia od funkcií, ktoré sú stále vo vývoji alebo v návrhu.',
    },
    link: '/spec/02-logic-data#_15-events',
  },

  // ── Choices & branching ───────────────────────────────────────────────────
  {
    id: 'choices',
    title: {
      en: 'Choices',
      sk: 'Voľby',
    },
    group: 'choices',
    syntax: '* [One-time] · + [Sticky]',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'One-time and sticky choices, and the before/label/after text rule, are released and in daily use.',
      sk: 'Jednorazové a trvalé voľby, aj pravidlo textu pred návestím, v ňom a za ním, sú vydané a v každodennom používaní.',
    },
    link: '/spec/03-narrative-interaction#simple-choices',
  },
  {
    id: 'conditional-choices',
    title: {
      en: 'Conditional choices',
      sk: 'Podmienené voľby',
    },
    group: 'choices',
    syntax: '* {gold >= 50} [Bribe the guard]',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'A condition in front of the label decides whether the option is offered at all.',
      sk: 'Podmienka pred návestím rozhoduje o tom, či sa možnosť vôbec ponúkne.',
    },
    link: '/spec/03-narrative-interaction#conditional-choices',
  },
  {
    id: 'hidden-choices',
    title: {
      en: 'Hidden choices',
      sk: 'Skryté voľby',
    },
    group: 'choices',
    syntax: '* hidden [&card_id] …',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'An option with no button that fires only through free-text input or a real-world activation; released together with exploration menus.',
      sk: 'Možnosť bez tlačidla, ktorá sa spustí len voľným textovým vstupom alebo aktiváciou v reálnom svete; vydané spolu s menu objavovania.',
    },
    link: '/spec/03-narrative-interaction#hidden-choices',
  },
  {
    id: 'diverts',
    title: {
      en: 'Diverts',
      sk: 'Odbočky',
    },
    group: 'choices',
    syntax: '-> the_clearing',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'The plain jump to a named anchor.',
      sk: 'Jednoduchý skok na pomenovanú kotvu.',
    },
    link: '/spec/03-narrative-interaction#diverts',
  },
  {
    id: 'nested-choices',
    title: {
      en: 'Nested choices & gathers',
      sk: 'Vnorené voľby a zbery',
    },
    group: 'choices',
    syntax: '* * [Deeper] · - gather',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Weave-style nesting where branches reconverge at a gather point of matching depth.',
      sk: 'Vnáranie v štýle weave, kde sa vetvy opäť zbiehajú v bode zberu zodpovedajúcej hĺbky.',
    },
    link: '/spec/03-narrative-interaction#nested-choices',
  },
  {
    id: 'fallback-choices',
    title: {
      en: 'Fallback choices',
      sk: 'Záložné voľby',
    },
    group: 'choices',
    syntax: '* ->',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'A textless option taken automatically once nothing else remains eligible.',
      sk: 'Možnosť bez textu, ktorá sa vyberie automaticky, keď už nič iné nie je použiteľné.',
    },
    link: '/spec/03-narrative-interaction#fallback-choices',
  },
  {
    id: 'tunnels',
    title: {
      en: 'Tunnels',
      sk: 'Tunely',
    },
    group: 'choices',
    syntax: '->-> examine_lock',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Divert into a section that returns to the caller automatically — the mechanism triggered storylets reuse.',
      sk: 'Odbočka do sekcie, ktorá sa automaticky vráti volajúcemu — mechanizmus, ktorý znovu využívajú spúšťané storylety.',
    },
    link: '/spec/03-narrative-interaction#tunnels-divert-and-return',
  },
  {
    id: 'once-then',
    title: {
      en: 'First-visit content',
      sk: 'Obsah pri prvej návšteve',
    },
    group: 'choices',
    syntax: '{once begin} … {then} … {end once}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Primary content on the first encounter, an optional fallback on every later one.',
      sk: 'Hlavný obsah pri prvom stretnutí, voliteľná náhrada pri každom ďalšom.',
    },
    link: '/spec/03-narrative-interaction#first-visit-content',
  },
  {
    id: 'varying-text',
    title: {
      en: 'Varying text',
      sk: 'Meniaci sa text',
    },
    group: 'choices',
    syntax: '{a|b|c} · {&cycle} · {!once} · {~shuffle}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Sequence, cycle, once and shuffle variants driven by visit count; the shuffle draws from the story’s seeded generator, so a replay is reproducible.',
      sk: 'Varianty sekvencie, cyklu, jedného zobrazenia a náhodného poradia riadené počtom návštev; premiešanie čerpá zo seedovaného generátora príbehu, takže opakované prehratie je reprodukovateľné.',
    },
    link: '/spec/03-narrative-interaction#varying-text',
  },
  {
    id: 'labels-replace',
    title: {
      en: 'Text replacement (live labels)',
      sk: 'Nahrádzanie textu (živé návestia)',
    },
    group: 'choices',
    syntax: '{label door begin}locked{end label} · {replace door = "open"}',
    status: 'development',
    note: {
      en: 'Labels are parsed and tracked today, but `{replace}` does not yet rewrite them in place — the in-place update path through the renderer is what is being built.',
      sk: 'Návestia sa dnes parsujú a sledujú, ale `{replace}` ich zatiaľ neprepisuje na mieste — práve sa stavia cesta aktualizácie na mieste cez renderer.',
    },
    link: '/spec/03-narrative-interaction#text-replacement-live-labels',
  },
  {
    id: 'cycling-text',
    title: {
      en: 'Cycling text (tap-to-cycle)',
      sk: 'Cyklický text (klepnutím ďalej)',
    },
    group: 'choices',
    syntax: '{cycle color begin}red|blue|green{end cycle}',
    status: 'development',
    note: {
      en: 'The cycle values and the exposed variable work; the tap-to-advance affordance in the reader is still being built.',
      sk: 'Hodnoty cyklu a sprístupnená premenná fungujú; ovládanie klepnutím na posun v čítačke sa ešte stavia.',
    },
    link: '/spec/03-narrative-interaction#cycling-text-tap-to-cycle',
  },
  {
    id: 'parallel-storylines',
    title: {
      en: 'Parallel storylines',
      sk: 'Paralelné dejové línie',
    },
    group: 'choices',
    syntax: '{parallel begin} {thread a begin} … {end parallel}',
    status: 'draft',
    note: {
      en: 'Independent threads that converge at a rendezvous point. Discussed for cooperative reading but not built — nothing in the parser recognises `{parallel}` or `{thread}` yet.',
      sk: 'Nezávislé vlákna, ktoré sa zbiehajú v bode stretnutia. Prediskutované pre kooperatívne čítanie, ale nepostavené — nič v parseri zatiaľ nepozná `{parallel}` ani `{thread}`.',
    },
    link: '/spec/03-narrative-interaction#parallel-storylines',
  },
  {
    id: 'multi-part-stories',
    title: {
      en: 'Multi-part stories',
      sk: 'Viacdielne príbehy',
    },
    group: 'choices',
    syntax: 'manifest.parts + gates + cross-part links',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Parts load on demand, variables accumulate along the path taken, and the saved path rebuilds the scroll-back on resume.',
      sk: 'Časti sa načítavajú na požiadanie, premenné sa hromadia pozdĺž prejdenej cesty a uložená cesta pri obnovení znovu vybuduje históriu čítania.',
    },
    link: '/spec/03-narrative-interaction#multi-part-stories',
  },
  {
    id: 'undo',
    title: {
      en: 'Undo & back navigation',
      sk: 'Krok späť a spätná navigácia',
    },
    group: 'choices',
    syntax: '{undo enabled=false}',
    status: 'draft',
    note: {
      en: 'The runtime keeps a choice-level undo stack, but the `{undo}` command that lets an author disable it for a puzzle section is specified only — the cooperative rules around it are unresolved.',
      sk: 'Runtime si drží zásobník krokov späť na úrovni volieb, ale príkaz `{undo}`, ktorým autor môže krok späť pre hádankovú sekciu vypnúť, je len špecifikovaný — kooperatívne pravidlá okolo neho nie sú vyriešené.',
    },
    link: '/spec/03-narrative-interaction#undo-back-navigation',
  },
  {
    id: 'checkpoints',
    title: {
      en: 'Checkpoints & manual save',
      sk: 'Kontrolné body a ručné uloženie',
    },
    group: 'choices',
    syntax: '{checkpoint name="before_boss"} · {restore name=…}',
    status: 'draft',
    note: {
      en: 'Automatic progress saving works today. Author-declared checkpoints, `{restore}` and `{save enabled=false}` are specified but unbuilt, and the cooperative "all readers must agree" rule needs a design pass first.',
      sk: 'Automatické ukladanie postupu funguje už dnes. Kontrolné body deklarované autorom, `{restore}` a `{save enabled=false}` sú špecifikované, ale nepostavené, a kooperatívne pravidlo „všetci čitatelia musia súhlasiť" si najprv vyžaduje návrhové kolo.',
    },
    link: '/spec/02-logic-data#save-checkpoints',
  },

  // ── Storylets & exploration ───────────────────────────────────────────────
  {
    id: 'storylets',
    title: {
      en: 'Storylets',
      sk: 'Storylety',
    },
    group: 'storylets',
    syntax: '{storylet id begin} require: … {end storylet}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Requirements, priority, weight, cooldown and tags all drive selection; the attribute set is still open to additions.',
      sk: 'Požiadavky, priorita, váha, ochladenie aj štítky riadia výber; množina atribútov je stále otvorená doplneniam.',
    },
    link: '/spec/storylets',
  },
  {
    id: 'storylet-deck',
    title: {
      en: 'Storylet decks',
      sk: 'Balíčky storyletov',
    },
    group: 'storylets',
    syntax: '{deck from="tavern_stories", max=3, shuffle begin}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Presents eligible storylets as a hand of cards the reader picks from.',
      sk: 'Predkladá použiteľné storylety ako ruku kariet, z ktorej si čitateľ vyberá.',
    },
    link: '/spec/storylets',
  },
  {
    id: 'triggered-storylets',
    title: {
      en: 'Triggered storylets',
      sk: 'Spúšťané storylety',
    },
    group: 'storylets',
    syntax: 'trigger: scan · match: "^REAST-.*"',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'A storylet the world deals instead of a deck; it plays as a side path and returns exactly where the reader left off. Which trigger kinds actually fire depends on the reader app and on features still in development.',
      sk: 'Storylet, ktorý rozdáva svet namiesto balíčka; prehrá sa ako vedľajšia cesta a vráti sa presne tam, kde čitateľ prestal. Ktoré druhy spúšťačov skutočne fungujú, závisí od čitateľskej aplikácie a od funkcií, ktoré sú ešte vo vývoji.',
    },
    link: '/spec/storylets#triggered-storylets',
  },
  {
    id: 'exploration-menus',
    title: {
      en: 'Exploration menus',
      sk: 'Menu objavovania',
    },
    group: 'storylets',
    syntax: '{menu select=2 begin} … {end menu}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'A choice group that waits for several discoveries instead of one pick; the `select=all` policy and the menu-beats-storylet priority rule are released.',
      sk: 'Skupina volieb, ktorá čaká na viacero objavov namiesto jedného výberu; politika `select=all` aj pravidlo priority „menu má prednosť pred storyletom" sú vydané.',
    },
    link: '/spec/03-narrative-interaction#exploration-menus',
  },

  // ── Cards, inventory & dialogue ───────────────────────────────────────────
  {
    id: 'character-cards',
    title: {
      en: 'Character cards',
      sk: 'Karty postáv',
    },
    group: 'cards',
    syntax: '[@elena] · {define character elena begin}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Tappable character references backed by a definition block with portrait, title and description.',
      sk: 'Klepnuteľné odkazy na postavy podložené definičným blokom s portrétom, titulom a popisom.',
    },
    link: '/spec/03-narrative-interaction#character-cards',
  },
  {
    id: 'item-cards',
    title: {
      en: 'Item cards & inventory',
      sk: 'Karty predmetov a inventár',
    },
    group: 'cards',
    syntax: '[$golden_key] · {give …} · {take …}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Items, the reader’s pocket, and the `{on_give}` / `{on_take}` lifecycle hooks.',
      sk: 'Predmety, čitateľovo vrecko a háčiky životného cyklu `{on_give}` / `{on_take}`.',
    },
    link: '/spec/03-narrative-interaction#item-cards',
  },
  {
    id: 'action-cards',
    title: {
      en: 'Action cards',
      sk: 'Karty akcií',
    },
    group: 'cards',
    syntax: '[&open_the_gate]',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Branch points with visual emphasis, whose `description:` doubles as the semantic target for free-text input.',
      sk: 'Body vetvenia s vizuálnym dôrazom, ktorých `description:` zároveň slúži ako sémantický cieľ pre voľný textový vstup.',
    },
    link: '/spec/03-narrative-interaction#action-cards',
  },
  {
    id: 'real-world-activation',
    title: {
      en: 'Real-world card activation',
      sk: 'Aktivácia karty v reálnom svete',
    },
    group: 'cards',
    syntax: 'scan: · mark: · listen:',
    status: 'development',
    note: {
      en: 'The card fields parse and match, but the capture side depends on the reader app: scanning and speech are being built, and `mark:` signatures need the editor’s drawing tool, which is not shipped yet.',
      sk: 'Polia karty sa parsujú a porovnávajú, ale strana snímania závisí od čitateľskej aplikácie: skenovanie a reč sa stavajú a `mark:` podpisy potrebujú kresliaci nástroj editora, ktorý zatiaľ nie je vydaný.',
    },
    link: '/spec/03-narrative-interaction#real-world-activation',
  },
  {
    id: 'card-sets',
    title: {
      en: 'Custom card sets',
      sk: 'Vlastné sady kariet',
    },
    group: 'cards',
    syntax: '{define cardset ability begin}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Author-declared card categories with shared acquire/lose/use rules and set-level hooks a card may override.',
      sk: 'Kategórie kariet deklarované autorom so spoločnými pravidlami získania, straty a použitia a s háčikmi na úrovni sady, ktoré karta môže prekryť.',
    },
    link: '/spec/03-narrative-interaction#card-sets-categories',
  },
  {
    id: 'play-card',
    title: {
      en: 'Playing a card',
      sk: 'Zahranie karty',
    },
    group: 'cards',
    syntax: '{play ginko}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Runs a card’s `{on_use}` hook, falling back to its set’s, and emits a `card-played` event hosts can observe.',
      sk: 'Spustí háčik `{on_use}` karty, so záložným háčikom jej sady, a vyšle udalosť `card-played`, ktorú môžu hostitelia sledovať.',
    },
    link: '/spec/03-narrative-interaction#playing-a-card',
  },
  {
    id: 'custom-card-types',
    title: {
      en: 'Custom card types',
      sk: 'Vlastné typy kariet',
    },
    group: 'cards',
    syntax: '{define card_type location, prefix="📍" begin}',
    status: 'draft',
    note: {
      en: 'New bracket prefixes beyond `@`, `$` and `&`. Specified as a future extension point; custom card *sets* cover most of the need today, so no implementation has started.',
      sk: 'Nové prefixy v hranatých zátvorkách nad rámec `@`, `$` a `&`. Špecifikované ako budúci bod rozšírenia; vlastné *sady* kariet dnes pokrývajú väčšinu potreby, takže implementácia sa nezačala.',
    },
    link: '/spec/05-reference#custom-card-types',
  },
  {
    id: 'typed-card-properties',
    title: {
      en: 'Typed card properties',
      sk: 'Typované vlastnosti kariet',
    },
    group: 'cards',
    syntax: 'weight: 3 · home: @(48.14, 17.10) · traits: [brave, literate]',
    status: 'draft',
    note: {
      en: 'A card property that carries a real number, boolean, point or array into comparisons and arithmetic, instead of text that merely looks like one. Nothing is built: how a property is addressed from an expression is still open, and card values stay verbatim text today.',
      sk: 'Vlastnosť karty, ktorá do porovnaní a aritmetiky nesie skutočné číslo, pravdivostnú hodnotu, bod alebo pole namiesto textu, ktorý tak iba vyzerá. Nič nie je postavené: ako sa na vlastnosť odkazuje z výrazu, je stále otvorené, a hodnoty kariet dnes zostávajú doslovným textom.',
    },
    link: '/spec/03-narrative-interaction#typed-card-properties',
  },
  {
    id: 'coins',
    title: {
      en: 'Coins & wallet',
      sk: 'Mince a peňaženka',
    },
    group: 'cards',
    syntax: '{earn gold 2} · {spend bronze 3}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'A three-tier wallet with fixed internal names so saves stay portable, and author-renamable labels and ratios.',
      sk: 'Trojúrovňová peňaženka s pevnými internými názvami, aby uloženia zostali prenosné, a s označeniami a pomermi, ktoré autor môže premenovať.',
    },
    link: '/spec/03-narrative-interaction#coins-wallet',
  },
  {
    id: 'dialogue',
    title: {
      en: 'Dialogue attribution',
      sk: 'Pripísanie repliky',
    },
    group: 'cards',
    syntax: '@elena: "Follow me."',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Links a line of speech to a character card, which is also what lets voice assignment happen automatically.',
      sk: 'Spája riadok reči s kartou postavy, čo je zároveň to, čo umožňuje automatické priradenie hlasu.',
    },
    link: '/spec/03-narrative-interaction#dialogue-attribution',
  },

  // ── Input & interaction ───────────────────────────────────────────────────
  {
    id: 'text-input',
    title: {
      en: 'Text & numeric input',
      sk: 'Textový a číselný vstup',
    },
    group: 'input',
    syntax: '{input name=guess, type="number", min=1, max=100}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Execution pauses until the reader submits; numeric input clamps to its bounds.',
      sk: 'Vykonávanie sa pozastaví, kým čitateľ neodošle odpoveď; číselný vstup sa oreže na svoje hranice.',
    },
    link: '/spec/03-narrative-interaction#text-input',
  },
  {
    id: 'action-input',
    title: {
      en: 'Free-text action input',
      sk: 'Voľný textový vstup akcie',
    },
    group: 'input',
    syntax: '{input type="action", placeholder="What do you do?"}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'The reader types what they want to do and the best-matching option fires, matched entirely on-device so the sentence never leaves it.',
      sk: 'Čitateľ napíše, čo chce urobiť, a spustí sa najlepšie zodpovedajúca možnosť; porovnávanie prebieha výhradne na zariadení, takže veta ho nikdy neopustí.',
    },
    link: '/spec/03-narrative-interaction#free-text-action-input',
  },
  {
    id: 'voice-output',
    title: {
      en: 'Text-to-speech',
      sk: 'Prevod textu na reč',
    },
    group: 'input',
    syntax: '{voice speaker="elena", emotion="whisper" begin}',
    status: 'development',
    note: {
      en: 'The command parses and reaches the host as a request, but speech synthesis itself is supplied by the reader app, which is still being built — nothing is spoken today.',
      sk: 'Príkaz sa parsuje a dorazí k hostiteľovi ako požiadavka, ale samotnú syntézu reči dodáva čitateľská aplikácia, ktorá sa ešte stavia — dnes sa nič nevysloví.',
    },
    link: '/spec/03-narrative-interaction#_18-voice-audio',
  },
  {
    id: 'audio-playback',
    title: {
      en: 'Audio playback commands',
      sk: 'Príkazy prehrávania zvuku',
    },
    group: 'input',
    syntax: '{audio src=…, loop} · {stop ambient_music}',
    status: 'draft',
    note: {
      en: 'Named, controllable background audio. Embedded audio via `[?caption < src]` works today; the command form that starts and stops a named track is specified only.',
      sk: 'Pomenovaný, ovládateľný zvuk na pozadí. Vložený zvuk cez `[?caption < src]` funguje už dnes; príkazová forma, ktorá spúšťa a zastavuje pomenovanú stopu, je len špecifikovaná.',
    },
    link: '/spec/03-narrative-interaction#audio-playback',
  },
  {
    id: 'buttons',
    title: {
      en: 'Buttons',
      sk: 'Tlačidlá',
    },
    group: 'input',
    syntax: '{button label="Continue", target=next_chapter}',
    status: 'draft',
    note: {
      en: 'A navigation affordance separate from a choice. Specified, but unbuilt — choices and links cover the same ground, so it has stayed at the bottom of the list.',
      sk: 'Navigačný prvok oddelený od voľby. Špecifikované, ale nepostavené — voľby a odkazy pokrývajú to isté, takže to zostalo na konci zoznamu.',
    },
    link: '/spec/03-narrative-interaction#buttons',
  },
  {
    id: 'timer',
    title: {
      en: 'Timers',
      sk: 'Časovače',
    },
    group: 'input',
    syntax: '{timer duration=30, on_expire="-> times_up" begin}',
    status: 'development',
    note: {
      en: 'The runtime starts, stops and expires timers; the reader-facing countdown and the accessibility affordances that must accompany a timed choice are still being built.',
      sk: 'Runtime časovače spúšťa, zastavuje a nechá vypršať; odpočet viditeľný pre čitateľa a sprístupňujúce prvky, ktoré musia časovanú voľbu sprevádzať, sa ešte stavajú.',
    },
    link: '/spec/03-narrative-interaction#timer',
  },
  {
    id: 'verb-target',
    title: {
      en: 'Verb-target interaction',
      sk: 'Interakcia sloveso — cieľ',
    },
    group: 'input',
    syntax: '{verbs begin} · {target chest begin}',
    status: 'draft',
    note: {
      en: 'Dragging an action word onto a highlighted noun. A well-liked idea from Texture, specified in full but not started; it needs a drag alternative for keyboard and screen-reader users before it can be built.',
      sk: 'Ťahanie slova akcie na zvýraznené podstatné meno. Obľúbený nápad z Texture, špecifikovaný celý, ale nezačatý; pred stavbou potrebuje alternatívu k ťahaniu pre používateľov klávesnice a čítačiek obrazovky.',
    },
    link: '/spec/03-narrative-interaction#verb-target-interaction',
  },

  // ── Cooperative reading ───────────────────────────────────────────────────
  {
    id: 'roles',
    title: {
      en: 'Reader roles',
      sk: 'Roly čitateľov',
    },
    group: 'cooperative',
    syntax: '{define role captain begin} max: 1 {end define}',
    status: 'development',
    note: {
      en: 'Roles and role-gated content parse and evaluate; assignment and reassignment need the group session service, which is being built.',
      sk: 'Roly a obsah viazaný na rolu sa parsujú a vyhodnocujú; priraďovanie a prerozdeľovanie potrebujú službu skupinových relácií, ktorá sa stavia.',
    },
    link: '/spec/03-narrative-interaction#reader-roles',
  },
  {
    id: 'shared-state',
    title: {
      en: 'Shared state',
      sk: 'Zdieľaný stav',
    },
    group: 'cooperative',
    syntax: '{set shared.torch_lit = true}',
    status: 'development',
    note: {
      en: 'The `shared.` scope is recognised and the sync layer exists in the engine, but propagation between readers needs the platform’s realtime channel, which is not live yet.',
      sk: 'Rozsah `shared.` je rozpoznávaný a synchronizačná vrstva v jadre existuje, ale šírenie medzi čitateľmi potrebuje realtime kanál platformy, ktorý zatiaľ nebeží.',
    },
    link: '/spec/03-narrative-interaction#shared-state',
  },
  {
    id: 'vote',
    title: {
      en: 'Group voting',
      sk: 'Skupinové hlasovanie',
    },
    group: 'cooperative',
    syntax: '{vote timeout=60 begin} … {end vote}',
    status: 'development',
    note: {
      en: 'Parsed, with the solo degradation path already working; tallying across real readers waits on the same realtime channel.',
      sk: 'Parsuje sa a cesta degradácie na sólo čítanie už funguje; sčítavanie medzi reálnymi čitateľmi čaká na ten istý realtime kanál.',
    },
    link: '/spec/03-narrative-interaction#synchronized-choices',
  },
  {
    id: 'whisper-broadcast',
    title: {
      en: 'Whisper & broadcast',
      sk: 'Šepot a vysielanie',
    },
    group: 'cooperative',
    syntax: '{whisper to="captain" begin} · {broadcast begin}',
    status: 'development',
    note: {
      en: 'Role-targeted and group-wide messages; both parse and both degrade to normal text solo, with delivery pending the group session service.',
      sk: 'Správy cielené na rolu a správy pre celú skupinu; obe sa parsujú a obe degradujú na bežný text pri sólo čítaní, doručovanie čaká na službu skupinových relácií.',
    },
    link: '/spec/03-narrative-interaction#reader-to-reader-communication',
  },
  {
    id: 'conditional-wait',
    title: {
      en: 'Waiting for a condition',
      sk: 'Čakanie na podmienku',
    },
    group: 'control-flow',
    syntax: '{wait EXPR, escape=…, escape_to=… begin} … {end wait}',
    status: 'experimental',
    since: '1.1',
    note: {
      en: 'The story pauses until the expression turns true. The body is what the reader sees while waiting; `escape=` gives up after a duration and `escape_to=` sends them somewhere else. Required whenever the expression reads `context.*`.',
      sk: 'Príbeh sa zastaví, kým výraz nezmení hodnotu na pravdivú. Telo je to, čo čitateľ vidí počas čakania; `escape=` sa po uplynutí trvania vzdá a `escape_to=` ho pošle inam. Povinné vždy, keď výraz číta `context.*`.',
    },
    link: '/spec/03-narrative-interaction#waiting-for-a-condition',
  },
  {
    id: 'context-sources',
    title: {
      en: 'Context sources',
      sk: 'Zdroje kontextu',
    },
    group: 'world',
    syntax: 'context.time · context.location · context.weather · context.ext.<ns>',
    status: 'experimental',
    since: '1.1',
    note: {
      en: 'Each `context.` subtree is a source with a cadence of its own: time is derived and answers exactly when it next changes, location is a push stream, weather is a shared rate-limited poll. A source starts when the first condition waits on it and stops when the last one leaves.',
      sk: 'Každý podstrom `context.` je zdroj s vlastnou kadenciou: čas je odvodený a presne povie, kedy sa nabudúce zmení, poloha je prúd s doručovaním a počasie je zdieľané dopytovanie s obmedzenou frekvenciou. Zdroj sa spustí, keď naň začne čakať prvá podmienka, a zastaví sa, keď odíde posledná.',
    },
    link: '/spec/03-narrative-interaction#context-sources',
  },
  {
    id: 'wait',
    title: {
      en: 'Waiting for readers',
      sk: 'Čakanie na čitateľov',
    },
    group: 'cooperative',
    syntax: '{wait readers=all begin} … {end wait}',
    status: 'development',
    note: {
      en: 'Blocks until the other readers arrive, or passes instantly solo; the multi-reader half is not live.',
      sk: 'Blokuje, kým nedorazia ostatní čitatelia, alebo prejde okamžite pri sólo čítaní; viacčitateľská polovica nebeží.',
    },
    link: '/spec/03-narrative-interaction#waiting-for-readers',
  },
  {
    id: 'synchronize',
    title: {
      en: 'Explicit state synchronization',
      sk: 'Explicitná synchronizácia stavu',
    },
    group: 'cooperative',
    syntax: '{synchronize out} · {synchronize auto="on", interval=5}',
    status: 'draft',
    note: {
      en: 'Manual push/pull control over shared state for turn-based stories. Specified, but it only becomes meaningful once automatic sync exists, so nothing is built.',
      sk: 'Ručné ovládanie odoslania a načítania zdieľaného stavu pre ťahové príbehy. Špecifikované, ale zmysel dostane až vtedy, keď bude existovať automatická synchronizácia, takže nič nie je postavené.',
    },
    link: '/spec/03-narrative-interaction#state-synchronization',
  },
  {
    id: 'conflict-resolution',
    title: {
      en: 'Exclusive blocks & races',
      sk: 'Výhradné bloky a preteky',
    },
    group: 'cooperative',
    syntax: '{exclusive action="open_chest" begin} · {race timeout=10 begin}',
    status: 'draft',
    note: {
      en: 'First-reader-wins primitives with defined disconnection behaviour. Specified in detail; implementation waits on the shared-state layer they depend on.',
      sk: 'Primitíva typu „vyhráva prvý čitateľ" s definovaným správaním pri odpojení. Podrobne špecifikované; implementácia čaká na vrstvu zdieľaného stavu, od ktorej závisia.',
    },
    link: '/spec/03-narrative-interaction#conflict-resolution',
  },
  {
    id: 'presence',
    title: {
      en: 'Live presence & reactions',
      sk: 'Živá prítomnosť a reakcie',
    },
    group: 'cooperative',
    syntax: '{presence show="cursor" begin} · {react options=[…] begin}',
    status: 'draft',
    note: {
      en: 'Seeing where other readers are and reacting with emoji. Specified as a later addition to cooperative reading; nothing built.',
      sk: 'Vidieť, kde sa nachádzajú ostatní čitatelia, a reagovať emotikonmi. Špecifikované ako neskorší doplnok kooperatívneho čítania; nič nie je postavené.',
    },
    link: '/spec/03-narrative-interaction#live-presence',
  },
  {
    id: 'solo-degradation',
    title: {
      en: 'Solo degradation',
      sk: 'Degradácia na sólo čítanie',
    },
    group: 'cooperative',
    syntax: 'automatic',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Every cooperative construct has a defined single-reader behaviour, so a cooperative story is always playable alone — this part works today even where the multi-reader half does not.',
      sk: 'Každá kooperatívna konštrukcia má definované správanie pre jediného čitateľa, takže kooperatívny príbeh je vždy hrateľný osamote — táto časť funguje už dnes aj tam, kde viacčitateľská polovica nie.',
    },
    link: '/spec/03-narrative-interaction#solo-mode-behavior',
  },

  // ── Real-world interaction ────────────────────────────────────────────────
  {
    id: 'capability-requirements',
    title: {
      en: 'Capability requirements',
      sk: 'Požiadavky na schopnosti',
    },
    group: 'world',
    syntax: '{require gps} · {require nfc optional} · world.has("nfc")',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Declaring what a story needs, and checking at runtime what it actually got, so every sensor path has a written fallback.',
      sk: 'Deklarovanie toho, čo príbeh potrebuje, a overenie za behu, čo skutočne dostal, aby každá senzorová cesta mala napísanú náhradu.',
    },
    link: '/spec/03-narrative-interaction#capability-requirements',
  },
  {
    id: 'location',
    title: {
      en: 'Location',
      sk: 'Poloha',
    },
    group: 'world',
    syntax: 'context.location matches circle(@(lat, lng), metres)',
    status: 'experimental',
    note: {
      en: 'Testing the reader’s position against an area in an ordinary expression. The host’s position reading is coerced to a point, so `matches` takes it directly against a circle, a polygon or a buffered path.',
      sk: 'Testovanie polohy čitateľa proti oblasti v bežnom výraze. Meranie polohy od hostiteľa sa prevedie na bod, takže ho `matches` berie priamo proti kruhu, mnohouholníku alebo obalenej trase.',
    },
    link: '/spec/03-narrative-interaction#location',
  },
  {
    id: 'waypoints',
    title: {
      en: 'Waypoints',
      sk: 'Zastávky',
    },
    group: 'world',
    syntax: '{waypoint old_bridge, circle(@(48.14, 17.10), 50) begin}',
    status: 'experimental',
    since: '1.1',
    note: {
      en: 'Geocaching-style named places gated on arrival. A waypoint is a `{wait}` plus a place on the map: `hint=` is its waiting text, its body is arrival content, and the same scheduler decides both.',
      sk: 'Pomenované miesta v štýle geocachingu podmienené príchodom. Zastávka je `{wait}` plus miesto na mape: `hint=` je jej text počas čakania, telo je obsah po príchode a o oboch rozhoduje ten istý plánovač.',
    },
    link: '/spec/03-narrative-interaction#waypoints',
  },
  {
    id: 'maps',
    title: {
      en: 'Map images & pins',
      sk: 'Obrázky máp a špendlíky',
    },
    group: 'world',
    syntax: '{map begin} … {pin begin} … {end map}',
    status: 'development',
    note: {
      en: 'An author-supplied image anchored to real GPS bounds by two point literals, with each pin positioned by an `at:` point expression. Parsed into structured nodes; the projection renderer in the reader is the remaining piece.',
      sk: 'Obrázok dodaný autorom ukotvený na reálne GPS hranice dvoma bodovými literálmi, pričom polohu každého špendlíka určuje bodový výraz `at:`. Parsuje sa na štruktúrované uzly; zostávajúcim dielom je renderer projekcie v čítačke.',
    },
    link: '/spec/03-narrative-interaction#map-images-pins',
  },
  {
    id: 'routes',
    title: {
      en: 'Multi-stage routes',
      sk: 'Viacetapové trasy',
    },
    group: 'world',
    syntax: '{route treasure_hunt, sequential begin}',
    status: 'experimental',
    since: '1.1',
    note: {
      en: 'A trail through waypoints declared elsewhere. Its progress is derived from those waypoints rather than tracked separately, and its `complete:` line renders where the block stands, once every stage is done.',
      sk: 'Chodník cez zastávky deklarované inde. Postup sa odvodzuje z týchto zastávok, nevedie sa osobitne, a riadok `complete:` sa vykreslí tam, kde stojí blok, keď sú hotové všetky etapy.',
    },
    link: '/spec/03-narrative-interaction#multi-stage-routes',
  },
  {
    id: 'zones',
    title: {
      en: 'Geo-fencing zones',
      sk: 'Geografické zóny',
    },
    group: 'world',
    syntax: '{zone dark_forest, area(…) begin} {on enter begin}',
    status: 'experimental',
    since: '1.1',
    note: {
      en: 'The `whenever` form of a wait: the same area expression, decided on every edge. The block renders the content of the edge the reader last crossed, and an edge’s commands run as it fires.',
      sk: 'Forma `kedykoľvek` bloku wait: ten istý výraz oblasti, rozhodovaný na každej hrane. Blok vykreslí obsah hrany, ktorú čitateľ naposledy prekročil, a príkazy hrany sa vykonajú pri jej spustení.',
    },
    link: '/spec/03-narrative-interaction#geo-fencing-zones',
  },
  {
    id: 'time-of-day',
    title: {
      en: 'Time & date context',
      sk: 'Kontext času a dátumu',
    },
    group: 'world',
    syntax: 'world.hour · world.weekday · world.season',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'The one real-world input that needs no permission and no sensor, so it is the safest to build a story on.',
      sk: 'Jediný vstup z reálneho sveta, ktorý nepotrebuje povolenie ani senzor, takže je najbezpečnejšie na ňom stavať príbeh.',
    },
    link: '/spec/03-narrative-interaction#time-of-day',
  },
  {
    id: 'weather',
    title: {
      en: 'Weather',
      sk: 'Počasie',
    },
    group: 'world',
    syntax: 'world.weather · world.temperature',
    status: 'draft',
    note: {
      en: 'Specified down to the permission tier (approximate, IP-based location — never GPS), but no weather provider is wired up, so the values are never populated.',
      sk: 'Špecifikované až po úroveň povolenia (približná poloha podľa IP — nikdy nie GPS), ale nie je zapojený žiadny poskytovateľ počasia, takže hodnoty sa nikdy nenaplnia.',
    },
    link: '/spec/03-narrative-interaction#weather',
  },
  {
    id: 'scan',
    title: {
      en: 'QR & barcode scanning',
      sk: 'Skenovanie QR a čiarových kódov',
    },
    group: 'world',
    syntax: '{scan type="qr", pattern="^REAST-.*" begin}',
    status: 'draft',
    note: {
      en: 'The blocking form that stops the story until a code arrives. Specified; the non-blocking paths — a `scan:` card field or `trigger: scan` — are the ones being built instead, because a blocking scan strands a reader who cannot find the code.',
      sk: 'Blokujúca forma, ktorá zastaví príbeh, kým nedorazí kód. Špecifikovaná; namiesto nej sa stavajú neblokujúce cesty — pole karty `scan:` alebo `trigger: scan` — pretože blokujúce skenovanie uviazne čitateľa, ktorý kód nenájde.',
    },
    link: '/spec/03-narrative-interaction#qr-and-barcode-scanning',
  },
  {
    id: 'nfc',
    title: {
      en: 'NFC tags',
      sk: 'NFC štítky',
    },
    group: 'world',
    syntax: '{nfc target="reast:chapter5" begin} · {nfc read, name=tag begin}',
    status: 'development',
    note: {
      en: 'The command reaches the host as a capability request; the reader app half, and the QR fallback for devices without NFC, are being built.',
      sk: 'Príkaz dorazí k hostiteľovi ako požiadavka na schopnosť; polovica v čitateľskej aplikácii a QR náhrada pre zariadenia bez NFC sa stavajú.',
    },
    link: '/spec/03-narrative-interaction#nfc-tags',
  },
  {
    id: 'camera',
    title: {
      en: 'Camera & photo capture',
      sk: 'Fotoaparát a snímanie fotografií',
    },
    group: 'world',
    syntax: '{capture type="photo", name=reader_photo begin}',
    status: 'draft',
    note: {
      en: 'Specified with a per-use permission tier and preview requirement. Not started — the privacy review has to come before the code.',
      sk: 'Špecifikované s úrovňou povolenia na jedno použitie a požiadavkou na náhľad. Nezačaté — kontrola súkromia musí prísť pred kódom.',
    },
    link: '/spec/03-narrative-interaction#camera-and-photo',
  },
  {
    id: 'motion',
    title: {
      en: 'Motion & orientation',
      sk: 'Pohyb a orientácia',
    },
    group: 'world',
    syntax: '{on shake, intensity=2 begin} · world.tilt.x',
    status: 'draft',
    note: {
      en: 'Shake, tilt and compass events. Specified with browser-support fallbacks; no implementation yet.',
      sk: 'Udalosti zatrasenia, náklonu a kompasu. Špecifikované so záložnými riešeniami pre podporu prehliadačov; implementácia zatiaľ žiadna.',
    },
    link: '/spec/03-narrative-interaction#motion-and-orientation',
  },
  {
    id: 'light',
    title: {
      en: 'Ambient light',
      sk: 'Okolité svetlo',
    },
    group: 'world',
    syntax: 'world.light',
    status: 'draft',
    note: {
      en: 'Reading room brightness in lux for darkness-gated scenes. Specified, but browser support is thin enough that the time-of-day fallback may end up being the whole feature.',
      sk: 'Čítanie jasu miestnosti v luxoch pre scény podmienené tmou. Špecifikované, ale podpora v prehliadačoch je taká slabá, že celou funkciou môže nakoniec zostať náhrada podľa dennej doby.',
    },
    link: '/spec/03-narrative-interaction#light-level',
  },
  {
    id: 'vibration',
    title: {
      en: 'Vibration & haptics',
      sk: 'Vibrácie a haptika',
    },
    group: 'world',
    syntax: '{vibrate 200} · {vibrate pattern=[100, 50, 100]}',
    status: 'development',
    note: {
      en: 'The command parses and emits a host request; the reader app must honour it, and its visual-pulse fallback for devices without a motor is still being built.',
      sk: 'Príkaz sa parsuje a vysiela požiadavku hostiteľovi; čitateľská aplikácia ju musí splniť a jej vizuálna náhrada pulzom pre zariadenia bez motorčeka sa ešte stavia.',
    },
    link: '/spec/03-narrative-interaction#vibration-and-haptics',
  },
  {
    id: 'proximity',
    title: {
      en: 'Proximity',
      sk: 'Blízkosť',
    },
    group: 'world',
    syntax: '{on proximity "near" begin}',
    status: 'draft',
    note: {
      en: 'Holding the device close to an object. Specified; not started.',
      sk: 'Priblíženie zariadenia k predmetu. Špecifikované; nezačaté.',
    },
    link: '/spec/03-narrative-interaction#proximity',
  },
  {
    id: 'listen',
    title: {
      en: 'Voice input',
      sk: 'Hlasový vstup',
    },
    group: 'world',
    syntax: '{listen language="en", name=spoken_word begin}',
    status: 'development',
    note: {
      en: 'The command reaches the host as a request for a transcript. Recognition runs on the reader’s device and is never stored or transmitted — that reader app is what is being built.',
      sk: 'Príkaz dorazí k hostiteľovi ako požiadavka o prepis. Rozpoznávanie beží na zariadení čitateľa a nikdy sa neukladá ani neprenáša — práve tá čitateľská aplikácia sa stavia.',
    },
    link: '/spec/03-narrative-interaction#voice-input',
  },
  {
    id: 'dice',
    title: {
      en: 'Dice notation',
      sk: 'Zápis hodu kockou',
    },
    group: 'world',
    syntax: 'dice("2d6+3") · d20adv · 4d6kh3',
    status: 'draft',
    note: {
      en: 'The compact tabletop notation is specified but the `dice()` built-in is unimplemented. Use `{use "std/dice"}` instead, which is released and covers the common rolls.',
      sk: 'Kompaktný zápis zo stolových hier je špecifikovaný, ale vstavaná funkcia `dice()` nie je implementovaná. Použite namiesto nej `{use "std/dice"}`, ktorá je vydaná a pokrýva bežné hody.',
    },
    link: '/spec/03-narrative-interaction#dice-and-randomization',
  },
  {
    id: 'challenges',
    title: {
      en: 'Real-world challenges',
      sk: 'Výzvy v reálnom svete',
    },
    group: 'world',
    syntax: '{challenge night_vigil begin} require: … timeout: 30m',
    status: 'draft',
    note: {
      en: 'Several sensor conditions combined into one gated moment. Specified as the capstone of real-world interaction; it cannot start before the sensors it combines do.',
      sk: 'Viacero senzorových podmienok spojených do jedného podmieneného momentu. Špecifikované ako vrchol interakcie s reálnym svetom; nemôže sa začať skôr než senzory, ktoré spája.',
    },
    link: '/spec/03-narrative-interaction#real-world-challenges',
  },
  {
    id: 'privacy-tiers',
    title: {
      en: 'Sensor permission tiers',
      sk: 'Úrovne povolení pre senzory',
    },
    group: 'world',
    syntax: 'none · low · medium · high',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'The four-tier model, ephemeral-by-default rule and "authors never see raw coordinates" guarantee are binding on every sensor feature above, whatever its own status.',
      sk: 'Štvorúrovňový model, pravidlo „predvolene pominuteľné" a záruka, že „autori nikdy nevidia surové súradnice", sú záväzné pre každú senzorovú funkciu vyššie, nech je jej vlastný stav akýkoľvek.',
    },
    link: '/spec/03-narrative-interaction#privacy-data-handling',
  },

  // ── Localization & formatting ─────────────────────────────────────────────
  {
    id: 'plural',
    title: {
      en: 'Pluralization',
      sk: 'Skloňovanie podľa počtu',
    },
    group: 'localization',
    syntax: '{plural(n, one="{} coin", other="{} coins")}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'CLDR categories resolved through `Intl.PluralRules` for the host locale, so no per-language table is baked into the engine.',
      sk: 'Kategórie CLDR rozlíšené cez `Intl.PluralRules` pre lokál hostiteľa, takže v jadre nie je zapečená žiadna tabuľka pre jednotlivé jazyky.',
    },
    link: '/spec/04-utilities#pluralization-with-plural',
  },
  {
    id: 'select',
    title: {
      en: 'Text selection',
      sk: 'Výber textu',
    },
    group: 'localization',
    syntax: '{select(pronoun, he="his", she="her", other="their")}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Key-based text variation for gender, role or any other categorical value.',
      sk: 'Variácia textu podľa kľúča pre rod, rolu alebo ľubovoľnú inú kategorickú hodnotu.',
    },
    link: '/spec/04-utilities#text-selection-with-select',
  },
  {
    id: 'format-number',
    title: {
      en: 'Number formatting',
      sk: 'Formátovanie čísel',
    },
    group: 'localization',
    syntax: '{formatNumber(value, "sk", style="currency")}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Delegates to `Intl.NumberFormat`, falling back to the plain string form on any error.',
      sk: 'Deleguje na `Intl.NumberFormat` a pri akejkoľvek chybe sa vráti k jednoduchému reťazcovému tvaru.',
    },
    link: '/spec/04-utilities#number-formatting-with-formatnumber',
  },
  {
    id: 'ordinal',
    title: {
      en: 'Ordinal numbers',
      sk: 'Radové číslovky',
    },
    group: 'localization',
    syntax: '{ordinal(3)} · {ordinal(n, one="{}.")}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'English suffixes only for `en*` locales; every other locale gets the formatted number, because `Intl` carries no ordinal spell-out data and inventing suffixes would be wrong.',
      sk: 'Anglické prípony len pre lokály `en*`; každý iný lokál dostane naformátované číslo, pretože `Intl` neobsahuje dáta na vypísanie radových čísloviek a vymýšľať prípony by bolo nesprávne.',
    },
    link: '/spec/04-utilities#ordinal-numbers-with-ordinal',
  },
  {
    id: 'date-functions',
    title: {
      en: 'Date & time functions',
      sk: 'Funkcie dátumu a času',
    },
    group: 'localization',
    syntax: '{formatDate(value, "long")} · {dateDiff(a, b, "d")}',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Host-supplied clock, locale and time zone, with formatting through `Intl.DateTimeFormat`; the `style` enum is the whole surface, with no author-facing token strings.',
      sk: 'Hodiny, lokál a časové pásmo dodáva hostiteľ, formátovanie ide cez `Intl.DateTimeFormat`; celým rozhraním je enum `style`, bez reťazcov s tokenmi pre autora.',
    },
    link: '/spec/05-reference#date-time-functions',
  },
  {
    id: 'calendar',
    title: {
      en: 'Fantasy calendars',
      sk: 'Fantasy kalendáre',
    },
    group: 'localization',
    syntax: '{calendar(world.date, month="Frost,Bloom,…")}',
    status: 'development',
    note: {
      en: 'Mapping real date components onto invented month and weekday names. The signature is settled and the surrounding locale built-ins already ship; `calendar()` itself is the one still being written.',
      sk: 'Mapovanie reálnych zložiek dátumu na vymyslené názvy mesiacov a dní v týždni. Signatúra je ustálená a okolité lokálové vstavané funkcie už fungujú; samotná `calendar()` sa ešte píše.',
    },
    link: '/spec/04-utilities#fantasy-calendars-with-calendar',
  },

  // ── Authoring & diagnostics ───────────────────────────────────────────────
  {
    id: 'comments',
    title: {
      en: 'Comments',
      sk: 'Komentáre',
    },
    group: 'authoring',
    syntax: '{comment …} · {comment begin} … {end comment}',
    status: 'stable',
    since: '1.0',
    note: {
      en: 'One syntax, single-line and paired. Only the exact `{comment begin}` opens a block, so `begin` inside a comment is just a word — which is what the retired `{// …}` form needed a special lexer mode for.',
      sk: 'Jedna syntax, jednoriadková aj párová. Blok otvára len presné `{comment begin}`, takže `begin` vnútri komentára je len slovo — a práve na to potreboval zrušený tvar `{// …}` špeciálny režim lexera.',
    },
    link: '/spec/04-utilities#_26-comments',
  },
  {
    id: 'escaping',
    title: {
      en: 'Escaping & raw blocks',
      sk: 'Únikové sekvencie a surové bloky',
    },
    group: 'authoring',
    syntax: '\\{not a command\\} · {raw begin} … {end raw}',
    status: 'stable',
    since: '1.0',
    note: {
      en: 'The backslash escape and the raw block are frozen — without them a story could never quote its own syntax.',
      sk: 'Únik spätnou lomkou a surový blok sú zmrazené — bez nich by príbeh nikdy nemohol citovať vlastnú syntax.',
    },
    link: '/spec/04-utilities#_25-escaping-raw-text',
  },
  {
    id: 'error-handling',
    title: {
      en: 'Graceful degradation',
      sk: 'Elegantná degradácia',
    },
    group: 'authoring',
    syntax: 'automatic',
    status: 'stable',
    since: '1.0',
    note: {
      en: 'A reader never sees an error: an unknown command is skipped whole, missing media falls back, an unclosed block auto-closes. The author hears about every one of them on a separate channel of coded records. This is a language guarantee, not a runtime detail, so it is frozen.',
      sk: 'Čitateľ nikdy neuvidí chybu: neznámy príkaz sa celý preskočí, chýbajúce médiá majú náhradu, neuzavretý blok sa uzavrie sám. Autor sa o každej z nich dozvie na samostatnom kanáli kódovaných záznamov. Toto je záruka jazyka, nie detail runtime, takže je zmrazená.',
    },
    link: '/spec/error-handling',
  },
  {
    id: 'todo',
    title: {
      en: 'TODO markers',
      sk: 'Značky TODO',
    },
    group: 'authoring',
    syntax: '{todo …} · {todo begin} … {end todo}',
    status: 'stable',
    since: '1.0',
    note: {
      en: 'A comment that reports itself: hidden from the reader like `{comment}`, and raised as `style/todo` on the author channel, so `reast validate` and the editor list every one.',
      sk: 'Komentár, ktorý sa sám ohlási: pred čitateľom skrytý ako `{comment}` a na autorskom kanáli vyvolá `style/todo`, takže ho `reast validate` aj editor vypíšu.',
    },
    link: '/spec/04-utilities#todo-markers',
  },
  {
    id: 'fallback-values',
    title: {
      en: 'Media fallback values',
      sk: 'Náhradné hodnoty médií',
    },
    group: 'authoring',
    syntax: '[!map < media/map.png, fallback="media/low.png"]',
    status: 'draft',
    note: {
      en: 'A second source tried before the platform’s own placeholder. Specified; the attribute is currently parsed and ignored.',
      sk: 'Druhý zdroj vyskúšaný predtým, než sa použije zástupný obsah platformy. Špecifikované; atribút sa dnes parsuje a ignoruje.',
    },
    link: '/spec/error-handling#fallback-values',
  },
  {
    id: 'captions',
    title: {
      en: 'Captions',
      sk: 'Popisky',
    },
    group: 'authoring',
    syntax: '{caption "A hand-drawn map"}',
    status: 'draft',
    note: {
      en: 'Descriptive captions attached to the preceding block. Specified and needed for accessibility conformance, but not built — alt text carries the load today.',
      sk: 'Popisné titulky pripojené k predchádzajúcemu bloku. Špecifikované a potrebné na splnenie prístupnosti, ale nepostavené — dnes to nesie alternatívny text.',
    },
    link: '/spec/04-utilities#_24-captions',
  },
  {
    id: 'content-lock',
    title: {
      en: 'Content protection (lock)',
      sk: 'Ochrana obsahu (zámok)',
    },
    group: 'authoring',
    syntax: '{lock type="soft", key=… begin}',
    status: 'draft',
    note: {
      en: 'Soft, hard and conditional locks, with the AES-GCM and PBKDF2 model fully specified. Nothing is implemented; a hard lock in particular needs the server side that does not exist yet.',
      sk: 'Mäkké, tvrdé a podmienené zámky s úplne špecifikovaným modelom AES-GCM a PBKDF2. Nič nie je implementované; najmä tvrdý zámok potrebuje serverovú stranu, ktorá zatiaľ neexistuje.',
    },
    link: '/spec/04-utilities#_23-content-protection-lock',
  },
  {
    id: 'external-api',
    title: {
      en: 'External API access',
      sk: 'Prístup k externým API',
    },
    group: 'authoring',
    syntax: 'manifest `allowed_urls`, referenced by alias',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'URLs live in the manifest and never in `.rea` text, so every external call is declared and auditable; the alias call surface is still settling.',
      sk: 'URL adresy žijú v manifeste a nikdy v texte `.rea`, takže každé externé volanie je deklarované a auditovateľné; volacie rozhranie cez alias sa ešte ustaľuje.',
    },
    link: '/spec/error-handling#external-api-access',
  },
  {
    id: 'seeded-randomness',
    title: {
      en: 'Seeded, replayable randomness',
      sk: 'Seedovaná, opakovateľná náhodnosť',
    },
    group: 'authoring',
    syntax: 'random() · shuffle() · std/dice',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Every draw comes from a generator the runtime owns and the save file carries, so restoring a save continues the identical sequence. The `seed(n)` testing function is not implemented — pin the seed through the host engine option instead.',
      sk: 'Každé ťahanie pochádza z generátora, ktorý vlastní runtime a nesie ho súbor uloženia, takže obnovenie uloženia pokračuje identickou postupnosťou. Testovacia funkcia `seed(n)` nie je implementovaná — seed namiesto toho pripnite cez voľbu jadra u hostiteľa.',
    },
    link: '/spec/05-reference#randomness-dice-functions',
  },

  // ── Packaging & distribution ──────────────────────────────────────────────
  {
    id: 'rea-file',
    title: {
      en: '`.rea` story file',
      sk: 'Súbor príbehu `.rea`',
    },
    group: 'packaging',
    syntax: 'UTF-8 plain text, no metadata',
    status: 'stable',
    since: '1.0',
    note: {
      en: 'A story file is pure text and carries no metadata at all — that separation is what keeps a `.rea` readable in any editor, and it is frozen.',
      sk: 'Súbor príbehu je čistý text a neobsahuje vôbec žiadne metadáta — práve toto oddelenie udržuje `.rea` čitateľné v ľubovoľnom editore a je zmrazené.',
    },
    link: '/spec/05-reference#single-files-rea',
  },
  {
    id: 'rext-file',
    title: {
      en: '`.rext` extension module',
      sk: 'Modul rozšírenia `.rext`',
    },
    group: 'packaging',
    syntax: 'declaration-only Rea',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Functions, top-level constants, `{use}` and comments only — any prose node anywhere in the file is a load error.',
      sk: 'Len funkcie, konštanty najvyššej úrovne, `{use}` a komentáre — akýkoľvek uzol prózy kdekoľvek v súbore je chybou načítania.',
    },
    link: '/spec/05-reference#tier-1-—-rea-extensions-author-space-portable-sandboxed',
  },
  {
    id: 'reast-package',
    title: {
      en: '`.reast` package',
      sk: 'Balík `.reast`',
    },
    group: 'packaging',
    syntax: 'ZIP: manifest.json + story/ + assets/',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Both layouts — packaged (with a manifest) and flat (a single entry file, no metadata) — load today.',
      sk: 'Obe štruktúry — zabalená (s manifestom) aj plochá (jediný vstupný súbor, bez metadát) — sa dnes načítajú.',
    },
    link: '/spec/05-reference#packages-reast',
  },
  {
    id: 'manifest',
    title: {
      en: '`manifest.json`',
      sk: '`manifest.json`',
    },
    group: 'packaging',
    syntax: 'one canonical shape, no short forms',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'Carries every piece of metadata a `.rea` file deliberately does not; unknown fields are preserved and ignored, so the schema can grow without breaking readers.',
      sk: 'Nesie každý údaj metadát, ktorý súbor `.rea` zámerne neobsahuje; neznáme polia sa zachovávajú a ignorujú, takže schéma môže rásť bez rozbitia čitačiek.',
    },
    link: '/engine/package-format#manifest-json',
  },
  {
    id: 'session-settings',
    title: {
      en: 'Session settings (`reast.json`)',
      sk: 'Nastavenia relácie (`reast.json`)',
    },
    group: 'packaging',
    syntax: 'preset variables for one session',
    status: 'development',
    note: {
      en: 'Per-session configuration (player count, difficulty, scenario variant) injected into the story’s variable space. The file format is settled; the platform side that reads it is being built.',
      sk: 'Konfigurácia pre jednu reláciu (počet hráčov, obtiažnosť, variant scenára) vložená do priestoru premenných príbehu. Formát súboru je ustálený; strana platformy, ktorá ho číta, sa stavia.',
    },
    link: '/engine/package-format#session-settings-reast-json',
  },
  {
    id: 'github-import',
    title: {
      en: 'GitHub repository import',
      sk: 'Import z GitHub repozitára',
    },
    group: 'packaging',
    syntax: 'https://github.com/owner/repo',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'An unzipped package in a public repository loads like a `.reast` file, making Git tags and branches a natural versioning mechanism.',
      sk: 'Rozbalený balík vo verejnom repozitári sa načíta ako súbor `.reast`, čím sa z tagov a vetiev Gitu stáva prirodzený mechanizmus verziovania.',
    },
    link: '/engine/package-format#importing-from-a-public-github-repository',
  },
  {
    id: 'integrity-signing',
    title: {
      en: 'Integrity & signing',
      sk: 'Integrita a podpisovanie',
    },
    group: 'packaging',
    syntax: 'manifest `integrity` · Ed25519 signature',
    status: 'development',
    note: {
      en: 'Per-file SHA-256 verification is implemented; the Ed25519 author-signature chain and its key distribution are still being built.',
      sk: 'Overovanie SHA-256 pre každý súbor je implementované; reťazec autorského podpisu Ed25519 a distribúcia jeho kľúčov sa ešte stavajú.',
    },
    link: '/engine/package-format#integrity-and-signing',
  },
  {
    id: 'progressive-loading',
    title: {
      en: 'Progressive loading',
      sk: 'Postupné načítavanie',
    },
    group: 'packaging',
    syntax: 'manifest `loading`, `preload`, `locked`',
    status: 'draft',
    note: {
      en: 'Downloading a long story part by part. Specified; today every part of a package arrives with the archive.',
      sk: 'Sťahovanie dlhého príbehu po častiach. Špecifikované; dnes každá časť balíka prichádza spolu s archívom.',
    },
    link: '/engine/package-format#progressive-loading',
  },
  {
    id: 'delta-updates',
    title: {
      en: 'Delta updates',
      sk: 'Rozdielové aktualizácie',
    },
    group: 'packaging',
    syntax: 'per-file hashes from manifest `integrity`',
    status: 'draft',
    note: {
      en: 'Re-downloading only the files that changed. The hashes it would use already exist for tamper detection; the update path itself is unbuilt.',
      sk: 'Opätovné stiahnutie len tých súborov, ktoré sa zmenili. Odtlačky, ktoré by na to použili, už existujú na detekciu neoprávnenej zmeny; samotná cesta aktualizácie nie je postavená.',
    },
    link: '/engine/package-format#delta-updates',
  },
  {
    id: 'minification',
    title: {
      en: 'Minification',
      sk: 'Minifikácia',
    },
    group: 'packaging',
    syntax: 'manifest `build` + META-REA/names.json',
    status: 'draft',
    note: {
      en: 'A lossless source transformation for distribution. Specified, including the name map that keeps it debuggable; no build tool implements it yet.',
      sk: 'Bezstratová transformácia zdroja pre distribúciu. Špecifikovaná vrátane mapy názvov, ktorá ju udrží laditeľnou; zatiaľ ju neimplementuje žiadny zostavovací nástroj.',
    },
    link: '/engine/package-format#minification-compression',
  },
  {
    id: 'reader-tab-bar',
    title: {
      en: 'Reader tab bar',
      sk: 'Panel kariet čitačky',
    },
    group: 'packaging',
    syntax: 'manifest `reader.tabBar`',
    status: 'development',
    note: {
      en: 'An opt-in bottom bar with up to five sections ordered by thumb distance. The manifest shape is settled; the reader UI is being built.',
      sk: 'Voliteľný spodný panel s najviac piatimi sekciami usporiadanými podľa vzdialenosti palca. Tvar v manifeste je ustálený; používateľské rozhranie čitačky sa stavia.',
    },
    link: '/engine/package-format#reader-tab-bar',
  },
  {
    id: 'conformance-levels',
    title: {
      en: 'Conformance levels',
      sk: 'Úrovne zhody',
    },
    group: 'packaging',
    syntax: 'Core · Standard · Platform',
    status: 'stable',
    since: '1.0',
    note: {
      en: 'Three declared levels so an implementer can ship a partial engine honestly; frozen, because the whole point is that the label means the same thing everywhere.',
      sk: 'Tri deklarované úrovne, aby implementátor mohol čestne vydať čiastočné jadro; zmrazené, pretože celý zmysel je v tom, že označenie znamená všade to isté.',
    },
    link: '/spec/05-reference#conformance-levels',
  },
  {
    id: 'spec-versioning',
    title: {
      en: 'Spec versioning & compatibility',
      sk: 'Verziovanie špecifikácie a kompatibilita',
    },
    group: 'packaging',
    syntax: 'manifest `rea: "1.0"`',
    status: 'stable',
    since: '1.0',
    note: {
      en: 'MAJOR.MINOR versioning with the forward-compatibility rules a parser must honour. Frozen with the 1.0 release.',
      sk: 'Verziovanie MAJOR.MINOR s pravidlami doprednej kompatibility, ktoré parser musí dodržať. Zmrazené s vydaním 1.0.',
    },
    link: '/spec/05-reference#spec-versioning',
  },
  {
    id: 'identifiers',
    title: {
      en: 'Identifiers & naming',
      sk: 'Identifikátory a pomenovanie',
    },
    group: 'packaging',
    syntax: 'domain.name, any Unicode except space and dot',
    status: 'stable',
    since: '1.0',
    note: {
      en: 'Frozen so that a non-English author can name state in their own alphabet and be certain it keeps working.',
      sk: 'Zmrazené preto, aby neanglicky píšuci autor mohol pomenovať stav vo vlastnej abecede a mať istotu, že to bude fungovať aj naďalej.',
    },
    link: '/spec/05-reference#_29-identifiers-naming',
  },
  {
    id: 'accessibility',
    title: {
      en: 'Accessibility',
      sk: 'Prístupnosť',
    },
    group: 'packaging',
    syntax: 'WCAG 2.2 Level AA',
    status: 'experimental',
    since: '1.0',
    note: {
      en: 'The author-facing obligations (alt text, meaningful choice text) are in force now; several platform-side criteria depend on features that are still in development.',
      sk: 'Povinnosti na strane autora (alternatívny text, zmysluplný text volieb) platia už teraz; viaceré kritériá na strane platformy závisia od funkcií, ktoré sú ešte vo vývoji.',
    },
    link: '/spec/05-reference#_32-accessibility',
  },

  // ── Deliberately not in Rea ───────────────────────────────────────────────
  {
    id: 'omit-lists',
    title: {
      en: 'Bulleted & numbered lists',
      sk: 'Odrážkové a číslované zoznamy',
    },
    group: 'omitted',
    syntax: '— none —',
    status: 'cancelled',
    note: {
      en: 'Ruled out during the 1.0 design: interactive stories do not use list formatting, and `*` and `-` are already the choice and gather markers. Choices fill the role naturally.',
      sk: 'Vylúčené počas návrhu 1.0: interaktívne príbehy nepoužívajú formátovanie zoznamov a `*` a `-` už sú značkami voľby a zberu. Voľby túto úlohu plnia prirodzene.',
    },
    link: '/spec/05-reference#what-rea-intentionally-omits',
  },
  {
    id: 'omit-tables',
    title: {
      en: 'Table markup',
      sk: 'Značkovanie tabuliek',
    },
    group: 'omitted',
    syntax: '— none —',
    status: 'cancelled',
    note: {
      en: 'Ruled out for 1.0: a data table is not a storytelling construct, and adding one would drag column alignment and cell spanning into a prose language.',
      sk: 'Vylúčené pre 1.0: dátová tabuľka nie je rozprávačská konštrukcia a jej pridanie by do prozaického jazyka vtiahlo zarovnávanie stĺpcov a spájanie buniek.',
    },
    link: '/spec/05-reference#what-rea-intentionally-omits',
  },
  {
    id: 'omit-html',
    title: {
      en: 'HTML passthrough',
      sk: 'Priepust HTML',
    },
    group: 'omitted',
    syntax: '— none —',
    status: 'cancelled',
    note: {
      en: 'Permanently excluded. Raw markup injection would make every story an XSS surface and would let one author’s markup break another host’s rendering.',
      sk: 'Trvalo vylúčené. Vkladanie surového značkovania by z každého príbehu urobilo plochu pre XSS a umožnilo by, aby značkovanie jedného autora rozbilo vykresľovanie u iného hostiteľa.',
    },
    link: '/spec/05-reference#what-rea-intentionally-omits',
  },
  {
    id: 'omit-css',
    title: {
      en: 'CSS styling',
      sk: 'Štýlovanie cez CSS',
    },
    group: 'omitted',
    syntax: '— none —',
    status: 'cancelled',
    note: {
      en: 'Permanently excluded. Visual presentation belongs to the platform theme so that reader preferences — contrast, font size, dark mode — can never be overridden by a story.',
      sk: 'Trvalo vylúčené. Vizuálna prezentácia patrí téme platformy, aby príbeh nikdy nemohol prebiť predvoľby čitateľa — kontrast, veľkosť písma, tmavý režim.',
    },
    link: '/spec/05-reference#what-rea-intentionally-omits',
  },
  {
    id: 'omit-scripting',
    title: {
      en: 'Embedded programming languages',
      sk: 'Vložené programovacie jazyky',
    },
    group: 'omitted',
    syntax: '— none —',
    status: 'cancelled',
    note: {
      en: 'Permanently excluded. A story is untrusted content; embedding JavaScript or any other language would destroy the sandbox. Sandboxed `.rext` extensions and host-supplied extensions cover the real need.',
      sk: 'Trvalo vylúčené. Príbeh je nedôveryhodný obsah; vloženie JavaScriptu alebo iného jazyka by zničilo sandbox. Reálnu potrebu pokrývajú izolované rozšírenia `.rext` a rozšírenia dodané hostiteľom.',
    },
    link: '/spec/05-reference#what-rea-intentionally-omits',
  },
  {
    id: 'omit-try-catch',
    title: {
      en: 'try / catch',
      sk: 'try / catch',
    },
    group: 'omitted',
    syntax: '— none —',
    status: 'cancelled',
    note: {
      en: 'Ruled out with the error model: all recovery is implicit, because a reader must never be shown a failure and an author should never have to write one.',
      sk: 'Vylúčené spolu s modelom chýb: každé zotavenie je implicitné, pretože čitateľovi sa nikdy nesmie ukázať zlyhanie a autor by ho nikdy nemal musieť písať.',
    },
    link: '/spec/error-handling',
  },
];

/**
 * Render the inline-code spans a note writes as backticks (`` `{format}` ``)
 * into `<code>` elements. The note is author-written data rather than markdown
 * the pipeline compiled, so it is HTML-escaped first and only the backtick
 * pairs are turned into markup — nothing else in a note can produce a tag.
 */
export function renderNote(note: string): string {
  const escaped = note
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  return escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
}

/**
 * The registry locale a VitePress `lang` maps to. A site locale the registry
 * has not been translated into yet falls back to English rather than rendering
 * blank, so adding `/de/` pages does not have to wait on the registry.
 */
export function langOf(lang: string | undefined): FeatureLang {
  const base = lang?.split('-')[0];
  return (LOCALES as readonly string[]).includes(base ?? '') ? (base as FeatureLang) : 'en';
}

/** Read one locale's string out of a `Localized` map. */
export function t(value: Localized, lang: FeatureLang): string {
  return value[lang];
}

/** Prefix a stored (English) link with the locale's path segment. */
function localizeLink(link: string | undefined, lang: FeatureLang): string | undefined {
  return link ? `${LOCALE_PATHS[lang]}${link}` : link;
}

/** Resolve a feature's strings and link for one locale. */
export function localizeFeature(feature: Feature, lang: FeatureLang): LocalizedFeature {
  return {
    ...feature,
    title: t(feature.title, lang),
    note: t(feature.note, lang),
    link: localizeLink(feature.link, lang),
  };
}

/** Every group, with its strings and link resolved for one locale. */
export function localizedGroups(lang: FeatureLang): LocalizedGroup[] {
  return GROUPS.map((group) => ({
    ...group,
    title: t(group.title, lang),
    summary: t(group.summary, lang),
    link: localizeLink(group.link, lang) as string,
  }));
}

/** Every feature, with its strings and link resolved for one locale. */
export function localizedFeatures(lang: FeatureLang): LocalizedFeature[] {
  return FEATURES.map((f) => localizeFeature(f, lang));
}

/** The status tooltips, resolved for one locale. */
export function statusDescriptions(lang: FeatureLang): Record<FeatureStatus, string> {
  return Object.fromEntries(
    STATUS_ORDER.map((status) => [status, t(STATUS_DESCRIPTIONS[status], lang)]),
  ) as Record<FeatureStatus, string>;
}

/** Look up a feature by its `id`, or `undefined` when the id is unknown. */
export function getFeature(id: string, lang: FeatureLang = 'en'): LocalizedFeature | undefined {
  const feature = FEATURES.find((f) => f.id === id);
  return feature && localizeFeature(feature, lang);
}

/** Count of features per status, for the summary row on the index page. */
export function countByStatus(): Record<FeatureStatus, number> {
  const counts = { stable: 0, experimental: 0, development: 0, draft: 0, cancelled: 0 };
  for (const f of FEATURES) counts[f.status] += 1;
  return counts;
}
