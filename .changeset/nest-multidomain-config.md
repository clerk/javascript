---
"@clerk/shared": minor
"@clerk/backend": minor
"@clerk/nextjs": minor
"@clerk/astro": minor
"@clerk/react-router": minor
"@clerk/tanstack-react-start": minor
"@clerk/clerk-js": minor
"@clerk/express": minor
"@clerk/react": minor
"@clerk/vue": minor
"@clerk/nuxt": minor
---

Nest satellite configuration under a `multiDomain` key. The top-level `isSatellite`, `domain`, and `satelliteAutoSync` options are replaced by `multiDomain: { isSatellite, domain?, proxyUrl?, autoSync? }`. The `proxyUrl` option remains available at both the top level and inside `multiDomain`.
