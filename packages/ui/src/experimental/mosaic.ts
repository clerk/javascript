'use client';

/**
 * Experimental entrypoint for the Mosaic design system.
 *
 * No semver guarantees: anything exported here may change or be removed in a minor
 * release. Render `OrganizationProfile` under a `ClerkProvider` (for data) and a
 * `MosaicProvider` (for styling/appearance). The profile's parts can also be rendered
 * standalone via `OrganizationProfile.GeneralPanel`, `OrganizationProfile.LeaveSection`,
 * and `OrganizationProfile.DeleteSection`.
 *
 * This entry carries a `'use client'` boundary because every Mosaic component is
 * client-only (React context, hooks, emotion). It lives under `experimental/mosaic`
 * rather than the generic `experimental` so that boundary stays scoped to Mosaic and
 * does not force a client directive onto unrelated experimental exports.
 */
export { MosaicProvider } from '../mosaic/MosaicProvider';
export type { MosaicProviderProps } from '../mosaic/MosaicProvider';
export { OrganizationProfile } from '../mosaic/aio/organization-profile';
export type { MosaicAppearance } from '../mosaic/appearance';
