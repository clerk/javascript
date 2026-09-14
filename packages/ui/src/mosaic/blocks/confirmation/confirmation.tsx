import type { ReactNode } from 'react';

import { Banner } from '../../components/banner';
import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import type { DialogHandle, DialogTriggerProps } from '../../components/dialog';
import { Dialog } from '../../components/dialog';
import { useConfirmationController } from './confirmation.controller';

interface ConfirmationCardProps {
  title: string;
  description: ReactNode;
  actionLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  isConfirming: boolean;
  errorMessage: string | undefined;
}

function ConfirmationCard({
  title,
  description,
  actionLabel,
  cancelLabel,
  onConfirm,
  isConfirming,
  errorMessage,
}: ConfirmationCardProps) {
  return (
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
  );
}

export interface ConfirmationControlledProps {
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

function ControlledConfirmation({
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
}: ConfirmationControlledProps) {
  return (
    <Dialog.Root
      closedBy='closerequest'
      open={open}
      onOpenChange={onOpenChange}
    >
      {trigger ? <Dialog.Trigger render={trigger} /> : null}
      <ConfirmationCard
        title={title}
        description={description}
        actionLabel={actionLabel}
        cancelLabel={cancelLabel}
        onConfirm={onConfirm}
        isConfirming={isConfirming}
        errorMessage={errorMessage}
      />
    </Dialog.Root>
  );
}

/** Opens the block from anywhere with the payload the confirmation is about. Create with `Confirmation.createHandle()` */
export type ConfirmationHandle<Payload> = DialogHandle<Payload>;

type FromPayload<Payload, Value> = Value | ((payload: Payload) => Value);

function isFromPayload<Payload, Value>(value: FromPayload<Payload, Value>): value is (payload: Payload) => Value {
  return typeof value === 'function';
}

function resolve<Payload, Value>(value: FromPayload<Payload, Value>, payload: Payload): Value {
  return isFromPayload(value) ? value(payload) : value;
}

export interface ConfirmationHandleProps<Payload> {
  /** Opens the dialog with a payload from anywhere: `handle.open(payload)` */
  handle: ConfirmationHandle<Payload>;
  /** Dialog heading, or a function of the payload */
  title: FromPayload<Payload, string>;
  /** What the action does and why it warrants a second look, or a function of the payload. Takes markup, for a name to emphasise */
  description: FromPayload<Payload, ReactNode>;
  /** Text of the confirming button, or a function of the payload */
  actionLabel: FromPayload<Payload, string>;
  /** Text of the cancel button (default: "Cancel") */
  cancelLabel?: string;
  /** Runs the action for the payload. Resolve to close the dialog; reject with an `Error` to keep it open showing why */
  onConfirm: (payload: Payload) => Promise<void> | void;
}

function HandleConfirmation<Payload>({
  handle,
  title,
  description,
  actionLabel,
  cancelLabel = 'Cancel',
  onConfirm,
}: ConfirmationHandleProps<Payload>) {
  const controller = useConfirmationController();

  return (
    <Dialog.Root
      closedBy='closerequest'
      handle={handle}
      open={controller.isOpen}
      onOpenChange={controller.onOpenChange}
    >
      {({ payload }) =>
        payload === undefined ? null : (
          <ConfirmationCard
            title={resolve(title, payload)}
            description={resolve(description, payload)}
            actionLabel={resolve(actionLabel, payload)}
            cancelLabel={cancelLabel}
            onConfirm={() =>
              controller.onConfirm(async () => {
                await onConfirm(payload);
              })
            }
            isConfirming={controller.isConfirming}
            errorMessage={controller.errorMessage}
          />
        )
      }
    </Dialog.Root>
  );
}

export type ConfirmationProps<Payload = unknown> = ConfirmationControlledProps | ConfirmationHandleProps<Payload>;

/**
 * Confirmation dialog for a destructive action that is worth a second look but not worth
 * making the user type for. Use `Destructive` for the actions that are.
 *
 * Two forms. Controlled: the caller owns `open`, `isConfirming`, and `errorMessage`, and the
 * block holds nothing of its own. With a `handle`: the block owns all three. Mount it once,
 * open it from anywhere with `handle.open(payload)`, and derive the copy and the action from
 * that payload; the promise `onConfirm` returns decides whether it closes or explains a failure.
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
 *
 * @example
 * const removeMember = Confirmation.createHandle<Member>();
 *
 * <Confirmation
 *   handle={removeMember}
 *   title='Remove member'
 *   description={member => <><strong>{member.name}</strong> will be removed from the organization.</>}
 *   actionLabel='Remove'
 *   onConfirm={member => removeMember(member.id)}
 * />
 *
 * <Menu.Item color='negative' onClick={() => removeMember.open(member)}>Remove</Menu.Item>
 */
export function Confirmation<Payload = unknown>(props: ConfirmationProps<Payload>) {
  return 'handle' in props ? <HandleConfirmation<Payload> {...props} /> : <ControlledConfirmation {...props} />;
}

Confirmation.createHandle = Dialog.createHandle;
