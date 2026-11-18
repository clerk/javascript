import type { ComponentDoc } from '../../docs-schema';
import type { SpinnerProps } from './spinner';

export default {
  name: 'Spinner',
  description:
    'Indeterminate loading spinner, sized to match an `Icon`. Decorative (`aria-hidden`) by default; with `label` it is a `progressbar` named by the label.',
  useFor: ['an indeterminate loading indicator', 'a spinner standing in for an icon'],
  keywords: ['spinner', 'loading', 'progress', 'busy', 'indeterminate'],
  practices: [
    { do: true, text: 'Pass a localized `label` when the spinner is the only sign of progress.' },
    { do: false, text: 'Render a spinner inside a button by hand. Use `SubmitButton` instead.' },
    { do: false, text: 'Show it as soon as work starts. Gate it with `useSpinDelay` so it does not flash.' },
  ],
  parts: {
    Spinner: {
      description: 'Renders a `span` and forwards its ref. Carries `data-size`.',
      slot: 'cl-spinner',
      props: {
        size: { type: "'sm' | 'md'", doc: '`sm` or `md`, matching the `Icon` sizes.', default: "'md'" },
        label: { type: 'string', doc: 'Accessible name. Makes the spinner a `progressbar` instead of decorative.' },
      },
    },
  },
  examples: [
    {
      title: 'Decorative',
      code: `
<Spinner />
`,
    },
    {
      title: 'Announced',
      code: `
<Spinner size='sm' label={t('loading')} />
`,
    },
  ],
  related: ['SubmitButton', 'useSpinDelay', 'Skeleton'],
} satisfies ComponentDoc<{ Spinner: SpinnerProps }>;
