import type { FormEvent, ReactNode } from 'react';
import { useEffect, useId, useState } from 'react';

import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import type { DialogProps } from '../../components/dialog';
import { Dialog } from '../../components/dialog';
import { Field } from '../../components/field';
import { Heading } from '../../components/heading';
import { Input } from '../../components/input';
import { Text } from '../../components/text';

export interface DestructiveProps {
  /** Whether the confirmation is showing. Controlled, the way any dialog is. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Renders the button that asks to open the dialog. Omit to open it some other way. */
  trigger?: DialogProps['trigger'];
  /** Names what is about to be destroyed, e.g. `Delete account?`. */
  title: ReactNode;
  /** Spells out what is lost. Sits above the confirmation field. */
  description: ReactNode;
  /** Labels the confirmation field, e.g. `Type “Delete account” below to continue`. */
  fieldLabel: ReactNode;
  /**
   * The phrase the user has to type back. Also the field's placeholder. The block holds
   * what is typed and compares it, so no flow has to carry a keystroke through a machine
   * to find out whether two strings match.
   */
  confirmationValue: string;
  actionLabel: ReactNode;
  /** @default 'Cancel' */
  cancelLabel?: ReactNode;
  /**
   * Asks the caller to run the action. Reached by pressing the action or by Enter in the
   * confirmation field, and only once the typed phrase matches.
   */
  onDelete: () => void;
  /** Keeps the dialog inert and the action pending while the caller works. */
  isDeleting?: boolean;
  /** Why the last attempt failed. Marks the field invalid and renders under it. */
  errorMessage?: string;
}

/**
 * Type-to-confirm dialog for an action that cannot be undone: the destructive button stays
 * inert until the typed phrase matches `confirmationValue`.
 *
 * The block owns one thing, the typed phrase, because nothing outside it can use a
 * half-typed string. Everything with a consequence stays with the caller: `open` closes the
 * dialog, `isDeleting` marks it busy, `error` explains a failure.
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
      size='card'
      closedBy='closerequest'
      open={open}
      onOpenChange={onOpenChange}
    >
      {trigger ? <Dialog.Trigger render={trigger} /> : null}
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup
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
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
