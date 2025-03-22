---
"@clerk/nextjs": patch
---

A security vulnerability in Next.js was disclosed on 22 MAR 2025, which allows malicious actors to bypass authorization in Middleware when targeting the x-middleware-subrequest header. With this version we patch the `clerkMiddleware` helper to reject requests that contain the `x-middleware-subrequest` header. For more details, please see https://github.com/advisories/GHSA-f82v-jwr5-mffw
