---
title: 'Changes to the `card` customization id'
warning: true
category: 'appearance'
matcherFlags: 'm'
matcher:
  - "\\.cl-card"
  - "elements:\\s+{[\\s\\S]*?card:[\\s\\S]*?}"
---

The `card` customization id in the previous major version was the main and only container element for components. Outside the `card` element, a new `cardBox` id was introduced that allows more fine-grained style customization.

As a note, if you are changing the background color of `card`, you will also need to also apply the same color on the `footer` id as well. The `footer` now gray by default, and it’s located outside `card`, but inside `cardBox`.

A `footerItem` id was also added for more targeted styling of items inside the `footer`.
