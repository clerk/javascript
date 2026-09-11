import type { ReactNode } from 'react';

import { Banner } from '../../components/banner';
import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import type { DialogTriggerProps } from '../../components/dialog';
import { Dialog } from '../../components/dialog';

export interface ConfirmationProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Element that opens the dialog */
  trigger?: DialogTriggerProps['render'];
  /** Dialog heading */
  title: string;
  /** What the action does and why it warrants a second look. Takes markup, for a name to emphasise */
  description: ReactNode;
  /** Text of the confirming button */
  actionLabel: string;
  /** Text of the cancel button (default: "Cancel") */
  cancelLabel?: string;
  /** Callback when the action is confirmed */
  onConfirm: () => void;
  /** Whether the confirmed action is in progress */
  isConfirming?: boolean;
  /** Error message to display if the confirmed action fails */
  errorMessage?: string;
}

/**
 * Confirmation dialog for a destructive action that is worth a second look but not worth
 * making the user type for. Use `Destructive` for the actions that are.
 *
 * Controlled: the caller owns `open`, `isConfirming`, and `errorMessage`. The block holds
 * nothing of its own.
 *
 * @example
 * <Confirmation
 *   open={snapshot.value === 'confirming' || snapshot.value === 'removing'}
 *   onOpenChange={open => send({ type: open ? 'OPEN' : 'CANCEL' })}
 *   trigger={<Button color='negative'>Remove</Button>}
 *   title='Remove connected account'
 *   description='Google will be removed from this account. You will no longer be able to use this connected account and any dependent features will no longer work.'
 *   actionLabel='Remove'
 *   onConfirm={() => send({ type: 'CONFIRM' })}
 *   isConfirming={snapshot.value === 'removing'}
 *   errorMessage={snapshot.context.errorMessage}
 * />
 */
export function Confirmation({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  actionLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  isConfirming = false,
  errorMessage,
}: ConfirmationProps) {
  return (
    <Dialog.Root
      closedBy='closerequest'
      open={open}
      onOpenChange={onOpenChange}
    >
      {trigger ? <Dialog.Trigger render={trigger} /> : null}
      <Dialog.Popup size='card'>
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Card.Header>
            <Card.Title>{title}</Card.Title>
            <Card.Description>{description}</Card.Description>
          </Card.Header>
          {errorMessage ? (
            <Card.Content>
              <Banner.Root
                role='alert'
                color='negative'
              >
                <Banner.Label>{errorMessage}</Banner.Label>
              </Banner.Root>
            </Card.Content>
          ) : null}
          <Card.Footer>
            <Dialog.Close
              render={
                <Button
                  variant='outline'
                  fullWidth
                >
                  {cancelLabel}
                </Button>
              }
            />
            <SubmitButton
              type='button'
              fullWidth
              color='negative'
              isPending={isConfirming}
              onClick={onConfirm}
            >
              {actionLabel}
            </SubmitButton>
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
