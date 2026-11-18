import type { HookDoc } from '../../docs-schema';
import type { UseFormOptions, UseFormResult } from './use-form';

export default {
  name: 'useForm',
  description:
    "Owns a form's values, validation, submit and errors in a machine. Field errors show once a field is touched; submit touches every field, waits for pending async checks and focuses the first invalid control.",
  useFor: [
    'a form: values, validation, submit, field errors, success UI',
    'a server check on a field as the user types, with `validateAsync`',
    'Clerk errors from a save landing on form fields',
  ],
  keywords: ['form', 'validation', 'submit', 'field error', 'useForm', 'async validation'],
  practices: [
    {
      do: true,
      text: 'Reject `onSubmit` with `FormSubmitError` (exported from this unit), or use `save` in the model, so errors land on fields and the banner.',
    },
    { do: true, text: 'Use `onSuccess` for success UI that stays mounted, such as a done step.' },
    {
      do: true,
      text: 'Spread `register(name)` on an `onChange` control and `registerValue(name)` on an `onValueChange` one.',
    },
    { do: true, text: 'Pass `form` whole to the view.' },
    { do: false, text: 'Wrap `onSubmit` in `try`/`catch`. Reject, and the form shows why.' },
    { do: false, text: 'Track a submitting flag in `useState`. Read `isSubmitting`.' },
  ],
  options: {
    initialValues: {
      type: 'TValues',
      doc: 'The starting values, and the baseline `isDirty` compares against until `reset(values)`.',
    },
    fields: {
      type: 'FieldsConfig<TValues>',
      doc: 'Per-field `validate` and `validateAsync`, each returning feedback or `undefined`.',
    },
    onSubmit: {
      type: '(values: TValues) => Promise<TResult>',
      doc: 'Runs with the values when the form is valid. Reject to show the error.',
    },
    onSuccess: {
      type: '(result: TResult, submittedValues: TValues) => void',
      doc: 'Called with the result and the submitted values after `onSubmit` resolves.',
    },
    canSubmit: {
      type: '(values: TValues) => boolean',
      doc: 'An extra check on the values before submit is allowed.',
      default: 'always true',
    },
    errorFallback: {
      type: 'string',
      doc: 'Copy shown when the submit fails without an error the form can describe.',
      default: 'the generic form error',
    },
  },
  returns: {
    id: { type: 'string', doc: 'A stable id. Pass it to the `Form` and to a `SubmitButton form` outside it.' },
    values: { type: 'TValues', doc: 'The current values.' },
    fields: {
      type: 'Record<keyof TValues, FormField>',
      doc: 'Per field: `feedback`, `isValidating`, `touched` and `isDirty`.',
    },
    error: { type: 'string', doc: 'Form-level copy for the last failed submit, for `Card.Banner`.' },
    isSubmitting: { type: 'boolean', doc: 'Whether a submit is queued behind async checks or running.' },
    isDirty: { type: 'boolean', doc: 'Whether any value differs from its initial value.' },
    canSubmit: { type: 'boolean', doc: 'Whether every field is valid and `canSubmit` passes.' },
    register: {
      type: '<K extends TextFieldName<TValues>>(name: K) => RegisteredField<TValues, K>',
      doc: 'Props for a string field on a control that takes `onChange(event)`.',
    },
    registerValue: {
      type: '<K extends keyof TValues>(name: K) => RegisteredValueField<TValues, K>',
      doc: 'Props for a field of any type on a control that takes `onValueChange(value)`.',
    },
    setValue: {
      type: '<K extends keyof TValues>(name: K, value: TValues[K]) => void',
      doc: 'Sets one value, clearing its submit error and starting its async check.',
    },
    touch: { type: '(name: keyof TValues) => void', doc: 'Marks a field touched, so its error shows.' },
    submit: { type: '() => void', doc: 'Submits, or focuses the first invalid control.' },
    handleSubmit: {
      type: '(event: { preventDefault: () => void }) => void',
      doc: 'A `<form>` submit handler: prevents the default, then submits.',
    },
    reset: {
      type: '(values?: TValues) => void',
      doc: 'Clears touched state and errors and resets to the initial values, or to `values`, which become the new baseline.',
    },
  },
  examples: [
    {
      title: 'A form in a view',
      code: `
<Form id={form.id} onSubmit={form.handleSubmit}>
  <Card.Banner color='negative'>{form.error}</Card.Banner>
  <Field.Root invalid={form.fields.email.feedback?.type === 'error'}>
    <Field.Label>{m.email}</Field.Label>
    <Input {...form.register('email')} />
    <Field.Feedback feedback={form.fields.email.feedback} />
  </Field.Root>
  <SubmitButton isPending={form.isSubmitting} disabled={!form.canSubmit}>
    {m.save}
  </SubmitButton>
</Form>
`,
    },
  ],
  related: ['Field', 'Form', 'SubmitButton', 'Card'],
} satisfies HookDoc<UseFormOptions<object>, UseFormResult<object>>;
