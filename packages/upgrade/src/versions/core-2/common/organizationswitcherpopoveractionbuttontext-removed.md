---
title: '`organizationSwitcherPopoverActionButtonText` customization id removed'
image: true
matcherFlags: 'm'
category: 'appearance'
matcher:
  - "\\.cl-organizationSwitcherPopoverActionButtonText"
  - "\\.cl-organizationSwitcherPopoverActionButtonText__manageOrganization"
  - "\\.cl-organizationSwitcherPopoverActionButtonText__createOrganization"
  - "elements:\\s+{[\\s\\S]*?organizationSwitcherPopoverActionButtonText:[\\s\\S]*?}"
  - "elements:\\s+{[\\s\\S]*?organizationSwitcherPopoverActionButtonText__manageOrganization:[\\s\\S]*?}"
  - "elements:\\s+{[\\s\\S]*?organizationSwitcherPopoverActionButtonText__createOrganization:[\\s\\S]*?}"
---

The `organizationSwitcherPopoverActionButtonText` customization id has been removed, as the text for this button is now directly rendered inside the button rather than an extra wrapping element. The nested ids `organizationSwitcherPopoverActionButtonText__manageOrganization` and `organizationSwitcherPopoverActionButtonText__createOrganization` have also been removed. Any styling that needs to apply to the text can be applied to its direct parent `cl-organizationSwitcherPopoverActionButton`.
