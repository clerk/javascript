import type { Ref } from 'react';

import { AuthIdentityPreview } from '../../../blocks/auth';
import { VerificationBackupCode, VerificationPasskey } from '../../../blocks/verification';
import type { UseFormResult } from '../../../components/form';
import { useMessages } from '../../../localization';
import type { SignInStep, SignInSubmitEvent, SignInValues } from '../sign-in.types';
import { backupCodeDescription } from '../sign-in.utils';
import { SignInPassword } from './sign-in-password';

interface CredentialStepProps {
  step: Extract<SignInStep, { kind: 'credential' }>;
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
  const m = useMessages('signIn');
  const actions = {
    secondaryActionLabel: m.useAnotherMethod,
    primaryActionLabel: m.continue,
    pendingLabel: m.verifying,
  };

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
        onShowHelp={onShowHelp}
      />
    );
  }

  if (step.credential === 'passkey') {
    return (
      <VerificationPasskey
        focusRef={focusRef}
        messages={{
          title: m.passkey.title,
          description: m.passkey.description,
          ...actions,
          secondaryActionLabel: onCancel ? m.useAnotherMethod : m.alternativeMethods.helpLink,
        }}
        identity={
          step.identifier ? (
            <AuthIdentityPreview
              identifier={step.identifier}
              editLabel={m.editIdentifier}
              disabled={isPending}
              onEdit={onEditIdentifier}
            />
          ) : undefined
        }
        errorMessage={globalErrorMessage}
        isPending={isPending}
        onSubmit={() => onSubmit()}
        onCancel={onCancel ?? onShowHelp}
      />
    );
  }

  const { value, onValueChange } = form.registerValue('backupCode');

  return (
    <VerificationBackupCode
      focusRef={focusRef}
      messages={{
        title: m.backupCodeMfa.title,
        description: backupCodeDescription(step, m),
        fieldLabel: m.backupCodeMfa.label,
        ...actions,
      }}
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
