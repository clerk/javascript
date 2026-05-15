---
'@clerk/ui': minor
---

Add support for inline `<bold>` markup in localization values, rendered as `<strong>` elements. Translators can now write `'Agree to <bold>Terms</bold>'` in a single key instead of splitting into prefix/bold/suffix fragments. Token values are substituted only into parsed text leaves, so user-controlled data can never become markup. Also hardens `applyTokensToString` to use `Object.prototype.hasOwnProperty.call` when filtering token names, preventing prototype-chain names like `{{hasOwnProperty}}` from crashing rendering.
