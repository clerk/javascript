// Lightning CSS encodes browser versions as (major << 16) | (minor << 8) | patch.
const version = (major, minor = 0) => (major << 16) | (minor << 8);

// Pin targets to browsers that natively support `light-dark()` and `oklch()`
// (the token color model). Without this, the plugin defaults to a broad
// browserslist and Lightning CSS down-levels `light-dark()` into an incomplete
// `--lightningcss-*` polyfill, producing invalid two-token color values.
//
// Firefox is 121, not the 120 that `light-dark()` alone would allow: 121 is where
// `:has()` shipped, which the styles now use (see `button.styles.ts`).
export const mosaicLightningCssTargets = {
  chrome: version(123),
  edge: version(123),
  firefox: version(121),
  safari: version(17, 5),
  ios_saf: version(17, 5),
};
