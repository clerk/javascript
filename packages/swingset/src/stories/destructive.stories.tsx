/** @jsxImportSource @emotion/react */
import { useState } from 'react';

import { Button } from '@clerk/ui/mosaic/components/button';
import { Destructive } from '@clerk/ui/mosaic/block/destructive';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Blocks',
  title: 'Destructive',
  source: 'packages/ui/src/mosaic/block/destructive.tsx',
};

export function Default() {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await new Promise<void>(resolve => setTimeout(resolve, 2000));
    setIsDeleting(false);
    setOpen(false);
  };

  return (
    <Destructive
      trigger={props => <Button {...props}>Leave organization</Button>}
      open={open}
      onOpenChange={setOpen}
      resourceType='organization'
      resourceName="Alex's Organization"
      onDelete={handleDelete}
      isDeleting={isDeleting}
    />
  );
}
