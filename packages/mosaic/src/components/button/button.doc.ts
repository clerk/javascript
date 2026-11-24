import type { ComponentDoc } from '../../docs-schema';
import type { ButtonProps } from './button';

export default {
  name: 'Button',
  description:
    'A clickable action. `color`, `variant` and `size` are independent axes, with `shape` and `fullWidth` as modifiers.',
  useFor: [
    'an action that finishes at once, such as Cancel or opening a dialog',
    'an action that waits on async work, such as a form submit or a confirm, with `SubmitButton`',
    'an icon-only action',
  ],
  keywords: ['button', 'action', 'submit', 'cta', 'link button', 'icon button'],
  practices: [
    {
      do: true,
      text: "Use `SubmitButton` for any action that waits on async work. In a form it submits; outside one, pass `type='button'` and `onClick`, as `Confirmation` does.",
    },
    { do: true, text: 'Use `Button` for actions that finish at once, such as Cancel, Back or opening a dialog.' },
    {
      do: true,
      text: 'In a view, hold the primary action pending until the next step renders. The rules are in the Views guide (`mosaic guides inspect views`).',
    },
    { do: true, text: 'Use `ProviderButton` to sign in with a third-party provider.' },
    { do: true, text: 'Pass `focusableWhenDisabled` when a button disables itself mid-interaction.' },
    { do: true, text: 'Pass `touchTarget={false}` in a dense toolbar, where grown hit areas would overlap.' },
    { do: false, text: 'Render a spinner inside `Button` by hand. `SubmitButton` owns the spinner delay.' },
  ],
  parts: {
    Button: {
      description: 'Renders a `button` and forwards its ref. Defaults can come from `ButtonContext`.',
      slot: 'cl-button',
      props: {
        children: { type: 'ReactNode', doc: 'The label.' },
        color: {
          type: "'primary' | 'neutral' | 'negative'",
          doc: '`primary`, `neutral` or `negative`.',
          default: "'primary'",
        },
        variant: {
          type: "'filled' | 'outline' | 'ghost' | 'link'",
          doc: '`filled`, `outline`, `ghost` or `link`.',
          default: "'filled'",
        },
        size: { type: "'xs' | 'sm' | 'md' | 'lg'", doc: '`xs`, `sm`, `md` or `lg`.', default: "'md'" },
        shape: {
          type: "'default' | 'square' | 'circle'",
          doc: '`default`, `square` or `circle`. Use `square` or `circle` for an icon-only button.',
          default: "'default'",
        },
        fullWidth: { type: 'boolean', doc: 'Stretches to the width of the container.', default: 'false' },
        touchTarget: {
          type: 'boolean',
          doc: 'Floors the hit area at the touch target size under a coarse pointer, without changing the rendered size. No effect on `link`.',
          default: 'true',
        },
        focusableWhenDisabled: {
          type: 'boolean',
          doc: 'Keeps the button in the tab order while `disabled`, marked `aria-disabled` and inert to clicks.',
          default: 'false',
        },
      },
    },
  },
  playground: { part: 'Button', defaults: { children: 'Save changes' } },
  examples: [
    {
      title: 'An action',
      code: `
<Button variant='outline' onClick={onCancel}>Cancel</Button>
`,
    },
  ],
  related: ['SubmitButton', 'ProviderButton', 'useForm', 'usePendingAction'],
} satisfies ComponentDoc<{ Button: ButtonProps }>;
