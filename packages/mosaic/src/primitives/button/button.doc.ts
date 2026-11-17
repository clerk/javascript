import type { ComponentDoc } from '../../docs-schema';
import type { ButtonProps } from './button';

export default {
  name: 'Button',
  description:
    'Headless, unstyled button that can stay focusable while disabled, and gives button semantics to an element that is not a `<button>`. Sets `data-disabled` while disabled.',
  useFor: [
    'a button that disables itself mid-interaction without dropping focus',
    'button semantics on a link or a `span`',
    'the base for a styled button component',
  ],
  keywords: ['button', 'headless button', 'aria-disabled', 'focusable disabled', 'render as link'],
  practices: [
    {
      do: true,
      text: 'Pass `focusableWhenDisabled` when the button disables itself while work runs, such as a submit.',
    },
    { do: true, text: 'Pass `nativeButton={false}` whenever `render` returns an element that is not a `<button>`.' },
    { do: true, text: 'For a styled action, use `Button` or `SubmitButton` from `src/components/button` instead.' },
  ],
  parts: {
    Button: {
      description:
        'Renders a `button`, or the `render` element, and forwards its ref. A native button gets `type="button"` unless you pass `type`. While disabled, clicks, pointer presses and keys other than `Tab` do nothing and the caller\'s handlers do not run.',
      props: {
        disabled: { type: 'boolean', doc: 'Makes the button inert.', default: 'false' },
        focusableWhenDisabled: {
          type: 'boolean',
          doc: 'Keeps a disabled button in the tab order, marked `aria-disabled` instead of `disabled`.',
          default: 'false',
        },
        nativeButton: {
          type: 'boolean',
          doc: 'Set `false` when `render` is not a `<button>`, to add `role="button"`, a tab stop, and Enter and Space activation.',
          default: 'true',
        },
      },
    },
  },
  examples: [
    {
      title: 'Focus survives a submit',
      code: `
<Button type='submit' disabled={submitting} focusableWhenDisabled>
  Save
</Button>
`,
    },
    {
      title: 'Button semantics on a link',
      code: `
<Button nativeButton={false} render={<a href='/settings' />}>
  Settings
</Button>
`,
    },
  ],
} satisfies ComponentDoc<{ Button: ButtonProps }>;
