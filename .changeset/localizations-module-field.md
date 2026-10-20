---
'@clerk/localizations': patch
---

Add a `module` field pointing to the ESM build, so bundlers that don't read `exports` (such as Parcel in Plasmo-based Chrome extensions) can tree-shake unused locales.
