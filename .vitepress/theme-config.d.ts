/**
 * The two theme-config fields this site adds beyond the default theme, read by
 * the footer's version switcher (`theme/Footer.vue`). Declaration-merging them
 * onto `DefaultTheme.Config` is what makes writing them in `config.ts` legal.
 *
 * Unlike `env.d.ts`, this file must be a *module* — a `declare module` for a
 * package that exists is an augmentation, and augmentations are only legal
 * inside a module.
 */
import 'vitepress';

declare module 'vitepress' {
  namespace DefaultTheme {
    interface Config {
      /** Version this build of the documentation represents, from package.json. */
      docVersion?: string;
      /** Published versions, newest first; rendered by the footer switcher. */
      docVersions?: { label: string; link: string; current?: boolean }[];
    }
  }
}
