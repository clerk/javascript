---
'@clerk/mosaic': minor
---

Dark mode gives the profile its own shell color. `--cl-color-background` is now the base layer, near-black in dark mode, and backs the profile shell. A new `--cl-color-surface` backs everything raised on it, such as cards, sections, menus, popovers and controls, and the gray ramp mixes into it. It is derived from `--cl-color-background` (a 6.5 percent mix of `--cl-color-neutral` in dark mode, equal to it in light mode), so retinting `--cl-color-background` retints the shell, the surface and the ramp together, and light mode is unchanged. Dark-mode borders are slightly stronger, a 10.5 percent mix of `--cl-color-neutral` into `--cl-color-surface` instead of 8 percent. A profile opened in a dialog now draws a border. Destructive buttons and menu items tint red on hover.
