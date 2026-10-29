import type { FormEvent, RefObject } from 'react';
import { useEffect, useId, useRef, useState } from 'react';

import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Dialog } from '../../components/dialog';
import { Field } from '../../components/field';
import { Input } from '../../components/input';
import { Form } from '../../primitives/form';
import { type FromPayload, resolveFromPayload as resolve } from '../../utils/resolve-from-payload';
import type { ConfirmBlockProps, ConfirmStepProps } from '../confirm/confirm-shell';
import { ConfirmShell } from '../confirm/confirm-shell';

export interface DestructiveProps<Payload = void> extends ConfirmBlockProps<Payload> {
  /** Label above the confirmation input, or a function of the payload */
  fieldLabel: FromPayload<Payload, string>;
  /** Phrase the user must type to confirm, or a function of the payload. Also the input's placeholder */
  confirmationValue: FromPayload<Payload, string>;
}

interface DestructiveStepProps<Payload> extends ConfirmStepProps<Payload> {
  fieldLabel: string;
  confirmationValue: string;
  typedValue: string;
  onTypedValueChange: (value: string) => void;
  inputRef: RefObject<HTMLInputElement>;
}

function DestructiveStep<Payload>({
  title,
  description,
  actionLabel,
  cancelLabel,
  isPending,
  errorMessage,
  confirm,
  fieldLabel,
  confirmationValue,
  typedValue,
  onTypedValueChange,
  inputRef,
}: DestructiveStepProps<Payload>) {
  const formId = useId();
  const isConfirmed = typedValue === confirmationValue;
  // The action sits in the footer, outside the form, so `form={formId}` associates the two.
  // That is what makes Enter in the field submit. Both guards are re-checked here because
  // neither spelling stops a native submit: `focusableWhenDisabled` only marks the button
  // `aria-disabled`, and `isPending` only cancels the press.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isConfirmed && !isPending) {
      confirm();
    }
  };

  return (
    <>
      <Card.Header>
        <Card.Title>{title}</Card.Title>
        <Card.Description>{description}</Card.Description>
      </Card.Header>
      <Card.Content>
        <Form
          id={formId}
          onSubmit={handleSubmit}
        >
          <Field.Root invalid={Boolean(errorMessage)}>
            <Field.Label>{fieldLabel}</Field.Label>
            <Input
              ref={inputRef}
              // Not a credential, so 1Password is told to leave it alone rather than
              // cover it with an autofill overlay.
              data-1p-ignore
              placeholder={confirmationValue}
              value={typedValue}
              disabled={isPending}
              onChange={event => onTypedValueChange(event.target.value)}
            />
            <Field.Message>
              <Field.Error>{errorMessage}</Field.Error>
            </Field.Message>
          </Field.Root>
        </Form>
      </Card.Content>
      <Card.Footer>
        <Dialog.Close
          render={
            <Button
              color='neutral'
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
          isPending={isPending}
          disabled={!isConfirmed}
          focusableWhenDisabled
        >
          {actionLabel}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}

/**
 * Type-to-confirm dialog for an action that cannot be undone. The delete button stays inert
 * until the typed phrase matches `confirmationValue`.
 *
 * An alert dialog: an outside press leaves it open, and the confirm step has no corner dismiss. The
 * verify step a reverified action swaps in shows one, except while the action is being retried.
 *
 * Driven by a `useConfirmController`, the same way as `Confirmation`. The block holds the typed
 * phrase and clears it when the dialog closes.
 *
 * @example
 * const deleteAccount = useConfirmController({ onConfirm: deleteAccountWithReverification, reverification });
 *
 * <Destructive
 *   controller={deleteAccount}
 *   trigger={<Button color='negative'>Delete account</Button>}
 *   title='Delete account?'
 *   description='All of your data will be permanently deleted.'
 *   fieldLabel='Type “Delete account” below to continue'
 *   confirmationValue='Delete account'
 *   actionLabel='Delete account'
 * />
 */
export function Destructive<Payload = void>({ fieldLabel, confirmationValue, ...props }: DestructiveProps<Payload>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [typedValue, setTypedValue] = useState('');
  const { isOpen } = props.controller;

  useEffect(() => {
    if (!isOpen) {
      setTypedValue('');
    }
  }, [isOpen]);

  return (
    <ConfirmShell
      {...props}
      initialFocus={inputRef}
    >
      {step => (
        <DestructiveStep
          {...step}
          fieldLabel={resolve(fieldLabel, step.payload)}
          confirmationValue={resolve(confirmationValue, step.payload)}
          typedValue={typedValue}
          onTypedValueChange={setTypedValue}
          inputRef={inputRef}
        />
      )}
    </ConfirmShell>
  );
}
