# Mosaic Design System Architecture

## Overview

Mosaic is the next-generation design system for Clerk's UI components, replacing the existing styled system. Both systems coexist during migration — Mosaic lives under `packages/ui/src/mosaic/` as a self-contained module that doesn't touch any existing code.

Mosaic components are authored with **StyleX** (`stylex.create` plus the `themeProps` / `mergeStyleProps` helpers in `props.ts`). StyleX compiles the styles out to a static stylesheet at build time, so Mosaic ships no CSS-in-JS runtime and does not use Emotion. (Swingset's dev server is the one exception: it enables StyleX's `runtimeInjection` so edits hot-reload.)

The public styling contract is a **stable per-slot class** plus **`data-<axis>` attributes**: a part emits `class="cl-<slot>"` for its identity (`.cl-button`, `.cl-item`) and `data-<axis>="<value>"` / presence `data-<state>` for its variants and state. Consumers target those, never StyleX's hashed atoms; tokens ship as overridable `--cl-*` custom properties.

Once migration is complete, the old system is removed and Mosaic becomes the sole design system.

## Token architecture

Tokens are CSS custom properties declared through `stylex.defineVars` in `tokens.stylex.ts`. Each var is named explicitly (`'--cl-color-primary'`, not a generated hash) so it is a stable, documented handle a consumer can override:

```ts
// packages/ui/src/mosaic/tokens.stylex.ts
export const colorVars = stylex.defineVars({
  '--cl-color-primary': 'light-dark(oklch(0.205 0 0), oklch(0.922 0 0))',
  '--cl-color-primary-foreground': 'light-dark(oklch(0.985 0 0), oklch(0.205 0 0))',
  // …
});
```

Groups: `colorVars`, `radiusVars`, `targetVars`, `scrollbarVars`, `scrollFadeVars`, `spacingVars`, `space`, `typeScaleVars`, `fontFamilyVars`, `fontWeightVars`, `durationVars`, `easingVars`.

Light and dark come from CSS `light-dark()` on the default values, so there is no theme object and no re-render on theme change — the browser resolves it.

`@stylexjs/enforce-extension` requires a `.stylex.ts` file to export nothing but its `defineVars` results, so the derived token-name unions (`ColorVarName`, `RadiusVarName`, …) live in `styles/index.ts` as `keyof typeof colorVars`.

## Public styling API

Every Mosaic part carries a **stable class** and reflects its variants and state as **data attributes** — no hashed classnames or registry keys to learn. `themeProps(slot, variants)` (in `props.ts`) emits:

- `class="cl-<slot>"` — the slot identity (`.cl-button`, `.cl-item`, `.cl-item-label`)
- `data-<axis>="<value>"` — the resolved variant (`data-variant="outline"`, `data-size="sm"`)
- `data-<state>` — boolean state or boolean variant, presence-only (`data-interactive=""`); omitted when the value is false/null

Consumers target the class and its attributes, never StyleX's hashed `x…` atoms.

Two ways to style a part — both hit the same class + attributes:

```css
/* 1. Plain CSS / stylesheet */
.cl-button {
  border-radius: 8px;
}
.cl-button[data-size='sm'] {
  border-radius: 4px;
}
.cl-item[data-interactive] {
  background-color: var(--cl-color-card);
}
```

```tsx
// 2. className / style props — merged onto the element by `mergeStyleProps`, applied last so they win
<Button
  className='MyButton'
  style={{ borderRadius: 12 }}
/>
```

Tokens are a third, independent lever: every `--cl-*` custom property (`--cl-color-*`, `--cl-radius-*`, `--cl-font-family-sans`, `--cl-spacing`) can be overridden in plain CSS at `:root` or any scope to re-theme without touching a component.

State styling uses real class + attribute-selector specificity — no `&&` boost, no data-attr-vs-class ambiguity.

## MosaicProvider

Mosaic components need no provider to render or to be styled — the stylesheet and the `--cl-*` tokens do that work. `MosaicProvider` exists for one thing: per-name icon glyph overrides.

```tsx
import { MosaicProvider } from '../mosaic/MosaicProvider';

<MosaicProvider icons={{ 'chevron-right': <MyChevron /> }}>{children}</MosaicProvider>;
```

`<Icon name='chevron-right' />` renders the override in place of the built-in glyph and applies Mosaic's own sizing props to it, so a swapped glyph stays visually consistent with the rest. Outside a provider, `useMosaicIcons()` returns `{}` and every icon falls back to `iconRegistry`.

## Component authoring pattern

Styles are declared once per component with `stylex.create`, keyed off the same axes the component exposes as props, then fused with `themeProps` output and the consumer's `className`/`style`:

