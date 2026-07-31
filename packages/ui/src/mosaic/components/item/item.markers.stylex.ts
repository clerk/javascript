import * as stylex from '@stylexjs/stylex';

/**
 * Scopes a part's ancestor-state selectors to a Mosaic `Item.Root`, so an unrelated hovered
 * ancestor can't drive them. `Item.Root` applies it; `Item.Label` matches on it to follow the
 * row's hover rather than its own.
 *
 * Its own module because `@stylexjs/enforce-extension` requires the define-primitives to live in
 * a `.stylex.ts` file.
 */
export const itemScope = stylex.defineMarker();
