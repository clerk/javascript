import { useMergeRefs } from '@floating-ui/react';
import type { Ref } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Field } from '../../../components/field';
import { useFlowAutoFocus } from '../../../components/flow';
import type { FieldFeedback, UseFormResult } from '../../../components/form';
import { PasswordInput } from '../../../components/password-input';
import { useMessages } from '../../../localization';
import { Form } from '../../../primitives/form';
import { styles } from '../sign-in.styles';
import type { SignInSubmitEvent, SignInValues } from '../sign-in.types';
import { SignInIdentityPreview } from './sign-in-identity-preview';

interface SignInPasswordProps {
  identifier: string;
  onEditIdentifier?: () => void;
  form: UseFormResult<SignInValues>;
  errorMessage?: string;
  isPending: boolean;
  onSubmit: (event: SignInSubmitEvent) => void;
  onForgotPassword?: () => void;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function SignInPassword({
  identifier,
  onEditIdentifier,
  form,
  errorMessage,
  isPending,
  onSubmit,
  onForgotPassword,
  onCancel,
  focusRef,
}: SignInPasswordProps) {
  const m = useMessages('signIn');
  const { ref: passwordFieldRef, ...password } = form.register('password');
  const passwordRef = useMergeRefs<HTMLElement>([passwordFieldRef, focusRef, useFlowAutoFocus<HTMLInputElement>()]);
  const feedback: FieldFeedback | undefined = errorMessage
    ? { type: 'error', message: errorMessage }
    : form.fields.password.feedback;

  return (
    <>
      <Card.Header>
        <Card.Title>{m.password.title}</Card.Title>
        <Card.Description>{m.password.description}</Card.Description>
        <SignInIdentityPreview
          identifier={identifier}
          editLabel={m.password.editIdentifier}
          disabled={isPending}
          onEdit={onEditIdentifier}
        />
      </Card.Header>
      <Card.Content>
        <Form
          id={form.id}
          onSubmit={onSubmit}
        >
          <Field.Root
            required
            invalid={feedback?.type === 'error'}
            disabled={isPending}
            focusableWhenDisabled
          >
            <Field.Label>{m.password.label}</Field.Label>
            <PasswordInput
              ref={passwordRef}
              autoComplete='current-password'
              placeholder={m.password.placeholder}
              {...password}
              showPasswordLabel={m.showPassword}
              hidePasswordLabel={m.hidePassword}
            />
            <Field.Feedback feedback={feedback} />
            {onForgotPassword ? (
              <Button
                type='button'
                size='sm'
                variant='link'
                disabled={isPending}
                onClick={onForgotPassword}
                xstyle={styles.forgotPassword}
              >
                {m.password.forgotPassword}
              </Button>
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
            {m.useAnotherMethod}
          </Button>
        ) : null}
        <SubmitButton
          form={form.id}
          fullWidth
          isPending={isPending}
          pendingLabel={m.verifying}
        >
          {m.continue}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
