import { useMergeRefs } from '@floating-ui/react';
import type { FormEvent, ReactNode, Ref } from 'react';
import { useId } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Field } from '../../../components/field';
import { useFlowAutoFocus } from '../../../components/flow';
import { Otp } from '../../../components/otp';
import { Form } from '../../../primitives/form';
import { CODE_LENGTH } from '../../../utils/verification';

export interface ReverificationOtpMessages {
  title: string;
  description: string;
  fieldLabel: string;
  secondaryActionLabel: string;
  primaryActionLabel: string;
  pendingLabel: string;
}

export interface ReverificationOtpResend {
  text: string;
  label: ReactNode;
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
  focusRef?: Ref<HTMLElement>;
}

export function ReverificationOTP({
  messages,
  value,
  length = CODE_LENGTH,
  errorMessage,
  isPending = false,
  resend,
  onValueChange,
  onComplete,
  onSubmit,
  onCancel,
  focusRef,
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
            <Otp
              ref={useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLInputElement>()])}
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
            <Field.Message>
              <Field.Error>{errorMessage}</Field.Error>
            </Field.Message>
            {resend ? (
              <Field.Description>
                {resend.text}{' '}
                <Button
                  type='button'
                  size='sm'
                  color='neutral'
                  variant='link'
                  disabled={resend.disabled || isPending}
                  onClick={resend.onClick}
                >
                  {resend.label}
                </Button>
              </Field.Description>
            ) : null}
          </Field.Root>
        </Form>
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
          isPending={isPending}
          pendingLabel={messages.pendingLabel}
        >
          {messages.primaryActionLabel}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
