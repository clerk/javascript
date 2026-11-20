'use client';

import { Button } from '@clerk/mosaic/components/button';

export default function ButtonExample() {
  return (
    <>
      <Button>Save changes</Button>
      <Button
        variant='outline'
        color='neutral'
      >
        Cancel
      </Button>
      <Button
        variant='ghost'
        color='negative'
      >
        Delete
      </Button>
    </>
  );
}
