---
name: headless-dev
description: Step-by-step conventions for creating or modifying headless UI primitives in packages/headless. Covers file structure, floating-ui wiring, renderElement, data attributes, transitions, and testing.
when_to_use: new primitive, add component to headless, modify headless primitive, headless development
disable-model-invocation: true
---

# Developing @clerk/headless Primitives

**Package:** `packages/headless` (`@clerk/headless`)
**Reference files:** `packages/headless/FLOATING-UI-REFERENCE.md`

Before implementing any floating/positioning behavior manually, check `FLOATING-UI-REFERENCE.md` in the headless package root — floating-ui almost certainly handles it already.

---

## Creating a New Primitive

### 1. File structure

```
src/primitives/<name>/
  <name>.tsx          # Full implementation (single file)
  <name>.test.tsx     # All tests
  index.ts            # Barrel re-export
```

Start `<name>.tsx` with `'use client';`.

### 2. Context + useXContext

```tsx
interface XContextValue {
  open: boolean;
  // ... all shared state
  mounted: boolean;
  transitionProps: TransitionProps;
}

const XContext = createContext<XContextValue | null>(null);

function useXContext() {
  const ctx = useContext(XContext);
  if (!ctx) {
    throw new Error('X compound components must be used within <X>');
  }
  return ctx;
}
```

### 3. Root component (FloatingTree self-wrapping)

Every floating primitive needs this pattern:

```tsx
function XInner(props: XProps) {
  const nodeId = useFloatingNodeId();
  // ... all hooks and state

  const contextValue = useMemo<XContextValue>(() => ({ ... }), [deps]);

  return (
    <FloatingNode id={nodeId}>
      <XContext.Provider value={contextValue}>{children}</XContext.Provider>
    </FloatingNode>
  );
}

function XRoot(props: XProps) {
  const parentId = useFloatingParentNodeId();
  if (parentId === null) {
    return (
      <FloatingTree>
        <XInner {...props} />
      </FloatingTree>
    );
  }
  return <XInner {...props} />;
}
```

### 4. Floating-UI hook composition

Choose hooks based on component type:

| Component        | Hooks                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Tooltip**      | `useHover` + `useFocus` + `useDismiss` + `useRole('tooltip')`                                                              |
| **Popover**      | `useClick` + `useDismiss` + `useRole('dialog')`                                                                            |
| **Dialog**       | `useClick` + `useDismiss` + `useRole('dialog')`                                                                            |
| **Select**       | `useClick` + `useDismiss` + `useRole('listbox')` + `useListNavigation` + `useTypeahead`                                    |
| **Autocomplete** | `useDismiss` + `useRole('listbox')` + `useListNavigation(virtual: true)`                                                   |
| **Menu**         | `useClick` + `useHover(nested)` + `useDismiss(bubbles)` + `useRole('menu')` + `useListNavigation(nested)` + `useTypeahead` |

Standard middleware order: `offset` -> `flip` -> `shift` -> `size` -> `arrow` -> `floatingCssVars`

Always use `whileElementsMounted: autoUpdate`.

```tsx
const { refs, floatingStyles, context: floatingContext, placement } = useFloating({
  nodeId,
  open,
  onOpenChange: setOpen,
  placement: placementProp,
  middleware: [
    offset(sideOffset),
    flip(),
    shift({ padding: 5 }),
    size({ apply({ availableHeight, elements }) { ... } }),
    arrow({ element: arrowRef }),
    floatingCssVars({ sideOffset }),
  ],
  whileElementsMounted: autoUpdate,
});
```

### 5. Transition wiring

```tsx
import { type TransitionProps, useFloatingTransition } from '../../hooks/use-floating-transition';

const popupRef = useRef<HTMLDivElement | null>(null);
const { mounted, transitionProps } = useFloatingTransition({ open, ref: popupRef });
```

- Pass `mounted` and `transitionProps` through context
- Gate Portal/Positioner rendering on `mounted` (`if (!mounted) return null`)
- Spread `transitionProps` onto Popup (NOT Positioner)
- Pass `popupRef` as the Popup's ref

### 6. Controllable state

Use the shared hook for every controlled/uncontrolled prop pair:

```tsx
import { useControllableState } from '../../hooks/use-controllable-state';

const [open, setOpen] = useControllableState(props.open, props.defaultOpen ?? false, props.onOpenChange);
const [value, setValue] = useControllableState(props.value, props.defaultValue, props.onValueChange);
```

### 7. Part components — always use renderElement

**Every** part must use `renderElement` from `../../utils/render-element`. Never return raw JSX.

```tsx
function XTrigger(props: XTriggerProps) {
  const { render, ...otherProps } = props;
  const { open, refs, getReferenceProps } = useXContext();

  const state = { open };

  const defaultProps = {
    type: 'button' as const,
    'data-cl-slot': 'x-trigger',
    ref: refs.setReference,
    ...(getReferenceProps() as React.ComponentPropsWithRef<'button'>),
  };

  return renderElement({
    defaultTagName: 'button',
    render,
    state,
    stateAttributesMapping: {
      open: (v: boolean) => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
    },
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
}
```

**Props assembly order** (always the same):

