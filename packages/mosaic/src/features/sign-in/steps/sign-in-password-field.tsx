import { useMergeRefs } from '@floating-ui/react';
import type { Ref } from 'react';
import { useState } from 'react';

import { Field } from '../../../components/field';
import { useFlowAutoFocus } from '../../../components/flow';
import type { FieldFeedback, UseFormResult } from '../../../components/form';
import { PasswordInput } from '../../../components/password-input';
import { Text } from '../../../components/text';
import { useMessages } from '../../../localization';
import type { SignInValues } from '../sign-in.types';

interface SignInPasswordFieldProps {
  form: UseFormResult<SignInValues>;
  name: 'password' | 'newPassword' | 'confirmPassword';
  label: string;
  placeholder?: string;
  required: boolean;
  disabled: boolean;
  autoFocus?: boolean;
  inputRef?: Ref<HTMLElement>;
  advisoryFeedback?: FieldFeedback;
}

export function SignInPasswordField({
  form,
  name,
  label,
  placeholder,
  required,
  disabled,
  autoFocus = false,
  inputRef,
  advisoryFeedback,
}: SignInPasswordFieldProps) {
  const m = useMessages('signIn');
  const [focused, setFocused] = useState(false);
  const { feedback } = form.fields[name];
  const message = feedback?.type === 'error' ? feedback : advisoryFeedback;
  const feedbackType = message?.type === 'info' && !focused ? 'error' : message?.type;
  const { ref, ...control } = form.register(name);
  const flowAutoFocusRef = useFlowAutoFocus<HTMLInputElement>();
  const mergedRef = useMergeRefs<HTMLElement>([ref, inputRef, autoFocus ? flowAutoFocusRef : undefined]);

  return (
    <Field.Root
      required={required}
      invalid={feedbackType === 'error'}
      disabled={disabled}
      focusableWhenDisabled
    >
      <Field.Header>
        <Field.Label>{label}</Field.Label>
        {required ? null : <SignInOptionalHint />}
      </Field.Header>
      <PasswordInput
        ref={mergedRef}
        autoComplete='new-password'
        placeholder={placeholder}
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

export function SignInOptionalHint() {
  const m = useMessages('signIn');

  return (
    <Text
      size='sm'
      color='foreground-secondary'
      render={<span />}
    >
      {m.signUp.optional}
    </Text>
  );
}
