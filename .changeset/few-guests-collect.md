---
"@clerk/nextjs": minor
"@clerk/shared": minor
"@clerk/clerk-react": minor
"@clerk/clerk-js": minor
---

Add a `nonce` to clerk-js' script loading options. Also adds a `nonce` prop to `ClerkProvider`. This can be used to thread a nonce value through to the clerk-js script load to support apps using a `strict-dynamic` content security policy. For next.js applications, the nonce will be automatically pulled from the CSP header and threaded through without needing any props so long as the provider is server-rendered.
