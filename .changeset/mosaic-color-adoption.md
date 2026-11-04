---
'@clerk/mosaic': patch
---

Controls such as inputs, selects, checkboxes, radios and outline buttons keep the stronger `--cl-color-border`, while containers and dividers (cards, sections, tables, menus, the profile nav) use `--cl-color-border-subtle`. The two are now 12 and 8 percent washes in both modes, which makes light-mode controls firmer and leaves containers close to where they were. The profile opened in a dialog draws a border. Outline buttons fill with the surface color, and their hover and pressed states tint that fill. Banners, badges, toasts and the tag-input error use the `-subtle` tokens, and the neutral badge and banner use `--cl-color-neutral-subtle`.
