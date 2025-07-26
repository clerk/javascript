---
'@clerk/localizations': patch
'@clerk/clerk-js': patch
'@clerk/testing': patch
'@clerk/types': patch
---

Replace "Personal Account" semantics in favor of "Personal Workspace"

- Update default English localization of `organizationSwitcher['personalWorkspace']` to `Personal account`
- Update JSDocs for `hidePersonal` prop
- Deprecate `expectPersonalAccount` in favor of `expectPersonalWorkspace`
