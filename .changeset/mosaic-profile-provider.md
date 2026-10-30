---
'@clerk/mosaic': minor
---

Configure the profile on `MosaicProvider` with the new `profile` prop, so `UserButton`, `OrganizationSwitcher` and `UserProfile` share one setup. This makes pairings like a user-only `UserButton` beside an `OrganizationSwitcher` with one combined profile possible.

```tsx
<MosaicProvider profile={{ combined: true, userProfileProps, organizationProfileProps }}>
  <OrganizationSwitcher />
  <UserButton combined={false} />
</MosaicProvider>
```

Breaking changes:

- `UserButton`: `mode` is replaced by `combined`, which only decides what the menu lists. `mode='user'` becomes `combined={false}`, and to keep the account-only profile too, also set `profile={{ combined: false }}` on `MosaicProvider`.
- `UserButton` and `OrganizationSwitcher`: `userProfileProps` and `organizationProfileProps` move to `MosaicProvider`'s `profile`.
- `UserButton` and `OrganizationSwitcher`: `userProfileUrl`, `userProfileMode`, `organizationProfileUrl` and `organizationProfileMode` move to `MosaicProvider`'s `profile`.
- `UserButton` and `OrganizationSwitcher`: `appearance` is no longer accepted in `userProfileProps` or `organizationProfileProps`.
- `UserButton` and `OrganizationSwitcher`: link items (`href`) are no longer accepted in `customPages`.
- `UserButton` and `OrganizationSwitcher`: `afterLeaveOrganizationUrl` moves to `profile.organizationProfileProps`, which also takes `apiKeysProps`.
- `UserProfile`: `mode` is replaced by `combined`. When unset it follows `profile.combined`, and it also picks up the provider's profile props, with its own props winning. `OrganizationProfile` picks them up the same way.
- With `experimental.newProfiles`, `OrganizationSwitcher` now opens the combined profile by default. Set `profile={{ combined: false }}` for the standalone organization profile.
- The `UserProfileMode` type is removed.
