---
'@clerk/ui': patch
---

Import the default English localization from `@clerk/localizations/en-US` instead of the package index, so bundlers that don't tree-shake re-exports (such as Parcel in Plasmo-based Chrome extensions) no longer include every locale.
