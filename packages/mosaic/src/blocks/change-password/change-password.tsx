import { useMergeRefs } from '@floating-ui/react';
import type { Ref } from 'react';
import { useState } from 'react';

import { Checkbox } from '../../components/checkbox';
import { Field } from '../../components/field';
import { useFlowAutoFocus } from '../../components/flow';
import type { FieldFeedback, FormField } from '../../components/form';
import { PasswordInput } from '../../components/password-input';

interface PasswordControl {
  name: string;
  value: string;
  onChange: (event: { target: { value: string } }) => void;
  onBlur: () => void;
  ref: (element: HTMLElement | null) => void;
}

export interface ChangePasswordMessages {
  newPasswordLabel: string;
  confirmPasswordLabel: string;
  signOutOfOtherSessionsLabel: string;
  signOutOfOtherSessionsDescription?: string;
  showPasswordLabel: string;
  hidePasswordLabel: string;
}

interface ChangePasswordProps {
  messages: ChangePasswordMessages;
  identifier: string;
  newPassword: PasswordControl;
  confirmPassword: PasswordControl;
  fields: Record<'newPassword' | 'confirmPassword', FormField>;
  signOutOfOtherSessions: boolean;
  onSignOutOfOtherSessionsChange: (checked: boolean) => void;
  passwordFeedback?: FieldFeedback;
  disabled: boolean;
  focusRef?: Ref<HTMLElement>;
}

export function ChangePassword({
  messages,
  identifier,
  newPassword,
  confirmPassword,
  fields,
  signOutOfOtherSessions,
  onSignOutOfOtherSessionsChange,
  passwordFeedback,
  disabled,
  focusRef,
}: ChangePasswordProps) {
  return (
    <>
      <input
        readOnly
        hidden
        name='identifier'
        autoComplete='username'
        value={identifier}
      />
      <PasswordField
        control={newPassword}
        field={fields.newPassword}
        label={messages.newPasswordLabel}
        messages={messages}
        disabled={disabled}
        focusRef={focusRef}
        advisoryFeedback={passwordFeedback}
      />
      <PasswordField
        control={confirmPassword}
        field={fields.confirmPassword}
        label={messages.confirmPasswordLabel}
        messages={messages}
        disabled={disabled}
      />
      <Field.Root
        orientation='horizontal'
        disabled={disabled}
      >
        <Checkbox
          checked={signOutOfOtherSessions}
          onChange={event => onSignOutOfOtherSessionsChange(event.target.checked)}
        />
        {messages.signOutOfOtherSessionsDescription ? (
          <Field.Content>
            <Field.Label>{messages.signOutOfOtherSessionsLabel}</Field.Label>
            <Field.Description>{messages.signOutOfOtherSessionsDescription}</Field.Description>
          </Field.Content>
        ) : (
          <Field.Label>{messages.signOutOfOtherSessionsLabel}</Field.Label>
        )}
      </Field.Root>
    </>
  );
}

function PasswordField({
  control: { ref, ...control },
  field,
  label,
  messages,
  disabled,
  focusRef,
  advisoryFeedback,
}: {
  control: PasswordControl;
  field: FormField;
  label: string;
  messages: ChangePasswordMessages;
  disabled: boolean;
  focusRef?: Ref<HTMLElement>;
  advisoryFeedback?: FieldFeedback;
}) {
  const [focused, setFocused] = useState(false);
  const message = field.feedback?.type === 'error' ? field.feedback : advisoryFeedback;
  const feedbackType = message?.type === 'info' && !focused ? 'error' : message?.type;
  const mergedRef = useMergeRefs<HTMLElement>([ref, focusRef, useFlowAutoFocus<HTMLInputElement>()]);

  // TODO: Discuss enforcing the configured minimum length on the new password input or keeping the hint advisory and letting the server validate. https://github.com/clerk/javascript/pull/9930#discussion_r4151734254
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
        showPasswordLabel={messages.showPasswordLabel}
        hidePasswordLabel={messages.hidePasswordLabel}
      />
      <Field.Feedback feedback={message && feedbackType ? { ...message, type: feedbackType } : undefined} />
    </Field.Root>
  );
}
