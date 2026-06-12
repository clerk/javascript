---
'@clerk/shared': patch
---

Ship a self-contained `CookieAttributes` interface from `@clerk/shared/cookie` and use it in `createCookieHandler`'s `set`/`remove` signatures. The published declarations previously referenced `Cookies.CookieAttributes` from js-cookie, which consumers could never resolve (the import was dropped from the declaration output and js-cookie ships no types), causing TS2503 errors under `skipLibCheck: false` and silently degrading the option types to `any` otherwise.
