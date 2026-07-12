import { defineConfig } from 'vitepress';
import reaGrammar from './rea.tmLanguage.json';
import pkg from '../package.json';

const currentVersion = pkg.version;

// Published documentation versions, newest first.
//
// The live source tree always *is* the latest version (`current: true`, served
// from `/`). Each older release is a static snapshot published under
// `public/v<version>/` and is therefore reachable at `/v<version>/`. The footer
// version switcher renders this list so readers can jump between versions.
//
// To archive a version before continuing edits, see
// `scripts/snapshot-version.mjs` and the "Versioning" section of the README.
const docVersions = [
  { label: `v${currentVersion} (latest)`, link: '/', current: true },
  { label: 'v0.1.0 (archived)', link: '/v0.1.0/' },
];

const enNav = [
  { text: 'Specification', link: '/spec/' },
  { text: 'Engine', link: '/engine/getting-started' },
  { text: 'Platform', link: '/platform/' },
];

const skNav = [
  { text: 'Špecifikácia', link: '/sk/spec/' },
  { text: 'Jadro', link: '/sk/engine/getting-started' },
  { text: 'Platforma', link: '/sk/platform/' },
];

const specSidebar = [
  {
    text: 'Rea Language Specification',
    items: [
      { text: 'Introduction', link: '/spec/' },
      { text: 'Basics', link: '/spec/01-basics' },
      { text: 'Logic & Data', link: '/spec/02-logic-data' },
      { text: 'Narrative & Interaction', link: '/spec/03-narrative-interaction' },
      { text: 'Utilities', link: '/spec/04-utilities' },
      { text: 'Reference', link: '/spec/05-reference' },
      { text: 'When rules differ in .rext files', link: '/spec/rext-differences' },
      { text: 'Cheatsheet', link: '/spec/REA-CHEATSHEET' },
    ],
  },
];

const engineSidebar = [
  {
    text: 'Engine',
    items: [
      { text: 'Getting Started', link: '/engine/getting-started' },
      { text: 'Embedding', link: '/engine/embedding' },
      { text: 'Theming', link: '/engine/theming' },
      { text: 'Extending', link: '/engine/extending' },
      { text: 'Package Format', link: '/engine/package-format' },
      { text: 'Contributing', link: '/engine/contributing' },
    ],
  },
  {
    text: 'Self-Hosting',
    items: [
      { text: 'API Reference', link: '/engine/api' },
      { text: 'Changelog', link: '/changelog' },
      { text: 'Playground', link: '/engine/playground' },
    ],
  },
];

const platformSidebar = [
  {
    text: 'Platform',
    items: [
      { text: 'Overview', link: '/platform/' },
      { text: 'Story Design', link: '/platform/design/' },
      { text: 'Help & Guide', link: '/platform/help' },
      { text: 'Glossary', link: '/platform/glossary' },
    ],
  },
];

// Virtual sidebar so the changelog page renders with the same
// (#VPSidebarNav) layout as every other doc page. Without it the changelog
// uses the no-sidebar layout, which has a different content width and search
// placement (task 8pwphf).
const changelogSidebar = [
  {
    text: 'Changelog',
    items: [{ text: 'Changelog', link: '/changelog' }],
  },
];

const skSpecSidebar = [
  {
    text: 'Špecifikácia jazyka Rea',
    items: [
      { text: 'Úvod', link: '/sk/spec/' },
      { text: 'Základy', link: '/sk/spec/01-basics' },
      { text: 'Logika a dáta', link: '/sk/spec/02-logic-data' },
      { text: 'Naratív a interakcia', link: '/sk/spec/03-narrative-interaction' },
      { text: 'Utility', link: '/sk/spec/04-utilities' },
      { text: 'Referencia', link: '/sk/spec/05-reference' },
      { text: 'Kde sa pravidlá líšia v .rext súboroch', link: '/sk/spec/rext-differences' },
      { text: 'Ťahák', link: '/sk/spec/REA-CHEATSHEET' },
    ],
  },
];

const skEngineSidebar = [
  {
    text: 'Engine',
    items: [
      { text: 'Začíname', link: '/sk/engine/getting-started' },
      { text: 'Vkladanie', link: '/sk/engine/embedding' },
      { text: 'Témy', link: '/sk/engine/theming' },
      { text: 'Rozširovanie', link: '/sk/engine/extending' },
      { text: 'Formát súboru', link: '/sk/engine/package-format' },
      { text: 'Prispievanie', link: '/sk/engine/contributing' },
    ],
  },
  {
    text: 'Self-Hosting',
    items: [
      { text: 'API referencia', link: '/sk/engine/api' },
      { text: 'Changelog', link: '/sk/changelog' },
      { text: 'Pieskovisko', link: '/sk/engine/playground' },
    ],
  },
];

const skPlatformSidebar = [
  {
    text: 'Platforma',
    items: [
      { text: 'Prehľad', link: '/sk/platform/' },
      { text: 'Návrh príbehov', link: '/sk/platform/design/' },
      { text: 'Bezpečnosť a súkromie', link: '/sk/platform/security/' },
      { text: 'Pomoc a sprievodca', link: '/sk/platform/help' },
      { text: 'Slovník', link: '/sk/platform/glossary' },
    ],
  },
];

const skChangelogSidebar = [
  {
    text: 'Changelog',
    items: [{ text: 'Changelog', link: '/sk/changelog' }],
  },
];

export default defineConfig({
  title: 'Rea Language',
  description: 'Interactive story language specification and documentation',
  base: '/',
  outDir: './dist',
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo-rea.svg' }]],
  ignoreDeadLinks: [/\.\/\.\.\/LICENSE$/, /\.\/\.\.\/research\//, /localhost/],
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
      title: 'Jazyk Rea',
      description: 'Špecifikácia a dokumentácia interaktívneho naratívneho jazyka',
      themeConfig: {
        docVersion: currentVersion,
        docVersions,
        nav: skNav,
        sidebar: {
          '/sk/spec/': skSpecSidebar,
          '/sk/engine/': skEngineSidebar,
          '/sk/platform/': skPlatformSidebar,
          '/sk/changelog': skChangelogSidebar,
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
    docVersion: currentVersion,
    docVersions,
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
    nav: enNav,
    sidebar: {
      '/spec/': specSidebar,
      '/engine/': engineSidebar,
      '/platform/': platformSidebar,
      '/changelog': changelogSidebar,
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/atiris/reast-docs' }],
    logo: '/logo-rea.svg',
  },
});
