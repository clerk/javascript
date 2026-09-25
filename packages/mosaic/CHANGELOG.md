# @clerk/mosaic

## 0.1.3

### Patch Changes

- Remove the `modePriority` prop from `UserButton`. The header now follows what it leads with: an active organization offers Settings and Invite, and an account offers Settings and Sign out. ([#9807](https://github.com/clerk/javascript/pull/9807)) by [@alexcarpenter](https://github.com/alexcarpenter)

  The rows in the `UserButton` popup are now themed through their own `.cl-user-button-item` slots (`-media`, `-content`, `-label`, `-description`, `-trailing`), plus `.cl-user-button-group` and `.cl-user-button-separator`, instead of the shared `.cl-item` slots.

- Updated dependencies [[`6a14691`](https://github.com/clerk/javascript/commit/6a14691f8d98dcafd3956e1ea97cb35d56a34864), [`0ee4ee2`](https://github.com/clerk/javascript/commit/0ee4ee2b49286a8cae5f251ec997f30c8a863205)]:
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
