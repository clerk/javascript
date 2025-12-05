---
title: 'Deprecated appearance props removed'
packages: ['*']
matcher: "(layout:\\s*\\{|socialButtonsPlacement|socialButtonsVariant)"
matcherFlags: 'i'
category: 'breaking'
docsAnchor: 'appearance-props'
---

Several appearance-related props have been deprecated and moved to new locations.

The `layout` prop in the `appearance` object has been restructured. Properties like `socialButtonsPlacement` and `socialButtonsVariant` have moved.

The codemod `transform-appearance-layout-to-options` will automatically migrate most of these changes. Review your `appearance` prop configurations after running the codemod.
