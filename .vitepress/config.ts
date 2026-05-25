import { defineConfig } from 'vitepress';
import reaGrammar from './rea.tmLanguage.json';
import pkg from '../package.json';

const currentVersion = pkg.version;

const enNav = [
  { text: 'Specification', link: '/spec/01-basics' },
  { text: 'Player', link: '/player/getting-started' },
  { text: 'API', link: '/player/api' },
  { text: 'Playground', link: '/docs/playground' },
  { text: 'Platform', link: '/platform/' },
  { text: 'Glossary', link: '/docs/glossary' },
];

const skNav = [
  { text: 'Špecifikácia', link: '/sk/spec/01-basics' },
  { text: 'Prehrávač', link: '/sk/player/getting-started' },
  { text: 'API', link: '/sk/player/api' },
  { text: 'Ihrisko', link: '/sk/docs/playground' },
  { text: 'Platforma', link: '/sk/platform/' },
  { text: 'Slovník', link: '/sk/docs/glossary' },
];

const specSidebar = [
  {
    text: 'REA Language Specification',
    items: [
      { text: 'Basics', link: '/spec/01-basics' },
      { text: 'Logic & Data', link: '/spec/02-logic-data' },
      { text: 'Narrative & Interaction', link: '/spec/03-narrative-interaction' },
      { text: 'Utilities', link: '/spec/04-utilities' },
      { text: 'Reference', link: '/spec/05-reference' },
      { text: 'Cheatsheet', link: '/spec/REA-CHEATSHEET' },
    ],
  },
];

const playerSidebar = [
  {
    text: 'Player',
    items: [
      { text: 'Getting Started', link: '/player/getting-started' },
      { text: 'Embedding', link: '/player/embedding' },
      { text: 'Theming', link: '/player/theming' },
      { text: 'Extending', link: '/player/extending' },
      { text: 'API Reference', link: '/player/api' },
    ],
  },
];

const docsSidebar = [
  {
    text: 'Documentation',
    items: [
      { text: 'Glossary', link: '/docs/glossary' },
      { text: 'Playground', link: '/docs/playground' },
      { text: 'Contributing', link: '/docs/contributing' },
    ],
  },
  {
    text: 'Architecture',
    items: [{ text: 'Docs Aggregation', link: '/docs/architecture/docs-aggregation' }],
  },
];

const platformSidebar = [
  {
    text: 'Platform',
    items: [
      { text: 'Overview', link: '/platform/' },
      { text: 'Design System', link: '/platform/design/' },
      { text: 'Security & Privacy', link: '/platform/security/' },
    ],
  },
];

const skSpecSidebar = [
  {
    text: 'Špecifikácia jazyka REA',
    items: [
      { text: 'Základy', link: '/sk/spec/01-basics' },
      { text: 'Logika a dáta', link: '/sk/spec/02-logic-data' },
      { text: 'Naratív a interakcia', link: '/sk/spec/03-narrative-interaction' },
      { text: 'Utility', link: '/sk/spec/04-utilities' },
      { text: 'Referencia', link: '/sk/spec/05-reference' },
      { text: 'Ťahák', link: '/sk/spec/REA-CHEATSHEET' },
    ],
  },
];

const skPlayerSidebar = [
  {
    text: 'Prehrávač',
    items: [
      { text: 'Začíname', link: '/sk/player/getting-started' },
      { text: 'Vkladanie', link: '/sk/player/embedding' },
      { text: 'Témy', link: '/sk/player/theming' },
      { text: 'Rozširovanie', link: '/sk/player/extending' },
      { text: 'API referencia', link: '/sk/player/api' },
    ],
  },
];

const skDocsSidebar = [
  {
    text: 'Dokumentácia',
    items: [
      { text: 'Slovník', link: '/sk/docs/glossary' },
      { text: 'Ihrisko', link: '/sk/docs/playground' },
      { text: 'Prispievanie', link: '/sk/docs/contributing' },
    ],
  },
  {
    text: 'Architektúra',
    items: [{ text: 'Agregácia dokumentácie', link: '/sk/docs/architecture/docs-aggregation' }],
  },
];

const skPlatformSidebar = [
  {
    text: 'Platforma',
    items: [
      { text: 'Prehľad', link: '/sk/platform/' },
      { text: 'Dizajn systém', link: '/sk/platform/design/' },
      { text: 'Bezpečnosť a súkromie', link: '/sk/platform/security/' },
    ],
  },
];

export default defineConfig({
  title: 'REA Language',
  description: 'Interactive story language specification and documentation',
  base: '/',
  outDir: './dist',
  ignoreDeadLinks: [
    /\/REA$/,
    /\.\/\.\.\/REA$/,
    /\.\/\.\.\/LICENSE$/,
    /\.\/\.\.\/research\//,
    /localhost/,
    /\.\/design\/system$/,
  ],
  markdown: {
    languages: [reaGrammar as any],
  },
  vite: {
    build: {
      rollupOptions: {
        external: ['@reast/engine/player'],
      },
    },
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en',
    },
    sk: {
      label: 'Slovenčina',
      lang: 'sk',
      title: 'Jazyk REA',
      description: 'Špecifikácia a dokumentácia interaktívneho naratívneho jazyka',
      themeConfig: {
        nav: [...skNav, { text: `v${currentVersion}`, link: '/changelog' }],
        sidebar: {
          '/sk/spec/': skSpecSidebar,
          '/sk/player/': skPlayerSidebar,
          '/sk/docs/': skDocsSidebar,
          '/sk/platform/': skPlatformSidebar,
        },
        outline: { label: 'Na tejto stránke' },
        docFooter: { prev: 'Predchádzajúca', next: 'Nasledujúca' },
        darkModeSwitchLabel: 'Tmavý režim',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Späť nahor',
        langMenuLabel: 'Jazyk',
      },
    },
  },
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        locales: {
          sk: {
            translations: {
              button: { buttonText: 'Hľadať', buttonAriaLabel: 'Hľadať' },
              modal: {
                noResultsText: 'Žiadne výsledky pre',
                resetButtonTitle: 'Vymazať',
                footer: { selectText: 'vybrať', navigateText: 'navigovať', closeText: 'zatvoriť' },
              },
            },
          },
        },
      },
    },
    nav: [...enNav, { text: `v${currentVersion}`, link: '/changelog' }],
    sidebar: {
      '/spec/': specSidebar,
      '/player/': playerSidebar,
      '/docs/': docsSidebar,
      '/platform/': platformSidebar,
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/atiris/reast-docs' }],
  },
});
