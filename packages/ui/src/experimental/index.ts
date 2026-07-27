// Public entrypoint for the composed profile API (`@clerk/ui/experimental`).
//
// Each component is a top-level named export (not a property on a namespace
// object) so React Server Components create a client reference for it. That lets
// consumers render these directly in a Server Component tree without adding their
// own `'use client'` boundary — the `'use client'` directive lives on each leaf
// file, and re-exporting forwards those references unchanged. A namespace object
// (`UserProfile.Account`) would expose only the object as a client reference and
// break property access across the RSC boundary.
export * from '../composed';
