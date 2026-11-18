import type { ComponentDoc } from '../../docs-schema';
import type { CheckboxProps } from './checkbox';

export default {
  name: 'Checkbox',
  description:
    'A native `input type="checkbox"` with a styled indicator for checked and indeterminate. Inside a `Field` it takes the field\'s id, `disabled`, `required` and ARIA wiring.',
  useFor: ['a checkbox in a form', 'a select-all checkbox with an indeterminate state', 'a row selection checkbox'],
  keywords: ['checkbox', 'check', 'toggle', 'indeterminate', 'select all', 'input'],
  practices: [
    { do: true, text: 'Put it in a `Field` with a `Field.Label` so it gets a label and its messages.' },
    { do: true, text: 'Use `indeterminate` for a select-all when only some rows are selected.' },
    {
      do: false,
      text: 'Expect `xstyle` to reach the input. It styles the wrapper (`cl-checkbox`); every other prop and the ref go to the input.',
    },
  ],
  parts: {
    Checkbox: {
      description:
        'A wrapper `span` around the input (`cl-checkbox-input`) and two indicators (`cl-checkbox-indicator` with `data-state`). The wrapper carries `data-size` and `data-disabled`.',
      slot: 'cl-checkbox',
      props: {
        size: { type: "'sm' | 'md'", doc: '`sm` or `md`.', default: "'md'" },
        indeterminate: { type: 'boolean', doc: 'Sets the input to its indeterminate state.', default: 'false' },
      },
    },
  },
  examples: [
    {
      title: 'In a field',
      code: `
<Field.Root orientation='horizontal'>
  <Checkbox checked={accepted} onChange={e => setAccepted(e.target.checked)} />
  <Field.Content>
    <Field.Label>{m.acceptTerms}</Field.Label>
  </Field.Content>
</Field.Root>
`,
    },
  ],
  related: ['Field', 'useForm'],
} satisfies ComponentDoc<{ Checkbox: CheckboxProps }>;
