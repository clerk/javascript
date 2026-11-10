# Clerk theme: scope and tabled follow-ups

The Clerk theme (`src/app/clerk-theme.css`, chosen in the header "Theme" dropdown, Clerk by default) restyles Mosaic components to match the Dashboard's design system (Ceramic) without touching `@clerk/mosaic`. Everything under `html[data-swingset-theme='clerk']`; with Default selected, nothing applies.

## Rules the theme follows

- Theme only: colors, shadows, rings, typography tokens, motion, and component chrome. No Mosaic source changes.
- Mosaic owns spacing, sizing and radii of menus, selects, comboboxes, phone inputs and inputs (the Figma spacing spec). The theme does not set padding, heights or popup radii on those. A value the theme would set differently is listed below instead.
- The profile modal (`variant='profile'`) keeps Mosaic's default layout: white surface, sidebar on the same surface with a divider. Only the fullscreen profile gets the gray frame, the sidebar on the frame, and the inset white panel.
- The fullscreen profile opens and closes instantly: its popup and backdrop have no transition. It is the only dialog variant with that rule; the card and profile modals keep Mosaic's standard motion.
- Page-level cards stay on Mosaic's look so sign-in and sign-up are unaffected. Card, banner-gap and flow-transition rules are scoped to `.cl-dialog-popup`.

## Dashboard facts that were not obvious

| Fact                                                                                                                                                                                | Where it matters                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| The Dashboard checkout in the repo can be stale; read `origin/main`                                                                                                                 | Button scale and other values differed between the two                              |
| Plain menus use the menu surface (white, dark `#33333e`); the organization switcher and user button popup uses the page surface (dark `#1b1b1f`) with a 1px ring of about white 10% | Popover with a card inside gets `--clerk-main`, everything else `--clerk-menu`      |
| Overlay is black 40% (dark `#111113` at 36%), 8px blur, plus the dots                                                                                                               | `.cl-dialog-backdrop`                                                               |
| Toasts are always dark, in both modes, with a top highlight and an inset ring                                                                                                       | `.cl-toast-root` and `.cl-toast-anchored-root`; the anchored one is a separate slot |
| Input focus is a gray halo, not the purple ring                                                                                                                                     | Inputs, input groups, tag input, OTP slots; invalid keeps a 2px red ring            |
| Checkbox is 14px (12px small) and radio 14px; checkbox draws its check and radio scales its dot                                                                                     | Checkbox and radio indicator animations                                             |

## Theme follow-ups (not done)

Scoped to `clerk-theme.css` and its Swingset plumbing. None change the look.

| Item                                                                                                                                                                                                                                      | Why                                                                            | Effort |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------ |
| Split `clerk-theme.css` (about 2,100 lines, 150 top-level rules, no sections) into ordered partials imported from one file: tokens, controls, overlays, data display, flows                                                               | Comments are not allowed, so structure has to come from file boundaries        | M      |
| Replace repeated raw colors with palette variables (`#33333e` 17 times, `#ffffff` 26 times; 143 hex and 320 `rgb()` values against 7 `--clerk-*` variables)                                                                               | Fewer places to change, and a second theme becomes cheap                       | M      |
| Pick one dark-mode mechanism: `light-dark()` for colors (72 uses), `&.dark` only for structure (about 25 blocks)                                                                                                                          | Two mechanisms side by side is harder to review                                | S      |
| Input focus is a faint gray halo with no outline; probably under 3:1 non-text contrast                                                                                                                                                    | Matches the Dashboard, so it is a design call                                  | Design |
| Mount `ThemeStyleProvider` in `layout.tsx` instead of `ClientRoot.tsx`; read the initial value with `useSyncExternalStore` and drop the `eslint-disable`                                                                                  | Smaller `ClientRoot` diff, no first-paint "Clerk" label when Default is stored | S      |
| Coupling to Mosaic internals: the 48rem breakpoint, the `card` named container, 13 `--_cl-*` private vars, and structural selectors (`> span > svg` with `!important`, `.cl-table-body > tr:not(.cl-table-row)`, `:not(:has(*))` add-ons) | Each breaks silently if Mosaic refactors; keep the list short                  | n/a    |
| Verify forced-colors, touch, RTL and Chaos mode under the theme                                                                                                                                                                           | Only measured in light and dark so far                                         | S      |

