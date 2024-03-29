'use client';

import { ProviderIcon as ClerkElementsProviderIcon } from '@clerk/elements/common';
import Image from 'next/image';
import type { ComponentProps } from 'react';

/**
 * Helper component for easily circumventing Next's typing
 * which requires `src`. It's being passed by the parent component.
 */
export const SocialProviderIcon = (props: ComponentProps<typeof ClerkElementsProviderIcon>) => (
  <ClerkElementsProviderIcon
    {...props}
    asChild
  >
    {/* @ts-expect-error - required props are passed to child */}
    <Image
      height={24}
      width={24}
    />
  </ClerkElementsProviderIcon>
);
