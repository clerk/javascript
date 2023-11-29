---
'@clerk/localizations': patch
---

The package now allows for [subpath exports](https://nodejs.org/api/packages.html#subpath-exports).

```diff
- import { frFR } from "@clerk/localizations"
+ import { frFR } from "@clerk/localizations/fr-FR"
```

This should help with tree-shaking by helping the bundler to include only specific localization.

This is a non-breaking change-previous imports from "@clerk/localizations" are still working as expected.