import type { Ref } from 'react';

import type { VerificationBackupCodeMessages } from '../../../blocks/verification';
import { VerificationBackupCode } from '../../../blocks/verification';
import type { UseFormResult } from '../../../components/form';
import type { SignInStep, SignInSubmitEvent, SignInValues } from '../sign-in.types';
import { SignInPassword } from './sign-in-password';

interface SecretStepProps {
  step: Extract<SignInStep, { kind: 'secret' }>;
  messages: VerificationBackupCodeMessages;
  form: UseFormResult<SignInValues>;
  errorMessage?: string;
  globalErrorMessage?: string;
  isPending: boolean;
  onSubmit: (event?: SignInSubmitEvent) => void;
  onEditIdentifier: () => void;
  onForgotPassword?: () => void;
  onShowMethods?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function SecretStep({
  step,
  messages,
  form,
  errorMessage,
  globalErrorMessage,
  isPending,
  onSubmit,
  onEditIdentifier,
  onForgotPassword,
  onShowMethods,
  focusRef,
}: SecretStepProps) {
  if (step.secret === 'password') {
    return (
      <SignInPassword
        focusRef={focusRef}
        identifier={step.identifier}
        onEditIdentifier={onEditIdentifier}
        form={form}
        errorMessage={errorMessage}
        globalErrorMessage={globalErrorMessage}
        isPending={isPending}
        onSubmit={onSubmit}
        onForgotPassword={onForgotPassword}
        onCancel={onShowMethods}
      />
    );
  }

  const { value, onValueChange } = form.registerValue('backupCode');

  return (
    <VerificationBackupCode
      focusRef={focusRef}
      messages={messages}
      value={value}
      errorMessage={errorMessage}
      globalErrorMessage={globalErrorMessage}
      isPending={isPending}
      onValueChange={onValueChange}
      onSubmit={() => onSubmit()}
      onCancel={onShowMethods}
    />
  );
}
