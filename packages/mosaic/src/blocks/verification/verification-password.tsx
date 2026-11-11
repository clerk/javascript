import { useMergeRefs } from '@floating-ui/react';
import type { FormEvent, Ref } from 'react';
import { useId } from 'react';

import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Field } from '../../components/field';
import { useFlowAutoFocus } from '../../components/flow';
import { PasswordInput } from '../../components/password-input';
import { Form } from '../../primitives/form';

interface VerificationPasswordMessages {
  title: string;
  description: string;
  fieldLabel: string;
  fieldPlaceholder: string;
  showPasswordLabel: string;
  hidePasswordLabel: string;
  secondaryActionLabel: string;
  primaryActionLabel: string;
  pendingLabel: string;
}

interface VerificationPasswordProps {
  messages: VerificationPasswordMessages;
  value: string;
  errorMessage?: string;
  globalErrorMessage?: string;
  isPending?: boolean;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function VerificationPassword({
  messages,
  value,
  errorMessage,
  globalErrorMessage,
  isPending = false,
  onValueChange,
  onSubmit,
  onCancel,
  focusRef,
}: VerificationPasswordProps) {
  const formId = useId();

  const canSubmit = value !== '';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit && !isPending) {
      onSubmit();
    }
  };

  return (
    <>
      <Card.Header>
        <Card.Title>{messages.title}</Card.Title>
        <Card.Description>{messages.description}</Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage}
      </Card.Banner>
      <Card.Content>
        <Form
          id={formId}
          onSubmit={handleSubmit}
        >
          <Field.Root
            required
            invalid={Boolean(errorMessage)}
            disabled={isPending}
            focusableWhenDisabled
          >
            <Field.Label>{messages.fieldLabel}</Field.Label>
            <PasswordInput
              ref={useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLInputElement>()])}
              name='password'
              autoComplete='current-password'
              placeholder={messages.fieldPlaceholder}
              value={value}
              onChange={event => onValueChange(event.target.value)}
              showPasswordLabel={messages.showPasswordLabel}
              hidePasswordLabel={messages.hidePasswordLabel}
            />
            <Field.Message>
              <Field.Error>{errorMessage}</Field.Error>
            </Field.Message>
          </Field.Root>
        </Form>
      </Card.Content>
      <Card.Footer>
        {onCancel ? (
          <Button
            type='button'
            variant='outline'
            color='neutral'
            disabled={isPending}
            onClick={onCancel}
          >
            {messages.secondaryActionLabel}
          </Button>
        ) : null}
        <SubmitButton
          form={formId}
          disabled={!canSubmit}
          isPending={isPending}
          pendingLabel={messages.pendingLabel}
        >
          {messages.primaryActionLabel}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
