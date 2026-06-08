---
'@clerk/tanstack-react-start': minor
'@clerk/react-router': minor
'@clerk/clerk-js': minor
'@clerk/nextjs': minor
'@clerk/shared': minor
'@clerk/astro': minor
'@clerk/react': minor
'@clerk/nuxt': minor
'@clerk/vue': minor
---

Remove the `<ConfigureSSO />` component from the public API in favor of usage within `OrganizationProfile`

Removing these exports has no breaking changes impact on production applications, as <ConfigureSSO /> was never released as a GA component
