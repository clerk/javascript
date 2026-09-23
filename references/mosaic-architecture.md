# Mosaic Design System Architecture

## Overview

Mosaic is the next-generation design system for Clerk's UI components, replacing the existing styled system. Both systems coexist during migration — Mosaic ships as `@clerk/mosaic` from `packages/mosaic`, independently of the Emotion-based `@clerk/ui` package.

Mosaic components are authored with **StyleX** (`stylex.create` plus the `themeProps` / `mergeStyleProps` helpers in `props.ts`). StyleX compiles the styles out to a static stylesheet at build time, so Mosaic ships no CSS-in-JS runtime and does not use Emotion. (Swingset's dev server is the one exception: it enables StyleX's `runtimeInjection` so edits hot-reload.)

The public styling contract is a **stable per-slot class** plus **`data-<axis>` attributes**: a part emits `class="cl-<slot>"` for its identity (`.cl-button`, `.cl-item`) and `data-<axis>="<value>"` / presence `data-<state>` for its variants and state. Consumers target those, never StyleX's hashed atoms; tokens ship as overridable `--cl-*` custom properties.

Once migration is complete, the old system is removed and Mosaic becomes the sole design system.

## Token architecture

Tokens are CSS custom properties declared through `stylex.defineVars` in `tokens.stylex.ts`. Each var is named explicitly (`'--cl-color-brand'`, not a generated hash) so it is a stable, documented handle a consumer can override:

```ts
// packages/mosaic/src/tokens.stylex.ts
export const colorVars = stylex.defineVars({
  '--cl-color-brand': 'light-dark(oklch(0.2046 0 0), oklch(0.9851 0 0))',
  '--cl-color-brand-foreground': 'light-dark(oklch(1 0 0), oklch(0.2046 0 0))',
  // …
});
```

Groups: `colorVars`, `radiusVars`, `targetVars`, `scrollbarVars`, `scrollFadeVars`, `spacingVars`, `space`, `typeScaleVars`, `fontFamilyVars`, `fontWeightVars`, `durationVars`, `easingVars`, `focusVars`.

There is no gray scale. Every achromatic token (`--cl-color-foreground`, `-border`, `-background-subtle`, …) is `--cl-color-neutral` (black on light, white on dark) mixed into `--cl-color-background` at a fixed percentage per mode, so overriding neutral to a warm gray retints the whole ramp; in dark mode override `--cl-color-background` too, since the ramp mixes toward it. The `--cl-<color>-alpha-100|200|300` tokens in `colorVars` are washes (6, 8, and 12 percent of `--cl-color-neutral`, `-negative`, `-positive`, and `-warning` over `transparent`); overriding the solid color retints its washes.

Light and dark come from CSS `light-dark()` on the default values, so there is no theme object and no re-render on theme change — the browser resolves it.

`@stylexjs/enforce-extension` requires a `.stylex.ts` file to export nothing but its `defineVars` results, so the derived token-name unions (`ColorVarName`, `RadiusVarName`, …) live in `styles/index.ts` as `keyof typeof colorVars`.

## Public styling API

Every Mosaic part carries a **stable class** and reflects its variants and state as **data attributes** — no hashed classnames or registry keys to learn. `themeProps(slot, variants)` (in `props.ts`) emits:

- `class="cl-<slot>"` — the slot identity (`.cl-button`, `.cl-item`, `.cl-item-label`)
- `data-<axis>="<value>"` — the resolved variant (`data-variant="outline"`, `data-size="sm"`)
- `data-<state>` — boolean state or boolean variant, presence-only (`data-interactive=""`); omitted when the value is false/null

Consumers target the class and its attributes, never StyleX's hashed `x…` atoms.

A theme styles a part from CSS, against that class and its attributes:

```css
.cl-button {
  border-radius: 8px;
}
.cl-button[data-size='sm'] {
  border-radius: 4px;
}
.cl-item[data-interactive] {
  background-color: var(--cl-color-background);
}
```

A part exposes no `className` or `style` prop. Inside `@clerk/mosaic`, code that renders a part and needs to nudge it passes StyleX atoms through `xstyle`, declared in its own `stylex.create` and composed last so they win:

