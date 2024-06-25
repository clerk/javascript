---
title: '`userButtonPopoverActionButtonText` customization id removed'
image: true
category: 'appearance'
matcher:
  - "\\.cl-userButtonPopoverActionButtonText"
  - "\\.cl-userButtonPopoverActionButtonText__signOut"
  - "\\.cl-userButtonPopoverActionButtonText__manageAccount"
  - "elements:\\s+{[\\s\\S]*?userButtonPopoverActionButtonText:[\\s\\S]*?}"
  - "elements:\\s+{[\\s\\S]*?userButtonPopoverActionButtonText__signOut:[\\s\\S]*?}"
  - "elements:\\s+{[\\s\\S]*?userButtonPopoverActionButtonText__manageAccount:[\\s\\S]*?}"
matcherFlags: 'm'
---

The `userButtonPopoverActionButtonText` customization id has been removed, as the text for this button is now directly rendered inside the button rather than an extra wrapping element. The nested ids `userButtonPopoverActionButtonText__signOut` and `userButtonPopoverActionButtonText__manageAccount` have also been removed. Any styling that needs to apply to the text can be applied to its direct parent `cl-userButtonPopoverActionButton`.
