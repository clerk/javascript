---
'@clerk/shared': minor
'@clerk/nextjs': patch
'@clerk/backend': minor
---

Remove leftover keyless-mode creation code now that no SDK mints keyless applications. `@clerk/shared/keyless` drops `resolveKeysWithKeylessFallback`, `getOrCreateKeys`, and related exports (internal APIs consumed only by Clerk SDKs); `@clerk/backend` removes the experimental `createAccountlessApplication` method; `@clerk/nextjs` deletes the unused keyless cookie reader and dead keyless middleware parameters, and logs a pointer to existing `.clerk/.tmp/keyless.json` keys when env keys are missing.
