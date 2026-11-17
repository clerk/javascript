import type { ComponentDoc } from '../../docs-schema';
import type { BannerDescriptionProps, BannerLabelProps, BannerRootProps } from './banner';

export default {
  name: 'Banner',
  description:
    'A tinted strip with a status message inside content: info, warning, error or success. `Banner.Root` draws the icon for its `color`.',
  useFor: [
    'an inline notice inside content: info, warning, error or success',
    'a warning before a risky setting',
    'a success or error message on a page',
  ],
  keywords: ['banner', 'alert', 'notice', 'callout', 'message', 'warning', 'error', 'success', 'info'],
  practices: [
    {
      do: true,
      text: "Pass `role='status'`, or `role='alert'` for an error, when the banner appears in response to something the user did. `Banner.Root` sets no role.",
    },
    { do: false, text: 'Use it for a form-level error on a card. Use `Card.Banner` instead.' },
    { do: false, text: 'Render an icon yourself. The root picks one for its `color`.' },
  ],
  parts: {
    'Banner.Root': {
      description:
        'The strip, with the icon (`cl-banner-icon`) and a content box (`cl-banner-content`) around its children. Renders a `div`.',
      slot: 'cl-banner-root',
      props: {
        color: { type: 'BannerColor', doc: '`neutral`, `warning`, `negative` or `positive`.', default: "'neutral'" },
      },
    },
    'Banner.Label': {
      description: "The headline, as a `p`. Carries the root's `data-color`.",
      slot: 'cl-banner-label',
    },
    'Banner.Description': {
      description: "Supporting copy, as a `p`. Carries the root's `data-color`.",
      slot: 'cl-banner-description',
    },
  },
  examples: [
    {
      title: 'An error',
      code: `
<Banner.Root color='negative' role='alert'>
  <Banner.Label>{m.paymentFailed}</Banner.Label>
  <Banner.Description>{m.renewNow}</Banner.Description>
</Banner.Root>
`,
    },
  ],
  related: ['Card', 'Badge'],
} satisfies ComponentDoc<{
  'Banner.Root': BannerRootProps;
  'Banner.Label': BannerLabelProps;
  'Banner.Description': BannerDescriptionProps;
}>;
