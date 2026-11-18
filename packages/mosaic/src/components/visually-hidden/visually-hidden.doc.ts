import type { ComponentDoc } from '../../docs-schema';
import type { VisuallyHiddenProps } from './visually-hidden';

export default {
  name: 'VisuallyHidden',
  description: 'Content exposed to assistive technology but not painted.',
  useFor: [
    'an accessible name for an icon-only button',
    'a screen reader announcement, such as a live status message',
    'text only screen readers should read',
  ],
  keywords: ['visually hidden', 'sr-only', 'screen reader', 'accessible label', 'live region'],
  practices: [
    { do: true, text: "Pass `render={<div role='status' aria-live='polite' />}` for an announcement." },
    { do: true, text: 'Pass `render` where a `span` is not valid in context.' },
  ],
  parts: {
    VisuallyHidden: {
      description: 'Renders a `span`, or the `render` element, and forwards its ref.',
      slot: 'cl-visually-hidden',
    },
  },
  examples: [
    {
      title: 'An icon-only button',
      code: `
<Button>
  <Icon glyph={Trash} />
  <VisuallyHidden>Delete</VisuallyHidden>
</Button>
`,
    },
    {
      title: 'A live message',
      code: `
<VisuallyHidden render={<div role='status' aria-live='polite' />}>{feedback}</VisuallyHidden>
`,
    },
  ],
} satisfies ComponentDoc<{ VisuallyHidden: VisuallyHiddenProps }>;
