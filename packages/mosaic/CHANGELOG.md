# @clerk/mosaic

## 0.3.0

### Minor Changes

- **Breaking:** Simplify `Item` to one size and one look. Rows are always bordered and size to their content. TypeScript flags the removed props. ([#10665](https://github.com/clerk/javascript/pull/10665)) by [@alexcarpenter](https://github.com/alexcarpenter)

  | Before                                                   | After                    |
  | -------------------------------------------------------- | ------------------------ |
  | `<Item.Root size='xs' \| 'md' \| 'lg'>`                  | `<Item.Root>`            |
  | `<Item.Root variant='outline' \| 'default'>`             | `<Item.Root>` (bordered) |
  | `<Item.Group variant='outline' \| 'default'>`            | `<Item.Group>`           |
  | `<Item.Separator />`                                     | Removed                  |
  | `.cl-item[data-size]`, `.cl-item-media[data-size]`       | Removed                  |
  | `.cl-item[data-variant]`, `.cl-item-group[data-variant]` | Removed                  |

  `Item.Label`'s `variant` is unchanged.

  Find usages with `git grep -nE "Item\.(Root|Group)[^>]*(size|variant)=|Item\.Separator|cl-item(-media|-group)?\[data-(size|variant)"`.

- Configure the profile on `MosaicProvider` with the new `profile` prop, so `UserButton`, `OrganizationSwitcher` and `UserProfile` share one setup. This makes pairings like a user-only `UserButton` beside an `OrganizationSwitcher` with one combined profile possible. ([#10546](https://github.com/clerk/javascript/pull/10546)) by [@alexcarpenter](https://github.com/alexcarpenter)

  ```tsx
  <MosaicProvider profile={{ combined: true, userProfileProps, organizationProfileProps }}>
    <OrganizationSwitcher />
    <UserButton combined={false} />
  </MosaicProvider>
  ```

  Breaking changes:
  - `UserButton`: `mode` is replaced by `combined`, which only decides what the menu lists. `mode='user'` becomes `combined={false}`, and to keep the account-only profile too, also set `profile={{ combined: false }}` on `MosaicProvider`.
  - `UserButton` and `OrganizationSwitcher`: `userProfileProps` and `organizationProfileProps` move to `MosaicProvider`'s `profile`.
  - `UserButton` and `OrganizationSwitcher`: `userProfileUrl` and `organizationProfileUrl` move to `MosaicProvider`'s `profile`.
  - `UserButton` and `OrganizationSwitcher`: `userProfileMode` and `organizationProfileMode` are removed. Setting a URL routes there, and leaving it out opens the modal.
  - `UserButton` and `OrganizationSwitcher`: `appearance` is no longer accepted in `userProfileProps` or `organizationProfileProps`.
  - `UserButton` and `OrganizationSwitcher`: link items (`href`) are no longer accepted in `customPages`.
  - `UserButton` and `OrganizationSwitcher`: `afterLeaveOrganizationUrl` moves to `profile.organizationProfileProps`, which also takes `apiKeysProps`.
  - `UserProfile`: `mode` is replaced by `combined`. When unset it follows `profile.combined`, and it also picks up the provider's profile props, with its own props winning. `OrganizationProfile` picks them up the same way.
  - With `experimental.newProfiles`, `OrganizationSwitcher` now opens the combined profile by default. Set `profile={{ combined: false }}` for the standalone organization profile.
  - The `UserProfileMode` type is removed.

### Patch Changes

- `PhoneInput` requires `countryTriggerLabel`, `countryPopupLabel`, and `countrySearchLabel`, which set the accessible names of its country trigger, popup, and search input. The country picker in UserProfile's add phone number and add SMS verification dialogs can now be localized through the `userProfile.phone.addDialog.phone.*` keys. ([#10694](https://github.com/clerk/javascript/pull/10694)) by [@austincalvelage](https://github.com/austincalvelage)

- Draw the divider above a card footer that follows a multi-step flow, and match the OAuth consent "Signed in as" text size to the other task footers. ([#10591](https://github.com/clerk/javascript/pull/10591)) by [@kylemac](https://github.com/kylemac)

- Reduce option re-renders in `Combobox`, `Autocomplete` and `Select`. ([#10621](https://github.com/clerk/javascript/pull/10621)) by [@alexcarpenter](https://github.com/alexcarpenter)

- On touch devices, link buttons no longer show their underline after a tap. With reduced motion turned on, `Drawer` now opens at its resting position instead of starting below it for a frame. ([#10692](https://github.com/clerk/javascript/pull/10692)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Fix the resend countdown in the email, phone and SMS verification dialogs staying locked too long after the device sleeps or the tab is throttled in the background. ([#10619](https://github.com/clerk/javascript/pull/10619)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Fix the organization profile's page order when `OrganizationSwitcher` or `UserButton` opens the legacy profile for a member who can manage the SSO bypass allowlist. The Security page now stays where `pageOrder` puts it instead of moving to the top. ([#10546](https://github.com/clerk/javascript/pull/10546)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Add `Radio.Card`, a radio laid out as an `Item` row that picks its `value` when clicked anywhere. Fill it with `Radio.Media` and `Radio.Content`, which holds `Radio.Label` and an optional `Radio.Description`. `Radio.Group` takes `layout='stack' | 'grid'`, and `Radio.Section` splits a group into titled sets. ([#10665](https://github.com/clerk/javascript/pull/10665)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`85afdd1`](https://github.com/clerk/javascript/commit/85afdd1ae903adbf04ec9529de4496423f77343d)]:
  - @clerk/shared@4.44.2

## 0.2.2

### Patch Changes

- Drop an image onto the profile picture row in `UserProfile` or the logo row in `OrganizationProfile` to upload it. While a file is dragged over the row, the avatar darkens and shows an upload icon. `FileUpload.Dropzone` now ignores drags that carry no files, such as selected text or links. ([#10601](https://github.com/clerk/javascript/pull/10601)) by [@alexcarpenter](https://github.com/alexcarpenter)

- The logo picker in `CreateOrganization` now matches `UserProfile` and `OrganizationProfile`: once a logo is chosen, the Upload button is replaced by a menu to change or remove it, and an image can be dropped onto the row. Clicking the Logo label opens the file picker, and a rejected file's error now shows below the row instead of replacing the description. In all three, dragging a file of an unsupported type over the avatar shows a blocked icon instead of the upload arrow. In `OrganizationProfile`, the logo menu no longer shows icons, and its Remove item now uses the destructive color, as in `UserProfile`. ([#10604](https://github.com/clerk/javascript/pull/10604)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Controls such as inputs, selects, checkboxes, radios and outline buttons keep the stronger `--cl-color-border`, while containers and dividers (cards, sections, tables, menus, the profile nav) use `--cl-color-border-subtle`. The two are now 12 and 8 percent washes in both modes, which makes light-mode controls firmer and leaves containers close to where they were. The profile opened in a dialog draws a border. Outline buttons fill with the surface color, and their hover and pressed states tint that fill. Banners, badges, toasts and the tag-input error use the `-subtle` tokens, and the neutral badge and banner use `--cl-color-neutral-subtle`. ([#10496](https://github.com/clerk/javascript/pull/10496)) by [@prestonwebdev](https://github.com/prestonwebdev)

- Fix keyboard navigation in tabs and accordions. The tab stop now lands on the selected tab even when it isn't the first, and arrow keys pressed in a field inside an accordion panel stay with that field. `ActionBar.Root` now calls `onFocus` and `onBlur` handlers passed by consumers. ([#10573](https://github.com/clerk/javascript/pull/10573)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Confirm dialogs now stay busy until their action finishes, even after you cancel a reverification prompt, and they can't be reopened or confirmed a second time while the request is in flight. ([#10628](https://github.com/clerk/javascript/pull/10628)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Keep keyboard focus on the input while saving an organization name or slug, renaming a passkey, verifying an authenticator code, or sending organization invitations. Focus previously dropped to the page. ([#10618](https://github.com/clerk/javascript/pull/10618)) by [@alexcarpenter](https://github.com/alexcarpenter)

- - Fixed an issue where an outgoing Flow step could show content from an update that never appeared on screen. ([#10651](https://github.com/clerk/javascript/pull/10651)) by [@dstaley](https://github.com/dstaley)

  - Fixed an issue where adding a tag while a controlled TagInput update was still pending could use the pending tag list instead of the list shown on screen.

- Move the OAuth consent redirect domain helper into `@clerk/shared` so it can be shared across UI packages. No behavior change. ([#10218](https://github.com/clerk/javascript/pull/10218)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Form submit buttons now show their pending state and keep focus while the form submits, instead of looking disabled. ([#10627](https://github.com/clerk/javascript/pull/10627)) by [@alexcarpenter](https://github.com/alexcarpenter)

- `IconFrame` and `Avatar` now share one size scale and set of corner radii: `xs`, `sm`, `md` and `lg` are 24, 32, 40 and 48px. `IconFrame` sizes are now `xs`, `sm`, `md` and `lg` and the default is `md` (40px), replacing `sm`, `md`, `lg` and `xl`. `Avatar` `md` is 40px instead of 38px, square `Avatar` at `md` has a 6px radius instead of 8px, and provider icons in the connected accounts, enterprise accounts and Web3 wallets sections are 16px instead of 20px. ([#10600](https://github.com/clerk/javascript/pull/10600)) by [@prestonwebdev](https://github.com/prestonwebdev)

- Keep the phone entry screen pending until the first verification code is sent in `UserProfile`. Disable Cancel while verifying or resending a phone verification code. ([#10561](https://github.com/clerk/javascript/pull/10561)) by [@austincalvelage](https://github.com/austincalvelage)

- Updated dependencies [[`88c99e3`](https://github.com/clerk/javascript/commit/88c99e3762d6f8ce8e198ee027bd3b1c77414ffc)]:
  - @clerk/shared@4.44.1

## 0.2.1

### Patch Changes

- Tighten component motion. Input hover and focus now appear instantly and fade on the way out, toasts leave faster than they arrive, hover and press feedback on `Checkbox`, `Radio`, the `Drawer` handle, the switcher trigger and the tag remove button responds instantly, and the `Table` expand icon respects `prefers-reduced-motion`. ([#10578](https://github.com/clerk/javascript/pull/10578)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Preserve verification code delivery errors and resend cooldowns when navigating to other methods or help and back in UserProfile. ([#10564](https://github.com/clerk/javascript/pull/10564)) by [@austincalvelage](https://github.com/austincalvelage)

- Show the generic error message in the `UserProfile` add email and add phone dialogs when sending a verification fails with a Clerk response that carries no error details. Previously these dialogs showed no message. ([#10563](https://github.com/clerk/javascript/pull/10563)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Add `Card.Media`, a slot for a logo, icon or image at the top of `Card.Header`, with 24px of space below it. Style it with `.cl-card-media`. `Card.Header` also takes an `align` prop, `start` by default, so `align='center'` centers its content. ([#10590](https://github.com/clerk/javascript/pull/10590)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Align the corners of `Select`, `Combobox`, `Menu` and `PhoneInput` options and `ActionBar` buttons with their surrounding surface. These radii now follow `--cl-radius-lg` and `--cl-spacing` rather than `--cl-radius-md`, so an override of `--cl-radius-md` no longer changes them. ([#10579](https://github.com/clerk/javascript/pull/10579)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Center the pending spinner on an `OrganizationList` row in a trailing column that mirrors the row's avatar, instead of pressing it against the row's edge. ([#10607](https://github.com/clerk/javascript/pull/10607)) by [@alexcarpenter](https://github.com/alexcarpenter)

- When users are asked to confirm their identity again, they can now use a passkey set up as their second step, as long as their browser supports passkeys. ([#10570](https://github.com/clerk/javascript/pull/10570)) by [@austincalvelage](https://github.com/austincalvelage)

- Add `<UserAvatar />`, which shows the signed-in user's profile image. It takes `shape`, `size` and `fallback`, renders nothing when nobody is signed in, and can be styled through `.cl-user-avatar`. ([#10500](https://github.com/clerk/javascript/pull/10500)) by [@kylemac](https://github.com/kylemac)

- Fix the `OrganizationList` loading skeleton. Avatar placeholders now match the size of the loaded avatars instead of shrinking to the width of the initials, and the personal account row is shown unless `hidePersonal` is set. ([#10608](https://github.com/clerk/javascript/pull/10608)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Preserve all errors during UserProfile reverification. Show errors for the active password or code beside that field, and unrelated errors in a banner without marking the field invalid. ([#10558](https://github.com/clerk/javascript/pull/10558)) by [@austincalvelage](https://github.com/austincalvelage)

- Updated dependencies [[`917748a`](https://github.com/clerk/javascript/commit/917748ab54aa75ae073bfb07b31938a1c193794a), [`064bab8`](https://github.com/clerk/javascript/commit/064bab8220547de81c98d8f9d521968228935598)]:
  - @clerk/shared@4.44.0

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