```tsx
const styles = stylex.create({ helpText: { textAlign: 'center' } });

<Text
  size='xs'
  xstyle={styles.helpText}
>
  {helpText}
</Text>;
```

Tokens are a second, independent lever: every `--cl-*` custom property (`--cl-color-*`, `--cl-radius-*`, `--cl-font-family-sans`, `--cl-spacing`) can be overridden in plain CSS at `:root` or any scope to re-theme without touching a component.

State styling uses real class + attribute-selector specificity — no `&&` boost, no data-attr-vs-class ambiguity.

## MosaicProvider

Mosaic components need no provider to render or to be styled — the stylesheet and the `--cl-*` tokens do that work. `MosaicProvider` exists for two things: per-name icon glyph overrides and localization.

```tsx
import { MosaicProvider } from './MosaicProvider';

<MosaicProvider icons={{ 'chevron-right': <MyChevron /> }}>{children}</MosaicProvider>;
```

`<Icon name='chevron-right' />` renders the override in place of the built-in glyph and applies Mosaic's own sizing props to it, so a swapped glyph stays visually consistent with the rest. Outside a provider, `useMosaicIcons()` returns `{}` and every icon falls back to `iconRegistry`.

## Component authoring pattern

Styles are declared once per component with `stylex.create`, keyed off the same axes the component exposes as props, then fused with `themeProps` output and the props the component was called with:

```tsx
const styles = stylex.create({
  base: { display: 'inline-flex', borderRadius: radiusVars['--cl-radius-md'] },
});

// `color` and `variant` are independent props, but every pair resolves to one style, so they are
// keyed compositely rather than merged at render time.
const variants = stylex.create({
  'filled-primary': { backgroundColor: colorVars['--cl-color-brand'], borderColor: 'transparent' },
  'filled-negative': { backgroundColor: colorVars['--cl-color-negative'], borderColor: 'transparent' },
  'outline-primary': { backgroundColor: 'transparent', borderColor: colorVars['--cl-color-brand'] },
  'outline-negative': { backgroundColor: 'transparent', borderColor: colorVars['--cl-color-negative'] },
});

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { color = 'primary', variant = 'filled', size = 'md', disabled, xstyle, ...rest },
  ref,
) {
  const props = mergeStyleProps(
    themeProps('button', { color, variant, size, disabled }),
    stylex.props(reset.base, styles.base, variants[`${variant}-${color}`], xstyle),
    rest,
  );
  return (
    <button
      ref={ref}
      disabled={disabled}
      {...props}
    />
  );
});
```

`mergeStyleProps` applies its bags in order — stable class + data attrs, then StyleX atoms, then the props the component was called with — concatenating `className`, shallow-merging `style`, and letting the later bag overwrite anything else. `ButtonProps` extends `MosaicElementProps<'button'>`, which omits `className`/`style` and adds `xstyle`, so the caller's only styling lever is StyleX atoms composed last inside `stylex.props`. The `rest` bag still goes through the merge rather than a trailing spread because a `render` source (`Dialog.Title render={<Heading />}`) hands its own merged `className`/`style` to the part it renders; the merge fuses that pair, a spread would clobber the part's own class.

A theme's CSS wins over the Mosaic sheet without any prop: the sheet is imported into a cascade layer (`@import '@clerk/mosaic/styles.css' layer(components)`) and an unlayered rule beats any layered one.

`utils/reset.styles.ts` holds the per-element resets so a component does not re-declare UA-normalization; `utils/typography.styles.ts`, `utils/focus-outline.styles.ts` and `utils/rtl.styles.ts` do the same for the treatments several components share. `rtl.mirror` flips a direction-aware icon (a forward/back chevron, a pagination arrow) under a `dir="rtl"` ancestor; there are no mirrored twins in the icon registry.

For the full StyleX authoring rules (token usage, the local `s(n)` spacing helper, the CSS build), see the `mosaic` Claude Code skill's `references/stylex.md`.

## CSS build

