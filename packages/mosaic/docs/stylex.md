# StyleX

Read this when you write or change a `*.styles.ts` or `*.stylex.ts` file, or the atoms a component composes. It covers file layout, tokens in use, atoms, conditions, dynamic styles and how a part's props are typed; the public contract those styles produce (`.cl-<slot>`, `data-<axis>`, `--cl-*`) and the CSS build are in [Theming](theming.md).

Worked example: `src/components/button/` (`button.styles.ts` and `button.tsx`).

## Rules

- Styles live in a co-located `<comp>.styles.ts`, never inline in a `.tsx`, even for a few atoms. No lint rule enforces this, so a few files still break it; do not copy them.
- A `.stylex.ts` file exports only `defineVars`, `defineConsts` and `defineMarker` results (the `enforce-extension` lint rule).
- Reference tokens by bracket string key (`colorVars['--cl-color-brand']`, `space['2']`). A computed key defeats static analysis and does not compile.
- `stylex.create` values are literals, same-file locals or `.stylex` tokens. A helper imported from another module cannot be inlined, so there is no `space(n)` or `hover()` helper; write `calc()` and selectors inline.
- One `stylex.props(...)` per element, fused through one `mergeStyleProps` call, with the caller's `xstyle` last. Do not forward `xstyle` to an internal slot element.
- Every condition is a value key inside the property it modifies, never a top-level key (only `::before` and `::after` sit at the top level).
- No manual `@layer` inside `create`; StyleX owns layering. Register a typed custom property with `stylex.types.*` in a `*.vars.stylex.ts` (`scroll-area.vars.stylex.ts`), not a raw `@property`. `stylex.firstThatWorks` and `stylex.attrs` are not used.
- Prefer CSS-native solutions to JS workarounds for anything StyleX supports: `color-mix()`, `light-dark()`, `:has()`, `@starting-style`, `anchor-size()`, `stylex.keyframes`, CSS counters.

## File layout

| File                              | Holds                                                                |
| --------------------------------- | -------------------------------------------------------------------- |
| `tokens.stylex.ts`                | `defineVars` and `defineConsts` (the tokens)                         |
| `<comp>/<comp>.styles.ts`         | `stylex.create` for this component                                   |
| `styles/<family>.styles.ts`       | Atoms several components share                                       |
| `<comp>/<comp>.markers.stylex.ts` | `stylex.defineMarker()` results for scoped ancestor states           |
| `<comp>/<comp>.vars.stylex.ts`    | Component-scoped `defineVars`, such as typed properties              |
| `<comp>/<comp>.tsx`               | The component; spreads `stylex.props(...)` through `mergeStyleProps` |
| `props.ts`                        | `themeProps`, `mergeStyleProps` and the `Mosaic*Props` types         |

When several components render the same visual surface, hoist the atoms into `styles/<family>.styles.ts` rather than copying them (`Input`, `OTP`, `InputGroup` and `TagInput` share `styles/input.styles.ts`). Check `styles/` for an existing family first, and never put a shared style file under `components/`.

Pick `rtl.mirror` (`styles/rtl.styles.ts`) by meaning, not shape: a forward or back chevron mirrors; a dropdown chevron or an external-link arrow does not.

## Tokens in use

