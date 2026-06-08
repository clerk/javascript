---
'@clerk/clerk-js': patch
'@clerk/shared': patch
---

Register the internal `ModuleManager` against the active `Clerk` instance via a new `@clerk/shared/moduleManager` registry, so `@clerk/ui` composed components can resolve a real `ModuleManager` without requiring `<ClerkProvider ui={ui} />`.