`styles/index.ts` is a StyleX-only barrel re-exporting every Mosaic component, the token groups, and the styling helpers. The Mosaic CSS build walks that graph with the StyleX rollup plugin and extracts one static `dist/styles.css`, exported as `@clerk/mosaic/styles.css`. A component is not shipped until it is exported from that barrel.

Run it with `pnpm build` in `packages/mosaic`.

## Flow and data architecture

Mosaic flow UI follows a **model → controller → view** split. Read it as _where the
data comes from_ → _what the user is doing to it_ → _what that looks like_. What
crosses each boundary is plain data: no Clerk resource reaches the controller, and
no machine snapshot reaches the view.

```text
model
  Clerk adapter. Reads Clerk hooks and resources, resolves the environment, gates
  on permissions, and answers with plain data plus plain callbacks under an
  explicit `status`. The only layer that may import Clerk hooks or call Clerk
  resource methods.

controller
  Local state. Owns the interaction — what is open, what is in flight, what the
  view may do next — held in React state or a state machine, whichever the
  interaction's complexity calls for. Wraps the model's callbacks so an action
  can report pending, hold the surface still while it runs, and close on
  success. No Clerk imports.

view
  Rendering. Receives plain props and callbacks, renders UI, calls them back.
  No Clerk imports. No data-fetching. No mutations. No machine snapshot.
```

A machine is not a layer of its own, and not a requirement. It is one of the two
ways a controller can hold its state, and which one a controller uses is a
complexity call: `useState` for a boolean that never touches async, a machine
once the interaction has an async lifecycle or two values that must change
together. A controller can also do both — a machine for the coordinated subset,
`useState` for the UI-only flags beside it. The choice is invisible from the
outside: the controller returns plain props either way, so the view cannot tell
and neither can its tests. `machine/ADOPTION.md` holds the criteria.

### File shape

A flow slice is split by role, one file per layer, prefixed with the feature name:

```text
user-button.model.tsx        // Clerk adapter — the only file that imports Clerk
user-button.controller.tsx   // local state (React state or a machine) + action wrapping
user-button.view.tsx         // rendering only
user-button.tsx              // composition wrapper and the public props type
```

Supporting files carry the parts that would otherwise bloat those four:

```text
user-button.types.ts         // the data contract the model and view both agree on
user-button.messages.ts      // every string the surface renders, as one `as const` object
user-button.layout.ts        // pure derivation (which affordance goes in which slot)
user-button.utils.ts         // pure helpers
user-button.styles.ts        // `stylex.create` atoms (see the StyleX authoring rules)
```

`*.types.ts` is worth calling out: it holds the data contract so that neither the
model nor the view owns it, and the two cannot drift.

`*.messages.ts` holds strings only, exported as one `<feature>Messages` object
declared `as const` and registered under a namespace in `src/localization/registry.ts`.
Views read their namespace inside the component with `useMessages('userButton')`, so
the `localization` prop on `MosaicProvider` can replace any string; a module-level
helper takes the messages as a parameter rather than importing them.

```tsx
<MosaicProvider localization={{ overrides: { 'userButton.popup.label': 'My account' } }}>{children}</MosaicProvider>;
<MosaicProvider
  localization={{ locale: 'es-ES', messages: esES, overrides: { 'userButton.popup.label': 'Mi cuenta' } }}
>
  {children}
</MosaicProvider>;
```

`messages` is the catalog for `locale`, `overrides` the app's own changes on top, and
English sits under both. `locale` only feeds `Intl.PluralRules`. Strings are resolved
with the helpers in `src/localization/messages.ts`, never with `.replace` or `.split`
on the string:

- `fill(m.trigger.open, { name })` substitutes `{name}` placeholders.
- `plural(m.members, count, locale)` picks a form from `{ one, other, … }` with
  `Intl.PluralRules` for the `locale` from `useLocale()` and fills `{count}`.
- `rich(m.description, { values, components })` renders `{#strong}…{/strong}`
  markup through the component authored for that tag, so the sentence stays in the
  messages file and the view supplies only the element. Markup is for inline
  emphasis a translator may keep or move. A wrapper the view needs for its own
  purposes, such as a countdown span, is passed as an element in `values`, so the
  string only ever sees `{seconds}`.

