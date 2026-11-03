# @clerk/mosaic

## 0.2.0

### Minor Changes

- **Breaking:** Replace and remove color tokens. TypeScript does not flag these, so find usages with `git grep -nE -e '--cl-color-(background|brand-secondary)'`. ([#10493](https://github.com/clerk/javascript/pull/10493)) by [@prestonwebdev](https://github.com/prestonwebdev)

  | Before                         | After                                                                                                                      |
  | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
  | `--cl-color-background`        | `--cl-color-page` for the profile shell, `--cl-color-surface` for anything raised on it, such as cards, menus and controls |
  | `--cl-color-background-subtle` | `--cl-color-surface-subtle`                                                                                                |
  | `--cl-color-brand-secondary`   | Removed, with no direct replacement. Choose another token by where it is used.                                             |

  Dark mode gives the profile its own shell color. `--cl-color-background` is replaced by `--cl-color-page`, the base layer (near-black in dark mode, white in light), which backs the profile shell. A new `--cl-color-surface` backs everything raised on it, such as cards, sections, menus, popovers and controls, and the gray ramp mixes into it. The surface is derived from the page (neutral mixed 5 percent into it in dark mode, white mixed 60 percent into it in light mode), so retinting `--cl-color-page` retints the shell, the surface and the ramp together, and with the default white page the shell, surface and borders look the same in light mode. `--cl-color-background-subtle` is renamed `--cl-color-surface-subtle`.

  Brand and the negative, positive and warning colors now share one set of derived tokens: `-foreground`, `-subtle`, `-border` and `-alpha-100|200|300`, so overriding a seed retints its companions. `-foreground` flips to dark text in dark mode for brand, positive and warning, where white would fail, while negative keeps white text. `--cl-color-brand-secondary` is removed. `--cl-color-neutral-subtle` is new. `--cl-color-border` and `--cl-color-border-subtle` are now neutral washes (7 and 4 percent in light mode, 12 and 8 in dark mode), so they stay visible on the surface and faded fills.

  In light mode the negative, positive and warning colors are slightly darker so their text passes contrast on their own `-subtle` fill, `--cl-color-foreground-secondary` is a little darker, and `--cl-color-input-placeholder` has its own value that now passes contrast on the field.

- **Breaking:** Nest localization keys under the component they appear in, for example `userProfileMfa.label` is now `userProfile.mfa.label`. Update any `localization` overrides that use the old keys, written as nested objects or dot paths; TypeScript flags each one. Keys below a root stay the same unless listed here. ([#10458](https://github.com/clerk/javascript/pull/10458)) by [@alexcarpenter](https://github.com/alexcarpenter)

  | Before                                 | After                                     |
  | -------------------------------------- | ----------------------------------------- |
  | `apiKeysTable`                         | `apiKeys`                                 |
  | `membersTableTab`                      | `organizationProfile.members.list`        |
  | `invitationsTableTab`                  | `organizationProfile.members.invitations` |
  | `requestsTableTab`                     | `organizationProfile.members.requests`    |
  | `organizationProfileInviteMembers`     | `organizationProfile.members.invite`      |
  | `organizationProfileProfileSection`    | `organizationProfile.profile`             |
  | `organizationProfileDangerSection`     | `organizationProfile.danger`              |
  | `userProfileProfileSection`            | `userProfile.profile`                     |
  | `userProfileContact`                   | `userProfile.contact`                     |
  | `userProfileContact.email`             | `userProfile.email`                       |
  | `userProfileContact.phone`             | `userProfile.phone`                       |
  | `userProfileAddEmail`                  | `userProfile.email.addDialog`             |
  | `userProfileAddPhone`                  | `userProfile.phone.addDialog`             |
  | `userProfileConnectedAccounts`         | `userProfile.connectedAccounts`           |
  | `userProfileEnterpriseAccountsSection` | `userProfile.enterpriseAccounts`          |
  | `userProfileWeb3Wallets`               | `userProfile.web3Wallets`                 |
  | `userProfilePasswordSection`           | `userProfile.password`                    |
  | `userProfilePasskeys`                  | `userProfile.passkeys`                    |
  | `userProfileMfa`                       | `userProfile.mfa`                         |
  | `userProfileAddSms`                    | `userProfile.mfa.addSms`                  |
  | `userProfileAddAuthenticator`          | `userProfile.mfa.addAuthenticator`        |
  | `userProfileAuthenticatorSetup`        | `userProfile.mfa.authenticatorSetup`      |
  | `userProfileBackupCodes`               | `userProfile.mfa.backupCodes`             |
  | `userProfileActiveDevices`             | `userProfile.activeDevices`               |
  | `userProfileDangerSection`             | `userProfile.danger`                      |

  Keys under `reverification` are also renamed:

  | Before                                                                                                   | After                                              |
  | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
  | `alternativeMethods.title`, `.description`                                                               | `methods.title`, `.description`                    |
  | `alternativeMethods.blockButton__<method>`                                                               | `methods.<method>`                                 |
  | `alternativeMethods.actionText`                                                                          | `methods.helpText`                                 |
  | `alternativeMethods.actionLink`                                                                          | `methods.help`                                     |
  | `alternativeMethods.getHelp.title`, `.description`                                                       | `help.title`, `.description`                       |
  | `alternativeMethods.getHelp.blockButton__emailSupport`                                                   | `help.emailSupport`                                |
  | `backupCodeMfa.*`                                                                                        | `backupCode.*`                                     |
  | `formFieldLabel__backupCode`                                                                             | `backupCode.label`                                 |
  | `formFieldLabel__password`                                                                               | `password.label`                                   |
  | `formFieldInputPlaceholder__password`                                                                    | `password.placeholder`                             |
  | `formFieldAction__showPassword`, `formFieldAction__hidePassword`                                         | `password.showPassword`, `.hidePassword`           |
  | `emailCode.formTitle`, `phoneCode.formTitle`, `totpMfa.formTitle`                                        | `emailCode.label`, `phoneCode.label`, `totp.label` |
  | `emailCode.resendButton`, `phoneCode.resendButton`                                                       | `emailCode.resend`, `phoneCode.resend`             |
  | `totpMfa.title`, `.description`                                                                          | `totp.title`, `.description`                       |
  | `phoneCodeMfa.*`                                                                                         | `phoneCode.*`, with the renames above              |
  | `error.closeButton`                                                                                      | `error.close`                                      |
  | `backButton`                                                                                             | `back`                                             |
  | `formButtonPrimary`                                                                                      | `continue`                                         |
  | `footerActionLink__useAnotherMethod`                                                                     | `useAnotherMethod`                                 |
  | `unstable__errors__generic`                                                                              | `attemptFailed`                                    |
  | `passkey.blockButton__passkey`, `password.actionLink`, `formButtonReset`, `identityPreviewEditButton__*` | Removed. Delete the override.                      |

  Find usages with:

  ```sh
  git grep -nE -e 'apiKeysTable|(members|invitations|requests)TableTab|organizationProfile(InviteMembers|DangerSection|ProfileSection)' \
    -e 'userProfile(ActiveDevices|AddEmail|AddPhone|AddAuthenticator|AddSms|AuthenticatorSetup|BackupCodes|ConnectedAccounts|Contact|DangerSection|EnterpriseAccountsSection|Mfa|Passkeys|PasswordSection|ProfileSection|Web3Wallets)'
  ```

- **Breaking:** Rename two `UserButton` and `OrganizationSwitcher` props. Values and defaults are unchanged; TypeScript flags each old name. ([#10554](https://github.com/clerk/javascript/pull/10554)) by [@alexcarpenter](https://github.com/alexcarpenter)

  | Before               | After              |
  | -------------------- | ------------------ |
  | `renderTriggerLabel` | `showTriggerLabel` |
  | `renderTriggerBadge` | `triggerBadge`     |

  Find usages with `git grep -nE 'renderTrigger(Label|Badge)'`.

### Patch Changes

- Fix hover-enabled menus, such as the `UserButton` account and settings flyouts, sometimes closing when the pointer moved toward an item after the menu was opened with a click. ([#10533](https://github.com/clerk/javascript/pull/10533)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Fix the user profile modal's return from a redirect on Next.js App Router apps: the URL change now reaches the router, so `useSearchParams` no longer keeps the removed param and going back no longer reloads the page. History state that isn't a plain object is also kept intact. ([#10550](https://github.com/clerk/javascript/pull/10550)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Ellipsis menus, the dialog and card close buttons, the Cancel buttons in the confirmation, delete and rename dialogs, and the reverification Back button and resend and help links use the neutral color instead of the brand color, and the "You" badge in the members table is neutral. Field labels use the neutral text color, and disabled inputs and tag inputs are tinted with the neutral color. Email and phone values in the user profile use the primary text color. An interactive row's icon darkens fully on hover, and an outlined interactive row firms up its border on hover. ([#10494](https://github.com/clerk/javascript/pull/10494)) by [@prestonwebdev](https://github.com/prestonwebdev)

- The user profile modal now reopens on the Account page after a user leaves it to connect or reconnect a social or enterprise account, or to verify an email address through enterprise SSO. Mosaic no longer sends `__clerk_modal_state` on these redirects, so returning from them no longer opens the legacy profile modal. ([#10545](https://github.com/clerk/javascript/pull/10545)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Suppress organization invitation success notifications when the members panel closes or the active organization or session changes before the invitation finishes. ([#10551](https://github.com/clerk/javascript/pull/10551)) by [@austincalvelage](https://github.com/austincalvelage)

- Updated dependencies [[`debfc72`](https://github.com/clerk/javascript/commit/debfc72bc2f49a004b20365773824b283bc3cda0)]:
  - @clerk/shared@4.43.1

## 0.1.15

### Patch Changes

- Fix menu rows in `<UserButton />` and `<OrganizationSwitcher />` showing the browser's default button border and background on pages without a CSS reset. ([#10466](https://github.com/clerk/javascript/pull/10466)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`4ce996f`](https://github.com/clerk/javascript/commit/4ce996ff283e6bee334109a245aaa7384b7e38e5)]:
  - @clerk/shared@4.43.0

## 0.1.14

### Patch Changes

- Fix primitive parts dropping their own event handler, `className` or `style` when a consumer passes `undefined` for that prop. For example, `<Dialog.Trigger onClick={undefined}>` now still opens the dialog. ([#10433](https://github.com/clerk/javascript/pull/10433)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Fix the gap around the badge on the UserButton avatar breaking when the avatar or its badge is resized. `.cl-user-button-avatar` now reads `--cl-avatar-badge-size`, `--cl-avatar-badge-gap` and `--cl-avatar-badge-offset`, and the cutout behind the badge follows them. ([#10455](https://github.com/clerk/javascript/pull/10455)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Add a `direction` prop to `MosaicProvider` (`'ltr' | 'rtl'`, default `'ltr'`). Arrow-key navigation in tabs, segmented controls, one-time code inputs, tag inputs, and nested menus now follows this prop instead of the nearest `dir` attribute. Pages that render right-to-left should pass `direction="rtl"`. ([#10420](https://github.com/clerk/javascript/pull/10420)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Filled icon frames now use a translucent background, so they darken with the row on hover instead of showing as a lighter patch. The reverification method picker's icon frames no longer have a border. ([#10423](https://github.com/clerk/javascript/pull/10423)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Darken `--cl-color-foreground-secondary` in light mode so secondary text meets WCAG AA contrast on both the default and subtle backgrounds. ([#10459](https://github.com/clerk/javascript/pull/10459)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Fix the `UserButton` and `OrganizationSwitcher` trigger badge flickering when the popup opens with an inline `renderTriggerBadge` function. The badge is now only requested again when the displayed user, organization or session changes, and each request uses the latest `renderTriggerBadge` you pass. ([#10456](https://github.com/clerk/javascript/pull/10456)) by [@alexcarpenter](https://github.com/alexcarpenter)

## 0.1.13

### Patch Changes

- Add `selfServeDirectorySyncEnabled` to `OrganizationResource`. Self-serve Directory Sync is now enabled per organization by this setting instead of following `selfServeSSOEnabled`. In `<OrganizationProfile />`, the Security page now appears for organizations that have only Directory Sync enabled, and their admins can manage the connection's directory. Organizations that have self-serve SSO without Directory Sync no longer see the Directory Sync section. ([#10374](https://github.com/clerk/javascript/pull/10374)) by [@kalafut](https://github.com/kalafut)

- Correct secondary text, brand colors, and status backgrounds and borders in light and dark modes to match the Mosaic design palette. Align dark input backgrounds with the surrounding surface and keep translucent error highlights red in both modes. ([#10375](https://github.com/clerk/javascript/pull/10375)) by [@austincalvelage](https://github.com/austincalvelage)

- Updated dependencies [[`0a6e367`](https://github.com/clerk/javascript/commit/0a6e3678ccc032ce9f00908bc125510e98b5a835), [`cf9c897`](https://github.com/clerk/javascript/commit/cf9c897afb10c0a8a8155ddc8b3bc2534032bcff)]:
  - @clerk/shared@4.42.0

## 0.1.12

### Patch Changes

- Prevent actions in `UserButton` and `OrganizationSwitcher` menus from activating during the closing animation. ([#10366](https://github.com/clerk/javascript/pull/10366)) by [@austincalvelage](https://github.com/austincalvelage)

- Reduce the size of the published bundle by only including the icons that Mosaic components render. Icon overrides passed to `MosaicProvider` through `icons` work as before. ([#10309](https://github.com/clerk/javascript/pull/10309)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Fix the OKX Wallet logo in the user profile Web3 wallets section so it follows the text color and stays visible in dark mode. ([#10370](https://github.com/clerk/javascript/pull/10370)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Fix the password visibility toggle in the reverification dialog. ([#10345](https://github.com/clerk/javascript/pull/10345)) by [@mwickett](https://github.com/mwickett)

- Fix the keyboard focus ring on `UserButton` and `OrganizationSwitcher` rows being covered by the row below it. ([#10381](https://github.com/clerk/javascript/pull/10381)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`8c3739d`](https://github.com/clerk/javascript/commit/8c3739dd7027335dc0a625e856daf5b3e482b8df), [`0334b05`](https://github.com/clerk/javascript/commit/0334b0539bd7058a5e02520d519a20eefe84659c)]:
  - @clerk/shared@4.41.1

## 0.1.11

### Patch Changes

- Add support for supplying an async function to `renderTriggerBadge` for `UserButton` and `OrganizationSwitcher` which allows supplying custom label text for the badge rendered alongside the trigger's label. ([#10287](https://github.com/clerk/javascript/pull/10287)) by [@dstaley](https://github.com/dstaley)

- An organization joined by accepting an invitation in `UserButton` or `OrganizationSwitcher` now stays listed right away, even before it appears in the loaded memberships, and selecting it follows `afterSelectOrganizationUrl`. ([#10280](https://github.com/clerk/javascript/pull/10280)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Menu items now use the secondary foreground color at rest and the primary foreground color on hover, matching the `UserButton` menu rows. ([#10281](https://github.com/clerk/javascript/pull/10281)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Fix menus in Safari not opening on the first click when their trigger already had focus, such as right after a dialog closes and returns focus to it. ([#10306](https://github.com/clerk/javascript/pull/10306)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Add `PortalProvider` to render Mosaic overlays into a custom container, and stop the page from shifting when a Mosaic overlay opens while another library has already locked scrolling. ([#10299](https://github.com/clerk/javascript/pull/10299)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Stop the page from shifting when a Mosaic overlay opens on a page that does not scroll. ([#10312](https://github.com/clerk/javascript/pull/10312)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`e5cfdff`](https://github.com/clerk/javascript/commit/e5cfdffc768f99a3be50a10ef247f5dbe8b3ed18)]:
  - @clerk/shared@4.41.0

## 0.1.10

### Patch Changes

- `<UserButton />` in `combined` mode now defaults to a larger trigger that badges the active organization with the user's avatar. Pass `triggerVariant='condensed'` to keep the previous, smaller trigger. ([#10279](https://github.com/clerk/javascript/pull/10279)) by [@alexcarpenter](https://github.com/alexcarpenter)

## 0.1.9

### Patch Changes

- Remove the `organization` option from `UserButton`'s `mode` prop. `mode` now accepts `combined` (the default) or `user`. For an organization-only switcher, use the new `OrganizationSwitcher` export. ([#10129](https://github.com/clerk/javascript/pull/10129)) by [@alexcarpenter](https://github.com/alexcarpenter)

- The name shown in the `UserButton` and `OrganizationSwitcher` trigger can now be styled with the `.cl-user-button-trigger-label` and `.cl-organization-switcher-trigger-label` classes. ([#10261](https://github.com/clerk/javascript/pull/10261)) by [@alexcarpenter](https://github.com/alexcarpenter)

- `UserButton` now leads with the active organization, and `UserButton` and `OrganizationSwitcher` move **Settings** and **Invite members** from the header into rows below the organization list. ([#10159](https://github.com/clerk/javascript/pull/10159)) by [@alexcarpenter](https://github.com/alexcarpenter)

## 0.1.8

### Patch Changes

- Updated dependencies [[`dcb03d3`](https://github.com/clerk/javascript/commit/dcb03d3c6d4597b029e39ef3eebc2ec681bb48b1), [`31c1930`](https://github.com/clerk/javascript/commit/31c1930f0d4933cf952133c784692cb5159a7659)]:
  - @clerk/shared@4.40.0

## 0.1.7

### Patch Changes

- Rename the `userButton.workspaces` localization keys to `userButton.organizations`. Update any overrides of `userButton.workspaces.*` to use `userButton.organizations.*`. ([#10072](https://github.com/clerk/javascript/pull/10072)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Show the active organization's name, instead of the account's email or username, under the user's name in the `UserButton` popover header when an organization is active in combined mode. ([#10096](https://github.com/clerk/javascript/pull/10096)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`568c668`](https://github.com/clerk/javascript/commit/568c6689ab25972f66c44e0fb72f025c2d56a7c0)]:
  - @clerk/shared@4.39.1

## 0.1.6

### Patch Changes

- Update `UserButton` to the latest designs. Combined mode always leads with the account, and the `modePriority` prop is removed. **Settings** opens organization and profile settings, and **Sign out of all accounts** moves into the **Switch account** menu. ([#10002](https://github.com/clerk/javascript/pull/10002)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`2654caa`](https://github.com/clerk/javascript/commit/2654caaecb9f59d3bd4103a1e12425bc04760260)]:
  - @clerk/shared@4.39.0

## 0.1.5

### Patch Changes

- Updated dependencies [[`f6937c8`](https://github.com/clerk/javascript/commit/f6937c84e5fc02b520e12908df804f62e9970e2c)]:
  - @clerk/shared@4.38.0

## 0.1.4

### Patch Changes

- `Menu.Popup` now holds its contents while it animates closed. ([#9813](https://github.com/clerk/javascript/pull/9813)) by [@maxyinger](https://github.com/maxyinger)

- Stop showing keyboard focus rings on menu items when a menu is opened and hovered with the mouse. Focus rings still appear when navigating the menu with the keyboard. ([#9986](https://github.com/clerk/javascript/pull/9986)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`c8eb8d5`](https://github.com/clerk/javascript/commit/c8eb8d5beb6b85b7ca056191c8ae60a296065cda)]:
  - @clerk/shared@4.37.1

## 0.1.3

### Patch Changes

- Remove the `modePriority` prop from `UserButton`. The header now follows what it leads with: an active organization offers Settings and Invite, and an account offers Settings and Sign out. ([#9807](https://github.com/clerk/javascript/pull/9807)) by [@alexcarpenter](https://github.com/alexcarpenter)

  The rows in the `UserButton` popup are now themed through their own `.cl-user-button-item` slots (`-media`, `-content`, `-label`, `-description`, `-trailing`), plus `.cl-user-button-group` and `.cl-user-button-separator`, instead of the shared `.cl-item` slots.

- Bring back the `modePriority` prop on `UserButton`. With `modePriority='user'`, a combined `UserButton` leads with the account, and its avatar is badged with the active organization in both the trigger and the header. The badged avatar is themed through `.cl-user-button-avatar` and `.cl-user-button-avatar-badge`. ([#9951](https://github.com/clerk/javascript/pull/9951)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`6a14691`](https://github.com/clerk/javascript/commit/6a14691f8d98dcafd3956e1ea97cb35d56a34864), [`0ee4ee2`](https://github.com/clerk/javascript/commit/0ee4ee2b49286a8cae5f251ec997f30c8a863205), [`7a3fcf5`](https://github.com/clerk/javascript/commit/7a3fcf5b2d536b4e444920a3e87c4f70da3487ba), [`69c1b9c`](https://github.com/clerk/javascript/commit/69c1b9c886ab0860a9af12872235b6e492b2b2d0), [`d9cf0f2`](https://github.com/clerk/javascript/commit/d9cf0f29ea2ef8388bbd5736007ca71f9411bf42)]:
  - @clerk/shared@4.37.0

## 0.1.2

### Patch Changes

- Updated dependencies [[`645a532`](https://github.com/clerk/javascript/commit/645a5327d9c7cae8052e39958ec4d737457d179a), [`84ee588`](https://github.com/clerk/javascript/commit/84ee588a712ffa0bb2988531d7a2727c9e06ac37), [`4e538ac`](https://github.com/clerk/javascript/commit/4e538ac07ed412706516531d9be9696bbd31bf24)]:
  - @clerk/shared@4.36.0

## 0.1.1

### Patch Changes

- Updated dependencies [[`b3af79e`](https://github.com/clerk/javascript/commit/b3af79e946aaa403595b31e472b07b138db39dc6), [`cc6f11a`](https://github.com/clerk/javascript/commit/cc6f11af564b62daf186f9721594efd864ce093f), [`d46b544`](https://github.com/clerk/javascript/commit/d46b5446e89f15c5532bfbbc09fdc05a0fbcbf8d), [`f50f48c`](https://github.com/clerk/javascript/commit/f50f48cf3c67807c8def30d4a6d29d6c7bf904d2)]:
  - @clerk/shared@4.35.0

## 0.1.0

### Minor Changes

- Add `@clerk/mosaic`, an experimental standalone package for next generation Clerk components. ([#9765](https://github.com/clerk/javascript/pull/9765)) by [@Ephem](https://github.com/Ephem)

  If you try this out, make sure to pin your version as breaking changes can happen in minors.

- `Avatar` now draws a 1px inset outline over its image and fallback so it keeps an edge against a matching background. Pass `bordered={false}` to `Avatar.Root` to drop it. ([#9815](https://github.com/clerk/javascript/pull/9815)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Export `MosaicProvider` to enable customizing messages and icons within the new components. ([#9801](https://github.com/clerk/javascript/pull/9801)) by [@alexcarpenter](https://github.com/alexcarpenter)

### Patch Changes

- Update link button to use underline position from font over hardcoded offset ([#9796](https://github.com/clerk/javascript/pull/9796)) by [@maxyinger](https://github.com/maxyinger)

- `@floating-ui/react` is now installed as a dependency of `@clerk/mosaic` instead of being bundled into its output, so apps that already use it can share a single copy. ([#9819](https://github.com/clerk/javascript/pull/9819)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Internal: the primitives previously in the private `@clerk/headless` package (Accordion, Dialog, Select, etc.) now live inside `@clerk/mosaic` as internal building blocks. No public API changes. ([#9819](https://github.com/clerk/javascript/pull/9819)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Direction-aware icons (the forward chevrons on menu rows, the log-out arrow, and the previous/next arrows in paginated lists) now mirror horizontally when rendered under an ancestor with `dir="rtl"`. ([#9803](https://github.com/clerk/javascript/pull/9803)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`804d3db`](https://github.com/clerk/javascript/commit/804d3db182746d3b403411025b5dccc5aeafc719), [`64c8e3e`](https://github.com/clerk/javascript/commit/64c8e3ec55e79a2ccc79ae27cbadaeef9481f3d9), [`07b4c2b`](https://github.com/clerk/javascript/commit/07b4c2b3c8bfa394f4331efcc363ee4064336f9d), [`4e36687`](https://github.com/clerk/javascript/commit/4e366874c5c4348750d43073cd8ec7aa4564e476), [`9e7485c`](https://github.com/clerk/javascript/commit/9e7485c8efc33e9458643372ce133b229347c03d)]:
  - @clerk/shared@4.34.0
