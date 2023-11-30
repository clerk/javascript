---
'@clerk/localizations': patch
---

The package now allows for [subpath exports](https://nodejs.org/api/packages.html#subpath-exports). You can now import specific languages like so:

```diff
# Single language
- import { frFR } from "@clerk/localizations"
+ import { frFR } from "@clerk/localizations/fr-FR"

# Multiple languages
- import { enUS, esES } from "@clerk/localizations"
+ import { enUS } from "@clerk/localizations/en-US"
+ import { esES } from "@clerk/localizations/es-ES"
```

This helps with tree-shaking and will reduce your total bundle size in most cases.

You can continue to use the top-level `@clerk/localizations` import as this is a non-breaking change. You can gradually opt-in to this optimization.
