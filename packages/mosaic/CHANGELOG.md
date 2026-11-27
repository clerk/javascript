# @clerk/mosaic

## 0.13.0

### Minor Changes

- Add `Select.SelectAll` for multiple selects. It selects every enabled item, or clears them once all are selected, and shows a check when all are selected and a dash when some are. It renders nothing in a single select. While the row is rendered and enabled, Ctrl+A (⌘+A on macOS) does the same from the open list. ([#11007](https://github.com/clerk/javascript/pull/11007)) by [@alexcarpenter](https://github.com/alexcarpenter)

  Add `Select.Separator`, a divider between items, such as below `Select.SelectAll`. Screen readers skip it.

  The organization select in `OAuthConsent` now has a "Select all" row when the user picks which organizations to grant access to.

- Adds 'path', 'query' and 'hash' routing modes. ([#10977](https://github.com/clerk/javascript/pull/10977)) by [@Ephem](https://github.com/Ephem)

  `UserProfile`, `OrganizationProfile` and `Profile` take a `routing` prop that keeps the open page in the pathname under `path`, in a query param, or in the hash, so the page survives a reload and Back returns to the previous one. `virtual`, in memory, stays the default.

  `MosaicProvider` takes a `routing` prop. `adapter` connects the URL modes to the host router (`usePathname` and `useSearchParams` from `next/navigation` is the Next.js one), `modals: 'query' | 'hash'` puts the profile modals in the URL too, and `keyPrefix` sets what the param names start with.

  Modals now close when the host navigates to another pathname.

### Patch Changes

- Fix `Select.Trigger` with `variant='ghost'` showing a border and no hover background. Ghost triggers are borderless again and tint on hover like a ghost `Button`; outline triggers are unchanged. ([#11017](https://github.com/clerk/javascript/pull/11017)) by [@alexcarpenter](https://github.com/alexcarpenter)

## 0.12.0

### Minor Changes

- **Breaking:** Rename the `Option` parts of `Select` and `Combobox` to `Item`. This applies to both the styled components and the headless primitives. Behavior is unchanged, and TypeScript flags the old names. ([#10997](https://github.com/clerk/javascript/pull/10997)) by [@alexcarpenter](https://github.com/alexcarpenter)

  | Before                           | After                          |
  | -------------------------------- | ------------------------------ |
  | `Select.Option`                  | `Select.Item`                  |
  | `Combobox.Option`                | `Combobox.Item`                |
  | `Combobox.OptionIndicator`       | `Combobox.ItemIndicator`       |
  | `SelectOptionProps`              | `SelectItemProps`              |
  | `ComboboxOptionProps`            | `ComboboxItemProps`            |
  | `ComboboxOptionIndicatorProps`   | `ComboboxItemIndicatorProps`   |
  | `.cl-select-option`              | `.cl-select-item`              |
  | `.cl-select-option-media`        | `.cl-select-item-media`        |
  | `.cl-select-option-content`      | `.cl-select-item-content`      |
  | `.cl-select-option-label`        | `.cl-select-item-label`        |
  | `.cl-select-option-description`  | `.cl-select-item-description`  |
  | `.cl-select-option-indicator`    | `.cl-select-item-indicator`    |
  | `.cl-combobox-option`            | `.cl-combobox-item`            |
  | `.cl-combobox-option-media`      | `.cl-combobox-item-media`      |
  | `.cl-combobox-option-label`      | `.cl-combobox-item-label`      |
  | `.cl-combobox-option-detail`     | `.cl-combobox-item-detail`     |
  | `.cl-combobox-option-indicator`  | `.cl-combobox-item-indicator`  |
  | `.cl-phone-input-country-option` | `.cl-phone-input-country-item` |

  Add `Select.ItemIndicator`, which renders only inside the selected item. It is `aria-hidden` and works like `Combobox.ItemIndicator`. Both indicators take `keepMounted`, which renders them in every item and puts `data-selected` only on the selected one. The styled `Select.ItemIndicator` and `Combobox.ItemIndicator` default `keepMounted` to `true` and hide the check on unselected items while keeping its width, so rows no longer change width as the selection moves; pass `keepMounted={false}` to render the check only in the selected item. The primitives default to `false`. The styled `Select.Item` renders a `Select.ItemIndicator`, so the check's `.cl-select-item-indicator` element is now a `span` wrapping the icon.

  A styled `Select.Item` with children no longer adds a check, matching `Combobox.Item`. Add `<Select.ItemIndicator />` to composed rows that should show one.

  Find usages with `git grep -nE "(Select|Combobox)\.Option|OptionIndicator|(Select|Combobox)Option(Indicator)?Props|cl-(select|combobox|phone-input-country)-option"`.

- **Breaking:** Remove `Menu.Indicator` and the `size` prop on `Menu.Media`. Menu now has checkbox and radio items, so a checkmark that marks the current choice goes in their indicator and is announced with `aria-checked`. Anything else at the end of a row, such as a spinner, goes in a trailing `Menu.Media`, which keeps its width while empty. `Menu.Media` is now always 20px wide; `size='xs'` made it 16px without changing the row height, so the label no longer lined up with the other rows. ([#11000](https://github.com/clerk/javascript/pull/11000)) by [@alexcarpenter](https://github.com/alexcarpenter)

  | Before                                                     | After                                                                                            |
  | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
  | `<Menu.Item>` with a check in `<Menu.Indicator>`           | `<Menu.RadioItem value>` in a `<Menu.RadioGroup>`, with the check in `<Menu.RadioItemIndicator>` |
  | A toggled `<Menu.Item>` with a check in `<Menu.Indicator>` | `<Menu.CheckboxItem>`, with the check in `<Menu.CheckboxItemIndicator>`                          |
  | Any other `<Menu.Indicator>…</Menu.Indicator>`             | `<Menu.Media>…</Menu.Media>`                                                                     |
  | `MenuIndicatorProps`                                       | `MenuMediaProps`, `MenuRadioItemIndicatorProps` or `MenuCheckboxItemIndicatorProps`              |
  | `.cl-menu-item-indicator`                                  | `.cl-menu-item-media`, `.cl-menu-radio-item-indicator` or `.cl-menu-checkbox-item-indicator`     |
  | `<Menu.Media size='xs'>` or `size='sm'`                    | `<Menu.Media>`                                                                                   |
  | `MenuMediaSize`                                            | Remove it                                                                                        |
  | `.cl-menu-item-media[data-size]`                           | `.cl-menu-item-media`                                                                            |

  Find usages with `git grep -nE 'Menu\.Indicator|MenuIndicatorProps|cl-menu-item-indicator|MenuMediaSize|Menu\.Media[^>]*size='`.

  Checkbox and radio items keep the menu open on click. Pass `closeOnClick` to close it.

  In the Switcher's accounts flyout, each account is now a `menuitemradio` inside a group named "Switch account", and the active one has `aria-checked="true"` in place of `aria-current="true"`.

### Patch Changes

- Updated dependencies [[`7c8fdc3`](https://github.com/clerk/javascript/commit/7c8fdc3116284ec4888002ba304589be1055952a), [`02a65cd`](https://github.com/clerk/javascript/commit/02a65cde13e22ddef85bce29a10531d90ad6ae34), [`125302a`](https://github.com/clerk/javascript/commit/125302ac5534da32909a19680792cdee00fabc4e), [`125302a`](https://github.com/clerk/javascript/commit/125302ac5534da32909a19680792cdee00fabc4e)]:
  - @clerk/shared@4.50.0

## 0.11.1

### Patch Changes

- Updated dependencies [[`63864a8`](https://github.com/clerk/javascript/commit/63864a8a9262f24b15bd4626b1a49f1dbab83989)]:
  - @clerk/shared@4.49.0

## 0.11.0

### Minor Changes

- `OAuthConsent` now lets the user clear the scopes they don't want to grant, and posts only the scopes left checked. `offline_access` is listed as required and can't be cleared. The organization picker only shows while `user:org:read` is checked. The consent card also shows a warning when the application registered itself, and names the host when its details come from a client metadata document. ([#10952](https://github.com/clerk/javascript/pull/10952)) by [@alexcarpenter](https://github.com/alexcarpenter)

### Patch Changes

- Fix elements passed from a React Server Component in development. A `render` element, such as `<Dialog.Trigger render={<Button />}>`, no longer renders as a plain unstyled element with a hydration mismatch, and an `icons` override on `MosaicProvider` no longer throws `Cannot read properties of undefined (reading 'className')`. ([#10940](https://github.com/clerk/javascript/pull/10940)) by [@alexcarpenter](https://github.com/alexcarpenter)

## 0.10.0

### Minor Changes

- `<OrganizationProfile />` and `<Profile />` now show a Security page with the organization's SSO bypass allow list. Members with the `org:sys_entconns_sso_bypass:manage` permission can see who is on the list, page through it, remove members after a confirmation, and add members by email or by role. The page shows to members with `org:sys_entconns_sso_bypass:manage` once the organization has an enterprise connection, and to members with `org:sys_entconns:manage` when self-serve SSO or self-serve Directory Sync is enabled for the instance and the organization. ([#10882](https://github.com/clerk/javascript/pull/10882)) by [@kylemac](https://github.com/kylemac)

- **Breaking:** A page's `Panel.Title` is now its profile page title, so `Profile.Content` no longer takes `pageTitle`. On compact layouts it still opens the navigation. ([#10932](https://github.com/clerk/javascript/pull/10932)) by [@alexcarpenter](https://github.com/alexcarpenter)

  A page can now open sub-pages. Give its `Profile.ContentPanel` a `label`, `subPage` and `onSubPageChange`, and wrap each view in a `Profile.SubPage`, with `value={null}` for the page itself. A sub-page's `Panel.Title` gets a back button to the page above it.

  | Before                                | After                                                                                         |
  | ------------------------------------- | --------------------------------------------------------------------------------------------- |
  | `<Profile.Content pageTitle={label}>` | `<Profile.Content>`, with `<Panel.Title>{label}</Panel.Title>` in each `Profile.ContentPanel` |

  Find affected usage with `git grep -n "pageTitle="`.

### Patch Changes

- A `Card.Root` inside a `Dialog.Popup` now defaults to `elevation='overlay'`, so dialog cards no longer need to set it. Cards outside a dialog still default to `'card'`, and an explicit `elevation` still wins. ([#10935](https://github.com/clerk/javascript/pull/10935)) by [@alexcarpenter](https://github.com/alexcarpenter)

- `Flow.Root` clips its content only vertically, and only while it moves between steps, so a focus ring at the edge of a step is no longer cut off. ([#10932](https://github.com/clerk/javascript/pull/10932)) by [@alexcarpenter](https://github.com/alexcarpenter)

- `SegmentedControl.Root` now keeps its natural width inside flex and grid containers instead of stretching to fill them. Pass the new `fullWidth` prop to fill the container, with the items sharing the width evenly. ([#10920](https://github.com/clerk/javascript/pull/10920)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`2619870`](https://github.com/clerk/javascript/commit/26198706450d42a827b77282b8b1efc6bb44458f), [`d3f7ab5`](https://github.com/clerk/javascript/commit/d3f7ab5bd4254ed41fe7ad3241ec1ff12555384e), [`e9ed081`](https://github.com/clerk/javascript/commit/e9ed081fa357fc070b5a8839016e956153ad9716)]:
  - @clerk/shared@4.48.3

## 0.9.1

### Patch Changes

- Updated dependencies [[`8066057`](https://github.com/clerk/javascript/commit/80660572f80ff05150ce15d1d47f75122ea4561a), [`6977a93`](https://github.com/clerk/javascript/commit/6977a938f11a2618fe01923eae87a10fef64e420)]:
  - @clerk/shared@4.48.2

## 0.9.0

### Minor Changes

- **Breaking:** Remove the `placement` prop from `Icon`, along with the `data-icon` attribute it rendered. `Button` now tightens its padding on the side of an `Icon` placed directly before or after the label, read from its position. An icon inside a wrapper element no longer counts as leading or trailing, so the button keeps its text padding. Delete `placement` from your `Icon`s; TypeScript flags the ones left. ([#10910](https://github.com/clerk/javascript/pull/10910)) by [@alexcarpenter](https://github.com/alexcarpenter)

  | Before                                           | After                   |
  | ------------------------------------------------ | ----------------------- |
  | `<Icon glyph={Plus} placement='inline-start' />` | `<Icon glyph={Plus} />` |

  Find usages with `git grep -nE "placement=\{?['\"]inline-|data-icon"`.

  The text label inside `Button` and `SubmitButton` now carries a `cl-button-label` class you can target in your styles.

- **Breaking:** Two helpers move onto their component's namespace. Behavior is unchanged; TypeScript flags the old imports. ([#10806](https://github.com/clerk/javascript/pull/10806)) by [@alexcarpenter](https://github.com/alexcarpenter)

  | Before                                                         | After                          |
  | -------------------------------------------------------------- | ------------------------------ |
  | `usePanelTitle` from `@clerk/mosaic/components/panel`          | `Panel.usePanelTitle`          |
  | `sectionCompactStyles` from `@clerk/mosaic/components/section` | `Section.sectionCompactStyles` |

  Find usages with `git grep -nE "usePanelTitle|sectionCompactStyles"`.

  Every component and primitive on the Mosaic docs site now imports from its docs path:
  - Components from `@clerk/mosaic/components/<name>`: `ActionBar`, `Checkbox`, `Combobox`, `CopyButton`, `Dialog`, `Drawer`, `Flow`, `InputGroup`, `Link`, `Menu`, `Otp`, `Pagination`, `PasswordInput`, `PhoneInput`, `Reveal`, `Select`, `Separator`, `Spinner`, `Stepper`, `Switch`, `Tabs`, `TagInput`, `Tooltip` and `VisuallyHidden`
  - Headless primitives from `@clerk/mosaic/primitives/<name>`

  Components and compound primitives export one namespace plus their types, and helpers live on the namespace.

### Patch Changes

- Compound components imported from `@clerk/mosaic/components/*` (`Avatar`, `Banner`, `Card`, `DataList`, `EmptyState`, `Entity`, `Field`, `Item`, `Panel`, `Popover`, `Profile`, `Radio`, `Section`, `SegmentedControl`, `Switcher` and `Table`) can now be rendered from React Server Components, e.g. `<Avatar.Root>` in a Next.js App Router page. ([#10806](https://github.com/clerk/javascript/pull/10806)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Glyphs imported from `@clerk/mosaic/icons/glyphs/*` can now be passed to `Icon` from React Server Components, e.g. `<Icon glyph={External} />` in a Next.js App Router page. Before, the page failed to render with "Functions cannot be passed directly to Client Components". ([#10806](https://github.com/clerk/javascript/pull/10806)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`0a49e7e`](https://github.com/clerk/javascript/commit/0a49e7e71d8799f5dd0eecf1bece3e19c3b2d71b)]:
  - @clerk/shared@4.48.1

## 0.8.0

### Minor Changes

- **Breaking:** The Settings submenu in `UserButton` and `OrganizationSwitcher` now reads "Manage account" instead of "Manage profile", and its message key is renamed to match. TypeScript flags overrides that still use the old key. ([#10908](https://github.com/clerk/javascript/pull/10908)) by [@alexcarpenter](https://github.com/alexcarpenter)

  | Before                                | After                                 |
  | ------------------------------------- | ------------------------------------- |
  | `userButton.manage.profile`           | `userButton.manage.account`           |
  | `organizationSwitcher.manage.profile` | `organizationSwitcher.manage.account` |

  Find usages with `git grep -nE "manage\.profile|manage: *\{"`.

- The combined organization and user switcher now shows the user's role in the active organization next to their identifier in the popup header, for example `cameron@clerk.com · Admin`. ([#10869](https://github.com/clerk/javascript/pull/10869)) by [@prestonwebdev](https://github.com/prestonwebdev)

### Patch Changes

- Fix a React "unique key" warning that `OAuthConsent` logged on every render in development. It came from copy that puts a link or button inside a styled part of the text, such as the redirect domain in the consent subtitle. ([#10888](https://github.com/clerk/javascript/pull/10888)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Switcher rows and menu items now use the primary foreground color for their text and icons at rest, instead of the secondary color that only darkened on hover. Trailing icons, such as the active checkmark and submenu chevrons, stay secondary. ([#10889](https://github.com/clerk/javascript/pull/10889)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`9f40d5c`](https://github.com/clerk/javascript/commit/9f40d5cb48807e6e4223f233e8b6e8bba96be2db)]:
  - @clerk/shared@4.48.0

## 0.7.0

### Minor Changes

- **Breaking:** Add a `Profile` component that shows the account's pages, the active organization's pages, or both. `<UserProfile />` now shows only the account's pages, and `<OrganizationProfile />` only the organization's. To keep both in one profile, render `<Profile />`. ([#10758](https://github.com/clerk/javascript/pull/10758)) by [@alexcarpenter](https://github.com/alexcarpenter)

  ```tsx
  <Profile />
  <Profile mode='user' />
  <Profile mode='organization' afterLeaveOrganizationUrl='/organizations' />
  ```

  `mode` defaults to `'combined'`. Without a `mode`, `Profile` follows `MosaicProvider`'s `profile.combined`, so `false` shows only the account's pages.

  With `experimental.newProfiles`, the profile a menu opens now matches the menu. `<UserButton />` and `<Switcher mode='user' />` open the account's pages, a lone `<OrganizationSwitcher />` opens the organization's pages, and only a combined `<Switcher />` opens one profile with both. `profile.combined: false` still splits a combined menu's profile in two.

  | Before                                           | After                                          |
  | ------------------------------------------------ | ---------------------------------------------- |
  | `<UserProfile />`                                | `<Profile />`                                  |
  | `<UserProfile combined />`                       | `<Profile />`                                  |
  | `<UserProfile combined={false} />`               | `<UserProfile />` or `<Profile mode='user' />` |
  | `<UserProfile organizationProfileProps={...} />` | `<Profile organizationProfileProps={...} />`   |

  To find the code to update, run:

  ```sh
  git grep -n '<UserProfile'
  ```

  New exported type: `ProfileProps`.

- **Breaking:** Add `Switcher`, the account and organization menu, and make `UserButton` list accounts only. `Switcher` takes `mode`: `'combined'` (the default) lists accounts and organizations, `'user'` lists accounts only, and `'organization'` lists organizations. `<UserButton />` is now `<Switcher mode='user' />` and `<OrganizationSwitcher />` is `<Switcher mode='organization' />`. Each mode takes only its own props, so TypeScript flags organization options on `UserButton` and `triggerVariant` outside `combined`. A `mode` chosen at runtime takes only the props every mode shares. ([#10752](https://github.com/clerk/javascript/pull/10752)) by [@alexcarpenter](https://github.com/alexcarpenter)

  | Before                                                                                                          | After                                                    |
  | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
  | `<UserButton />` (accounts and organizations)                                                                   | `<Switcher />`                                           |
  | `<UserButton combined={false} />`                                                                               | `<UserButton />` or `<Switcher mode='user' />`           |
  | `<UserButton triggerVariant='condensed' />`                                                                     | `<Switcher triggerVariant='condensed' />`                |
  | Organization props on `UserButton` (`hidePersonal`, `afterSelectOrganizationUrl`, `createOrganizationUrl`, ...) | The same props on `Switcher`                             |
  | `UserButtonProps` (combined menu)                                                                               | `SwitcherProps`                                          |
  | `UserButtonProps` (user-only menu)                                                                              | `UserButtonProps`, which now takes account options only  |
  | `.cl-user-button-*` classes on the combined menu                                                                | `.cl-switcher-*`; `UserButton` keeps `.cl-user-button-*` |

  Find usages with `git grep -n -e "UserButton" -e "cl-user-button-"`.

- **Breaking:** Rename `Consent` to `OAuthConsent`. Behavior is unchanged; TypeScript flags the old names. ([#10870](https://github.com/clerk/javascript/pull/10870)) by [@alexcarpenter](https://github.com/alexcarpenter)

  | Before                                            | After                                                         |
  | ------------------------------------------------- | ------------------------------------------------------------- |
  | `Consent`                                         | `OAuthConsent`                                                |
  | `ConsentProps`                                    | `OAuthConsentProps`                                           |
  | `consent.*` localization keys                     | `oauthConsent.*`                                              |
  | `consent_missing_client_id` error code            | `oauth_consent_missing_client_id`                             |
  | `consent_missing_redirect_uri` error code         | `oauth_consent_missing_redirect_uri`                          |
  | `.cl-consent-scopes` / `.cl-consent-redirect-url` | `.cl-oauth-consent-scopes` / `.cl-oauth-consent-redirect-url` |

  Find usages with `git grep -nE "(^|[^[:alnum:]_])(Consent(Props)?([^[:alnum:]_]|$)|consent[\"']?[[:space:]]*(\.[[:alpha:]]|:)|consent_missing_)|cl-consent-"`.

### Patch Changes

- Add component entry points: ([#10854](https://github.com/clerk/javascript/pull/10854)) by [@maxyinger](https://github.com/maxyinger)
  - `Card` from `@clerk/mosaic/components/card` and `Field` from `@clerk/mosaic/components/field`
  - `Popover` from `@clerk/mosaic/components/popover`
  - `ProviderButton` and `ProviderButtonGroup` from `@clerk/mosaic/components/provider-button`
  - `Switcher` from `@clerk/mosaic/components/switcher`: `Switcher.Root`, `Switcher.Trigger` and `Switcher.Popup`, and the content parts `Switcher.Header`, `Switcher.Separator`, `Switcher.Group`, `Switcher.Item` (with `ItemMedia`, `ItemContent`, `ItemLabel`, `ItemDescription` and `ItemTrailing`), `Switcher.Avatar` and `Switcher.BadgedAvatar`. `UserButton` and `OrganizationSwitcher` are built from them
  - The `Building`, `Checkmark`, `ChevronDown`, `ChevronRight`, `Cog6Teeth`, `EllipsisHorizontal`, `Key`, `SecurityLockSquare`, `SecurityPhone`, `SignOut`, `SwitchAccount` and `UsersAddRight` glyphs from `@clerk/mosaic/icons/glyphs/<name>`

- Updated dependencies [[`c71b7d3`](https://github.com/clerk/javascript/commit/c71b7d389f28393511b92e8d416bb6641d6b0ab0), [`2ab3bb8`](https://github.com/clerk/javascript/commit/2ab3bb881435dee9cf520e2e230f932e2c13b443)]:
  - @clerk/shared@4.47.0

## 0.6.0

### Minor Changes

- Export the `<Consent />` component. ([#10848](https://github.com/clerk/javascript/pull/10848)) by [@alexcarpenter](https://github.com/alexcarpenter)

### Patch Changes

- Export `Avatar`, `Badge`, `Banner`, `Button`, `DataList`, `EmptyState`, `Entity`, `Heading`, `Icon`, `Input`, `Item`, `Skeleton`, `Table` and `Text` from `@clerk/mosaic/components/<name>`, and the `External` glyph from `@clerk/mosaic/icons/glyphs/external`, the import paths Swingset documents. Style them with `@clerk/mosaic/styles.css`. ([#10754](https://github.com/clerk/javascript/pull/10754)) by [@djgould](https://github.com/djgould)

- Export `ActionMenu`, `Panel`, `Profile`, `Radio`, `Section` and `SegmentedControl` from `@clerk/mosaic/components/<name>`, and the `ArrowUpRight`, `Code`, `Plus`, `ShieldCheck` and `UserCircle` glyphs from `@clerk/mosaic/icons/glyphs/<name>`. Style them with `@clerk/mosaic/styles.css`. ([#10754](https://github.com/clerk/javascript/pull/10754)) by [@djgould](https://github.com/djgould)

- Updated dependencies [[`23ac615`](https://github.com/clerk/javascript/commit/23ac615a5f566c03685fb99dcef9b3ff58deadca), [`23ac615`](https://github.com/clerk/javascript/commit/23ac615a5f566c03685fb99dcef9b3ff58deadca)]:
  - @clerk/shared@4.46.0

## 0.5.0

### Minor Changes

- Picking a profile picture in `UserProfile`, or a logo in `OrganizationProfile` or `CreateOrganization`, now opens a dialog to crop it to a square before it uploads. Animated images upload as picked. ([#10784](https://github.com/clerk/javascript/pull/10784)) by [@alexcarpenter](https://github.com/alexcarpenter)

### Patch Changes

- Let the avatar and logo cropper zoom out until the whole image fits, so a wide logo or a tall photo can be uploaded without cutting it off. A JPEG zoomed out this way is saved as a PNG, so the area around it stays transparent. ([#10809](https://github.com/clerk/javascript/pull/10809)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`eb24fb0`](https://github.com/clerk/javascript/commit/eb24fb0a4bf55d25e8d7b19fc1d16bc4089cac35), [`eb24fb0`](https://github.com/clerk/javascript/commit/eb24fb0a4bf55d25e8d7b19fc1d16bc4089cac35)]:
  - @clerk/shared@4.45.1

## 0.4.0

### Minor Changes

- **Breaking:** Screen readers now announce `Combobox.Empty` when a search matches no options. It renders a polite `role="status"` `<div>` (it was a `<p>`) that stays mounted and shows its children only when nothing matches, so keep it in the popup or beside the list rather than rendering it conditionally. To make this work, `Combobox.Root` now owns the items, and `Combobox.Collection` only renders them: ([#10794](https://github.com/clerk/javascript/pull/10794)) by [@alexcarpenter](https://github.com/alexcarpenter)

  | Before                                                                      | After                                                       |
  | --------------------------------------------------------------------------- | ----------------------------------------------------------- |
  | `<Combobox.Collection items={items} itemToStringLabel={toLabel}>`           | `<Combobox.Root items={items} itemToStringLabel={toLabel}>` |
  | `<Combobox.Collection empty={<Combobox.Empty>No results</Combobox.Empty>}>` | `<Combobox.Empty>No results</Combobox.Empty>` beside it     |
  | `{item => …}`                                                               | `{(item: Item) => …}`                                       |

  Without `items` on the root, `Combobox.Empty` always shows its children. The `ComboboxEmpty` ref is now an `HTMLDivElement`.

  Find usages with `git grep -nE "Combobox\.(Collection|Empty)|ComboboxEmpty"`.

## 0.3.0

### Minor Changes

- Add `Combobox.Media`, `Combobox.Label` and `Combobox.Detail` for composing a combobox option, styled through `.cl-combobox-option-media`, `.cl-combobox-option-label` and `.cl-combobox-option-detail`. `PhoneInput` builds its country options from these parts, which centers each country's name in its row and gives the flag, name and calling code targetable classes. ([#10764](https://github.com/clerk/javascript/pull/10764)) by [@alexcarpenter](https://github.com/alexcarpenter)

- `UserProfile` and `OrganizationProfile` now route their pages through a location instead of local state, which changes a few things for consumers: ([#10602](https://github.com/clerk/javascript/pull/10602)) by [@Ephem](https://github.com/Ephem)
  - The `defaultPage` prop is removed. A profile opens on the first page in its navigation, as the legacy components do. To open on another page, put it first with `pageOrder`, or open the profile as a modal with the `page` option.
  - A new `path` prop sets the base a profile's pages live under, `/user` and `/organization` by default. Two profiles on one page need different bases.
  - There is no path or hash mode yet, so urls are not updated, this will come in a later version.
  - A custom page whose `path` cannot be a route, because it is percent-encoded, starts with a colon, or is the URL segment of a built-in page such as `api-keys`, is left out of the navigation with a console warning instead of rendering a page that cannot be reached.

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

- **Breaking:** Rename the `.cl-` classes on `Menu` item parts to match the `<row>-<part>` scheme used by `Select` and `Combobox`. Components and props are unchanged; only the classes change. ([#10763](https://github.com/clerk/javascript/pull/10763)) by [@alexcarpenter](https://github.com/alexcarpenter)

  | Before              | After                    |
  | ------------------- | ------------------------ |
  | `cl-menu-media`     | `cl-menu-item-media`     |
  | `cl-menu-label`     | `cl-menu-item-label`     |
  | `cl-menu-indicator` | `cl-menu-item-indicator` |

  Find usages with `git grep -n "cl-menu-media\|cl-menu-label\|cl-menu-indicator"`.

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

- Updated dependencies [[`12ef401`](https://github.com/clerk/javascript/commit/12ef401940fc71bd45a6c635f8e670cc5d556d35), [`57b4e0b`](https://github.com/clerk/javascript/commit/57b4e0bfef0dcddc9428efab949547f15600a0f6), [`6bb6ecb`](https://github.com/clerk/javascript/commit/6bb6ecb2b159e98fbebe768f898bdb64cecb007c), [`85afdd1`](https://github.com/clerk/javascript/commit/85afdd1ae903adbf04ec9529de4496423f77343d)]:
  - @clerk/shared@4.45.0

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