## Tabled: differs from Mosaic's spacing, decide with design

| Area                                                  | Ceramic (Dashboard)           | Mosaic now              |
| ----------------------------------------------------- | ----------------------------- | ----------------------- |
| Popup radius (menu, select, combobox, popover, phone) | 8px                           | 12px (`--cl-radius-xl`) |
| Popup viewport padding                                | 4px                           | 6px (5px on select)     |
| Menu, select and combobox item height                 | 28px minimum                  | 32px                    |
| Item inline padding                                   | 8px                           | 6px                     |
| Input height and inline padding                       | sm 24px / 8px, md 32px / 10px | 32px / 11px             |
| Input add-on inline padding                           | 8px                           | Mosaic default          |

## Tabled: dialog open and close motion

The theme keeps Mosaic's standard dialog motion (card scales from 0.94 and fades; profile and fullscreen fade; compact widths slide as a sheet). The Dashboard does it differently, and it reads cleaner. Worth coming back to.

| Part              | Dashboard                                                                                                                                                                                     | Mosaic and the theme now                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Modal transform   | Scales from 0.85 to 1, starting translated toward the trigger; the translation is the distance between the trigger's center and the modal's center, clamped to 160px                          | Scale 0.94 from the modal's own center   |
| Trigger awareness | The trigger's rectangle is captured at press time; on close the trigger's current rectangle is measured and the modal animates back toward it; with no usable trigger the offset is 0px, 64px | None                                     |
| Modal opacity     | Not animated; only the transform moves                                                                                                                                                        | Fades in and out                         |
| Timing            | Spring curves: 500ms `spring(0.24, 0)` in, 250ms `spring(0.12, 0)` out                                                                                                                        | `--cl-duration-*` with `--cl-ease-enter` |
| Backdrop          | Opacity only, 240ms in and 150ms out                                                                                                                                                          | 240ms (theme) both ways                  |
| Reduced motion    | The origin effect is skipped                                                                                                                                                                  | Mosaic's own handling                    |

What was tried: a spring-and-scale CSS override plus a small client effect that recorded the last clicked trigger and set `--clerk-modal-x` and `--clerk-modal-y` on the popup. It worked and was sampled frame by frame (the modal grew out of the trigger and returned to it on close), but it needs JS outside the theme's CSS, so it was dropped. Doing it properly belongs in Mosaic, not the theme:

- A `Dialog` that exposes the trigger's offset as CSS variables (or an `origin` option) so any theme can use them.
- Motion tokens for the spring curves (see the spring motion tokens item below).

Curves used: enter `linear(0, 0.1495, 0.3955, 0.6061, 0.7562, 0.8542, 0.9148, 0.9512, 0.9724, 0.9846, 0.9914, 0.9953, 0.9974, 0.9986, 0.9992, 1, 1)` over 500ms; exit `linear(0, 0.4615, 0.8176, 0.9471, 0.9858, 0.9964, 0.9991, 1)` over 250ms (generated from `motion` 12.38).

## Tabled: Mosaic changes worth making

Ranked by impact for theming. Severity is how fragile the theme workaround is, effort is the Mosaic work.

