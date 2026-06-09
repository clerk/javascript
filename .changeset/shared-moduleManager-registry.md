---
'@clerk/clerk-js': patch
'@clerk/shared': patch
'@clerk/react': patch
---

Expose the internal `ModuleManager` from the active `Clerk` instance via `__internal_moduleManager` so framework SDK wrappers can forward it across bundle boundaries. `@clerk/react`'s `IsomorphicClerk` reads it on load and re-registers it through `@clerk/shared/moduleManager`, allowing `@clerk/ui` composed subcomponents to resolve dynamic-imported modules (Coinbase Wallet, Base, Stripe, zxcvbn) without requiring `<ClerkProvider ui={ui} />`.
