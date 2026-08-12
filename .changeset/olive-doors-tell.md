---
'@clerk/headless': patch
'@clerk/ui': patch
---

Move the Mosaic `Dialog` onto StyleX, joining the other migrated components, and rework its sizing, motion and mobile behaviour.

**Styling.** The dialog's rules now ship in `@clerk/ui/styles.css`. Style it by targeting the `.cl-dialog-backdrop` / `.cl-dialog-viewport` / `.cl-dialog-popup` slot classes from a CSS layer of your own, or per-part with `className` and `style`, in place of the previous `sx` prop.

**Sizes.** `size` replaces `md` / `lg` with three named surfaces, and moves from `Dialog.Popup` to `Dialog.Root` because the backdrop reads it too. `prompt` (the default, `23.75rem`) asks one thing — a confirmation or a single-field form. `card` (`25rem`) is the sign-in / sign-up surface. `panel` fills the viewport minus its inset, up to `94rem` wide, so a settings surface does not resize as you navigate between its sections.

**A `card` brings its own surface.** `prompt` and `panel` paint themselves; `card` contributes width and motion only, and takes its background, shadow, radius and padding from `Card`. Render the popup as the card — `<Dialog.Popup render={<Card.Root elevation='overlay' />}>` — rather than nesting one inside the other, so a single element both paints and animates and the corner-radius correction still lands on the corners you can see. A `card` with no `Card` inside now renders an unpainted box.

**The inset.** The gap between a dialog and the edge of the screen is now a fixed inset that steps up at two breakpoints — `1.25rem`, `2rem` at `48rem`, `3rem` at `90rem` — rather than a percentage of the viewport. A percentage margin is asymmetric between the axes and the asymmetry tracks the viewport's aspect ratio, so the surround never read as an even frame. Below `48rem` the sides come in to `1rem` while the top and bottom hold at `1.25rem`, since horizontal space is what a phone is short of.

**Scrolling.** A dialog taller than the screen now scrolls, and how it scrolls follows from its size rather than from a prop. A `panel` is a fixed-height window, so it scrolls _inside_: compose the region with `scrollAreaRoot` / `scrollAreaViewport()`. A `prompt` and a `card` take their height from their content, so they scroll _outside_ — the popup keeps its natural height and the whole dialog moves within the viewport, keeping its inset at both ends rather than running flush into the bottom of the screen. `Dialog.Viewport` also now carries `data-size`. One exception: a `prompt` below `48rem` is a bottom sheet, and the rule that keeps its off-screen slide from painting a scrollbar also keeps it from scrolling — use `card` for a tall surface on a phone.

**Panels compose.** A `panel` clips rather than scrolling, and carries no padding of its own. Build the scroll region inside it with `scrollAreaRoot` / `scrollAreaViewport()`. That keeps anything anchored to the popup's corner from scrolling away, lets a scroll region sit flush with the dialog's edge, and makes a fixed-sidebar layout a plain flex row. `prompt` and `card` still pad themselves.

**On a phone.** Below `48rem` a `prompt` pins to the bottom of the viewport and slides up as a sheet, keeping the inset on all four sides. `card` and `panel` are unchanged at every width. When an on-screen keyboard opens, `Dialog.Viewport` measures how much of the viewport it covers and pads for it, so a sheet rises to sit on top of the keyboard, a card re-centres in the space that is left without being squashed, and a panel shrinks.

**Motion.** `prompt` and `card` scale from their own centre, and corner radius no longer distorts during the scale. `panel` has no enter or exit animation, since the absolute travel of a scale is a proportion of the element's own size. Under `prefers-reduced-motion: reduce` the movement drops and the fade remains.

**New `--cl-ease-enter` token.** An entrance curve that decelerates onto its target instead of carrying past it, for surfaces where `--cl-ease-default`'s overshoot reads as a correction rather than as physicality — a large surface, or one whose arrival is already announced by a scrim. `Dialog` uses it for every entrance; nothing else changes curve. Retarget it like any other Mosaic token.

This also fixes the enter/exit transition, which was keyed to a `data-cl-starting-style` attribute the headless layer does not emit — dialogs previously appeared with no animation at all.

**New `Dialog.CloseButton`.** The corner dismiss affordance: a ghost circular button holding the close glyph, anchored to the popup's top-inline-end corner. `Dialog.Close` is unchanged and stays unstyled, for footer "Cancel" buttons. Note that a close button rendered before a form becomes the dialog's initial focus.

**Stacked dialogs.** A dialog opened from inside another one carries `data-nested` and paints a lighter scrim, so backdrops no longer compound into an opaque wall as the stack grows; the nested value is solved against the base so two levels composite to a `0.68` dim.

**Browser chrome.** While a dialog is open, the mobile browser's own chrome is tinted to match the scrim — both `theme-color` and the `<body>` background, the latter being what paints the overscroll gutter and the area behind the address bar. On by default and needing no integration: the colour is derived from the backdrop rather than shipped, the meta is prepended rather than mutated so removing it restores the app's own, and it is refcounted across stacked dialogs. Opt out with `syncBrowserChrome={false}`.

**`Button` gains an `xstyle` prop** for composing StyleX styles into its own, last so they win. Styles passed through `className` sit outside the button's `stylex.props` call and cannot be deduped, so the button's media-guarded rules — which compile to a doubled class — silently outrank them; positioning a button absolutely via `className` was ignored under a coarse pointer.

**Polish.** The dialog surface now draws a real border under `forced-colors: active`, where `box-shadow` is discarded and the popup would otherwise float edgeless over a scrim that is also discarded. Long unbroken strings — an email address, an org slug, an API key — wrap instead of pushing past the size's width clamp. And in development, a dialog with no accessible name warns: pass `aria-label`, or render a `Dialog.Title`. The same check now backs `Popover`, and it resolves `aria-labelledby` to a real element rather than trusting the attribute's presence, so a reference pointing at nothing is reported rather than waved through.
