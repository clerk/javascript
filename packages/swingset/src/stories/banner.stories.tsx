import type { BannerRootProps } from '@clerk/ui/mosaic/components/banner';
import { Banner } from '@clerk/ui/mosaic/components/banner';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './banner.stories?raw';

// StyleX has no runtime recipe to derive knobs from, so the variant surface is described
// here to drive the playground + prop table. Keys mirror `BannerRootProps`.
export const meta: StoryMeta = {
  group: 'Components',
  title: 'Banner',
  source: 'packages/ui/src/mosaic/components/banner/banner.tsx',
  styles: {
    _variants: {
      color: { neutral: {}, warning: {}, negative: {} },
    },
    _defaultVariants: {
      color: 'neutral',
    },
  },
};

// Story functions accept Record<string,unknown> (knob values) and cast to BannerRootProps.
// The cast is unavoidable: knobs are dynamically typed; Banner.Root has a strict prop interface.
function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as BannerRootProps;
}

export function Default(props: Record<string, unknown>) {
  return (
    <Banner.Root {...knobsAsProps(props)}>
      <Banner.Label>Info banner</Banner.Label>
      <Banner.Description>Here is a tip for how this should work</Banner.Description>
    </Banner.Root>
  );
}

export function Colors() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Banner.Root color='negative'>
        <Banner.Label>Error banner</Banner.Label>
        <Banner.Description>
          Renew now to avoid service interruption or upgrade to a paid plan to continue using the service.
        </Banner.Description>
      </Banner.Root>
      <Banner.Root color='warning'>
        <Banner.Label>Warning banner</Banner.Label>
        <Banner.Description>
          Your payment could not be processed. Please check your payment method and try again.
        </Banner.Description>
      </Banner.Root>
      <Banner.Root color='neutral'>
        <Banner.Label>Info banner</Banner.Label>
        <Banner.Description>Here is a tip for how this should work</Banner.Description>
      </Banner.Root>
    </div>
  );
}

export function LabelOnly() {
  return (
    <Banner.Root color='warning'>
      <Banner.Label>Your trial ends in 3 days</Banner.Label>
    </Banner.Root>
  );
}

export function Announced() {
  return (
    <Banner.Root
      color='negative'
      role='alert'
    >
      <Banner.Label>Payment failed</Banner.Label>
      <Banner.Description>We could not charge your card. Update your payment method to continue.</Banner.Description>
    </Banner.Root>
  );
}
