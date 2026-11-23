/**
 * A styled surface composed through `Card.Root`, `Card.Header`, `Card.Media`, `Card.Title`,
 * `Card.Description`, `Card.Banner`, `Card.Content`, and `Card.Footer`. Every part accepts the Mosaic
 * `render` prop and forwards its ref.
 *
 * `Card.Banner` is a message slot between the header and the content. It is always rendered, and
 * a `Banner` expands into it while its children hold a message, collapsing again once they are
 * empty, so the slot takes `role='alert'` and stays a live region across both.
 *
 * Rendered as the content of a `Dialog.Popup`, the card reads that surface from `DialogContext`:
 * the title and description take the popup's ARIA ids, and the header carries the dismiss button.
 */
export * as Card from './card.parts';
export type { CardAlign, CardBannerProps, CardProps, CardSize } from './card';
