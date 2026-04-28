---
'@clerk/shared': patch
'@clerk/backend': patch
'@clerk/clerk-js': patch
'@clerk/nextjs': patch
---

Auto-proxy FAPI requests for `.vercel.app` subdomains. When deployed to a `.vercel.app` domain without explicit proxy or domain configuration, the SDK automatically routes Frontend API requests through `/__clerk` on the app's own origin. This enables Clerk production mode on Vercel deployments without manual proxy setup.
