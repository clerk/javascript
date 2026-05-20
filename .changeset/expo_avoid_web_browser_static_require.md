---
'@clerk/clerk-expo': patch
---

Stop statically resolving `expo-web-browser` in native bundles. `ClerkProvider` previously called `require('expo-web-browser')` synchronously inside an `isWeb()` runtime gate, but Metro's static analyzer resolved the literal-string require regardless of the gate, causing production bundling to fail for native consumers who don't install `expo-web-browser` (an optional peer dependency).

The web-only call to `WebBrowser.maybeCompleteAuthSession()` has been moved into a platform-split helper (`maybeCompleteAuthSession.web.ts` for web, no-op `maybeCompleteAuthSession.ts` for native). Behavior on web is unchanged; native bundles no longer reference `expo-web-browser`.
