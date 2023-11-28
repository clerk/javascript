---
'@clerk/clerk-react': minor
'@clerk/types': minor
---

Update `<ClerkProvider/>` `routerPush` and `routerReplace` options to be both required or both missing.
Also used internally the `Without` generic instead of `Omit` to resolve issues with complex types and
partially making a type property optional.
