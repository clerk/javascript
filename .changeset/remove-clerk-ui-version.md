---
'@clerk/shared': major
'@clerk/nextjs': major
'@clerk/astro': major
'@clerk/react-router': major
'@clerk/tanstack-react-start': major
'@clerk/express': major
'@clerk/nuxt': major
---

Remove `clerkJSUrl`, `clerkJSVersion`, `clerkUIUrl`, and `clerkUIVersion` props from all SDKs. To pin a specific version of `@clerk/clerk-js`, import the `Clerk` constructor from `@clerk/clerk-js` and pass it to `ClerkProvider` via the `Clerk` prop. To pin a specific version of `@clerk/ui`, import `ui` from `@clerk/ui` and pass it via the `ui` prop. This bundles the modules directly with your application instead of loading them from the CDN.
