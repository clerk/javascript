# Button

A button with the disabled behaviour a native `<button>` cannot express: staying focusable while inert, and behaving like a button on elements that aren't one.

## When to Use

- A button that disables itself mid-interaction — while a form submits, while a request is in flight. Use `focusableWhenDisabled` so focus is not dropped to the body and the user keeps their place on the page.
- Rendering a button as a link or a `<span>`. Pass `nativeButton={false}` so the role, tab order, and Enter/Space activation are applied.
- A plain always-enabled button needs neither prop, and a bare `<button>` is fine.

## Usage

```tsx
import { Button } from '@/primitives/button';

<Button onClick={save}>Save</Button>;
```

### Focusable while disabled

```tsx
<Button
  type='submit'
  disabled={submitting}
  focusableWhenDisabled
>
  Save
</Button>
```

The button keeps its place in the tab order, is marked `aria-disabled`, and ignores clicks and keyboard activation. Focus is not pulled off its current element by a pointer press either.

Suppression is the consumer's handler plus the event's default action, not propagation. Events still bubble, so an enclosing dialog or menu keeps seeing them. Every key but `Tab` has its default prevented — `Tab` is exempt so focus can still move off the button, which is the point of keeping it focusable.

### Non-native element

```tsx
<Button
  nativeButton={false}
  render={<a href='/settings' />}
>
  Settings
</Button>
```

## Props

| Prop                    | Type                  | Default | Description                                                        |
| ----------------------- | --------------------- | ------- | ------------------------------------------------------------------ |
| `disabled`              | `boolean`             | `false` | Makes the button inert                                             |
| `focusableWhenDisabled` | `boolean`             | `false` | Keeps a disabled button in the tab order                           |
| `nativeButton`          | `boolean`             | `true`  | Whether the rendered element is a real `<button>`                  |
| `render`                | `RenderPropOrElement` | —       | Renders a different element (see the shared `render` escape hatch) |

Standard `<button>` attributes pass through. `type` defaults to `"button"` on a native button and is overridable.

## Data Attributes

| Attribute       | Description           |
| --------------- | --------------------- |
| `data-disabled` | Present when disabled |

## ARIA

- Native + disabled: the `disabled` attribute.
- Native + `disabled` + `focusableWhenDisabled`: `aria-disabled="true"`, no `disabled` attribute.
- `nativeButton={false}`: `role="button"`, `tabIndex={0}` (`-1` when disabled without `focusableWhenDisabled`, since an `<a href>` is tabbable on its own and dropping the attribute would leave it in the tab order), `aria-disabled` when disabled. `Enter` and `Space` activate it; `Enter` on a link is left to the browser so it does not fire twice.
