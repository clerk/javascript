# @clerk/mosaic

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
