---
'@clerk/ui': patch
---

The Mosaic `Text` and `Heading` components now accept `foreground` and `foreground-secondary` as `color` variants, mapped to the `--cl-color-foreground` and `--cl-color-foreground-secondary` tokens. The `neutral` variant has been removed in favor of `foreground`, and both components now default to `foreground` instead of `primary`.
