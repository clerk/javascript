# Flow

A controlled, headless primitive for rendering one step of a multi-step flow at a time while preserving outgoing steps until their exit animations finish.

## Usage

```tsx
import { Flow } from '@clerk/headless/flow';

<Flow.Root
  value={machine.status}
  direction={machine.direction}
>
  <Flow.Step ids={['enter-password', 'enter-password-pending', 'enter-password-error']}>
    <PasswordView {...passwordViewProps} />
  </Flow.Step>
  <Flow.Step ids={['enter-code', 'enter-code-pending', 'enter-code-error']}>
    <OtpView {...otpViewProps} />
  </Flow.Step>
</Flow.Root>;
```

The controller owns the active value and direction. `Flow.Root` renders an unstyled viewport that measures the active step, while `Flow.Step` maps controller states to presence and transition attributes.

Multiple ids can select the same step. Moving between those ids updates the existing step without starting a transition.

## Parts

| Part        | Default Element | Description                                 |
| ----------- | --------------- | ------------------------------------------- |
| `Flow.Root` | `<div>`         | Provides state and measures the active step |
| `Flow.Step` | `<div>`         | Renders while active or completing an exit  |

## Props

### `Flow.Root`

| Prop        | Type      | Default      | Description                              |
| ----------- | --------- | ------------ | ---------------------------------------- |
| `value`     | `string`  | **required** | The active controller state              |
| `direction` | `-1 \| 1` | `1`          | Direction used by step transition styles |

### `Flow.Step`

| Prop  | Type                | Default      | Description                               |
| ----- | ------------------- | ------------ | ----------------------------------------- |
| `ids` | `readonly string[]` | **required** | Controller states represented by the step |

`Flow.Step` also accepts standard `<div>` attributes and the package's `render` prop.

## Transition attributes

| Attribute             | Description                                              |
| --------------------- | -------------------------------------------------------- |
| `data-open`           | The step is active                                       |
| `data-closed`         | The step is exiting                                      |
| `data-starting-style` | Present for the incoming step's initial animation frame  |
| `data-ending-style`   | Present while the outgoing step's animation is finishing |

The initially active step does not receive `data-starting-style`. An exiting step is inert, hidden from the accessibility tree, and retains the content from its last active render until it unmounts.

`Flow.Root` carries `data-initial` through the first measured frame. Styled adapters can use it to disable viewport transitions so the initial step never animates.

## CSS variable

| CSS variable                     | Element     | Description                                   |
| -------------------------------- | ----------- | --------------------------------------------- |
| `--cl-flow-step-height`          | `Flow.Root` | Measured height of the active/entering step   |
| `--cl-flow-transition-direction` | `Flow.Step` | Transition direction expressed as `1` or `-1` |

The styled root can animate its height toward `--cl-flow-step-height`. Each step can multiply its offset by `--cl-flow-transition-direction` to reverse directional motion without branching in React.
