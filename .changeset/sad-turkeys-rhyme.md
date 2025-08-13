---
'@clerk/clerk-js': patch
'@clerk/types': patch
---

Add optional `isExternal` to `ApplicationLogo`

Add optional `oAuthApplicationUrl` parameter to OAuth Consent mounting (which is used to provide a link to the OAuth App homepage).

Harden `Link` component so it sanitizes the given `href` to avoid dangerous protocols.