The helpers are typed from the string itself: `fill` accepts exactly the `{name}`
placeholders the template declares, `rich` exactly the tags it marks up, and
`plural` whatever any of the forms name besides `count`.

Message keys are public surface. `MosaicCatalog` is derived from the registry,
so a consumer's overrides type-check against the real keys, as a dot path
(`'userButton.popup.label'`) or a nested object (`{ userButton: { popup: { label } } }`).
Renaming or moving a key breaks every override that names it; treat it like renaming
a prop.

### Composition

Two shapes, chosen by whether the slice fetches its own data.

**A wrapper composes the layers** when the slice is a connected component. The
wrapper resolves the model, hands it to the controller, and branches on `status`:

```tsx
export function UserButton(props: UserButtonProps = {}) {
  const { renderTriggerLabel, mode, modePriority, fallback, ...options } = props;
  const model = useUserButtonModel(options);
  const controller = useUserButtonController(model, { mode, modePriority });

  if (controller.status === 'loading') {
    return <>{fallback}</>;
  }
  // Signed out is an answer, so the placeholder goes too rather than promising a button.
  if (controller.status === 'hidden') {
    return null;
  }

  const { status: _status, ...viewController } = controller;
  return (
    <UserButtonView
      {...viewController}
      renderTriggerLabel={renderTriggerLabel}
    />
  );
}
```

**A view owns its controller** when the slice is a leaf that takes its effect as a
prop. There is no model: the Clerk call arrives from whoever renders it.

```tsx
export function UserProfileDeleteSectionView({ onDelete }: UserProfileDeleteSectionViewProps) {
  const { isOpen, onOpenChange, onConfirm, isDeleting, errorMessage } = useUserProfileDeleteSectionController({
    onDelete,
  });
  // …render…
}
```

Either way the rule holds: the controller never imports Clerk, and its effects
arrive as injected plain functions.

### Models

The model reads Clerk and answers with a discriminated `status`, so every consumer
branches on one value rather than on a scatter of `isLoaded` flags. Every callback
it exposes is a plain function over plain ids — never a Clerk resource:

```tsx
export type UserButtonModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | (UserButtonData & UserButtonCallbacks & { status: 'ready'; organizationsEnabled: boolean });

export function useUserButtonModel(options?: UserButtonModelOptions): UserButtonModel {
  const { isLoaded: isUserLoaded, user } = useUser();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const clerk = useClerk();
  const environment = useMosaicEnvironment();

  // These all affect layout, so wait for every one and avoid a reshuffle.
  if (!isUserLoaded || !isSessionLoaded || !environment) {
    return { status: 'loading' };
  }
  if (!user || !session) {
    return { status: 'hidden' };
  }

  return {
    status: 'ready',
    activeSession: toSession(session.id, user),
    memberships: membershipData.map(m => toMembership(m.organization)),
    onSelectOrganization: organizationId => clerk.setActive({ organization: organizationId }),
    // Single-session apps cannot hold a second account, so the action is meaningless there.
    onSignOutAll: singleSessionMode ? undefined : () => clerk.signOut(),
  };
}
```

An action the instance does not offer is `undefined` rather than a disabled flag —
the view hides the affordance it drives, so the model never has to describe UI.

### Controllers

The controller is the layer between the view and the outside world. It holds the
local state, wraps the model's actions to drive pending state, keeps the surface
stable while an action runs, and closes the surface on the actions that should
close it.

How it holds that state is a complexity call. `UserButton` earns a machine — an
action is async, `open` and `pendingKey` constrain each other, and dismissing
must not abandon an in-flight invoke — so the machine is declared in the same
file and its context carries the injected effect:

