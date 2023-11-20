---
'@clerk/clerk-js': minor
'@clerk/nextjs': minor
'@clerk/shared': minor
---

Move and export the following from @clerk/clerk-js and @clerk/nextjs to @clerk/shared:
    - `DEV_BROWSER_SSO_JWT_PARAMETER`
    - `DEV_BROWSER_JWT_MARKER`
    - `DEV_BROWSER_SSO_JWT_KEY`
    - `setDevBrowserJWTInURL`
    - `getDevBrowserJWTFromURL`
    - `getDevBrowserJWTFromResponse`