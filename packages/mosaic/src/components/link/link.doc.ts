import type { ComponentDoc } from '../../docs-schema';
import type { LinkProps } from './link';

export default {
  name: 'Link',
  description: "An inline text link, underlined on hover. With `target='_blank'` it appends an external-link icon.",
  useFor: ['a text link to another page', 'a link that opens in a new tab', 'an inline link inside a sentence'],
  keywords: ['link', 'anchor', 'href', 'external link', 'a'],
  practices: [
    { do: true, text: 'Pass `render` to use a router link while keeping the styles.' },
    { do: false, text: "Use it for an action that does not navigate. Use `Button` with `variant='link'` instead." },
  ],
  parts: {
    Link: {
      description: 'Renders an `a`, or the `render` element, and forwards its ref.',
      slot: 'cl-link',
      props: {
        color: {
          type: "'primary' | 'neutral' | 'negative'",
          doc: '`primary`, `neutral` or `negative`.',
          default: "'primary'",
        },
        size: { type: "'xs' | 'sm' | 'md' | 'lg'", doc: '`xs`, `sm`, `md` or `lg`.', default: "'md'" },
        target: { type: 'string', doc: '`_blank` adds the external-link icon after the text.' },
      },
    },
  },
  examples: [
    {
      title: 'An external link',
      code: `
<Link href='https://clerk.com/docs' target='_blank'>Docs</Link>
`,
    },
  ],
  related: ['Button'],
} satisfies ComponentDoc<{ Link: LinkProps }>;
