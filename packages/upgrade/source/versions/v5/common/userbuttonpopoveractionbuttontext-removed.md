---
title: '`userButtonPopoverActionButtonText` descriptor removed'
matcher:
  - "\\.cl-userButtonPopoverActionButtonText"
  - "elements:\\s+{[\\s\\S]*?userButtonPopoverActionButtonText:[\\s\\S]*?}"
---

The `userButtonPopoverActionButtonText` customization descriptor has been removed, as the text for this button is now directly rendered inside the button rather than an extra wrapping element. Any styling that needs to apply to the text can be applied to its direct parent `cl-userButtonPopoverActionButton`.
