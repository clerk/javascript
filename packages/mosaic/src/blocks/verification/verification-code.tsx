import { useMergeRefs } from '@floating-ui/react';
import type { FormEvent, ReactNode, Ref } from 'react';
import { useId } from 'react';

import { Banner } from '../../components/banner';
import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Field } from '../../components/field';
import { useFlowAutoFocus } from '../../components/flow';
import { Otp } from '../../components/otp';
import { Form } from '../../primitives/form';
import { CODE_LENGTH } from '../../utils/verification';

export interface VerificationCodeMessages {
  title: string;
  description: string;
  fieldLabel: string;
  secondaryActionLabel: string;
  primaryActionLabel: string;
  pendingLabel: string;
}

export interface VerificationCodeResend {
  text: string;
  label: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}

interface VerificationCodeProps {
  messages: VerificationCodeMessages;
  value: string;
  length?: number;
  errorMessage?: string;
  globalErrorMessage?: string;
  isPending?: boolean;
  resend?: VerificationCodeResend;
  identityPreview?: ReactNode;
  notice?: string;
  onValueChange: (value: string) => void;
  onComplete?: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function VerificationCode({
  messages,
  value,
  length = CODE_LENGTH,
  errorMessage,
  globalErrorMessage,
  isPending = false,
  resend,
  identityPreview,
  notice,
  onValueChange,
  onComplete,
  onSubmit,
  onCancel,
  focusRef,
}: VerificationCodeProps) {
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
        {identityPreview}
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
        {notice ? (
          <Banner.Root color='warning'>
            <Banner.Label>{notice}</Banner.Label>
          </Banner.Root>
        ) : null}
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
