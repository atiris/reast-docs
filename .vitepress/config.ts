import { defineConfig } from 'vitepress';
import reaGrammar from './rea.tmLanguage.json';

export default defineConfig({
  title: 'REA Language',
  description: 'Interactive story language specification and documentation',
  base: '/',
  outDir: './dist',
  markdown: {
    languages: [reaGrammar as any],
  },
  themeConfig: {
    nav: [
      { text: 'Specification', link: '/spec/01-basics' },
      { text: 'Player', link: '/player/getting-started' },
      { text: 'API', link: '/player/api' },
      { text: 'Playground', link: '/docs/playground' },
      { text: 'Platform', link: '/platform/architecture/' },
      { text: 'Glossary', link: '/docs/glossary' },
      {
        text: 'v0.1.0',
        items: [
          { text: 'v0.1.0 (current)', link: '/changelog' },
          { text: 'Changelog', link: '/changelog' },
        ],
      },
    ],
    sidebar: {
      '/spec/': [
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
      ],
      '/player/': [
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
      ],
      '/docs/': [
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
      ],
      '/platform/': [
        {
          text: 'Platform',
          items: [
            { text: 'Overview', link: '/platform/' },
            { text: 'Design System', link: '/platform/design/' },
            { text: 'Security & Privacy', link: '/platform/security/' },
          ],
        },
      ],
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/atiris/reast-docs' }],
  },
});
