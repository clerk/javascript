---
'@clerk/mosaic': minor
---

**Breaking:** Add a `Profile` component that shows the account's pages, the active organization's pages, or both. `<UserProfile />` now shows only the account's pages, and `<OrganizationProfile />` only the organization's. To keep both in one profile, render `<Profile />`.

```tsx
<Profile />
<Profile mode='user' />
<Profile mode='organization' afterLeaveOrganizationUrl='/organizations' />
```

`mode` defaults to `'combined'`. Without a `mode`, `Profile` follows `MosaicProvider`'s `profile.combined`, so `false` shows only the account's pages.

With `experimental.newProfiles`, the profile a menu opens now matches the menu. `<UserButton />` and `<Switcher mode='user' />` open the account's pages, a lone `<OrganizationSwitcher />` opens the organization's pages, and only a combined `<Switcher />` opens one profile with both. `profile.combined: false` still splits a combined menu's profile in two.

| Before                                                    | After                                         |
| --------------------------------------------------------- | --------------------------------------------- |
| `<UserProfile />`                                         | `<Profile />`                                 |
| `<UserProfile combined />`                                | `<Profile />`                                 |
| `<UserProfile combined={false} />`                        | `<UserProfile />` or `<Profile mode='user' />` |
| `<UserProfile organizationProfileProps={...} />`          | `<Profile organizationProfileProps={...} />`  |

To find the code to update, run:

```sh
git grep -n '<UserProfile'
```

New exported types: `ProfileProps`, `CombinedProfileProps` and `ProfileMode`.
