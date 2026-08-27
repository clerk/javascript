import { Destructive } from '@clerk/ui/mosaic/blocks/destructive';
import { Button } from '@clerk/ui/mosaic/components/button';
import React from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './destructive.stories?raw';

export const meta: StoryMeta = {
  group: 'Blocks',
  title: 'Destructive',
  source: 'packages/ui/src/mosaic/blocks/destructive/destructive.tsx',
};

// A real delete is a network round trip. Without one the action never renders its pending
// state, so both stories wait before they settle.
const settleAfter = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const trigger = (
  <Button
    color='negative'
    variant='outline'
  >
    Delete account
  </Button>
);

/**
 * The block holds the typed phrase and compares it to `confirmationValue`. Everything that
 * decides what the dialog does next stays with the caller: `open` closes it, `isDeleting`
 * marks it busy, `errorMessage` explains a failure.
 */
export function Default() {
  const [open, setOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await settleAfter(2000);
    setIsDeleting(false);
    setOpen(false);
  };

  return (
    <Destructive
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title='Delete account?'
      description='Are you sure you want to delete your account? All of your data will be permanently deleted.'
      fieldLabel='Type “Delete account” below to continue'
      confirmationValue='Delete account'
      actionLabel='Delete account'
      onDelete={() => void handleDelete()}
      isDeleting={isDeleting}
    />
  );
}

/**
 * A failed attempt leaves the dialog up. Pass the sentence the user should read as
 * `errorMessage`, and clear it when the next attempt starts.
 */
export function WithError() {
  const [open, setOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(undefined);

  const handleDelete = async () => {
    setErrorMessage(undefined);
    setIsDeleting(true);
    await settleAfter(2000);
    setIsDeleting(false);
    setErrorMessage('Your subscription is still active. Cancel it before you delete your account.');
  };

  // The error belongs to the caller, so the caller drops it. Without this a reopened dialog
  // still shows why the last attempt failed.
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setErrorMessage(undefined);
    }
  };

  return (
    <Destructive
      open={open}
      onOpenChange={handleOpenChange}
      trigger={trigger}
      title='Delete account?'
      description='Are you sure you want to delete your account? All of your data will be permanently deleted.'
      fieldLabel='Type “Delete account” below to continue'
      confirmationValue='Delete account'
      actionLabel='Delete account'
      onDelete={() => void handleDelete()}
      isDeleting={isDeleting}
      errorMessage={errorMessage}
    />
  );
}
