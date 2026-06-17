/** @jsxImportSource @emotion/react */
import { Button } from '@clerk/ui/mosaic/components/button';
import { Dialog, dialogRecipe } from '@clerk/ui/mosaic/components/dialog';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Dialog',
  source: 'packages/ui/src/mosaic/components/dialog.tsx',
  styles: dialogRecipe,
};

const dialogTrigger = (props: React.HTMLAttributes<HTMLElement>) => <Button {...props}>Open dialog</Button>;

export function Default(args: Record<string, unknown>) {
  const { size } = args as { size?: 'md' | 'lg' };
  return (
    <Dialog
      size={size}
      trigger={dialogTrigger}
    >
      {({ close }) => (
        <>
          <Dialog.Title>Confirm action</Dialog.Title>
          <Dialog.Description>Are you sure you want to proceed? This action cannot be undone.</Dialog.Description>
          <Button
            intent='destructive'
            onClick={close}
          >
            Cancel
          </Button>
        </>
      )}
    </Dialog>
  );
}
