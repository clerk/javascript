---
'@clerk/clerk-js': patch
'@clerk/shared': patch
---

Update the debBrowser handling logic to remove hash-based devBrowser JWTs from the URL. Even if v5 does not use the hash-based JWT at all, we still need to remove it from the URL in case clerk-js is initialised on a page after a redirect from an older clerk-js version, such as an AccountPortal using the v4 components
