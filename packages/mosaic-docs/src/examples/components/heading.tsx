'use client';

import { Heading } from '@clerk/mosaic/components/heading';

export default function HeadingExample() {
  return (
    <div>
      <Heading
        level={2}
        size='2xl'
      >
        Account
      </Heading>
      <Heading
        level={3}
        size='lg'
      >
        Security
      </Heading>
      <Heading
        level={4}
        color='foreground-secondary'
      >
        Active devices
      </Heading>
    </div>
  );
}
