# OTP

A headless one-time-password (OTP / PIN) input. The value is a single string; each character is
rendered by its own `<Otp.Input>` slot, so you style each box yourself. Typing advances focus,
`Backspace` walks back, arrows/Home/End move between slots, and pasting a full code distributes it
across the slots. Supports controlled/uncontrolled value, a character `pattern`, masking, a
`disabled` state, and optional `<form>` submission via `name`.

## When to Use

- SMS / email verification code entry.
- Authenticator (TOTP) code entry.
- Any fixed-length PIN or code split into per-character boxes.

Each slot is a real, individually styleable `<input>` — the primitive emits zero styles and injects
no global CSS. Everything is driven by `data-cl-*` attributes.

## Usage

```tsx
import { Otp } from '@clerk/headless/otp';

function VerifyCode() {
  return (
    <Otp.Root
      length={6}
      aria-label='Verification code'
      onComplete={code => submit(code)}
    >
      <Slots />
    </Otp.Root>
  );
}

// Render one Input per slot from the live slot list.
function Slots() {
  const { slots } = Otp.useOtp();
  return slots.map(slot => (
    <Otp.Input
      key={slot.index}
      index={slot.index}
    />
  ));
}
```

`useOtp()` returns `{ value, length, disabled, complete, slots, activeIndex, clear, focus }`. Each
entry in `slots` is `{ index, char, isActive, isFilled }`, so you can render decorations (a caret, a
separator) around the boxes. It must be called inside `<Otp.Root>`.

### Controlled

```tsx
const [code, setCode] = useState('');

<Otp.Root
  length={6}
  value={code}
  onValueChange={setCode}
>
  <Slots />
</Otp.Root>;
```

### Inside a form

Pass `name` to submit the combined value through a hidden input:

```tsx
<form action={verify}>
  <Otp.Root
    length={6}
    name='code'
  >
    <Slots />
  </Otp.Root>
  <button type='submit'>Verify</button>
</form>
```

### Masked / alphanumeric

```tsx
<Otp.Root
  length={4}
  mask
  pattern='alphanumeric'
>
  <Slots />
</Otp.Root>
```

## Parts

| Part        | Default Element | Description                                                 |
| ----------- | --------------- | ----------------------------------------------------------- |
| `Otp.Root`  | `<div>`         | Owns the value + focus, provides context, submits the value |
| `Otp.Input` | `<input>`       | A single character slot (render one per `slots` entry)      |

`Otp.useOtp()` is a hook (not a component) for reading the value and driving custom UI. It must be
called inside `Otp.Root`.

## Props

### `Otp.Root`

| Prop            | Type                                     | Default     | Description                                         |
| --------------- | ---------------------------------------- | ----------- | --------------------------------------------------- |
| `length`        | `number`                                 | —           | Number of slots (required)                          |
| `value`         | `string`                                 | —           | Controlled value                                    |
| `defaultValue`  | `string`                                 | `''`        | Initial value (uncontrolled)                        |
| `onValueChange` | `(value: string) => void`                | —           | Called with the full value on every change          |
| `onComplete`    | `(value: string) => void`                | —           | Called once every slot is filled                    |
| `pattern`       | `'numeric' \| 'alpha' \| 'alphanumeric'` | `'numeric'` | Allowed characters; others are stripped             |
| `mask`          | `boolean`                                | `false`     | Render slots as password inputs                     |
| `name`          | `string`                                 | —           | Submit the value via a hidden input under this name |
| `disabled`      | `boolean`                                | `false`     | Disable every slot                                  |

### `Otp.Input`

| Prop    | Type     | Default | Description                                           |
| ------- | -------- | ------- | ----------------------------------------------------- |
| `index` | `number` | —       | The slot's `0`-based position (from `useOtp().slots`) |

Both parts accept a `render` prop for polymorphic rendering and standard HTML attributes for their
default element.

## Keyboard

| Key                        | Behavior                                                          |
| -------------------------- | ----------------------------------------------------------------- |
| character                  | Fills the slot and moves focus to the next slot                   |
| `Backspace`                | Clears the slot, or the previous slot when already empty          |
| `Ctrl`/`Cmd` + `Backspace` | Clears the whole value and focuses the first slot                 |
| `Delete`                   | Clears the current slot                                           |
| `ArrowLeft`/`ArrowRight`   | Moves focus to the previous / next slot                           |
| `Ctrl`/`Cmd` + arrow       | Jumps focus to the first / last-entered slot                      |
| `Home`/`ArrowUp`           | Moves focus to the first slot                                     |
| `End`/`ArrowDown`          | Moves focus to the last-entered slot                              |
| paste                      | Distributes the pasted code across the slots from the focus point |

Focus can't skip past the first empty slot: clicking, arrowing, or tabbing onto an empty slot beyond
it snaps focus back to the first empty slot (so an empty field always focuses the first slot).

Arrow keys follow reading order. Under `dir="rtl"` (resolved from the nearest ancestor with an
explicit `dir`), `ArrowLeft` moves to the next slot and `ArrowRight` to the previous one; `Home`/`End`
and the `Ctrl`/`Cmd` boundary jumps stay logical (first / last-entered).

## Data Attributes

| Attribute          | Applies To  | Description                                   |
| ------------------ | ----------- | --------------------------------------------- |
| `data-cl-slot`     | All parts   | Part identifier (`"otp-root"`, `"otp-input"`) |
| `data-cl-empty`    | Root        | Present when no character has been entered    |
| `data-cl-complete` | Root        | Present when every slot is filled             |
| `data-cl-disabled` | Root, Input | Present when disabled                         |
| `data-cl-active`   | Input       | Present when the slot holds focus             |
| `data-cl-filled`   | Input       | Present when the slot holds a character       |

## ARIA

- `Root` is a `role="group"`; give it an `aria-label` (or `aria-labelledby`) describing the code.
- Each `Input` gets a default `aria-label` of `"Character N of M"`, overridable per input.
- Slots use a roving tab index: `Tab` enters the group at the next empty slot and leaves in one step.
- When `name` is set, the hidden form input is `aria-hidden` and removed from the tab order.
