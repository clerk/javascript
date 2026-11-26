import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { emphasizeIdentifier } from '../../../blocks/auth';
import { Prompt } from '../../../blocks/prompt';
import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Field } from '../../../components/field';
import type { FieldFeedback, UseFormResult } from '../../../components/form';
import { PasswordInput } from '../../../components/password-input';
import { fill, useMessages } from '../../../localization';
import { useFlowAutoFocus } from '../../../primitives/flow/flow-step-context';
import { Form } from '../../../primitives/form';
import { styles } from '../sign-in.styles';
import type { SignInSubmitEvent, SignInValues } from '../sign-in.types';
import { differentIdentifierLabel } from '../sign-in.utils';

interface SignInPasswordProps {
  identifier: string;
  onEditIdentifier?: () => void;
  form: UseFormResult<SignInValues>;
  errorMessage?: string;
  globalErrorMessage?: string;
  isPending: boolean;
  onSubmit: (event: SignInSubmitEvent) => void;
  onForgotPassword?: () => void;
  onCancel?: () => void;
  onShowHelp?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function SignInPassword({
  identifier,
  onEditIdentifier,
  form,
  errorMessage,
  globalErrorMessage,
  isPending,
  onSubmit,
  onForgotPassword,
  onCancel,
  onShowHelp,
  focusRef,
}: SignInPasswordProps) {
  const m = useMessages('signIn');
  const { ref: passwordFieldRef, ...password } = form.register('password');
  const passwordRef = useMergeRefs<HTMLElement>([passwordFieldRef, focusRef, useFlowAutoFocus<HTMLInputElement>()]);
  const feedback: FieldFeedback | undefined = errorMessage ? { type: 'error', message: errorMessage } : undefined;

  return (
    <>
      <Card.Header>
        <Card.Title>{m.password.title}</Card.Title>
        <Card.Description>
          {emphasizeIdentifier(fill(m.password.description, { identifier }), identifier)}
        </Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage}
      </Card.Banner>
      <Card.Content>
        <Form
          id={form.id}
          onSubmit={onSubmit}
        >
          <input
            readOnly
            hidden
            name='identifier'
            autoComplete='username'
            value={identifier}
          />
          <Field.Root
            required
            invalid={feedback?.type === 'error'}
            disabled={isPending}
            focusableWhenDisabled
          >
            <Field.Header>
              <Field.Label>{m.password.label}</Field.Label>
              {onForgotPassword ? (
                <Button
                  type='button'
                  size='sm'
                  color='neutral'
                  variant='link'
                  disabled={isPending}
                  onClick={onForgotPassword}
                >
                  {m.password.forgotPassword}
                </Button>
              ) : null}
            </Field.Header>
            <PasswordInput
              size='lg'
              ref={passwordRef}
              autoComplete='current-password'
              enterKeyHint='go'
              {...password}
              showPasswordLabel={m.showPassword}
              hidePasswordLabel={m.hidePassword}
            />
            <Field.Feedback feedback={feedback} />
          </Field.Root>
        </Form>
        <div {...stylex.props(styles.actionGroups)}>
          <SubmitButton
            form={form.id}
            fullWidth
            isPending={isPending}
            pendingLabel={m.verifying}
          >
            {m.continue}
          </SubmitButton>
          {onCancel || onShowHelp ? (
            <Button
              type='button'
              variant='outline'
              color='neutral'
              fullWidth
              disabled={isPending}
              onClick={onCancel ?? onShowHelp}
            >
              {onCancel ? m.useAnotherMethod : m.alternativeMethods.helpLink}
            </Button>
          ) : null}
          {onEditIdentifier ? (
            <Prompt
              text={m.notYou}
              action={differentIdentifierLabel(identifier, m)}
              disabled={isPending}
              onAction={onEditIdentifier}
            />
          ) : null}
        </div>
      </Card.Content>
    </>
  );
}
