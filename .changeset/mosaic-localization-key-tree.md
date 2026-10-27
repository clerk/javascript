---
'@clerk/mosaic': minor
---

Reorganize localization keys under the component they belong to. Section and dialog strings now nest under their component instead of sitting at the top level, for example `userProfileMfa.label` is now `userProfile.mfa.label`, `membersTableTab.title` is now `organizationProfile.members.list.title`, and `apiKeysTable.search` is now `apiKeys.search`. Email and phone strings moved from `userProfileContact.email` and `userProfileContact.phone` to `userProfile.email` and `userProfile.phone`. Update any `localization` overrides that use the old keys; TypeScript flags each one.
