import type { ComponentDoc } from '../../docs-schema';
import type { PasswordInputProps } from './password-input';

export default {
  name: 'PasswordInput',
  description:
    'A password input with a trailing button that shows or hides what was typed. The ref, `Field` wiring and input attributes such as `autoComplete` go to the input.',
  useFor: ['a password field', 'a password with a show or hide toggle'],
  keywords: ['password', 'show password', 'hide password', 'reveal', 'secret'],
  practices: [
    { do: true, text: 'Pass localized `showPasswordLabel` and `hidePasswordLabel`. They name the toggle.' },
    {
      do: true,
      text: 'Set `autoComplete` to `current-password` or `new-password`, so password managers fill the right value.',
    },
    { do: false, text: 'Use `Input` with `type="password"` and your own toggle.' },
  ],
  parts: {
    PasswordInput: {
      description:
        'An `InputGroup` around the input and toggle. Carries `data-visible` while the password shows; the toggle is `cl-password-input-toggle`.',
      slot: 'cl-password-input',
      props: {
        size: { type: "'sm' | 'md' | 'lg'", doc: '`sm`, `md` or `lg`.', default: "'md'" },
        showPasswordLabel: { type: 'string', doc: 'The toggle name while the password is hidden.' },
        hidePasswordLabel: { type: 'string', doc: 'The toggle name while the password shows.' },
      },
    },
  },
  examples: [
    {
      title: 'A sign-in password',
      code: `
<Field.Root>
  <Field.Label>Password</Field.Label>
  <PasswordInput
    autoComplete='current-password'
    showPasswordLabel='Show password'
    hidePasswordLabel='Hide password'
  />
</Field.Root>
`,
    },
  ],
  related: ['Input', 'InputGroup', 'Field'],
} satisfies ComponentDoc<{ PasswordInput: PasswordInputProps }>;
