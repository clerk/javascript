---
'@clerk/mosaic': minor
---

**Breaking:** Add `Switcher`, the account and organization menu, and make `UserButton` list accounts only. `Switcher` takes `mode`: `'combined'` (the default) lists accounts and organizations, `'user'` lists accounts only, and `'organization'` lists organizations. `<UserButton />` is now `<Switcher mode='user' />` and `<OrganizationSwitcher />` is `<Switcher mode='organization' />`. Each mode takes only its own props, so TypeScript flags organization options on `UserButton` and `triggerVariant` outside `combined`. A `mode` chosen at runtime takes only the props every mode shares.

| Before                                                                                                          | After                                          |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `<UserButton />` (accounts and organizations)                                                                   | `<Switcher />`                                 |
| `<UserButton combined={false} />`                                                                               | `<UserButton />` or `<Switcher mode='user' />` |
| `<UserButton triggerVariant='condensed' />`                                                                     | `<Switcher triggerVariant='condensed' />`      |
| Organization props on `UserButton` (`hidePersonal`, `afterSelectOrganizationUrl`, `createOrganizationUrl`, ...) | The same props on `Switcher`                   |
| `UserButtonProps` (combined menu)                                                                               | `CombinedSwitcherProps`                        |

Find usages with `git grep -n "UserButton"`.
