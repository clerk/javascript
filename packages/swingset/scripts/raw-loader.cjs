/**
 * Webpack loader powering `import src from './x?raw'` — returns the file's *untransformed*
 * source as a default-exported string (used by the `<Story>` "Code" footer).
 *
 * It is registered as a `pre` loader so it runs first and receives the original bytes. The
 * downstream Next/SWC pass then only sees `export default "<source>"` — a plain string
 * literal it re-emits unchanged — so the footer shows real source instead of compiled
 * `createElement(...)` output. (Next/webpack has no built-in `?raw`, unlike Vite.)
 */
module.exports = function rawLoader(source) {
  return `const __raw = ${JSON.stringify(source)};\nexport default __raw;`;
};
