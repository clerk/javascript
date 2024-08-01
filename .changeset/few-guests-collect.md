---
"@clerk/nextjs": patch
"@clerk/clerk-react": patch
"@clerk/shared": patch
---

Add a nonce prop to `ClerkProvider` that can be used to thread the nonce value through to the clerk-js script load to support apps using a strict-dynamic content security policy. For NextJs applications, the nonce will be automatically pulled from the CSP header and threaded through without needing any props so long as the provider is server-rendered.
