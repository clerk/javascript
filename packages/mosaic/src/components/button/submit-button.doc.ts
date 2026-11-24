import type { ComponentDoc } from '../../docs-schema';
import type { SubmitButtonProps } from './submit-button';

export default {
  name: 'SubmitButton',
  description: 'A `Button` for async actions. While `isPending` it goes inert and shows a spinner, keeping its width.',
  useFor: ['a form submit', 'an async action outside a form, such as a confirm or a revoke'],
  keywords: ['submit', 'pending', 'loading', 'spinner', 'async'],
  practices: [
    {
      do: true,
      text: "Use `SubmitButton` for any action that waits on async work. In a form it submits; outside one, pass `type='button'` and `onClick`, as `Confirmation` does.",
    },
    { do: false, text: 'Render a spinner inside `Button` by hand. `SubmitButton` owns the spinner delay.' },
  ],
  parts: {
    SubmitButton: {
      description:
        "A `Button` for async actions. While `isPending` it goes inert and shows a spinner, keeping its width. Takes every `Button` prop; `type` defaults to `submit`, so pass `type='button'` outside a form.",
      slot: 'cl-button',
      props: {
        children: { type: 'ReactNode', doc: 'The label.' },
        isPending: {
          type: 'boolean',
          doc: 'Makes the button inert and busy. After a short delay it fades the label and centers a spinner over it.',
          default: 'false',
        },
        pendingLabel: {
          type: 'string',
          doc: 'Accessible name for the spinner. Pass a localized string.',
          default: "'pending'",
        },
        spinDelay: {
          type: 'SpinDelayOptions',
          doc: '`delay` before the spinner shows (default `150`) and `minDuration` it stays (default `400`).',
        },
      },
    },
  },
  playground: { part: 'SubmitButton', defaults: { children: 'Save' } },
  examples: [
    {
      title: 'A submit',
      code: `
<SubmitButton isPending={form.isSubmitting}>Save</SubmitButton>
`,
    },
    {
      title: 'An async action outside a form',
      code: `
<SubmitButton type='button' onClick={onRevoke} isPending={isRevoking}>
  Revoke
</SubmitButton>
`,
    },
  ],
  related: ['Button', 'useForm', 'usePendingAction'],
} satisfies ComponentDoc<{ SubmitButton: SubmitButtonProps }>;
