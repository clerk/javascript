import type { ComponentDoc } from '../../docs-schema';
import type { ClerkLogo } from './clerk-logo';

export default {
  name: 'ClerkLogo',
  description:
    'The Clerk wordmark as an inline `svg` in `currentColor`, with `role="img"` and the accessible name "Clerk". Takes any `svg` prop.',
  useFor: ['the Clerk logo', 'a Clerk wordmark that follows the text color'],
  keywords: ['clerk logo', 'logo', 'wordmark', 'brand', 'svg'],
  practices: [
    { do: true, text: 'Size it with `height`; the width follows the view box.' },
    { do: false, text: 'Use it for the "Secured by Clerk" mark. Use `Branding` instead.' },
  ],
  parts: {
    ClerkLogo: {
      description: 'Renders the `svg`. Props spread last, so they can replace `role` and `aria-label`.',
    },
  },
  examples: [
    {
      title: 'A small logo',
      code: `
<ClerkLogo height={14} />
`,
    },
  ],
  related: ['Branding'],
} satisfies ComponentDoc<{ ClerkLogo: Parameters<typeof ClerkLogo>[0] }>;