```tsx
const userButtonMachine = createMachine({
  id: 'userButton',
  initial: 'idle',
  context: { open: false, pendingKey: null, run: () => Promise.resolve(), closeOnSuccess: false },
  states: {
    idle: {
      on: {
        OPEN: { actions: assign(() => ({ open: true })) },
        RUN: {
          target: 'busy',
          guard: context => context.open,
          actions: assign((_, event) => ({ pendingKey: event.key, run: event.run })),
        },
      },
    },
    // OPEN/CLOSE have no target so they do not leave this state and abandon the invoke.
    busy: {
      on: { OPEN: { actions: assign(() => ({ open: true })) } },
      invoke: fromPromise(context => context.run(), { onDone: 'idle', onError: 'idle' }),
    },
  },
});

export function useUserButtonController(model: UserButtonModel, options = {}): UserButtonController {
  const [{ context }, send] = useMachine(userButtonMachine);

  if (model.status !== 'ready') {
    return { status: model.status };
  }

  const runAction = (key, fn, closeOnSuccess = false) =>
    fn ? (...args) => send({ type: 'RUN', key: key(...args), run: () => fn(...args), closeOnSuccess }) : undefined;

  return {
    status: 'ready',
    ...data,
    open: context.open,
    onOpenChange: next => send(next ? { type: 'OPEN' } : { type: 'CLOSE' }),
    pendingKey: context.pendingKey,
    onSelectOrganization: runAction(userButtonBusyKeys.selectOrganization, model.onSelectOrganization, true),
  };
}
```

The controller passes the model's `status` through, so the wrapper has one thing to
branch on rather than two.

A controller whose interaction is a single boolean with no async and no second
value to keep in step is the same layer with `useState` inside it — still no
Clerk, still returning plain props:

```tsx
export function useSectionController({ onSave }: { onSave: () => void }) {
  const [isEditing, setIsEditing] = React.useState(false);

  return {
    isEditing,
    onEdit: () => setIsEditing(true),
    onCancel: () => setIsEditing(false),
    onSave: () => {
      setIsEditing(false);
      onSave();
    },
  };
}
```

Reaching for a machine here would produce a two-state machine with one event,
which is a boolean spelled long. Reaching for `useState` in `UserButton` would
produce the flag soup the machine exists to prevent. `machine/ADOPTION.md` has
the criteria and worked before/afters for the calls in between.

### Views

Views take plain props and callbacks. They branch on the props the controller
derived — `open`, `pendingKey`, an absent callback — never on a machine snapshot:

```tsx
export function UserButtonView({ open, onOpenChange, pendingKey, onSignOutAll, ...data }: UserButtonProps) {
  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
    >
      {/* An action the instance does not offer arrives undefined, so the row is simply absent. */}
      {onSignOutAll ? (
        <Item
          onClick={onSignOutAll}
          busy={pendingKey === userButtonBusyKeys.signOutAll()}
        >
          {m.footer.signOutAll}
        </Item>
      ) : null}
    </Popover>
  );
}
```

A **block** is a view fragment that owns one piece of state nothing outside it can
use, and takes the rest as props. `blocks/destructive` is the example: it holds the
half-typed confirmation phrase and compares it, while `open`, `isDeleting`, and
`errorMessage` come from the controller, because those are what decide whether the
dialog closes or explains itself.

### Testing a flow

The split organizes code; it does not call for a test file per layer. A flow is
tested mostly through one integration test: the real wrapper, model, controller,
and view against a mocked `@clerk/shared/react`, driven through the DOM with
`userEvent` and role queries. Unit tests are for pure helpers and machines with
a real input space. Tests never mock a module inside `packages/mosaic`, never
assert machine state or internal keys, and never assert CSS values in jsdom. See
the `mosaic` skill's `references/testing.md` for the rules and recipes.

## Coexistence with existing system

### Rules

- **Do** author components with StyleX (`stylex.create` + `themeProps` / `mergeStyleProps`)
- **Do** type a part's props off `MosaicComponentProps` / `MosaicElementProps`; a part takes `xstyle`, never `className` / `style`
- **Do not** use Emotion in Mosaic — no `css` prop, no `styled`, no theme callbacks
- **Do** export every new component from `styles/index.ts`, or its CSS never ships
- **Do** import from source paths directly (no published subpath barrels) inside `packages/mosaic`
- **Do not** import Clerk hooks or call Clerk resource methods anywhere but a `*.model.tsx`

### What doesn't share