| #   | Change                                                                                                                                        | Why                                                                                                                                        | Severity | Effort | Risk           |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------ | -------------- |
| 1   | A supported override layer (`@layer` contract) instead of a theme scope padded with eight `:not(#\#)` repeats                                 | StyleX dev output carries specificity boosts that beat normal selectors                                                                    | High     | M      | Low            |
| 2   | Semantic tokens for menu vs page surface, frame surface, control and popup radius, focus halo, press scale, shadow rings                      | The theme repeats these values about 280 times                                                                                             | High     | M      | Low (additive) |
| 3   | Promote private sizing vars to documented `--cl-*` tokens (`--_cl-switch-thumb/travel/stretch`, `--_cl-button-radius`, `--_cl-table-surface`) | Theme depends on private names                                                                                                             | High     | S–M    | Low            |
| 4   | Card goes flat when enclosed by a popover or dialog; surfaces carry a `data-surface` attribute                                                | The switcher popup showed a 16px card inside an 8px popup; the theme needs ancestor selectors to tell page, dialog and popover cards apart | Medium   | S      | Low            |
| 5   | Device icons (`DeviceLaptop`, `DevicePhone` and similar) use `currentColor`                                                                   | Hard-coded fills render as black blobs in dark mode, with or without the theme                                                             | Medium   | S      | Low            |
| 6   | Add slots: Pagination layout, control group and page size; OTP caret; Card "Secured by Clerk" row                                             | Unclassed wrappers cannot be styled                                                                                                        | Medium   | S      | Low            |
| 7   | Button focus rings via the same tokens as text-field focus                                                                                    | Keyboard focus on buttons stays brand purple                                                                                               | Low      | S      | Low            |
| 8   | Tokenize the Flow step transition (or adopt the sequential crossfade as the default)                                                          | The theme re-times `.cl-flow-root` and `.cl-flow-step`; Mosaic scales from 0.96 and overlaps steps                                         | Medium   | M      | Medium         |
| 9   | Dialog frame variant with an inset panel and `--cl-dialog-inset`                                                                              | Theme hand-computes concentric radii and the close-button inset                                                                            | Medium   | M      | Low            |
| 10  | Table shell that includes pagination, plus a row-actions hover state                                                                          | Theme joins pagination to the shell and reveals the ellipsis with `:has()`                                                                 | Medium   | M      | Low            |
| 11  | Spring motion tokens (`--cl-ease-spring-*`)                                                                                                   | Nine `linear()` curves are inlined, generated from `motion` 12.38                                                                          | Low      | S      | Low            |
| 12  | Backdrop image token                                                                                                                          | The dots overlay is two inline PNG data URIs (about 1.8 KB each) set by overriding `.cl-dialog-backdrop`                                   | Low      | S      | Low            |

## Tabled: component gaps the theme cannot reach

| Gap                   | Note                                                                                                                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spinner               | Ceramic is 8 dots plus an arc; Mosaic is a bordered ring. Only size and speed match                                                                                                          |
| Toast                 | No action button; stack math is driven by inline vars                                                                                                                                        |
| Drawer                | Keeps its grabber and swipe math; Ceramic's header is flat                                                                                                                                   |
| TagInput              | Mosaic renders tags inside the field, Ceramic renders them below a plain input                                                                                                               |
| Billing history       | Hand-rolled native `<select>` and inline prev/next (the theme restyles the select under `.cl-section-group`); a move to `Table`, Mosaic `Select` and `Pagination` is being redone separately |
| Member requests       | Inline Accept and Decline with no confirm or success toast; Ceramic uses a hover-revealed menu, a decline confirm and a toast                                                                |
| Switcher, user button | Ceramic's popover surface is the page color in dark; plain menus use the lighter menu color                                                                                                  |

## Tabled: Mosaic ports that were built and dropped from this branch

| Item                                        | What it was                                  | Why it was dropped                                                                                                      |
| ------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `InputGroup.Start`/`End` `variant='filled'` | A Mosaic variant for the tinted add-on cell  | Conflicted with the Figma spacing work on the same files. The theme tints text-only add-ons itself with `:not(:has(*))` |
| Billing history on `Table`                  | Replace the inline table with Mosaic `Table` | Unfinished; being redone                                                                                                |

## Unverified

- Live Sandbox (`/live`, `/sign-in`, `/sign-up`) under the theme needs Clerk keys in `.env.local`.
- Section container rules (gray frame, inset body, dividers) may overlap `Section.Frame` and `Section.Footer` once those land.
- Select trigger against the trigger interactions in Mosaic (hover icon color, hover border color); the theme sets its own ring and background.
- Swingset already loads Geist through `next/font` and the theme uses it first. Suisse, the Dashboard's other face, is licensed and not bundled, so glyph metrics for it depend on the fallback stack.

## Open decisions

- Should the Ceramic spacing values in "differs from Mosaic's spacing" become token overrides, stay out, or go to design?
- Should sign-in and sign-up stay on Mosaic's card look, or get the page-card look behind a `data-surface` attribute?
