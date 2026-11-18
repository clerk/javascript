# Form

A `<form>` that never shows the browser's validation popup.

## When to Use

- Every form in Mosaic. Lint flags a bare `<form>`.
- Controls keep `required` and `type` for assistive tech and mobile keyboards. The caller owns validation: hold the submit with `useForm`'s `canSubmit`, and show messages through `Field.Error`.

## Usage

```tsx
import { Form } from '@/primitives/form';

<Form onSubmit={handleSubmit}>…</Form>;
```

When the form is another part's node, pass it through that part's `render`:

```tsx
<Card.Content
  render={
    <Form
      id={formId}
      onSubmit={handleSubmit}
    />
  }
>
  …
</Card.Content>
```

## Props

| Prop     | Type                  | Default | Description                                                        |
| -------- | --------------------- | ------- | ------------------------------------------------------------------ |
| `render` | `RenderPropOrElement` | —       | Renders a different element (see the shared `render` escape hatch) |

Standard `<form>` attributes pass through. `noValidate` is always set.
