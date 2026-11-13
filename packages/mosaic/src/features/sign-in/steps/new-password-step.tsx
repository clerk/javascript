import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Checkbox } from '../../../components/checkbox';
import { Field } from '../../../components/field';
import type { FieldFeedback, UseFormResult } from '../../../components/form';
import { useMessages } from '../../../localization';
import { Form } from '../../../primitives/form';
import { styles } from '../sign-in.styles';
import type { SignInSubmitEvent, SignInValues } from '../sign-in.types';
import { SignInPasswordField } from './sign-in-password-field';

interface NewPasswordStepProps {
  required: boolean;
  form: UseFormResult<SignInValues>;
  isPending: boolean;
  onSubmit: (event: SignInSubmitEvent) => void;
  passwordFeedback?: FieldFeedback;
  onBack: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function NewPasswordStep({
  required,
  form,
  isPending,
  onSubmit,
  passwordFeedback,
  onBack,
  focusRef,
}: NewPasswordStepProps) {
  const m = useMessages('signIn');

  return (
    <>
      <Card.Header>
        <Card.Title>{m.newPassword.title}</Card.Title>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {form.error ?? (required ? m.newPassword.requiredMessage : undefined)}
      </Card.Banner>
      <Card.Content
        render={
          <Form
            id={form.id}
            onSubmit={onSubmit}
          />
        }
      >
        <input
          readOnly
          hidden
          name='identifier'
          autoComplete='username'
          value={form.values.identifier}
        />
        <div {...stylex.props(styles.fieldStack)}>
          <SignInPasswordField
            form={form}
            name='newPassword'
            required
            autoFocus
            label={m.newPassword.passwordLabel}
            disabled={isPending}
            inputRef={focusRef}
            advisoryFeedback={passwordFeedback}
          />
          <SignInPasswordField
            form={form}
            name='confirmPassword'
            required
            label={m.newPassword.confirmPasswordLabel}
            disabled={isPending}
          />
          {required ? null : (
            <Field.Root
              orientation='horizontal'
              disabled={isPending}
            >
              <Checkbox
                checked={form.values.signOutOfOtherSessions}
                onChange={event => form.setValue('signOutOfOtherSessions', event.target.checked)}
              />
              <Field.Label>{m.newPassword.signOutOfOtherSessions}</Field.Label>
            </Field.Root>
          )}
        </div>
      </Card.Content>
      <Card.Footer>
        <Button
          type='button'
          variant='outline'
          color='neutral'
          disabled={isPending}
          onClick={onBack}
        >
          {m.forgotPassword.back}
        </Button>
        <SubmitButton
          form={form.id}
          isPending={isPending}
          pendingLabel={m.newPassword.pending}
          disabled={!form.canSubmit}
          focusableWhenDisabled
        >
          {m.newPassword.submit}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
