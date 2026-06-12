import React, { useEffect, useState } from 'react';
import type { HTMLAttributes } from 'react';

import { Box } from '../components/box';
import { Button } from '../components/button';
import { Dialog } from '../components/dialog';
import { Input } from '../components/input';

interface DestructiveProps {
  trigger: (props: Omit<HTMLAttributes<HTMLElement>, 'color'>) => React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  primaryActionLabel: string;
  resourceName: string;
  onDelete: () => void | Promise<void>;
  isDeleting: boolean;
}

export function Destructive({
  trigger,
  open,
  onOpenChange,
  title,
  description,
  primaryActionLabel,
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
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Description>{description}</Dialog.Description>
            <Box
              render={p => (
                <form
                  {...p}
                  onSubmit={handleSubmit}
                />
              )}
              sx={t => ({
                marginBlockStart: t.spacing(3),
              })}
            >
              <Box
                render={p => <label {...p} />}
                sx={t => ({
                  ...t.text('sm'),
                  fontWeight: t.font.medium,
                })}
              >
                Type &quot;{resourceName}&quot; below to continue.
                <Input
                  value={confirmValue}
                  onChange={e => setConfirmValue(e.target.value)}
                  disabled={isDeleting}
                  sx={t => ({
                    marginBlockStart: t.spacing(1),
                  })}
                />
              </Box>
              <Box
                sx={t => ({
                  marginBlockStart: t.spacing(4),
                })}
              >
                <Button
                  type='submit'
                  color='destructive'
                  disabled={!canSubmit}
                >
                  {primaryActionLabel}
                </Button>
              </Box>
            </Box>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
