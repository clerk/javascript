---
'@clerk/localizations': patch
---

fix(localizations): Complete formFieldInputPlaceholder keys for es-ES and ca-ES

Adds missing translations for `formFieldInputPlaceholder__apiKeyDescription`,
`formFieldInputPlaceholder__apiKeyExpirationDate`, `formFieldInputPlaceholder__apiKeyName`,
and `formFieldInputPlaceholder__signUpPassword` in both locales.

Also adds `formFieldInput__emailAddress_format` for ca-ES and improves consistency
of existing placeholder text in ca-ES.

Note for maintainers: the es-ES file currently uses Latin American Spanish conventions
(e.g. 'Ingrese' for 'Type/Enter'). The European Spanish (es-ES) equivalent would be
'Introduzca' or 'Introduce'. A future contribution to align the file with European
Spanish usage would be welcome.
