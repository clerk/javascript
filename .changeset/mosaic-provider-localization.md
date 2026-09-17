---
'@clerk/mosaic': minor
---

Add a `localization` prop to `MosaicProvider` for supplying a translated message catalog. Pass `messages` for a full or partial catalog, `overrides` for sparse changes on top of it, and `locale` to pick plural forms. Any key a catalog omits falls back to the built-in English strings.
