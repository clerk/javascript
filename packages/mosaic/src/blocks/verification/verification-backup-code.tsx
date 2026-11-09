import { useMergeRefs } from '@floating-ui/react';
import type { FormEvent, Ref } from 'react';
import { useId } from 'react';

import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Field } from '../../components/field';
import { useFlowAutoFocus } from '../../components/flow';
import { Input } from '../../components/input';
import { Form } from '../../primitives/form';

export interface VerificationBackupCodeMessages {
  title: string;
  description: string;
  fieldLabel: string;
  secondaryActionLabel: string;
  primaryActionLabel: string;
  pendingLabel: string;
}

export interface VerificationBackupCodeProps {
  messages: VerificationBackupCodeMessages;
  value: string;
  errorMessage?: string;
  globalErrorMessage?: string;
  isPending?: boolean;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function VerificationBackupCode({
  messages,
  value,
  errorMessage,
  globalErrorMessage,
  isPending = false,
  onValueChange,
  onSubmit,
  onCancel,
  focusRef,
}: VerificationBackupCodeProps) {
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
            <Input
              ref={useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLInputElement>()])}
              name='backupCode'
              type='text'
              autoComplete='off'
              spellCheck={false}
              data-1p-ignore
              value={value}
              onChange={event => onValueChange(event.target.value)}
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
