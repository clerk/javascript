import * as stylex from '@stylexjs/stylex';

/**
 * Scopes a container's `data-icon` selectors to a Mosaic `Icon`, so a stray `data-icon` elsewhere
 * in the subtree can't trigger them. `Icon` applies it; `Button`'s inline padding matches on it.
 *
 * Its own module because `@stylexjs/enforce-extension` requires the define-primitives to live in
 * a `.stylex.ts` file.
 */
export const iconScope = stylex.defineMarker();