1. Destructure `render` + named props; collect rest as `otherProps`
2. Build `defaultProps` with the component's required attributes
3. `mergeProps(defaultProps, otherProps)` — consumer wins for most props; event handlers chain (internal first), styles shallow-merge, classNames concatenate

### 8. Standard parts for floating primitives

**Trigger:** `refs.setReference` + `getReferenceProps()`

**Portal:** Gate on `mounted`, wrap in `<FloatingPortal>`

**Positioner:** `refs.setFloating` + `style: floatingStyles` + `getFloatingProps()`. Wrap in `<FloatingFocusManager>`. For list primitives, also wrap in `<FloatingList elementsRef labelsRef>`. Use `renderElement` with `enabled: mounted`.

**Popup:** `popupRef` + `transitionProps`. Pure visual wrapper.

**Arrow:** Thin wrapper around `<FloatingArrow ref={arrowRef} context={floatingContext} />`.

### 9. Data attribute conventions

All prefixed `data-cl-`. Set as empty string `""` when present, absent when not.

| Attribute                                 | Usage                           |
| ----------------------------------------- | ------------------------------- |
| `data-cl-slot="<primitive>-<part>"`       | Every part, always present      |
| `data-cl-side="top\|bottom\|left\|right"` | Positioner and Arrow            |
| `data-cl-open` / `data-cl-closed`         | Trigger, mutually exclusive     |
| `data-cl-selected`                        | Selected option/item            |
| `data-cl-active`                          | Keyboard-highlighted item       |
| `data-cl-disabled`                        | Disabled item                   |
| `data-cl-starting-style`                  | Popup, first frame (enter-from) |
| `data-cl-ending-style`                    | Popup, exit animation           |

### 10. Ref combining

Always use `useMergeRefs` from `@floating-ui/react` when combining multiple refs:

```tsx
import { useMergeRefs } from '@floating-ui/react';

const combinedRef = useMergeRefs([popupRef, refs.setFloating]);
```

Never manually create callback refs to combine refs.

### 11. Compound export

```tsx
export const X = Object.assign(XRoot, {
  Trigger: XTrigger,
  Portal: XPortal,
  Positioner: XPositioner,
  Popup: XPopup,
  Arrow: XArrowComponent,
});
```

### 12. Barrel export (index.ts)

```ts
export type { XProps, XTriggerProps, XPositionerProps, XPopupProps, XArrowProps } from './x';
export { X } from './x';
```

### 13. Package exports (package.json)

Add an entry to `exports`:

```json
"./<name>": {
  "import": "./dist/primitives/<name>/index.js",
  "types": "./dist/primitives/<name>/index.d.ts"
}
```

### 14. Testing

**Stack:** Vitest + real Chromium (`@vitest/browser-playwright`)

**Standard test structure:**

```tsx
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from '../../test-utils/axe';
import { X } from './x';

afterEach(() => cleanup());

describe('X', () => {
  describe('slot attributes', () => { ... });
  describe('open/close', () => { ... });
  describe('keyboard navigation', () => { ... });
  describe('ARIA attributes', () => { ... });
  describe('animation lifecycle', () => { ... });
  describe('controlled open/value', () => { ... });
  describe('accessibility (axe)', () => {
    it('has no violations when closed', async () => {
      const { container } = renderX();
      expect(await axe(container)).toHaveNoViolations();
    });
    it('has no violations when open', async () => {
      renderX({ defaultOpen: true });
      expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();
    });
  });
});
```

**Query patterns:**

- Slot: `document.querySelector('[data-cl-slot="x-positioner"]')`
- Role: `screen.getByRole('combobox')`, `screen.getByRole('option')`
- Open via click: `await user.click(screen.getByRole('combobox'))`
- Open via hover: `await user.hover(trigger)` (Tooltip)
- Always `cleanup()` in `afterEach`

**No fake timers** — tests run in a real browser. Use `waitFor` for async assertions. Use `delay={0}` on tooltips to eliminate timer waits.

---

## Modifying an Existing Primitive

### Checklist

1. **Read the file first.** Understand the existing context interface and hook composition before changing anything.

2. **Always use `renderElement`** for any part that renders UI. Never return raw JSX from a part component.

3. **`mergeProps(defaultProps, otherProps)`** — consumer props always come second. Event handlers chain (internal fires first), styles shallow-merge, classNames concatenate, everything else: consumer wins.

4. **New state?** Add to `stateAttributesMapping` with a `data-cl-*` attribute. Follow the existing naming: `open`/`closed`, `selected`, `active`, `disabled`.

5. **New floating-ui feature?** Check `FLOATING-UI-REFERENCE.md` in the package root first. Use the built-in hook/component if one exists. Don't reimplement scroll-into-view, dismiss handling, focus management, ARIA, or positioning.

6. **Combining refs?** Use `useMergeRefs([ref1, ref2])` from `@floating-ui/react`. Never use manual callback refs.

7. **New context value?** Add to the interface, the `useMemo` value, AND the deps array.

8. **Custom middleware?** Define as a standalone function outside the component. Return `{ x, y }` for position overrides or `{}` to no-op.

9. **Run tests:** `pnpm test -- --run` (all 345+ tests must pass). Build: `pnpm build`.

10. **Test coverage for changes:** Add tests in the appropriate describe block. Always test: DOM attributes, keyboard interaction, ARIA, and axe accessibility.
