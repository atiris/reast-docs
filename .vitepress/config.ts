import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'REA Language',
  description: 'Interactive story language specification and documentation',
  base: '/',
  outDir: './dist',
  themeConfig: {
    nav: [
      { text: 'Specification', link: '/spec/' },
      { text: 'Guides', link: '/guides/' },
      { text: 'API', link: '/api/' },
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
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/atiris/reast-docs' },
    ],
  },
});
