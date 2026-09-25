import type { FormEvent, ReactNode } from 'react';
import { useEffect, useId, useState } from 'react';

import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import type { DialogFocusTarget, DialogHandle, DialogTriggerProps } from '../../components/dialog';
import { Dialog } from '../../components/dialog';
import { Field } from '../../components/field';
import { Input } from '../../components/input';
import { type FromPayload, resolveFromPayload as resolve } from '../../utils/resolve-from-payload';
import { useConfirmationController } from '../confirmation/confirmation.controller';

export interface DestructiveControlledProps {
  finalFocus?: DialogFocusTarget;
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Element that opens the dialog */
  trigger?: DialogTriggerProps['render'];
  /** Dialog heading */
  title: string;
  /** What the action destroys */
  description: ReactNode;
  /** Label above the confirmation input */
  fieldLabel: string;
  /** Phrase the user must type to confirm. Also the input's placeholder */
  confirmationValue: string;
  /** Text of the delete button */
  actionLabel: string;
  /** Text of the cancel button (default: "Cancel") */
  cancelLabel?: string;
  /** Callback when delete is confirmed, by button or by Enter */
  onDelete: () => void;
  /** Whether the delete action is in progress */
  isDeleting?: boolean;
  /** Error message to display if the delete action fails */
  errorMessage?: string;
}

type DestructiveCardProps = Omit<DestructiveControlledProps, 'onOpenChange' | 'trigger'>;

function DestructiveCard({
  open,
  finalFocus,
  title,
  description,
  fieldLabel,
  confirmationValue,
  actionLabel,
  cancelLabel = 'Cancel',
  onDelete,
  isDeleting = false,
  errorMessage,
}: DestructiveCardProps) {
  const formId = useId();
  const [typedValue, setTypedValue] = useState('');

  // The caller may close the dialog without going through the trigger or Cancel, so the
  // field is cleared on close rather than in a handler.
  useEffect(() => {
    if (!open) {
      setTypedValue('');
    }
  }, [open]);

  const isConfirmed = typedValue === confirmationValue;

  // The action sits in the footer, outside the form, so `form={formId}` associates the two.
  // That is what makes Enter in the field submit. Both guards are re-checked here because
  // neither spelling stops a native submit: `focusableWhenDisabled` only marks the button
  // `aria-disabled`, and `isPending` only cancels the press.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isConfirmed && !isDeleting) {
      onDelete();
    }
  };

  return (
    <Dialog.Popup
      variant='card'
      finalFocus={finalFocus}
    >
      <Card.Root
        elevation='overlay'
        renderBranding={false}
      >
        <Card.Header>
          <Card.Title>{title}</Card.Title>
          <Card.Description>{description}</Card.Description>
        </Card.Header>
        <Card.Content>
          <form
            id={formId}
            onSubmit={handleSubmit}
          >
            <Field.Root invalid={Boolean(errorMessage)}>
              <Field.Label>{fieldLabel}</Field.Label>
              <Input
                // Not a credential, so 1Password is told to leave it alone rather than
                // cover it with an autofill overlay.
                data-1p-ignore
                placeholder={confirmationValue}
                value={typedValue}
                disabled={isDeleting}
                onChange={event => setTypedValue(event.target.value)}
              />
              <Field.Message>
                <Field.Error>{errorMessage}</Field.Error>
              </Field.Message>
            </Field.Root>
          </form>
        </Card.Content>
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
            form={formId}
            fullWidth
            color='negative'
            isPending={isDeleting}
            disabled={!isConfirmed}
            focusableWhenDisabled
          >
            {actionLabel}
          </SubmitButton>
        </Card.Footer>
      </Card.Root>
    </Dialog.Popup>
  );
}

function ControlledDestructive({ open, onOpenChange, trigger, ...props }: DestructiveControlledProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      {trigger ? <Dialog.Trigger render={trigger} /> : null}
      <DestructiveCard
        open={open}
        {...props}
      />
    </Dialog.Root>
  );
}

export interface DestructiveHandle<Payload> extends DialogHandle<Payload> {
  open(payload: Payload): void;
}

function createHandle<Payload>(): DestructiveHandle<Payload> {
  return Dialog.createHandle<Payload>();
}

export interface DestructiveHandleProps<Payload> {
  handle: DestructiveHandle<Payload>;
  finalFocus?: DialogFocusTarget;
  title: FromPayload<Payload, string>;
  description: FromPayload<Payload, ReactNode>;
  fieldLabel: FromPayload<Payload, string>;
  confirmationValue: FromPayload<Payload, string>;
  actionLabel: FromPayload<Payload, string>;
  cancelLabel?: string;
  onDelete: (payload: Payload) => Promise<void> | void;
}

function HandleDestructive<Payload>({
  handle,
  finalFocus,
  title,
  description,
  fieldLabel,
  confirmationValue,
  actionLabel,
  cancelLabel,
  onDelete,
}: DestructiveHandleProps<Payload>) {
  const controller = useConfirmationController();

  return (
    <Dialog.Root
      handle={handle}
      open={controller.isOpen}
      onOpenChange={controller.onOpenChange}
    >
      {({ payload }) =>
        payload === undefined ? null : (
          <DestructiveCard
            open={controller.isOpen}
            finalFocus={finalFocus}
            title={resolve(title, payload)}
            description={resolve(description, payload)}
            fieldLabel={resolve(fieldLabel, payload)}
            confirmationValue={resolve(confirmationValue, payload)}
            actionLabel={resolve(actionLabel, payload)}
            cancelLabel={cancelLabel}
            onDelete={() =>
              controller.onConfirm(async () => {
                await onDelete(payload);
              })
            }
            isDeleting={controller.isConfirming}
            errorMessage={controller.errorMessage}
          />
        )
      }
    </Dialog.Root>
  );
}

export type DestructiveProps<Payload = unknown> = DestructiveControlledProps | DestructiveHandleProps<Payload>;

/**
 * Type-to-confirm dialog for an action that cannot be undone. The delete button stays inert
 * until the typed phrase matches `confirmationValue`.
 *
 * Controlled: the caller owns `open`, `isDeleting`, and `errorMessage`. With a `handle`,
 * the block owns all three, using the same controller as `Confirmation`. Mount it once and
 * call `handle.open(payload)` from menu items; `onDelete` resolves to close or rejects to
 * show an error. In both forms the block holds the typed phrase.
 *
 * @example
 * <Destructive
 *   open={snapshot.value === 'confirming' || snapshot.value === 'deleting'}
 *   onOpenChange={open => send({ type: open ? 'OPEN' : 'CANCEL' })}
 *   trigger={<Button color='negative'>Delete account</Button>}
 *   title='Delete account?'
 *   description='All of your data will be permanently deleted.'
 *   fieldLabel='Type “Delete account” below to continue'
 *   confirmationValue='Delete account'
 *   actionLabel='Delete account'
 *   onDelete={() => send({ type: 'CONFIRM' })}
 *   isDeleting={snapshot.value === 'deleting'}
 *   errorMessage={snapshot.context.errorMessage}
 * />
 */
export function Destructive<Payload = unknown>(props: DestructiveProps<Payload>) {
  return 'handle' in props ? <HandleDestructive<Payload> {...props} /> : <ControlledDestructive {...props} />;
}

Destructive.createHandle = createHandle;
