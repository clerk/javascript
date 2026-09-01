import type { FormEvent } from 'react';
import { useEffect, useId, useState } from 'react';

import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import type { DialogTriggerProps } from '../../components/dialog';
import { Dialog } from '../../components/dialog';
import { Field } from '../../components/field';
import { Heading } from '../../components/heading';
import { Input } from '../../components/input';
import { Text } from '../../components/text';

export interface DestructiveProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Element that opens the dialog */
  trigger?: DialogTriggerProps['render'];
  /** Dialog heading */
  title: string;
  /** What the action destroys */
  description: string;
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

/**
 * Type-to-confirm dialog for an action that cannot be undone. The delete button stays inert
 * until the typed phrase matches `confirmationValue`.
 *
 * Controlled: the caller owns `open`, `isDeleting`, and `errorMessage`. The block holds only
 * the typed phrase.
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
export function Destructive({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  fieldLabel,
  confirmationValue,
  actionLabel,
  cancelLabel = 'Cancel',
  onDelete,
  isDeleting = false,
  errorMessage,
}: DestructiveProps) {
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
    <Dialog.Root
      closedBy='closerequest'
      open={open}
      onOpenChange={onOpenChange}
    >
      {trigger ? <Dialog.Trigger render={trigger} /> : null}
      <Dialog.Popup
        size='card'
        render={
          <Card.Root
            elevation='overlay'
            renderBranding={false}
          />
        }
      >
        <Dialog.CloseButton />
        <Card.Header>
          <Dialog.Title render={<Heading />}>{title}</Dialog.Title>
          <Dialog.Description render={<Text />}>{description}</Dialog.Description>
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
              {errorMessage ? <Field.Error>{errorMessage}</Field.Error> : null}
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
      </Dialog.Popup>
    </Dialog.Root>
  );
}
