'use client';

/**
 * Experimental entrypoint for the Mosaic design system.
 *
 * No semver guarantees: anything exported here may change or be removed in a minor
 * release. Render `OrganizationProfile` under a `ClerkProvider` (for data) and a
 * `MosaicProvider` (for styling/appearance).
 *
 * This entry carries a `'use client'` boundary because every Mosaic component needs one
 * (React context, hooks, emotion can't run in a Server Component). The directive marks a
 * client boundary — it does not opt out of SSR; React still invokes these components during
 * the server render. In practice they emit no server markup anyway, because their controllers
 * gate on Clerk being loaded (`!isLoaded` → render `null`) and Clerk only loads client-side,
 * so the UI appears after hydration. What the directive actually buys is letting the flat
 * exports below drop straight into a Server Component with no consumer setup. It lives under
 * `experimental/mosaic` rather than the generic `experimental` so that boundary stays scoped
 * to Mosaic and does not force a client directive onto unrelated experimental exports.
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
export { OrganizationProfileGeneralPanel } from '../mosaic/panels/organization-profile-general-panel';
export { OrganizationProfileDeleteSection } from '../mosaic/sections/organization-profile-delete-section';
export { OrganizationProfileLeaveSection } from '../mosaic/sections/organization-profile-leave-section';
export type { MosaicAppearance } from '../mosaic/appearance';
