import React, { useEffect, useState } from 'react';
import type { HTMLAttributes } from 'react';

import { Button } from '../components/button';
import { Dialog } from '../components/dialog';
import { Input } from '../components/input';

interface DestructiveProps {
  trigger: (props: Omit<HTMLAttributes<HTMLElement>, 'color'>) => React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceType: string;
  resourceName: string;
  onDelete: () => void | Promise<void>;
  isDeleting: boolean;
}

export function Destructive({
  trigger,
  open,
  onOpenChange,
  resourceType,
  resourceName,
  onDelete,
  isDeleting,
}: DestructiveProps) {
  const [confirmValue, setConfirmValue] = useState('');
  const canSubmit = confirmValue === resourceName && !isDeleting;

  useEffect(() => {
    if (!open) setConfirmValue('');
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) onDelete();
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Trigger render={trigger} />
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup>
            <Dialog.Title>Leave {resourceType}</Dialog.Title>
            <Dialog.Description>
              Are you sure you want to leave this {resourceType}? You will lose access to this {resourceType} and its
              applications.
            </Dialog.Description>
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <label>
                Type &quot;{resourceName}&quot; below to continue.
                <Input
                  value={confirmValue}
                  onChange={e => setConfirmValue(e.target.value)}
                  disabled={isDeleting}
                />
              </label>
              <Button
                type='submit'
                color='destructive'
                disabled={!canSubmit}
                sx={{ alignSelf: 'flex-start' }}
              >
                {isDeleting ? 'Leaving…' : `Leave ${resourceType}`}
              </Button>
            </form>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
