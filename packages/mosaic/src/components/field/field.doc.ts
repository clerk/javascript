import type { ComponentDoc } from '../../docs-schema';
import type {
  FieldContentProps,
  FieldDescriptionProps,
  FieldErrorProps,
  FieldFeedbackProps,
  FieldHeaderProps,
  FieldHintProps,
  FieldLabelProps,
  FieldMessageProps,
  FieldRootProps,
  FieldSuccessProps,
} from './field';

export default {
  name: 'Field',
  description:
    "Wraps one form control with its label, description and feedback, and wires them together: the control takes the field's id, `disabled`, `required`, `aria-invalid`, `aria-labelledby` and `aria-describedby`.",
  useFor: [
    'a labelled input in a form',
    'showing a field error, hint or success message under a control',
    'a checkbox or radio beside its label and description',
  ],
  keywords: ['field', 'form field', 'label', 'error message', 'hint', 'validation', 'input'],
  practices: [
    {
      do: true,
      text: 'Pass `form.fields.<name>.feedback` from `useForm` to `Field.Feedback`, and set `invalid` when its `type` is `error`.',
    },
    {
      do: true,
      text: 'Pass `disabled={form.isSubmitting}` with `focusableWhenDisabled` on text fields, so focus stays put while the form submits.',
    },
    { do: true, text: 'Use `Field.Label visuallyHidden` when the design has no visible label.' },
    { do: false, text: 'Pass `render` to `Field.Label` that is not a `label`. It warns in development.' },
    { do: false, text: 'Set `id` or `aria-describedby` on the control by hand. The field wires them.' },
  ],
  parts: {
    'Field.Root': {
      description: 'Holds the field state for its parts and control. Carries `data-orientation`.',
      slot: 'cl-field-root',
      props: {
        orientation: {
          type: 'FieldOrientation',
          doc: '`horizontal` puts the control beside a `Field.Content` that stacks the label and text.',
          default: "'vertical'",
        },
        disabled: { type: 'boolean', doc: 'Disables the control.', default: 'false' },
        focusableWhenDisabled: {
          type: 'boolean',
          doc: 'Keeps a disabled text control focusable: read-only and `aria-disabled` instead of `disabled`.',
          default: 'false',
        },
        required: { type: 'boolean', doc: 'Marks the control required.', default: 'false' },
        invalid: { type: 'boolean', doc: 'Marks the control `aria-invalid`.', default: 'false' },
      },
    },
    'Field.Header': {
      description: 'A row with the label at the start and an action, such as a link, at the end.',
      slot: 'cl-field-header',
    },
    'Field.Label': {
      description:
        'A native `label` for the control. For a control a `label` would activate, such as a select, renders a `span` that focuses it and names it through `aria-labelledby`. Carries `data-visually-hidden`.',
      slot: 'cl-field-label',
      props: {
        visuallyHidden: {
          type: 'boolean',
          doc: 'Hides the label but keeps it in the accessibility tree.',
          default: 'false',
        },
      },
    },
    'Field.Content': {
      description: "Stacks a horizontal field's label and supporting text.",
      slot: 'cl-field-content',
    },
    'Field.Description': {
      description: 'Supporting text, as a `p`. The control is described by it.',
      slot: 'cl-field-description',
    },
    'Field.Message': {
      description:
        'A `role="status"` box that animates its height to the shown message and crossfades between `Field.Error`, `Field.Hint` and `Field.Success`.',
      slot: 'cl-field-message',
    },
    'Field.Feedback': {
      description: 'A `Field.Message` holding one error, hint or success, picked from `feedback`.',
      slot: 'cl-field-message',
      props: {
        feedback: {
          type: 'FormFieldFeedback',
          doc: 'The field feedback from `useForm`. `warning` and `info` show as a hint.',
        },
      },
    },
    'Field.Error': {
      description: 'Error text with an icon. Shows while it has children, and the control is described by it.',
      slot: 'cl-field-error',
    },
    'Field.Hint': {
      description: 'Info text. Shows while it has children, and the control is described by it.',
      slot: 'cl-field-info',
    },
    'Field.Success': {
      description: 'Success text with a checkmark. Shows while it has children, and the control is described by it.',
      slot: 'cl-field-success',
    },
  },
  examples: [
    {
      title: 'A form field',
      code: `
<Field.Root
  required
  disabled={form.isSubmitting}
  focusableWhenDisabled
  invalid={feedback?.type === 'error'}
>
  <Field.Label>{m.emailLabel}</Field.Label>
  <Input type='email' {...form.register('emailAddress')} />
  <Field.Feedback feedback={feedback} />
</Field.Root>
`,
    },
    {
      title: 'A control beside its label',
      code: `
<Field.Root orientation='horizontal'>
  <Radio.Item value='all' />
  <Field.Content>
    <Field.Label>{m.all}</Field.Label>
    <Field.Description>{m.allDescription}</Field.Description>
  </Field.Content>
</Field.Root>
`,
    },
  ],
  related: ['useForm', 'Input', 'Checkbox', 'Form'],
} satisfies ComponentDoc<{
  'Field.Root': FieldRootProps;
  'Field.Header': FieldHeaderProps;
  'Field.Label': FieldLabelProps;
  'Field.Content': FieldContentProps;
  'Field.Description': FieldDescriptionProps;
  'Field.Message': FieldMessageProps;
  'Field.Feedback': FieldFeedbackProps;
  'Field.Error': FieldErrorProps;
  'Field.Hint': FieldHintProps;
  'Field.Success': FieldSuccessProps;
}>;
