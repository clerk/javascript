import { Confirmation } from '@clerk/ui/mosaic/blocks/confirmation';
import { Button } from '@clerk/ui/mosaic/components/button';
import React from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './confirmation.stories?raw';

export const meta: StoryMeta = {
  group: 'Blocks',
  status: 'stable',
  title: 'Confirmation',
  source: 'packages/ui/src/mosaic/blocks/confirmation/confirmation.tsx',
};

// A real removal is a network round trip. Without one the action never renders its pending
// state, so both stories wait before they settle.
const settleAfter = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const trigger = (
  <Button
    color='negative'
    variant='outline'
  >
    Remove
  </Button>
);

/**
 * The block holds nothing of its own. `open` closes it, `isConfirming` marks it busy,
 * `errorMessage` explains a failure.
 */
export function Default() {
  const [open, setOpen] = React.useState(false);
  const [isConfirming, setIsConfirming] = React.useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    await settleAfter(2000);
    setIsConfirming(false);
    setOpen(false);
  };

  return (
    <Confirmation
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title='Remove connected account'
      description='Google will be removed from this account. You will no longer be able to use this connected account and any dependent features will no longer work.'
      actionLabel='Remove'
      onConfirm={() => void handleConfirm()}
      isConfirming={isConfirming}
    />
  );
}

/**
 * A failed attempt leaves the dialog up. Pass the sentence the user should read as
 * `errorMessage`, and clear it when the next attempt starts.
 */
export function WithError() {
  const [open, setOpen] = React.useState(false);
  const [isConfirming, setIsConfirming] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(undefined);

  const handleConfirm = async () => {
    setErrorMessage(undefined);
    setIsConfirming(true);
    await settleAfter(2000);
    setIsConfirming(false);
    setErrorMessage('Google is your only way to sign in. Add a password or another account first.');
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
    <Confirmation
      open={open}
      onOpenChange={handleOpenChange}
      trigger={trigger}
      title='Remove connected account'
      description='Google will be removed from this account. You will no longer be able to use this connected account and any dependent features will no longer work.'
      actionLabel='Remove'
      onConfirm={() => void handleConfirm()}
      isConfirming={isConfirming}
      errorMessage={errorMessage}
    />
  );
}
