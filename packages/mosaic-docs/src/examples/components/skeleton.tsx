'use client';

import { Skeleton } from '@clerk/mosaic/components/skeleton';
import { Text } from '@clerk/mosaic/components/text';

export default function SkeletonExample() {
  return (
    <>
      <Skeleton
        shape='pill'
        width={40}
        height={40}
      />
      <div>
        <Text>
          <Skeleton>Ada Lovelace</Skeleton>
        </Text>
        <Text color='foreground-secondary'>
          <Skeleton>ada@example.com</Skeleton>
        </Text>
      </div>
      <Skeleton
        width={96}
        height={32}
      />
    </>
  );
}
