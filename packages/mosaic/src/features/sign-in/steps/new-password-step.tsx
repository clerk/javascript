import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';
import { useState } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Checkbox } from '../../../components/checkbox';
import { Field } from '../../../components/field';
import { useFlowAutoFocus } from '../../../components/flow';
import type { FieldFeedback, UseFormResult } from '../../../components/form';
import { PasswordInput } from '../../../components/password-input';
import { useMessages } from '../../../localization';
import { Form } from '../../../primitives/form';
import { styles } from '../../auth-flow/auth-flow.styles';
import type { SignInSubmitEvent, SignInValues } from '../sign-in.types';

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
          <PasswordField
            form={form}
            name='newPassword'
            label={m.newPassword.passwordLabel}
            disabled={isPending}
            inputRef={focusRef}
            advisoryFeedback={passwordFeedback}
          />
          <PasswordField
            form={form}
            name='confirmPassword'
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

function PasswordField({
  form,
  name,
  label,
  disabled,
  inputRef,
  advisoryFeedback,
}: {
  form: UseFormResult<SignInValues>;
  name: 'newPassword' | 'confirmPassword';
  label: string;
  disabled: boolean;
  inputRef?: Ref<HTMLElement>;
  advisoryFeedback?: FieldFeedback;
}) {
  const m = useMessages('signIn');
  const [focused, setFocused] = useState(false);
  const { feedback } = form.fields[name];
  const message = feedback?.type === 'error' ? feedback : advisoryFeedback;
  const feedbackType = message?.type === 'info' && !focused ? 'error' : message?.type;
  const { ref, ...control } = form.register(name);
  const mergedRef = useMergeRefs<HTMLElement>([ref, inputRef, useFlowAutoFocus<HTMLInputElement>()]);

  return (
    <Field.Root
      required
      invalid={feedbackType === 'error'}
      disabled={disabled}
      focusableWhenDisabled
    >
      <Field.Label>{label}</Field.Label>
      <PasswordInput
        ref={mergedRef}
        autoComplete='new-password'
        {...control}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          control.onBlur();
        }}
        showPasswordLabel={m.showPassword}
        hidePasswordLabel={m.hidePassword}
      />
      <Field.Feedback feedback={message && feedbackType ? { ...message, type: feedbackType } : undefined} />
    </Field.Root>
  );
}
