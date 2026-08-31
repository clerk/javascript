import type { FormEvent } from 'react';
import { useId } from 'react';

import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Field } from '../../components/field';
import { Otp } from '../../components/otp';

export interface ReverificationOtpMessages {
  title: string;
  description: string;
  fieldLabel: string;
  secondaryActionLabel: string;
  primaryActionLabel: string;
  pendingLabel: string;
}

export interface ReverificationOtpResend {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

export interface ReverificationOTPProps {
  messages: ReverificationOtpMessages;
  value: string;
  length?: number;
  errorMessage?: string;
  isPending?: boolean;
  resend?: ReverificationOtpResend;
  onValueChange: (value: string) => void;
  onComplete?: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
}

export function ReverificationOTP({
  messages,
  value,
  length = 6,
  errorMessage,
  isPending = false,
  resend,
  onValueChange,
  onComplete,
  onSubmit,
  onCancel,
}: ReverificationOTPProps) {
  const formId = useId();
  const canSubmit = value.length === length;

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
            <Otp
              name='code'
              length={length}
              value={value}
              onValueChange={onValueChange}
              onComplete={code => {
                if (!isPending) {
                  onComplete?.(code);
                }
              }}
            />
            {errorMessage ? <Field.Error>{errorMessage}</Field.Error> : null}
            {resend ? (
              <Button
                type='button'
                size='sm'
                variant='link'
                disabled={resend.disabled || isPending}
                onClick={resend.onClick}
              >
                {resend.label}
              </Button>
            ) : null}
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
