---
'@clerk/mosaic': minor
---

Export `MosaicProvider` and add a `localization` prop to it for supplying a translated message catalog. Wrap `UserButton` in the provider and pass `messages` for a full or partial catalog, `overrides` for sparse changes on top of it, and `locale` to pick plural forms. Any key a catalog omits falls back to the built-in English strings.