The token groups and the color model are in [Theming → Tokens](theming.md#tokens). Check `tokens.stylex.ts` before writing a literal: elevation, for example, comes from `shadowVars`.

- Put light and dark in one value with `light-dark()`. Never ship a second `@media (prefers-color-scheme: dark)` copy of a color.
- `--cl-*` keys are the public, overridable contract. Name an internal var with `--_cl-*` (such as a value a parent writes for a child): it still emits verbatim, but the `_` says it is not a contract.
- Only `--cl-spacing` is public; the `space` steps are hashed (`gap: space['2']`).
- Pick radii from `radiusVars`. `--cl-radius-md` is the control radius; a surface wrapping controls takes a larger step so the corners nest ([Nested radii](#nested-radii)).
- Compute tints at the call site with `color-mix()` or `calc()` from an existing token. Do not mint a per-step token like `--cl-color-brand-hover-12`.
- Do not give one value two public names. The focus ring's color is `--cl-color-ring` and nothing else; an alias would let a consumer override one and not the other.
- A wash on top of an unknown backdrop (hover on a transparent `outline` or `ghost` control) uses the `--cl-color-neutral-alpha-*` tokens, not a percentage of a gray. A gray token is a 900, not black, so a percentage of it lands differently on each surface; the alpha scrim composites the same everywhere.

## Atoms

Split `stylex.create` by concern into small named objects and compose them in one `stylex.props` call:

- a **base** object for the structure the slot always has
- **variant maps** keyed by a prop value
- small **state** objects applied with `&&` or a ternary

```ts
stylex.props(styles.base, variants[variant], sizes[size], isIconOnly && styles.iconOnly, xstyle);
```

Do not put everything in one object, and do not go the other way into one object per property. Do not branch a variant inside a style (`variant === 'primary' ? a : b`); a repeated ternary is a missing variant map. A helper that assembles a slot may return an array of atoms for the caller to spread.

### Multiplying axes: flatten, don't plumb vars

When two axes multiply (`color` × `variant`), flatten the cross product into one map keyed `<axis-a>-<axis-b>` and index it with ``variants[`${variant}-${color}`]``. The template-literal key makes an unhandled pair a compile error (`button.styles.ts`). Hoist a value shared across cells into a same-file `const`, which StyleX inlines at build.

Do not have one axis write custom properties for the other to read, whether as raw vars in `create` or through `defineVars` and `createTheme`. They land in the stylesheet and on every instance in devtools, which reads as public API nobody agreed to support.

A var is still right when a value must cross an element boundary (a parent computes, a descendant reads) or collapse an unbounded value into one atom ([Dynamic styles](#dynamic-styles)).

### Nested radii

A part inset from a rounded surface gets its radius from that surface: `max(0px, calc(outer - border - padding))`. Do not pick a fixed step, or it stops matching when `--cl-radius-*` or `--cl-spacing` is overridden. This applies to small insets. When the inset is about as large as the outer radius or larger (Card content, TagInput tags), the part keeps its own radius.

- **Same component:** declare the outer radius, border and padding as local consts, and use them in both the surface and the calc, so changing any of them updates the inner radius (`components/select/select.styles.ts`).
- **Different component:** the parent computes the radius from the same consts and sets a `--_cl-*-radius` var, and the child reads it with a fallback (`--_cl-button-radius` in `components/action-bar/action-bar.styles.ts` and `components/button/button.styles.ts`).

Do not add a shared `concentric()` helper or a global surface-radius var. A global var inherits into nested surfaces and gives them the wrong value.

## Conditions and state

Use conditional-value objects: a `default` plus pseudo and at-rule keys.

```ts
backgroundColor: {
  default: colorVars['--cl-color-brand'],
  ':active': primaryActive,
  '@media (hover: hover)': {
    default: null,
    ':hover:not(:active)': primaryHover,
  },
},
```

- Guard `:hover` behind `@media (hover: hover)` so it never sticks on touch. Leave `:active`, `:focus-visible` and `:disabled` unguarded.
- Write the guarded hover as `':hover:not(:active)'`. StyleX gives an at-rule extra priority by repeating the class, so a media-wrapped `:hover` outranks a bare `:active` and a pressed button on a mouse device never shows its pressed color. Keep the bare `':active'` outside the media query, since it is the only pressed state a no-hover device sees, and do not re-declare it inside. The same applies to any state pair where one side is in an at-rule. To confirm, run `pnpm build` in `packages/mosaic` and compare the two selectors in `dist/styles.css`.
- A disclosure trigger keeps its pressed fill while `[data-open]`, and its hover also excludes `:not([data-open])` (`button.styles.ts`).
- Use `default: null` when a property exists only in a state branch, so the atom emits no base value that would clobber a merged style: `boxShadow: { default: null, ':focus-visible': focusShadow }`.

### Focus, motion, touch, disabled

- **Focus.** Never write a ring by hand. Compose `focusOutline.visible` (the element's own keyboard focus) or `focusOutline.within` (a container that rings when a child is focused) from `styles/focus-outline.styles.ts`. The ring's width, style, color and offset come from `--cl-focus-outline-*` and `--cl-color-ring`. It uses `:focus-visible` and `:has(:focus-visible)`, never `:focus-within`, which also matches a mouse click. The file header explains the longhands and the `Input` exception.
- **Motion.** Durations and easings come from `durationVars` and `easingVars`; which fits which change, and the reduced-motion gate, are in [Motion](motion.md).
- **Touch.** Floor an interactive control's hit area at `--cl-target-coarse` under `(pointer: coarse)` with the `touchTarget` atom, plus `touchTargetIcon` for square controls (`button.styles.ts`).
- **Disabled.** Do not use `pointer-events: none`. Gate `:hover` and `:active` on `:not([data-disabled])`, not `:enabled`, and pressed also on `:not([data-pending])` (reasons in `button.styles.ts`).
- **State attributes.** Reflect a runtime condition the component owns (disabled, selected, invalid) as a `data-<axis>` through `themeProps`, as well as in the atom, so consumer CSS can override it.
- `*.styles.ts` files are exempt from the repo's media-query lint rule.

### State on another element

- **The element's own `data-*`:** wrap it in `:where(...)`, because a conditional key must start with `:` or `@`. `opacity: { default: 1, ':where([data-starting-style], [data-ending-style])': 0 }` (`popover.styles.ts`; the reasons are in [Motion](motion.md)).
- **An ancestor's state:** use `stylex.when.ancestor(selector, marker)` with a marker from a `*.markers.stylex.ts`, so the selector is scoped to your subtree and an unrelated ancestor cannot trigger it. Apply the marker atom to the ancestor (`select.markers.stylex.ts` and `select.styles.ts`).

## Dynamic styles

A style key can be a function of a runtime value: `stylex.create({ width: (w: string) => ({ width: w }) })`, applied as `dyn.width(value)`. Use it for a continuous, per-instance or formula-derived value: an avatar size, a drag transform, a tree indent, a line clamp, a stagger delay. A closed set (sm, md, lg) is a variant map, and a static token is a static atom.

There are two shapes. Each distinct argument emits an atom, so bound the set or use the first:

- **Write a `--_cl-*` var and let a static rule read it.** One atom no matter how many values flow through, and a `var()` in a class does not beat a consumer's `@media` override the way an inline style would. Use this when the value feeds a rule with media or pseudo variants, is read by descendants (`--_cl-content-width`), or must stay overridable.
- **Set the property directly** when only this element uses the value and nothing needs to read or override it (a live drag `transform`, `WebkitLineClamp`).

## Typing a part

The contract `themeProps` and `mergeStyleProps` produce is in [Theming → Composing a part](theming.md#composing-a-part).

- A part takes atoms through `xstyle`. Only a native element spreads `stylex.props(...)`. Lint flags both mistakes outside `src/primitives/**`. Why `XStyle` is wider than `StyleXStyles` is in `props.ts`.
- Type every part with `MosaicComponentProps<Tag>`, or `MosaicElementProps<Tag>` when it has no `render`. They drop `color`, so a callback's props spread into a part whose `color` is a variant union.
- Do not type a part with the headless `ComponentProps<Tag>` or `React.ComponentPropsWithoutRef<typeof Primitive.X>`. Those keep `color: string`, and every consumer then has to strip it.
- Do not re-export a headless part onto the Mosaic namespace (`Popover.Trigger = Primitive.Trigger`), which leaks the wide type. Bridge it with a `forwardRef` typed `MosaicComponentProps<'button'>`.
- If a consumer has to annotate a `render` callback, the part's props type is wrong; fix it there.
