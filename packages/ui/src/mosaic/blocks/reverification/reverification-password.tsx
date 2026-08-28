import type { FormEvent } from 'react';
import { useId } from 'react';

import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Field } from '../../components/field';
import { Input } from '../../components/input';

export interface ReverificationPasswordMessages {
  title: string;
  description: string;
  fieldLabel: string;
  fieldPlaceholder: string;
  secondaryActionLabel: string;
  primaryActionLabel: string;
  pendingLabel: string;
}

export interface ReverificationPasswordProps {
  messages: ReverificationPasswordMessages;
  value: string;
  errorMessage?: string;
  isPending?: boolean;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
}

export function ReverificationPassword({
  messages,
  value,
  errorMessage,
  isPending = false,
  onValueChange,
  onSubmit,
  onCancel,
}: ReverificationPasswordProps) {
  const formId = useId();
  const canSubmit = value.length > 0;

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
      <Card.Content>
        <form
          id={formId}
          onSubmit={handleSubmit}
        >
          <Field.Root
            required
            invalid={Boolean(errorMessage)}
            disabled={isPending}
          >
            <Field.Label>{messages.fieldLabel}</Field.Label>
            <Input
              name='password'
              type='password'
              autoComplete='current-password'
              placeholder={messages.fieldPlaceholder}
              value={value}
              onChange={event => onValueChange(event.target.value)}
            />
            {errorMessage ? <Field.Error>{errorMessage}</Field.Error> : null}
          </Field.Root>
        </form>
      </Card.Content>
      <Card.Footer>
        {onCancel ? (
          <Button
            type='button'
            variant='outline'
            color='neutral'
            fullWidth
            disabled={isPending}
            onClick={onCancel}
          >
            {messages.secondaryActionLabel}
          </Button>
        ) : null}
        <SubmitButton
          form={formId}
          fullWidth
          disabled={!canSubmit}
          focusableWhenDisabled
          isPending={isPending}
          pendingLabel={messages.pendingLabel}
        >
          {messages.primaryActionLabel}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
