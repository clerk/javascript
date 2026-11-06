# Theming

Read this when you add a component, or change a token, a part's `.cl-<slot>` class or `data-<axis>` attributes, `MosaicProvider`, or the CSS build. It covers the styling contract consumers rely on; how to write the styles behind it is in [StyleX](stylex.md).

Worked example: `src/components/button/`.

## Rules

- Consumers style a part through its `.cl-<slot>` class, its `data-<axis>` attributes and the `--cl-*` tokens, never through StyleX's hashed `x…` atoms. All three are public API.
- A part takes no `className` or `style` prop. Code inside Mosaic nudges a part with `xstyle`, declared in its own `*.styles.ts`.
- Every new component is exported from `src/styles/index.ts`, or its CSS never ships.
- Light and dark come from `light-dark()` in the token value. There is no theme object and no re-render on a theme change.
- Mosaic uses StyleX, never Emotion: no `css` prop, no `styled`, no theme callbacks.

## The contract

Mosaic is authored with StyleX, which compiles every style to one static stylesheet at build time, so there is no CSS-in-JS runtime. Swingset's dev server is the exception: it turns on StyleX's `runtimeInjection` so edits hot-reload.

`themeProps(slot, variants)` in `src/props.ts` gives every part:

- `class="cl-<slot>"`, the part's identity (`.cl-button`, `.cl-item-label`)
- `data-<axis>="<value>"` for a resolved variant (`data-variant="outline"`, `data-size="sm"`)
- `data-<state>` for a boolean state or variant, present only when true (`data-interactive=""`)

A theme targets those from plain CSS:

```css
.cl-button[data-size='sm'] {
  border-radius: 4px;
}
```

The `--cl-*` tokens are a second, independent lever: any of them can be overridden at `:root` or any scope to re-theme without touching a component. A derived token resolves where it is declared, so a scoped override of `--cl-color-brand` leaves `--cl-color-brand-alpha-*` and the tokens built on them on the `:root` value. Override a seed at `:root`, or override its derived tokens in the same scope.

A theme's CSS wins without any prop because the consumer imports the sheet into a cascade layer (`@import '@clerk/mosaic/styles.css' layer(components)`), and an unlayered rule beats a layered one.

## Tokens

Tokens are `stylex.defineVars` groups in `src/tokens.stylex.ts`, one exported `*Vars` const per group; the file is the list, and its comments explain each group. Keys that start with `--cl-` are emitted verbatim, so they are stable handles. `space` keys are not `--cl-*` names, so its steps are hashed and internal. The derived name unions (`ColorVarName`, …) live in `src/styles/index.ts`, because a `.stylex.ts` file may export only define-primitives.

The color model, which decides which token a new style uses:

- **Seeds.** `--cl-color-page`, `-neutral`, `-brand`, `-negative`, `-positive` and `-warning`. Only the seeds and the `-foreground` pairs are set by hand; the rest derive from them, so retinting a seed retints its companions.
- **No gray scale.** Every achromatic token is `--cl-color-neutral` mixed into `--cl-color-surface`, so a warm-gray neutral retints the whole ramp.
- **Three tiers.** `--cl-color-page` is the shell of a settings surface and the darkest layer. `--cl-color-surface` is everything raised on it: cards, sections, menus, popovers, dialogs and controls. `--cl-color-surface-subtle` is the faded step on a surface, for footers, tiles and striped rows. The surface derives from the page; override it directly only to change how far cards sit above the shell. All three are solid, never alpha.
- **Accent shape.** Brand and each status has the seed, `-foreground`, `-subtle`, `-border` and `-alpha-100|200|300` washes. Neutral has the same slots as `--cl-color-surface-subtle`, `--cl-color-neutral-subtle` and `--cl-color-border`.
- **Borders are washes.** `--cl-color-border` (controls) and `--cl-color-border-subtle` (containers and dividers) keep the same step on every tier.

## Composing a part

A part fuses its contract, its atoms and its caller's props in one `mergeStyleProps` call (`src/components/button/button.tsx`):

```tsx
const props = mergeStyleProps(
  themeProps('button', { color, variant, size, disabled }),
  stylex.props(reset.base, styles.base, variants[`${variant}-${color}`], xstyle),
  rest,
);
```

`mergeStyleProps` applies its bags in order: contract, then atoms, then the caller's props. It concatenates `className`, shallow-merges `style`, and lets the later bag win for anything else. `rest` goes through the merge rather than a trailing spread because a `render` source (`Dialog.Title render={<Heading />}`) hands its own `className` and `style` to the part; a spread would clobber the part's class.

Type a part's props with `MosaicElementProps<Tag>` or `MosaicComponentProps<Tag>` from `src/props.ts`. They drop `className` and `style` and add `xstyle`, so the caller's only lever is atoms composed last in `stylex.props`. [StyleX](stylex.md#typing-a-part) has the rules for using them.

`src/styles/reset.styles.ts` holds per-element resets, so a component does not re-declare UA normalization. `rtl.mirror` flips a direction-aware icon under a `dir="rtl"` ancestor; the icon registry has no mirrored twins.

## MosaicProvider

Components render and style without a provider. `MosaicProvider` (`src/mosaic-provider.tsx`) exists for four things:

- **Icons.** `icons={{ 'chevron-right': <MyChevron /> }}` swaps a glyph by its `iconName`, and `Icon` applies Mosaic's sizing to the replacement. Outside a provider every icon renders the glyph it was given. Shipped code imports each glyph directly so the bundle carries only the glyphs in use; `iconRegistry` is for catalogs and tests and must not be imported from shipped code.
- **Localization.** The `localization` prop; see [Views → Where the strings live](views.md#where-the-strings-live).
- **Direction.** It mounts `DirectionProvider` from its `direction` prop; see [Headless → Reading direction](headless.md#reading-direction).
- **Toasts.** It mounts `ToastProvider`.

## CSS build

`src/styles/index.ts` is a StyleX-only barrel of every component, token group and styling helper. The build walks it with the StyleX rollup plugin and extracts one `dist/styles.css`, exported as `@clerk/mosaic/styles.css`. Run it with `pnpm build` in `packages/mosaic`.

Swingset consumes Mosaic from source instead. `@stylexjs/unplugin/webpack` in its `next.config` compiles the StyleX calls, and `@stylexjs/postcss-plugin` extracts the CSS by replacing `@stylex;` in `globals.css`. Both contexts must use the same StyleX babel version and options, or the atom hashes will not line up.

Both contexts set `useCSSLayers: true`: StyleX emits `@layer priorityN` for its own precedence, and the consumer's `@import … layer()` picks the outer layer. Both pin lightningcss targets (`stylex-lightningcss.config.mjs`) to browsers with native `light-dark()` and `oklch()`, so the token colors are not down-leveled into an invalid polyfill.
