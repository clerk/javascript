---
title: 'Back button customization ids change on alternative 2fa methods page'
category: 'appearance'
image: true
matcherFlags: 'm'
matcher:
  - "\\.cl-headerBackIcon"
  - "\\.cl-headerBackRow"
  - "\\.cl-headerBackLink"
  - "elements:\\s+{[\\s\\S]*?headerBackIcon:[\\s\\S]*?}"
  - "elements:\\s+{[\\s\\S]*?headerBackRow:[\\s\\S]*?}"
  - "elements:\\s+{[\\s\\S]*?headerBackLink:[\\s\\S]*?}"
---

The "back" button on the panel within `<SignIn />` that lists out alternative two factor auth methods has changed location, and there have been some changes to the ids as a result of this:

- `headerBackIcon` has been removed, as there is no longer an associated icon
- `headerBackRow` has been renamed to `backRow` as it's no longer in the header
- `headerBackLink` has been renamed to `backLink` as it's no longer in the header
