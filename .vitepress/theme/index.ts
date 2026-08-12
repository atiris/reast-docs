import DefaultTheme from 'vitepress/theme';
import Layout from './Layout.vue';
import Feature from './components/Feature.vue';
import FeatureIndex from './components/FeatureIndex.vue';
import './style.css';

export default {
  extends: DefaultTheme,
  Layout,
  // Registered globally so any markdown page can drop a status badge under a
  // heading (`<Feature id="…"/>`) without a per-page script block.
  enhanceApp({ app }: { app: import('vue').App }) {
    app.component('Feature', Feature);
    app.component('FeatureIndex', FeatureIndex);
  },
};
