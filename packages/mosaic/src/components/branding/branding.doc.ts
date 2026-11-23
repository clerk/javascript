import type { ComponentDoc } from '../../docs-schema';
import type { BrandingProps } from './branding';

export default {
  name: 'Branding',
  description: 'The "Secured by Clerk" mark, with the Clerk logo linking to clerk.com in a new tab. Takes no children.',
  useFor: ['the "Secured by Clerk" footer on a card or profile'],
  keywords: ['branding', 'secured by clerk', 'logo', 'footer', 'watermark'],
  practices: [
    {
      do: false,
      text: "Render it in a feature, or hide it with a check of your own. The host's `renderBranding` decides whether it shows.",
    },
  ],
  parts: {
    Branding: {
      description: 'Renders a `span`, or the `render` element. The link carries `cl-branding-link`.',
      slot: 'cl-branding',
    },
  },
  related: ['ClerkLogo', 'Card'],
} satisfies ComponentDoc<{ Branding: BrandingProps }>;
