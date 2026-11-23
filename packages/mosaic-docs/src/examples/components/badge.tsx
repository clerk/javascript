'use client';

import { Badge } from '@clerk/mosaic/components/badge';

export default function BadgeExample() {
  return (
    <>
      <Badge color='positive'>Active</Badge>
      <Badge color='warning'>Pending</Badge>
      <Badge color='negative'>Expired</Badge>
      <Badge color='neutral'>Draft</Badge>
    </>
  );
}
