'use client';

import { Text } from '@clerk/mosaic/components/text';

export default function TextExample() {
  return (
    <div>
      <Text size='base'>Invitations expire after 30 days.</Text>
      <Text color='foreground-secondary'>ada@example.com</Text>
      <Text color='positive'>Your changes were saved.</Text>
      <Text color='negative'>That code is incorrect.</Text>
    </div>
  );
}