- Styling engine — StyleX (static CSS) vs Emotion (runtime CSS-in-JS)
- Tokens — `--cl-*` custom properties vs `InternalTheme`
- Variant utility — `stylex.create` + `themeProps` vs `createVariants`
- Styling contract — `.cl-<slot>` class + `data-<axis>` attributes vs the legacy `customizables` / `APPEARANCE_KEYS` registry

## Migration guide

To migrate a component from the old system to Mosaic:

1. Replace `createVariants` with `stylex.create` — one style key per variant value, selected by the prop at render time instead of merged by a runtime engine.
2. Replace `applyVariants(props)` with `mergeStyleProps(themeProps(slot, variants), stylex.props(..., xstyle), rest)` and spread the result onto the element. Drop any `className` / `style` props the legacy component accepted; callers pass `xstyle`.
3. Move stateful styling (disabled/hover/focus/invalid) into StyleX conditions. A condition is a key _inside a property's value object_ alongside `default`, never a top-level style key, and an attribute selector must be wrapped in `:is(...)`:

   ```ts
   cursor: { default: 'pointer', ':is([data-disabled])': 'not-allowed' },
   ```

4. Update token references — e.g. `theme.colors.$primary500` → `colorVars['--cl-color-brand']`.
5. Export the component from `styles/index.ts` and run `pnpm build --filter @clerk/mosaic`.

The steps above cover the **styling** migration. For **flow** components — where the legacy component also fuses data-fetching and interaction state into the same file — splitting that into the model/controller/view layers and verifying no implicit behavior is dropped is its own end-to-end workflow. See the `mosaic` Claude Code skill (`.claude/skills/mosaic/`), in particular its `references/migration.md`.

## Files

| File                                    | Purpose                                                                            |
| --------------------------------------- | ---------------------------------------------------------------------------------- |
| `src/tokens.stylex.ts`                  | `--cl-*` token groups declared with `stylex.defineVars`                            |
| `src/props.ts`                          | `themeProps`, `mergeStyleProps`, `MosaicComponentProps`, `MosaicStyleProps`        |
| `src/MosaicProvider.tsx`                | Provider for the `icons` and `localization` props                                  |
| `src/icons/overrides.ts`                | `MosaicIconOverrides` type + `useMosaicIcons()` context                            |
| `src/icons/registry.tsx`                | Built-in glyphs and the `IconName` union                                           |
| `src/localization/`                     | Message registry, `MosaicCatalog` types, context hooks, and `fill`/`plural`/`rich` |
| `src/components/`                       | One subdirectory per component, and nothing else                                   |
| `src/blocks/`                           | View fragments that own one piece of state of their own (`destructive`)            |
| `src/utils/*.styles.ts`                 | Atoms shared across components: `reset`, `typography`, `focus-outline`             |
| `src/hooks/`                            | Mosaic-only hooks (`useMosaicEnvironment`, `useMosaicRouter`, …)                   |
| `src/styles/index.ts`                   | StyleX-only barrel — the entry the CSS build walks                                 |
| `src/machine/`                          | State-machine runtime (`createMachine`, `createActor`, `useMachine`)               |
| `src/machines/`                         | Standalone machines and the shared `__tests__/test-utils.ts`                       |
| `src/<feature>/*.model.tsx`             | Clerk adapter — the only file in a feature that may import Clerk                   |
| `src/<feature>/*.controller.tsx`        | Local state and action wrapping; holds the feature's machine                       |
| `src/<feature>/*.view.tsx`              | Clerk-free rendering from plain props                                              |
| `src/<feature>/*.types.ts`              | The data contract the model and the view both agree on                             |
| `src/<feature>/*.messages.ts`           | Every string the surface renders; its keys are the `localization` paths            |
| `src/__tests__/MosaicProvider.test.tsx` | Icon-override and localization context specs                                       |
| `src/components/button/button.test.tsx` | Component-level slot/state/variant specs                                           |
| `src/features/user-button/__tests__/`   | `user-button.integration.test.tsx` is the flow test to copy                        |

`machine/` is the runtime; `machines/` is machines written with it. The one-letter
difference is easy to misread — a feature's own machine belongs in its
`*.controller.tsx`, not in either directory.
