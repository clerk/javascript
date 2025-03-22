---
"@clerk/nextjs": patch
---

A security vulnerability in Next.js was disclosed on 22 MAR 2025, which allows malicious actors to bypass authorization in Middleware when targeting the x-middleware-subrequest header. With this version we update the `peerDependencies` filed of the `@clerk/nextjs` package to only allow the patched NextJS versions to be used. For more details, please see https://github.com/advisories/GHSA-f82v-jwr5-mffw
