'use client';

import { SocialProviderImage as ClerkElementsSocialProviderImage } from '@clerk/elements';
import Image from 'next/image';
import type { ComponentProps } from 'react';

/**
 * Helper component for easily circumventing Next's typing
 * which requires `src`. It's being passed by the parent component.
 */
export const SocialProviderImage = (props: ComponentProps<typeof ClerkElementsSocialProviderImage>) => (
  <ClerkElementsSocialProviderImage
    {...props}
    asChild
  >
    {/* @ts-expect-error - required props are passed to child */}
    <Image
      height={24}
      width={24}
    />
  </ClerkElementsSocialProviderImage>
);
