/**
 * Ambient shim for `.vue` single-file components.
 *
 * `vue-tsc` understands them natively; plain `tsc` — which is all this repo
 * runs, since the components are checked by the build rather than by types —
 * needs them declared as generic components so `theme/index.ts` can register
 * them without erroring.
 *
 * This file must stay a *script*, not a module: a wildcard `declare module` is
 * only legal at the top level of a global declaration file. The theme-config
 * augmentation, which needs the opposite, lives in `theme-config.d.ts`.
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
