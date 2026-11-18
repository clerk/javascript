import type { ComponentDoc } from '../../docs-schema';
import type { BadgeProps } from './badge';

export default {
  name: 'Badge',
  description:
    'A small label that marks nearby content with a status or category. Renders a `span`, or the `render` element, and forwards its ref.',
  useFor: ['a status label such as Active or Failed', 'a category or role tag next to a name', 'a "New" marker'],
  keywords: ['badge', 'tag', 'pill', 'chip', 'status', 'label'],
  practices: [
    {
      do: true,
      text: 'Pick `color` by meaning: `positive` for success, `negative` for failure, `warning` for attention.',
    },
    { do: true, text: 'Pass `render` to make a badge a link, such as `render={<a href="/billing" />}`.' },
    { do: false, text: 'Use a badge for a message the user must read. Use `Banner` instead.' },
  ],
  parts: {
    Badge: {
      description: 'The label. `color` defaults from `BadgeContext` when a parent sets it.',
      slot: 'cl-badge',
      props: {
        color: {
          type: "'primary' | 'neutral' | 'warning' | 'negative' | 'positive'",
          doc: '`primary`, `neutral`, `warning`, `negative` or `positive`.',
          default: "'primary'",
        },
      },
    },
  },
  examples: [
    {
      title: 'A status',
      code: `
<Badge color='positive'>Active</Badge>
`,
    },
    {
      title: 'As a link',
      code: `
<Badge render={<a href='/billing' />}>Upgrade</Badge>
`,
    },
  ],
  related: ['Banner'],
} satisfies ComponentDoc<{ Badge: BadgeProps }>;
