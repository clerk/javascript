/**
 * A combination of settings a fixed __PKG_VERSION__ during build time
 * and the runtime __webpack_public_path__ config option (https://webpack.js.org/guides/public-path/).
 * We explicitly set the public path in order to account for all chunk caching scenarios.
 * A specific version of ui.browser.js file should always try to load its corresponding chunk versions,
 * otherwise we risk hitting caching issues.
 *
 * Scenario:
 * 1. We release @clerk/ui@1.0.0 containing: ui.browser.js, chunkA-1.0.0.js, chunkB-1.0.0.js
 * 2. A user opens an app using Clerk
 * 3. The browser downloads and caches `/npm/@clerk/ui@latest/dist/ui.browser.js`
 * 4. chunkA is needed so the browser downloads and caches `/npm/@clerk/ui@latest/dist/chunkA-1.0.0.js`
 * 5. Meanwhile, we release ui@1.2.0 containing: ui.browser.js, chunkA-1.2.0.js, chunkB-1.2.0.js
 *    On our CDN, @clerk/ui@latest now points to the new version
 * 6. A user opens the app again
 * 7. The browser loads `/npm/@clerk/ui@latest/dist/ui.browser.js` FROM CACHE (v1.0.0 file)
 * 8. chunkA is needed so the browser loads `/npm/@clerk/ui@latest/dist/chunkA-1.0.0.js` FROM CACHE (v1.0.0 file)
 * 9. chunkB is needed for the first time. The cached v1.0.0 ui.browser.js will try to load (request)
 *    `/npm/@clerk/ui@latest/dist/chunkA-1.0.0.js` but because ui@latest now resolves to v1.2.0,
 *    the v1.0.0 file will not be found and the app will crash
 *
 *  Solution:
 *  A given ui.browser.js file will only load its corresponding chunks using a fixed version. Example:
 *  - ui.browser.js loads from https://pk.accounts.dev/npm/@clerk/ui@canary/dist/ui.browser.js
 *  - all other chunks need to be loaded from https://pk.accounts.dev/npm/@clerk/ui@__PKG_VERSION__/dist/
 */
if (!__DEV__) {
  const CLERK_UI_NPM_PATH_REGEX = /(^.*\/@clerk\/ui@)(.+?)(\/dist.*)/;
  const setWebpackChunkPublicPath = () => {
    try {
      // @ts-expect-error
      const scriptUrl = new URL(document.currentScript.src);
      let hrefWithoutFilename = new URL(scriptUrl.href.split('/').slice(0, -1).join('/')).href;
      hrefWithoutFilename += hrefWithoutFilename.endsWith('/') ? '' : '/';
      __webpack_public_path__ = hrefWithoutFilename.replace(CLERK_UI_NPM_PATH_REGEX, `$1${__PKG_VERSION__}$3`);
    } catch {
      //
    }
  };
  setWebpackChunkPublicPath();
}

// Make this file a module to ESM TS happy
export {};
