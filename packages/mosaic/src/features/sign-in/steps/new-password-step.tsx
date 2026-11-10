import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Checkbox } from '../../../components/checkbox';
import { Field } from '../../../components/field';
import { useFlowAutoFocus } from '../../../components/flow';
import type { FieldFeedback, UseFormResult } from '../../../components/form';
import { PasswordInput } from '../../../components/password-input';
import { useMessages } from '../../../localization';
import { Form } from '../../../primitives/form';
import { styles } from '../sign-in.styles';
import type { SignInSubmitEvent, SignInValues } from '../sign-in.types';

interface NewPasswordStepProps {
  form: UseFormResult<SignInValues>;
  isPending: boolean;
  onSubmit: (event: SignInSubmitEvent) => void;
  passwordFeedback?: FieldFeedback;
  onBack: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function NewPasswordStep({
  form,
  isPending,
  onSubmit,
  passwordFeedback,
  onBack,
  focusRef,
}: NewPasswordStepProps) {
  const m = useMessages('signIn');
  const { ref: passwordFieldRef, ...password } = form.register('newPassword');
  const passwordRef = useMergeRefs<HTMLElement>([passwordFieldRef, focusRef, useFlowAutoFocus<HTMLInputElement>()]);
  const passwordError = form.fields.newPassword.feedback;
  const confirmPasswordFeedback = form.fields.confirmPassword.feedback;

  return (
    <>
      <Card.Header>
        <Card.Title>{m.newPassword.title}</Card.Title>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {form.error}
      </Card.Banner>
      <Card.Content
        render={
          <Form
            id={form.id}
            onSubmit={onSubmit}
          />
        }
      >
        <div {...stylex.props(styles.fieldStack)}>
          <Field.Root
            required
            invalid={passwordError?.type === 'error'}
            disabled={isPending}
            focusableWhenDisabled
          >
            <Field.Label>{m.newPassword.passwordLabel}</Field.Label>
            <PasswordInput
              ref={passwordRef}
              autoComplete='new-password'
              {...password}
              showPasswordLabel={m.showPassword}
              hidePasswordLabel={m.hidePassword}
            />
            <Field.Feedback feedback={passwordError?.type === 'error' ? passwordError : passwordFeedback} />
          </Field.Root>
          <Field.Root
            required
            invalid={confirmPasswordFeedback?.type === 'error'}
            disabled={isPending}
            focusableWhenDisabled
          >
            <Field.Label>{m.newPassword.confirmPasswordLabel}</Field.Label>
            <PasswordInput
              autoComplete='new-password'
              {...form.register('confirmPassword')}
              showPasswordLabel={m.showPassword}
              hidePasswordLabel={m.hidePassword}
            />
            <Field.Feedback feedback={confirmPasswordFeedback} />
          </Field.Root>
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
        </div>
        <div {...stylex.props(styles.actions)}>
          <SubmitButton
            form={form.id}
            fullWidth
            isPending={isPending}
            pendingLabel={m.newPassword.pending}
            disabled={!form.canSubmit}
            focusableWhenDisabled
          >
            {m.newPassword.submit}
          </SubmitButton>
          <Button
            type='button'
            variant='ghost'
            color='neutral'
            fullWidth
            disabled={isPending}
            onClick={onBack}
          >
            {m.forgotPassword.back}
          </Button>
        </div>
      </Card.Content>
    </>
  );
}
