---
'@clerk/clerk-react': minor
'@clerk/types': minor
---

Update the TypeScript types of `<ClerkProvider />`. If you use the `routerPush` prop you're now required to also provide the `routerReplace` prop (or other way around). You can also not provide them at all since both props are optional.