```tsx
const styles = stylex.create({
  base: { display: 'inline-flex', borderRadius: radiusVars['--cl-radius-md'] },
});

// `color` and `variant` are independent props, but every pair resolves to one style, so they are
// keyed compositely rather than merged at render time.
const variants = stylex.create({
  'filled-primary': { backgroundColor: colorVars['--cl-color-primary'], borderColor: 'transparent' },
  'filled-negative': { backgroundColor: colorVars['--cl-color-negative'], borderColor: 'transparent' },
  'outline-primary': { backgroundColor: 'transparent', borderColor: colorVars['--cl-color-primary'] },
  'outline-negative': { backgroundColor: 'transparent', borderColor: colorVars['--cl-color-negative'] },
});

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { color = 'primary', variant = 'filled', size = 'md', disabled, className, style, ...rest },
  ref,
) {
  const props = mergeStyleProps(
    themeProps('button', { color, variant, size, disabled }),
    stylex.props(reset.base, styles.base, variants[`${variant}-${color}`]),
    className,
    style,
  );
  return (
    <button
      ref={ref}
      disabled={disabled}
      {...props}
      {...rest}
    />
  );
});
```

`mergeStyleProps` applies its arguments in order — stable class + data attrs, then StyleX atoms, then the consumer's `className` and `style`. Only `style` wins by that ordering: it is an inline style, which outranks any stylesheet rule. A consumer's `className` wins for a different reason — class order inside the attribute has no effect on the cascade, so the consumer's rule wins because the Mosaic sheet is imported into a cascade layer (`@import '@clerk/ui/styles.css' layer(components)`) and an unlayered rule beats any layered one.

`components/reset.styles.ts` holds the per-element resets so a component does not re-declare UA-normalization.

For the full StyleX authoring rules (token usage, the local `s(n)` spacing helper, the CSS build), see the `mosaic` Claude Code skill's `references/stylex.md`.

## CSS build

`styles/index.ts` is a StyleX-only barrel re-exporting every Mosaic component, the token groups, and the styling helpers. `tsdown.mosaic.config.mts` walks that graph with the StyleX rollup plugin and extracts one static `dist-mosaic/styles.css`. A component is not shipped until it is exported from that barrel.

Run it with `pnpm build:mosaic` in `packages/ui`.

## Flow and data architecture

Mosaic flow UI follows a **machine → controller → view** split. This keeps Clerk resource logic out of visual components and makes most behavior testable without a running Clerk app.

```text
machine
  Pure flow rules: states, events, guards, async invokes, errors.
  No React hooks. No Clerk hooks. No Clerk resource objects.

controller
  Clerk/data adapter: reads Clerk hooks/resources, injects async effects, derives actor-driven view props.
  This is the only layer in the flow that may import Clerk hooks or call Clerk resource methods.

view
  Rendering only: receives a snapshot plus explicit props, renders UI, sends events.
  No Clerk imports. No data-fetching hooks. No mutation calls.
```

### File shape

Flow slices should be split by role:

```text
delete-organization.machine.ts        // pure state machine
delete-organization.controller.tsx     // Clerk/mock adapter + actor wiring
delete-organization.view.tsx           // view-only rendering
delete-organization.tsx                // thin composition wrapper
```

The exported component composes the controller and view:

```tsx
export function DeleteOrganization() {
  const controller = useDeleteOrganizationController();
  // Render nothing until the controller is ready (mirrors the legacy sections,
  // which gate their own visibility and show no skeleton).
  if (controller.status !== 'ready') {
    return null;
  }

  return (
    <DeleteOrganizationView
      snapshot={controller.snapshot}
      send={controller.send}
      canSubmit={controller.canSubmit}
    />
  );
}
```

### Machines

Machines own the flow rules. For destructive confirmation flows, the confirmation input value and the guard live in the machine, not the view block:

```ts
export type DeleteOrgEvent =
  | { type: 'OPEN' }
  | { type: 'TYPE_CONFIRMATION'; value: string }
  | { type: 'CONFIRM' }
  | { type: 'CANCEL' };

CONFIRM: {
  target: 'deleting',
  guard: context => context.confirmationValue === context.organizationName,
}
```

Async effects are injected through context and invoked by the machine:

```ts
deleting: {
  invoke: fromPromise(ctx => ctx.destroyOrganization(), {
    onDone: 'deleted',
    onError: {
      target: 'confirming',
      actions: assign((_, event) => ({ error: String(event.error) })),
    },
  }),
}
```

Machine tests should use `createActor()` directly. They should not render React and should not require Clerk fixtures.

### Controllers

Controllers are the adapter from Clerk resources into machine context and view props. They may call hooks like `useOrganization()` and inject live resource methods:

```tsx
export function useDeleteOrganizationController() {
  const { isLoaded, organization } = useOrganization();
  const [snapshot, send, actor] = useMachine(deleteOrgMachine, {
    context: {
      organizationName: organization?.name ?? '',
      destroyOrganization: () => organization?.destroy() ?? Promise.resolve(),
    },
  });

  if (!isLoaded || !organization) {
    return { status: 'loading' as const };
  }

  return {
    status: 'ready' as const,
    snapshot,
    send,
    canSubmit: actor.can({ type: 'CONFIRM' }),
  };
}
```

