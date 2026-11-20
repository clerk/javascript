'use client';

import { Banner } from '@clerk/mosaic/components/banner';

export default function BannerExample() {
  return (
    <Banner.Root
      color='negative'
      role='alert'
    >
      <Banner.Label>Your payment failed</Banner.Label>
      <Banner.Description>Update your card to keep your plan active.</Banner.Description>
    </Banner.Root>
  );
}
