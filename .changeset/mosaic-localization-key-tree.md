---
'@clerk/mosaic': patch
---

Nest localization keys under the component they appear in, for example `userProfileMfa.label` is now `userProfile.mfa.label`. Update any `localization` overrides that use the old keys; TypeScript flags each one.
