/** @jsxImportSource @emotion/react */
import { Destructive } from '@clerk/ui/mosaic/block/destructive';
import { Button } from '@clerk/ui/mosaic/components/button';
import type { HTMLAttributes } from 'react';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Blocks',
  title: 'Destructive',
  source: 'packages/ui/src/mosaic/block/destructive.tsx',
};

function DestructiveTrigger(props: Omit<HTMLAttributes<HTMLElement>, 'color'>) {
  return (
    <Button
      {...props}
      color='destructive'
    >
      Delete organization
    </Button>
  );
}

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
      trigger={DestructiveTrigger}
      open={open}
      onOpenChange={setOpen}
      title='Delete organization'
      description='Are you sure you want to delete this organization?'
      primaryActionLabel='Delete organization'
      resourceName='Example organization'
      onDelete={handleDelete}
      isDeleting={isDeleting}
    />
  );
}
