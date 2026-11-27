'use client';

import { Avatar } from '@clerk/mosaic/components/avatar';

export default function AvatarExample() {
  return (
    <>
      <Avatar.Root size='lg'>
        <Avatar.Image
          src='https://github.com/clerk.png'
          alt='Clerk'
        />
        <Avatar.Fallback />
      </Avatar.Root>
      <Avatar.Root
        size='lg'
        shape='square'
      >
        <Avatar.Image
          src='https://github.com/clerk.png'
          alt='Clerk'
        />
        <Avatar.Fallback />
      </Avatar.Root>
      <Avatar.Root size='md'>
        <Avatar.Fallback />
      </Avatar.Root>
      <Avatar.Root size='sm'>
        <Avatar.Fallback />
      </Avatar.Root>
    </>
  );
}
