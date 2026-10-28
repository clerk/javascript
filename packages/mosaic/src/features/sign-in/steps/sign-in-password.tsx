import { useMergeRefs } from '@floating-ui/react';
import type { FormEvent, Ref } from 'react';
import { useId, useState } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Field } from '../../../components/field';
import { useFlowAutoFocus } from '../../../components/flow';
import { Icon } from '../../../components/icon';
import { InputGroup } from '../../../components/input-group';
import { styles } from '../sign-in.styles';
import { SignInIdentityPreview } from './sign-in-identity-preview';

export interface SignInPasswordMessages {
  title: string;
  description: string;
  identityEditLabel: string;
  fieldLabel: string;
  fieldPlaceholder: string;
  showPasswordLabel: string;
  hidePasswordLabel: string;
  forgotPasswordLabel: string;
  secondaryActionLabel: string;
  primaryActionLabel: string;
  pendingLabel: string;
}

export interface SignInPasswordProps {
  messages: SignInPasswordMessages;
  identifier: string;
  onEditIdentifier?: () => void;
  value: string;
  errorMessage?: string;
  isPending?: boolean;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onForgotPassword?: () => void;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function SignInPassword({
  messages,
  identifier,
  onEditIdentifier,
  value,
  errorMessage,
  isPending = false,
  onValueChange,
  onSubmit,
  onForgotPassword,
  onCancel,
  focusRef,
}: SignInPasswordProps) {
  const formId = useId();
  const [visible, setVisible] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isPending) {
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
        <SignInIdentityPreview
          identifier={identifier}
          editLabel={messages.identityEditLabel}
          disabled={isPending}
          onEdit={onEditIdentifier}
        />
        <form
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
            <InputGroup.Root>
              <InputGroup.Input
                ref={useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLInputElement>()])}
                name='password'
                type={visible ? 'text' : 'password'}
                autoComplete='current-password'
                placeholder={messages.fieldPlaceholder}
                value={value}
                onChange={event => onValueChange(event.target.value)}
              />
              <InputGroup.End>
                <Button
                  type='button'
                  aria-label={visible ? messages.hidePasswordLabel : messages.showPasswordLabel}
                  onClick={() => setVisible(current => !current)}
                >
                  <Icon name={visible ? 'eye-slash' : 'eye'} />
                </Button>
              </InputGroup.End>
            </InputGroup.Root>
            <Field.Message>
              <Field.Error>{errorMessage}</Field.Error>
            </Field.Message>
            {onForgotPassword ? (
              <Button
                type='button'
                size='sm'
                variant='link'
                disabled={isPending}
                onClick={onForgotPassword}
                xstyle={styles.forgotPassword}
              >
                {messages.forgotPasswordLabel}
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
          isPending={isPending}
          pendingLabel={messages.pendingLabel}
        >
          {messages.primaryActionLabel}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
