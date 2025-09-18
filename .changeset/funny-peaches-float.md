---
"@clerk/nuxt": patch
---

Fixed an issue where Nuxt route middleware saw intermediate states during navigation, causing unwanted redirects during sign-in/sign-out flows.
