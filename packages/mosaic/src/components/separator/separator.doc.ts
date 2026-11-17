import type { ComponentDoc } from '../../docs-schema';
import type { SeparatorProps } from './separator';

export default {
  name: 'Separator',
  description:
    'A horizontal rule between blocks of content, as `role="separator"`. Without children it is a 1px line; with children it is a labelled divider with a line on each side. Carries `data-labelled` when labelled.',
  useFor: ['a divider between sections or groups', "a labelled divider, such as 'or' between sign-in options"],
  keywords: ['separator', 'divider', 'rule', 'hr', 'or'],
  parts: {
    Separator: {
      description: 'Renders a `div`, or the `render` element, and forwards its ref.',
      slot: 'cl-separator',
    },
  },
  examples: [
    {
      title: 'A line',
      code: `
<Separator />
`,
    },
    {
      title: 'A labelled divider',
      code: `
<Separator>or</Separator>
`,
    },
  ],
} satisfies ComponentDoc<{ Separator: SeparatorProps }>;
