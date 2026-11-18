# Clerk theme

The Clerk theme (`src/app/clerk-theme.css`, chosen in the header "Theme" dropdown, Clerk by default) restyles Mosaic components to match the Dashboard's design system (Ceramic) without touching `@clerk/mosaic`. It applies under `html[data-swingset-theme='clerk']`; with Default selected, nothing applies.

## How the theme is built

The theme lands as a stack of PRs. Each one adds only what the layers below it cannot express.

| PR  | Scope                                                                                       | Budget  |
| --- | ------------------------------------------------------------------------------------------- | ------- |
| 1   | Mosaic `--cl-*` token overrides only. No component selectors                                | ~100    |
| 2   | Buttons, select trigger, press scale                                                        | 200     |
| 3   | Inputs, input group, OTP, tag input, checkbox, radio, switch                                | 200     |
| 4   | Overlays: popups, popover with a card, tooltip, dialog frame, backdrop, toast               | 200     |
| 5   | Data display: table, pagination, badge, banner, section, item, empty state, skeleton        | 180     |
| 6   | Profile nav and fullscreen profile, flow, segmented control, spinner, forced-colors restore | 100     |
|     | Total                                                                                       | < 1,000 |

The full single-file theme the stack is cut from is kept on the local branch `prestonwebdev/swingset-clerk-theme-reference`. Each PR lists the selectors it adds and why in its own description.

## Rules the theme follows

- Tokens first. A value goes in a component rule only when no Mosaic token reaches it, and a component rule reads `var(--cl-*)` instead of repeating a literal.
- Colors carry light and dark in one `light-dark()` value, the way Mosaic's own tokens do. No `&.dark` blocks.
- The token block needs no specificity boost: Mosaic emits its defaults on `:root`, and `html[data-swingset-theme='clerk']` outranks it. Component rules do need one, because StyleX dev output boosts Mosaic's own rules (see Mosaic change 1).
- No Mosaic source changes. What would make the theme smaller goes in "Mosaic changes that would make theming easier".
- Mosaic owns spacing and sizing. The theme does not set `--cl-spacing`, padding or heights. Values where Ceramic differs are listed under "Ceramic spacing that Mosaic does not match".
- Page-level cards stay on Mosaic's look so sign-in and sign-up are unaffected. Dialog chrome is scoped to `.cl-dialog-popup`.
- The profile modal keeps Mosaic's layout. Only the fullscreen profile gets the gray frame and inset panel, and it opens and closes without a transition.

## What PR 1's tokens cover

| Token                                                         | Ceramic value it carries                                               | Reaches                                    |
| ------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------ |
| `--cl-color-*` foreground, surface, border, input, ring       | Ceramic ink, page, separator and input grays                           | Every component                            |
| `--cl-color-neutral` and `-neutral-alpha-100/200/300`         | Ceramic gray `#767684` washes in light, white washes in dark           | Hover fills, ghost buttons, subtle borders |
| `--cl-color-{brand,negative,positive,warning}-subtle/-border` | The 4% wash and 16% ring of each status color                          | Badge, banner, stepper                     |
| `--cl-font-medium`, `-semibold`, `-bold`                      | 500 everywhere                                                         | Labels, headings, buttons                  |
| `--cl-shadow-md`                                              | The menu shadow: 1px ring, two drop layers, an inset highlight in dark | Menu, select, combobox, phone input        |
| `--cl-shadow-lg`                                              | The panel shadow                                                       | Card, profile, toast, action bar           |
| `--cl-focus-outline-*`                                        | 2px solid at a 3px offset                                              | Every focus outline                        |
| `--cl-ease-default`, `--cl-duration-fast/base`                | Ceramic's standard curve, 120ms and 150ms                              | Hover and press transitions                |

Tokens left on Mosaic's values on purpose: `--cl-spacing` (Mosaic owns spacing), `--cl-ease-enter`/`-exit`/`-in-out` and `--cl-duration-slow`/`-slower` (Ceramic uses springs, which these cannot express; see change 9), and the scrollbar hover and active colors (derived from the thumb).

| Gap with tokens only                                                                             | Closed in |
| ------------------------------------------------------------------------------------------------ | --------- |
| Raised button look (gradient, inset highlight, ring), button sizes, press scale                  | PR 2      |
| Select trigger raised look                                                                       | PR 2      |
| Input gray focus halo, tinted text add-ons, checkbox and radio sizes and animations, switch      | PR 3      |
| Menu surface `#33333e` in dark (popups use the page surface), popover-with-card surface          | PR 4      |
| Dialog gray frame and inset panel, backdrop blur, always-dark toast, popup spring                | PR 4      |
| Badge gradient and text color, table header, row hover, pagination joined to the table, sections | PR 5      |
| Profile nav, fullscreen profile frame, flow crossfade, segmented control spring, spinner         | PR 6      |
| Forced-colors border restore for elements drawn with shadows                                     | PR 6      |

## Mosaic changes that would make theming easier

