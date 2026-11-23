/**
 * Mosaic `Item` — a row for lists of accounts, organizations, and settings.
 * Composed via dot syntax: `Item.Root`, `Item.Media`, `Item.Content`,
 * `Item.Label`, `Item.Description`, `Item.Actions`, `Item.Group`. Every part
 * takes a `render` prop and forwards a ref.
 */
export * as Item from './item.parts';
export type { ItemProps } from './item';
