---
title: 'Breaking Changes to appearance variables'
matcherFlags: 'm'
category: 'appearance'
matcher:
  - "variables:\\s+{[\\s\\S]*?fontSmoothing:"
  - "variables:\\s+{[\\s\\S]*?shadowShimmer:"
  - "variables:\\s+{[\\s\\S]*?colorAlphaShade:"
---

Several appearance variables have been removed or renamed. If you were using these variables in your application, you will need to update your code to use the new variables.

- The `fontSmoothing` variable has been removed.
- The `shadowShimmer` variable has been removed.
- The `colorAlphaShade` variable has been renamed to `colorNeutral`.
