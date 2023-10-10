---
'gatsby-plugin-clerk': patch
'@clerk/chrome-extension': patch
'@clerk/fastify': patch
'@clerk/nextjs': patch
'@clerk/clerk-react': patch
'@clerk/remix': patch
'@clerk/types': patch
'@clerk/clerk-expo': patch
---

Introduce a new property on the core Clerk singleton, `sdkMetadata`. This will be populated by each host SDK. This metadata will be used to make logging and debugging easier.
