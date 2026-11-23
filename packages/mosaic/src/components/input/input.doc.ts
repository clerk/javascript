import type { ComponentDoc } from '../../docs-schema';
import type { InputProps } from './input';

export default {
  name: 'Input',
  description:
    'A single-line text input. Inside a `Field` it takes its id, label, description, disabled, required and invalid state from the field. Inside an `InputGroup` it drops its chrome and takes the group size.',
  useFor: ['a text, email or search field', 'the text part of an `InputGroup`'],
  keywords: ['input', 'text field', 'textbox', 'form control'],
  practices: [
    { do: true, text: 'Render it inside `Field.Root` with a `Field.Label`, so it is labelled and described.' },
    { do: true, text: 'Use `PasswordInput`, `PhoneInput` or `Otp` for those values.' },
    { do: false, text: 'Set `size` inside an `InputGroup`. The group size wins.' },
  ],
  parts: {
    Input: {
      description:
        'Renders an `input` and forwards its ref. When the field keeps a disabled control focusable, the input goes `readOnly` and `aria-disabled` instead of `disabled`.',
      slot: 'cl-input',
      props: {
        size: { type: "'sm' | 'md' | 'lg'", doc: '`sm`, `md` or `lg`.', default: "'md'" },
        variant: {
          type: 'InputVariant',
          doc: '`default` draws the field chrome. `ghost` keeps the sizing and leaves chrome and focus to the container.',
          default: '`ghost` inside an `InputGroup`, else `default`',
        },
      },
    },
  },
  examples: [
    {
      title: 'A labelled input',
      code: `
<Field.Root>
  <Field.Label>Email</Field.Label>
  <Input type='email' autoComplete='email' />
</Field.Root>
`,
    },
  ],
  related: ['Field', 'InputGroup', 'PasswordInput', 'PhoneInput', 'Otp'],
} satisfies ComponentDoc<{ Input: InputProps }>;
