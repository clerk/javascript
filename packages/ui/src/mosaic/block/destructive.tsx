import React, { useEffect, useState } from 'react';

import { Box } from '../components/box';
import { Button } from '../components/button';
import { Dialog } from '../components/dialog';
import { Heading } from '../components/heading';
import { Input } from '../components/input';
import { Text } from '../components/text';

interface DestructiveProps {
  trigger: React.ComponentProps<typeof Dialog>['trigger'];
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
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
    >
      <Dialog.Title render={p => <Heading {...p} />}>{title}</Dialog.Title>
      <Dialog.Description render={p => <Text {...p} />}>{description}</Dialog.Description>
      <form onSubmit={handleSubmit}>
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
          <ButtonGroup>
            <Button disabled={!canSubmit}>Cancel</Button>
            <Button
              type='submit'
              intent='destructive'
              disabled={!canSubmit}
            >
              {primaryActionLabel}
            </Button>
          </ButtonGroup>
        </Box>
      </form>
    </Dialog>
  );
}

function ButtonGroup({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={t => ({
        display: 'flex',
        columnGap: t.spacing(2),
      })}
    >
      {children}
    </Box>
  );
}
