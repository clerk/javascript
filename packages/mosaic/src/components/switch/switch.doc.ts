import type { ComponentDoc } from '../../docs-schema';
import type { SwitchProps } from './switch';

export default {
  name: 'Switch',
  description:
    "An on/off toggle: a native checkbox `input` with `role='switch'`, styled as a track and thumb (`cl-switch-thumb`). The ref and other props go to the input (`cl-switch-input`). Inside a `Field` it takes the field id, label, disabled, required, invalid and message wiring.",
  useFor: ['turning a setting on or off', 'a toggle in a settings row or form'],
  keywords: ['switch', 'toggle', 'checkbox', 'on off', 'setting'],
  practices: [
    { do: true, text: 'Wrap it in `Field.Root` with a `Field.Label`, or pass `aria-label` or `aria-labelledby`.' },
    { do: true, text: 'Control it with `checked` and `onChange`, as a checkbox.' },
  ],
  parts: {
    Switch: {
      description: 'Renders a `span` around the input and thumb. Carries `data-size` and `data-disabled`.',
      slot: 'cl-switch',
      props: {
        size: { type: "'sm' | 'md'", doc: '`sm` or `md`.', default: "'md'" },
        disabled: { type: 'boolean', doc: "Disables the input. Inside a `Field`, the field's `disabled` wins." },
      },
    },
  },
  examples: [
    {
      title: 'In a field',
      code: `
<Field.Root orientation='horizontal'>
  <Switch checked={enabled} onChange={event => setEnabled(event.currentTarget.checked)} />
  <Field.Content>
    <Field.Label>Email notifications</Field.Label>
  </Field.Content>
</Field.Root>
`,
    },
  ],
  related: ['Field'],
} satisfies ComponentDoc<{ Switch: SwitchProps }>;
