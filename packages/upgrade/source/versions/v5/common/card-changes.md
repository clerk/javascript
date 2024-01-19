---
title: 'Changes to the `card` customization id'
warning: true
matcherFlags: 'm'
matcher:
  - "\\.cl-card"
  - "elements:\\s+{[\\s\\S]*?card:[\\s\\S]*?}"
---

The `card` customization id in the previous major version was the main and only container element for components Outside the `card` element we introduced a new `cardBox` id that allows more fine-grained style customization.

As a note, if you are changing the background color of `card`, you will also need to also apply the same color on the `footer` id as well. The `footer` now gray by default, and it’s located outside `card`, but inside `cardBox`.

We also added a `footerItem` id for more targeted styling of items inside the `footer`.
