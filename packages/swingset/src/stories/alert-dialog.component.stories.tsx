/** @jsxImportSource @emotion/react */
import type { RenderProps } from '@clerk/headless/utils';
import { AlertDialog, createConfirmHandle, useConfirmedClose } from '@clerk/ui/mosaic/components/alert-dialog';
import { Button } from '@clerk/ui/mosaic/components/button';
import { Dialog } from '@clerk/ui/mosaic/components/dialog';
import { Heading } from '@clerk/ui/mosaic/components/heading';
import { Input } from '@clerk/ui/mosaic/components/input';
import { Text } from '@clerk/ui/mosaic/components/text';
import React from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './alert-dialog.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'AlertDialog',
  source: 'packages/ui/src/mosaic/components/alert-dialog/alert-dialog.tsx',
  styleEngine: 'stylex',
};

const deleteTrigger = (props: RenderProps) => (
  <Button
    {...props}
    color='negative'
  >
    Delete organization
  </Button>
);

export function Default() {
  return (
    <AlertDialog trigger={deleteTrigger}>
      {({ close }) => (
        <>
          <AlertDialog.Title render={<Heading size='sm' />}>Delete Acme Inc?</AlertDialog.Title>
          <AlertDialog.Description render={<Text />}>
            The organization and everything in it will be permanently removed. This cannot be undone.
          </AlertDialog.Description>
          <AlertDialog.Actions>
            <AlertDialog.Close render={<Button variant='outline' />}>Cancel</AlertDialog.Close>
            {/* Not an `AlertDialog.Close`: the action is where the work happens, so the caller
                closes once it resolves rather than the button closing on press. */}
            <Button
              color='negative'
              onClick={close}
            >
              Delete organization
            </Button>
          </AlertDialog.Actions>
        </>
      )}
    </AlertDialog>
  );
}

const addEmailTrigger = (props: RenderProps) => <Button {...props}>Add email address</Button>;

/**
 * The case the stack was built for: a form prompt raising a confirmation over itself rather than
 * discarding what was typed.
 *
 * `useConfirmedClose` wraps the dialog's own `onOpenChange`, so every close the dialog owns —
 * Escape, the corner X, `Dialog.Close` — is guarded by the one hook, and the veto is simply the
 * absence of a commit. `AlertDialog.Confirm` renders inside the dialog it guards, which is what
 * puts the two in the same floating tree: escape ordering, the stacking styles and the refcounted
 * scroll lock all depend on it.
 *
 * `finalFocus` puts the caret back in the field. Without it there is nowhere to return to — the
 * confirmation is raised by a close request rather than by a trigger — so keeping editing would
 * leave focus on the body, at the top of the page rather than where the work was.
 */
export function DiscardChanges() {
  const confirm = React.useMemo(() => createConfirmHandle(), []);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const onOpenChange = useConfirmedClose({
    handle: confirm,
    when: () => value.trim() !== '',
    onOpenChange: next => {
      setOpen(next);
      if (!next) {
        setValue('');
      }
    },
    confirm: {
      title: 'Discard changes?',
      description: 'You have not finished adding this address. It will not be saved.',
      actionLabel: 'Discard',
      cancelLabel: 'Keep editing',
      destructive: true,
    },
  });

  return (
    <Dialog
      trigger={addEmailTrigger}
      closedBy='closerequest'
      open={open}
      onOpenChange={onOpenChange}
    >
      {({ close }) => (
        <>
          <Dialog.CloseButton />
          <Dialog.Title render={<Heading size='sm' />}>Add email address</Dialog.Title>
          <Dialog.Description render={<Text />}>
            You will need to verify this address before it can be used.
          </Dialog.Description>
          <Input
            ref={inputRef}
            placeholder='name@example.com'
            value={value}
            onChange={event => setValue(event.target.value)}
          />
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Dialog.Close render={<Button variant='outline' />}>Cancel</Dialog.Close>
            {/* Adding is the one close that must NOT be questioned, so it clears the field the
                guard reads before closing. */}
            <Button
              onClick={() => {
                setValue('');
                close();
              }}
            >
              Add
            </Button>
          </div>

          <AlertDialog.Confirm
            handle={confirm}
            finalFocus={inputRef}
          />
        </>
      )}
    </Dialog>
  );
}
