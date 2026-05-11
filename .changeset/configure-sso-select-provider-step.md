---
'@clerk/localizations': patch
'@clerk/clerk-js': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Implement the provider selection step of `<__experimental_ConfigureSSO />`. Renders the two SAML provider tiles (Okta Workforce and Custom SAML Provider) with real icons sourced from `img.clerk.com`, tracks the picked provider in local state, and gates `Step.Footer.Continue` on a selection. Includes a warning callout about provider lock-in and a minor `Step.Header` alignment tweak. All user-visible strings are wired through `@clerk/localizations`, with translations for every supported locale.
