// @ts-nocheck
/**
 * Brand marks for recognized OAuth clients. These live in the component
 * directory (not `src/icons`) on purpose: the `ui-common` rspack cacheGroup
 * captures everything outside `/components`, so keeping them here bundles the
 * marks into the lazy `oauthConsent` chunk instead of the shared chunk that
 * loads on every component. The `@ts-nocheck` mirrors `icons/index.ts`: `.svg`
 * modules are resolved by the bundler (svgr), not by tsc.
 */
export { default as Claude } from './claude.svg';
export { default as OpenAI } from './openai.svg';
