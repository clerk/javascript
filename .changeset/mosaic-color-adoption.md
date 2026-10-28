---
'@clerk/mosaic': patch
---

Controls such as inputs, selects, checkboxes, radios and outline buttons keep the stronger `--cl-color-border`, while containers and dividers (cards, sections, tables, menus, the profile nav) use `--cl-color-border-subtle`. Outline buttons fill with the surface color and lay their hover and pressed tint over it, so the tint works on the page, the surface or a faded fill. Banners, badges, toasts and the tag-input error use the `-subtle` and `-border` tokens, and the neutral badge and banner use `--cl-color-neutral-subtle`. The negative color is slightly deeper in light mode for contrast.
