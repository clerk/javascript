---
title: '`userButtonBox` is now a child of `userButtonTrigger`'
warning: true
category: 'appearance'
matcher:
  - "\\.cl-userButtonTrigger"
  - "\\.cl-userButtonBox"
  - "elements:\\s+{[\\s\\S]*?userButtonTrigger:[\\s\\S]*?}"
  - "elements:\\s+{[\\s\\S]*?userButtonBox:[\\s\\S]*?}"
matcherFlags: 'm'
---

The parent-child relationship of the two elements `userButtonTrigger` and `userButtonBox` has been swapped. Previously, `userButtonTrigger` was nested inside of `userButtonBox`, and now `userButtonBox` is nested inside of `userButtonTrigger`. This change resolves [some usability issues](https://github.com/clerk/javascript/issues/1625) in `<UserButton />`. If you are applying style customization to either of these elements, your customizations may need to be adjusted.
