'use client';

/**
 * A tinted strip that annotates the surface it sits on with a status message. Composed through
 * `Banner.Root`, `Banner.Label`, and `Banner.Description`; every part accepts the Mosaic `render`
 * prop and forwards its ref. `Banner.Root` renders the icon for its `color` itself.
 *
 * `Banner.Root` sets no ARIA role. A banner that appears in response to something the user did
 * should be given `role='status'` (or `role='alert'` for an error) so it is announced.
 *
 * @example
 * <Banner.Root color='negative'>
 *   <Banner.Label>Error banner</Banner.Label>
 *   <Banner.Description>Renew now to avoid service interruption.</Banner.Description>
 * </Banner.Root>
 */
export * as Banner from './banner.parts';
export type { BannerDescriptionProps, BannerLabelProps, BannerRootProps } from './banner';
