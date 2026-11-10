import type { Ref } from 'react';

import type { VerificationBackupCodeMessages } from '../../../blocks/verification';
import { VerificationBackupCode } from '../../../blocks/verification';
import type { SignInStep } from '../sign-in.types';
import { SignInPassword } from './sign-in-password';

interface SecretStepProps {
  step: Extract<SignInStep, { kind: 'secret' }>;
  messages: VerificationBackupCodeMessages;
  value: string;
  errorMessage?: string;
  isPending: boolean;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onEditIdentifier: () => void;
  onForgotPassword?: () => void;
  onShowMethods?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function SecretStep({
  step,
  messages,
  value,
  errorMessage,
  isPending,
  onValueChange,
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
        value={value}
        errorMessage={errorMessage}
        isPending={isPending}
        onValueChange={onValueChange}
        onSubmit={onSubmit}
        onForgotPassword={onForgotPassword}
        onCancel={onShowMethods}
      />
    );
  }

  return (
    <VerificationBackupCode
      focusRef={focusRef}
      messages={messages}
      value={value}
      errorMessage={errorMessage}
      isPending={isPending}
      onValueChange={onValueChange}
      onSubmit={onSubmit}
      onCancel={onShowMethods}
    />
  );
}