Each row is something a theme cannot do with today's tokens, so it needs component CSS instead. "Shrinks" is the stacked PR whose CSS the change would remove. Ranked by how much theme CSS each one removes.

| #   | Change                                                                                                                                                                           | What a theme has to do today                                                                                                                        | Shrinks | Effort |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------ |
| 1   | A supported override layer: Mosaic ships its styles in a named `@layer` and themes go in a later one                                                                             | Pad every component selector with eight `:not(#\#)` repeats to beat StyleX dev boosts, and break silently if the boost changes                      | 2–6     | M      |
| 2   | Control tokens: `--cl-control-shadow`, `--cl-control-shadow-hover`, `--cl-press-scale`, a public `--cl-button-radius`                                                            | Rebuild the raised button and select-trigger look per variant, size and state, and write Mosaic's private `--_cl-button-radius`                     | 2       | M      |
| 3   | Field focus tokens separate from the button focus outline (`--cl-field-focus-ring` or a halo shadow token). Today `--cl-color-ring` colors every focus outline                   | Override focus on inputs, input groups, tag input and OTP slots to get Ceramic's gray halo while buttons keep the purple outline                    | 3       | S      |
| 4   | Popup surface token (`--cl-color-popup`), separate from `--cl-color-surface`. Menu, select and combobox all read `--cl-color-surface` today                                      | Set the menu color on every popup slot, and set the page color back on popovers that hold a card                                                    | 4       | S      |
| 5   | Shadow tokens per surface (card, dialog, toast) instead of one `--cl-shadow-lg` shared by card, profile, toast and action bar                                                    | Override the shadow on the dialog card and the toast, because setting `--cl-shadow-lg` for one changes all four                                     | 4       | S      |
| 6   | Scrim tokens: `--cl-color-scrim` and `--cl-backdrop-blur`. The dialog backdrop is a hardcoded 40% black                                                                          | Restyle `.cl-dialog-backdrop` to get Ceramic's dark-mode color and its 8px blur                                                                     | 4       | S      |
| 7   | Dialog frame variant with an inset panel and `--cl-dialog-inset`                                                                                                                 | Paint the inset panel with `::before`, hand-compute concentric radii and the close-button inset                                                     | 4, 6    | M      |
| 8   | Card goes flat inside a popover or dialog, and surfaces carry a `data-surface` attribute                                                                                         | Use ancestor selectors (`.cl-popover-popup:has(.cl-card-root)`, `.cl-dialog-popup …`) to tell page, dialog and popover cards apart                  | 4       | S      |
| 9   | Spring motion tokens (`--cl-ease-spring-*` as `linear()` curves) and a popup enter and exit pair                                                                                 | Inline nine generated `linear()` curves on popups, checkbox, radio and segmented control                                                            | 4, 6    | S      |
| 10  | Promote the private vars themes write to documented tokens: `--_cl-switch-thumb`, `-travel`, `-stretch`, `--_cl-table-surface`, `--_cl-table-row-tint`                           | Write private names that can be renamed without notice                                                                                              | 3, 5    | S      |
| 11  | Table shell that includes pagination, plus a row-actions hover state                                                                                                             | Join pagination to the shell with `:has(+ .cl-pagination)` and a negative margin, and reveal the ellipsis with `:has()` and `@media (hover: hover)` | 5       | M      |
| 12  | `InputGroup.Start`/`End` `variant='filled'` for tinted add-on cells                                                                                                              | Guess which add-ons are text with `:not(:has(*))`, which also tints add-ons never meant to be filled                                                | 3       | S      |
| 13  | Add slots: Pagination layout, control group and page size; OTP caret; Card "Secured by Clerk" row; sortable column label and sort icon                                           | Reach unclassed wrappers by DOM order (`> span > svg` with the file's only `!important`, `.cl-table-body > tr:not(.cl-table-row)`)                  | 5       | S      |
| 14  | Tokenize the Flow step transition (or adopt the sequential crossfade as the default)                                                                                             | Re-time `.cl-flow-root` and `.cl-flow-step`, since Mosaic scales from 0.96 and overlaps steps                                                       | 6       | M      |
| 15  | Sizing tokens for the values in "Ceramic spacing that Mosaic does not match" (`--cl-popup-padding`, `--cl-item-height`, `--cl-control-height-*`), if design wants them themeable | Nothing today: the theme leaves these on Mosaic's values                                                                                            | —       | M      |
| 16  | `Dialog` exposes the trigger's offset as CSS variables (or an `origin` option)                                                                                                   | Nothing today: the Dashboard's grow-from-trigger motion needs JS, so the theme does not attempt it                                                  | —       | M      |
| 17  | Device icons (`DeviceLaptop`, `DevicePhone` and similar) use `currentColor`                                                                                                      | Nothing a theme can do: hard-coded fills render as black blobs in dark mode, with or without the theme                                              | —       | S      |

## Ceramic spacing that Mosaic does not match

Left on Mosaic's values. Decide with design whether these become tokens (change 15).

| Area                                                  | Ceramic (Dashboard)           | Mosaic now              |
| ----------------------------------------------------- | ----------------------------- | ----------------------- |
| Popup radius (menu, select, combobox, popover, phone) | 8px                           | 12px (`--cl-radius-xl`) |
| Popup viewport padding                                | 4px                           | 6px (5px on select)     |
| Menu, select and combobox item height                 | 28px minimum                  | 32px                    |
| Item inline padding                                   | 8px                           | 6px                     |
| Input height and inline padding                       | sm 24px / 8px, md 32px / 10px | 32px / 11px             |
| Input add-on inline padding                           | 8px                           | Mosaic default          |

## Dialog open and close motion

The theme keeps Mosaic's dialog motion. The Dashboard's reads cleaner; matching it needs changes 9 and 16.

| Part              | Dashboard                                                                                                                  | Mosaic now                               |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Modal transform   | Scales from 0.85 to 1, starting translated toward the trigger (the distance between the two centers, clamped to 160px)     | Scale 0.94 from the modal's own center   |
| Trigger awareness | Captures the trigger's rectangle on press and animates back to it on close; with no usable trigger the offset is 0px, 64px | None                                     |
| Modal opacity     | Not animated; only the transform moves                                                                                     | Fades in and out                         |
| Timing            | 500ms `spring(0.24, 0)` in, 250ms `spring(0.12, 0)` out                                                                    | `--cl-duration-*` with `--cl-ease-enter` |
| Backdrop          | Opacity only, 240ms in and 150ms out                                                                                       | Mosaic's duration both ways              |

Curves, generated from `motion` 12.38: enter `linear(0, 0.1495, 0.3955, 0.6061, 0.7562, 0.8542, 0.9148, 0.9512, 0.9724, 0.9846, 0.9914, 0.9953, 0.9974, 0.9986, 0.9992, 1, 1)` over 500ms; exit `linear(0, 0.4615, 0.8176, 0.9471, 0.9858, 0.9964, 0.9991, 1)` over 250ms.

## Component gaps no theme can reach

| Gap             | Note                                                                                                                          |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Spinner         | Ceramic is 8 dots plus an arc; Mosaic is a bordered ring. Only size and speed match                                           |
| Toast           | No action button; stack math is driven by inline vars                                                                         |
| Drawer          | Keeps its grabber and swipe math; Ceramic's header is flat                                                                    |
| TagInput        | Mosaic renders tags inside the field, Ceramic renders them below a plain input                                                |
| Billing history | Hand-rolled native `<select>` and inline prev/next; a move to `Table`, Mosaic `Select` and `Pagination` is being redone       |
| Member requests | Inline Accept and Decline with no confirm or success toast; Ceramic uses a hover-revealed menu, a decline confirm and a toast |

## Dashboard facts that were not obvious

| Fact                                                                                                                                                                                                                      | Where it matters                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| The Dashboard checkout in the repo can be stale; read `origin/main`                                                                                                                                                       | Button scale and other values differed between the two                |
| Plain menus use the menu surface (white, dark `#33333e`); the organization switcher and user button popup uses the page surface (dark `#1b1b1f`) with a white 10% ring                                                    | Change 4; PR 4                                                        |
| Overlay is black 40% (dark `#111113` at 36%) with an 8px blur. The Dashboard also draws a dot pattern from a shader; the theme does not                                                                                   | Change 6; PR 4                                                        |
| Toasts are always dark, in both modes, with a top highlight and an inset ring                                                                                                                                             | `.cl-toast-root` and `.cl-toast-anchored-root`, a separate slot; PR 4 |
| Input focus is a gray halo, not the purple ring; invalid keeps a 2px red ring                                                                                                                                             | Change 3; PR 3                                                        |
| Status washes differ by component: in dark, badges are 24% (16% positive), while banners are 12% for neutral and warning and stay at 4% for negative and positive. One `-subtle` token per status covers only one of them | PR 1 tunes `-subtle` to the badge; PR 5 adjusts the banner            |
| Checkbox is 14px (12px small) and radio 14px; checkbox draws its check and radio scales its dot                                                                                                                           | PR 3                                                                  |

## Unverified

- Live Sandbox (`/live`, `/sign-in`, `/sign-up`) under the theme needs Clerk keys in `.env.local`.
- Forced-colors, touch, RTL and Chaos mode under the theme. Only light and dark have been measured.
- Input focus is a faint gray halo with no outline; probably under 3:1 non-text contrast. It matches the Dashboard, so it is a design call.
- Swingset loads Geist through `next/font` and the theme uses it first. Suisse, the Dashboard's other face, is licensed and not bundled.

## Open decisions

- Should the Ceramic spacing values become tokens (change 15), stay out, or go to design?
- Should sign-in and sign-up stay on Mosaic's card look, or get the page-card look behind a `data-surface` attribute (change 8)?
