---
'@clerk/mosaic': minor
---

**Breaking:** Replace and remove color tokens. TypeScript does not flag these, so find usages with `git grep -nE -e '--cl-color-(background|brand-secondary)'`.

| Before                         | After                                                                                                                      |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `--cl-color-background`        | `--cl-color-page` for the profile shell, `--cl-color-surface` for anything raised on it, such as cards, menus and controls |
| `--cl-color-background-subtle` | `--cl-color-surface-subtle`                                                                                                |
| `--cl-color-brand-secondary`   | Removed, with no direct replacement. Choose another token by where it is used.                                             |

Dark mode gives the profile its own shell color. `--cl-color-background` is replaced by `--cl-color-page`, the base layer (near-black in dark mode, white in light), which backs the profile shell. A new `--cl-color-surface` backs everything raised on it, such as cards, sections, menus, popovers and controls, and the gray ramp mixes into it. The surface is derived from the page (neutral mixed 5 percent into it in dark mode, white mixed 60 percent into it in light mode), so retinting `--cl-color-page` retints the shell, the surface and the ramp together, and with the default white page the shell, surface and borders look the same in light mode. `--cl-color-background-subtle` is renamed `--cl-color-surface-subtle`.

Brand and the negative, positive and warning colors now share one set of derived tokens: `-foreground`, `-subtle`, `-border` and `-alpha-100|200|300`, so overriding a seed retints its companions. `-foreground` flips to dark text in dark mode for brand, positive and warning, where white would fail, while negative keeps white text. `--cl-color-brand-secondary` is removed. `--cl-color-neutral-subtle` is new. `--cl-color-border` and `--cl-color-border-subtle` are now neutral washes (7 and 4 percent in light mode, 12 and 8 in dark mode), so they stay visible on the surface and faded fills.

In light mode the negative, positive and warning colors are slightly darker so their text passes contrast on their own `-subtle` fill, `--cl-color-foreground-secondary` is a little darker, and `--cl-color-input-placeholder` has its own value that now passes contrast on the field.
