import type { Ref } from 'react';

import type { VerificationBackupCodeMessages } from '../../../blocks/verification';
import { VerificationBackupCode } from '../../../blocks/verification';
import type { UseFormResult } from '../../../components/form';
import type { SignInStep, SignInSubmitEvent, SignInValues } from '../sign-in.types';
import { SignInPasskey } from './sign-in-passkey';
import { SignInPassword } from './sign-in-password';

interface CredentialStepProps {
  step: Extract<SignInStep, { kind: 'credential' }>;
  messages: VerificationBackupCodeMessages;
  form: UseFormResult<SignInValues>;
  errorMessage?: string;
  globalErrorMessage?: string;
  isPending: boolean;
  onSubmit: (event?: SignInSubmitEvent) => void;
  onEditIdentifier: () => void;
  onForgotPassword?: () => void;
  onCancel?: () => void;
  onShowHelp: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function CredentialStep({
  step,
  messages,
  form,
  errorMessage,
  globalErrorMessage,
  isPending,
  onSubmit,
  onEditIdentifier,
  onForgotPassword,
  onCancel,
  onShowHelp,
  focusRef,
}: CredentialStepProps) {
  if (step.credential === 'password') {
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
        onCancel={onCancel}
      />
    );
  }

  if (step.credential === 'passkey') {
    return (
      <SignInPasskey
        focusRef={focusRef}
        identifier={step.identifier}
        onEditIdentifier={onEditIdentifier}
        globalErrorMessage={globalErrorMessage}
        isPending={isPending}
        onSubmit={() => onSubmit()}
        onCancel={onCancel}
        onShowHelp={onShowHelp}
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
      onCancel={onCancel}
    />
  );
}
