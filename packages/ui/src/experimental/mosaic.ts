'use client';

/**
 * Experimental entrypoint for the Mosaic design system.
 *
 * No semver guarantees: anything exported here may change or be removed in a minor
 * release. Render `OrganizationProfile` under a `ClerkProvider` (for data) and a
 * `MosaicProvider` (for styling/appearance).
 *
 * This entry carries a `'use client'` boundary because every Mosaic component is
 * client-only (React context, hooks, emotion). It lives under `experimental/mosaic`
 * rather than the generic `experimental` so that boundary stays scoped to Mosaic and
 * does not force a client directive onto unrelated experimental exports.
 *
 * The profile's parts are exposed two ways:
 *
 * - As flat top-level exports (`OrganizationProfileGeneralPanel`,
 *   `OrganizationProfileLeaveSection`, `OrganizationProfileDeleteSection`). Each is its
 *   own named export, so React treats it as an individual client reference and a React
 *   Server Component can render it directly — no `'use client'` needed in the consumer.
 * - As a compound namespace (`OrganizationProfile.GeneralPanel`, `.LeaveSection`,
 *   `.DeleteSection`), which is more ergonomic but only works inside a client component:
 *   property access on a client reference is not possible across the RSC boundary, so
 *   `OrganizationProfile.GeneralPanel` reads as `undefined` in a server component. Server
 *   components must use the flat exports.
 *
 * Both forms resolve to the same component object.
 */
export { MosaicProvider } from '../mosaic/MosaicProvider';
export type { MosaicProviderProps } from '../mosaic/MosaicProvider';
export { OrganizationProfile } from '../mosaic/aio/organization-profile';
export { OrganizationProfileGeneral as OrganizationProfileGeneralPanel } from '../mosaic/panels/organization-profile-general';
export { DeleteOrganization as OrganizationProfileDeleteSection } from '../mosaic/sections/delete-organization';
export { LeaveOrganization as OrganizationProfileLeaveSection } from '../mosaic/sections/leave-organization';
export type { MosaicAppearance } from '../mosaic/appearance';
