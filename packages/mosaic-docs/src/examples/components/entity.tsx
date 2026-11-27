'use client';

import { Avatar } from '@clerk/mosaic/components/avatar';
import { Entity } from '@clerk/mosaic/components/entity';

export default function EntityExample() {
  return (
    <Entity.Root>
      <Entity.Media>
        <Avatar.Root size='fit'>
          <Avatar.Image
            src='https://github.com/clerk.png'
            alt=''
          />
          <Avatar.Fallback />
        </Avatar.Root>
      </Entity.Media>
      <Entity.Content>
        <Entity.Label>Ada Lovelace</Entity.Label>
        <Entity.Description>ada@example.com</Entity.Description>
      </Entity.Content>
    </Entity.Root>
  );
}
