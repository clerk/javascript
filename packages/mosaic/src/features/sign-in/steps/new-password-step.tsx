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
import { Form } from '../../../primitives/form';
import { styles } from '../sign-in.styles';
import type { NewPasswordValues } from '../sign-in.types';

export interface NewPasswordStepMessages {
  title: string;
  passwordLabel: string;
  confirmPasswordLabel: string;
  showPasswordLabel: string;
  hidePasswordLabel: string;
  signOutOfOtherSessionsLabel: string;
  primaryActionLabel: string;
  pendingLabel: string;
  backLabel: string;
}

interface NewPasswordStepProps {
  messages: NewPasswordStepMessages;
  form: UseFormResult<NewPasswordValues>;
  passwordFeedback?: FieldFeedback;
  onBack: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function NewPasswordStep({ messages, form, passwordFeedback, onBack, focusRef }: NewPasswordStepProps) {
  const { ref: passwordFieldRef, ...password } = form.register('password');
  const passwordRef = useMergeRefs<HTMLElement>([passwordFieldRef, focusRef, useFlowAutoFocus<HTMLInputElement>()]);
  const passwordError = form.fields.password.feedback;
  const confirmPasswordFeedback = form.fields.confirmPassword.feedback;

  return (
    <>
      <Card.Header>
        <Card.Title>{messages.title}</Card.Title>
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
            onSubmit={form.handleSubmit}
          />
        }
      >
        <div {...stylex.props(styles.fieldStack)}>
          <Field.Root
            required
            invalid={passwordError?.type === 'error'}
            disabled={form.isSubmitting}
            focusableWhenDisabled
          >
            <Field.Label>{messages.passwordLabel}</Field.Label>
            <PasswordInput
              ref={passwordRef}
              autoComplete='new-password'
              {...password}
              showPasswordLabel={messages.showPasswordLabel}
              hidePasswordLabel={messages.hidePasswordLabel}
            />
            <Field.Feedback feedback={passwordError?.type === 'error' ? passwordError : passwordFeedback} />
          </Field.Root>
          <Field.Root
            required
            invalid={confirmPasswordFeedback?.type === 'error'}
            disabled={form.isSubmitting}
            focusableWhenDisabled
          >
            <Field.Label>{messages.confirmPasswordLabel}</Field.Label>
            <PasswordInput
              autoComplete='new-password'
              {...form.register('confirmPassword')}
              showPasswordLabel={messages.showPasswordLabel}
              hidePasswordLabel={messages.hidePasswordLabel}
            />
            <Field.Feedback feedback={confirmPasswordFeedback} />
          </Field.Root>
          <Field.Root
            orientation='horizontal'
            disabled={form.isSubmitting}
          >
            <Checkbox
              checked={form.values.signOutOfOtherSessions}
              onChange={event => form.setValue('signOutOfOtherSessions', event.target.checked)}
            />
            <Field.Label>{messages.signOutOfOtherSessionsLabel}</Field.Label>
          </Field.Root>
        </div>
        <div {...stylex.props(styles.actions)}>
          <SubmitButton
            form={form.id}
            fullWidth
            isPending={form.isSubmitting}
            pendingLabel={messages.pendingLabel}
            disabled={!form.canSubmit}
            focusableWhenDisabled
          >
            {messages.primaryActionLabel}
          </SubmitButton>
          <Button
            type='button'
            variant='ghost'
            color='neutral'
            fullWidth
            disabled={form.isSubmitting}
            onClick={onBack}
          >
            {messages.backLabel}
          </Button>
        </div>
      </Card.Content>
    </>
  );
}