Controllers should pass plain data and plain functions into machines. Do not pass Clerk resource objects through to views.

### Views

Views render snapshots and emit events. They receive any derived booleans from the controller, including `actor.can(...)` results, so they do not duplicate machine guards:

```tsx
export function DeleteOrganizationView({ snapshot, send, canSubmit }: DeleteOrganizationViewProps) {
  return (
    <Field.Root>
      <Field.Label>Type {snapshot.context.organizationName} to confirm</Field.Label>
      <Input
        value={snapshot.context.confirmationValue}
        onChange={event => send({ type: 'TYPE_CONFIRMATION', value: event.target.value })}
      />
      {snapshot.context.error ? <Field.Error>{snapshot.context.error}</Field.Error> : null}
      <Button
        color='negative'
        disabled={!canSubmit}
        onClick={() => send({ type: 'CONFIRM' })}
      >
        Delete organization
      </Button>
    </Field.Root>
  );
}
```

View tests should render the view directly with a fake snapshot and fake `send`. They should not use Clerk providers or Clerk fixtures.

## Coexistence with existing system

### Rules

- **Do** author components with StyleX (`stylex.create` + `themeProps` / `mergeStyleProps`)
- **Do not** use Emotion in Mosaic — no `css` prop, no `styled`, no theme callbacks
- **Do** export every new component from `styles/index.ts`, or its CSS never ships
- **Do** import from `src/mosaic/` directly (no barrel files) inside `packages/ui`

### What doesn't share

- Styling engine — StyleX (static CSS) vs Emotion (runtime CSS-in-JS)
- Tokens — `--cl-*` custom properties vs `InternalTheme`
- Variant utility — `stylex.create` + `themeProps` vs `createVariants`
- Styling contract — `.cl-<slot>` class + `data-<axis>` attributes vs the legacy `customizables` / `APPEARANCE_KEYS` registry

## Migration guide

To migrate a component from the old system to Mosaic:

1. Replace `createVariants` with `stylex.create` — one style key per variant value, selected by the prop at render time instead of merged by a runtime engine.
2. Replace `applyVariants(props)` with `mergeStyleProps(themeProps(slot, variants), stylex.props(...), className, style)` and spread the result onto the element.
3. Move stateful styling (disabled/hover/focus/invalid) into StyleX conditions. A condition is a key _inside a property's value object_ alongside `default`, never a top-level style key, and an attribute selector must be wrapped in `:is(...)`:

   ```ts
   cursor: { default: 'pointer', ':is([data-disabled])': 'not-allowed' },
   ```

4. Update token references — e.g. `theme.colors.$primary500` → `colorVars['--cl-color-primary']`.
5. Export the component from `styles/index.ts` and run `pnpm build:mosaic`.

The steps above cover the **styling** migration. For **flow** components — where the legacy component also fuses data-fetching and flow logic — splitting that logic into the machine/controller/view layers and verifying no implicit behavior is dropped is its own end-to-end workflow. See the `mosaic` Claude Code skill (`.claude/skills/mosaic/`), in particular its `references/migration.md`.

## Files

| File                                           | Purpose                                                              |
| ---------------------------------------------- | -------------------------------------------------------------------- |
| `src/mosaic/tokens.stylex.ts`                  | `--cl-*` token groups declared with `stylex.defineVars`              |
| `src/mosaic/props.ts`                          | `themeProps`, `mergeStyleProps`, `MosaicComponentProps`              |
| `src/mosaic/MosaicProvider.tsx`                | Provider for the `icons` prop (per-name glyph overrides)             |
| `src/mosaic/icons/overrides.ts`                | `MosaicIconOverrides` type + `useMosaicIcons()` context              |
| `src/mosaic/icons/registry.tsx`                | Built-in glyphs and the `IconName` union                             |
| `src/mosaic/components/reset.styles.ts`        | Per-element UA resets shared by every component                      |
| `src/mosaic/styles/index.ts`                   | StyleX-only barrel — the entry the CSS build walks                   |
| `src/mosaic/machine/`                          | State-machine runtime (`createMachine`, `createActor`, `useMachine`) |
| `src/mosaic/<feature>/*.machine.ts`            | Pure flow rules for a Mosaic feature                                 |
| `src/mosaic/<feature>/*.controller.tsx`        | Clerk/mock data adapters and actor wiring for a Mosaic feature       |
| `src/mosaic/<feature>/*.view.tsx`              | Clerk-free view modules that render snapshots and send events        |
| `src/mosaic/components/reset.test.tsx`         | Reset specs                                                          |
| `src/mosaic/__tests__/MosaicProvider.test.tsx` | Icon-override context specs                                          |
| `src/mosaic/components/button/button.test.tsx` | Component-level slot/state/variant specs                             |
