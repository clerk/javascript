import type { Ref } from 'react';

import type { VerificationCodeMessages, VerificationCodeResend } from '../../../blocks/verification';
import { VerificationCode } from '../../../blocks/verification';
import type { UseFormResult } from '../../../components/form';
import type { SignInStep, SignInSubmitEvent, SignInValues } from '../sign-in.types';

// TODO: Have the controller pass the one callback each code step offers, and omit resend for the authenticator app, so the view stops choosing by purpose and channel.
function secondaryAction(
  step: Extract<SignInStep, { kind: 'code' }>,
  onShowMethods: (() => void) | undefined,
  onBack: () => void,
): (() => void) | undefined {
  switch (step.purpose) {
    case 'verify-email':
      return undefined;
    case 'reset-password':
      return onBack;
    case 'first-factor':
    case 'second-factor':
      return onShowMethods;
  }
}

interface CodeStepProps {
  step: Extract<SignInStep, { kind: 'code' }>;
  messages: VerificationCodeMessages;
  resend?: VerificationCodeResend;
  form: UseFormResult<SignInValues>;
  errorMessage?: string;
  globalErrorMessage?: string;
  isPending: boolean;
  onSubmit: (event?: SignInSubmitEvent) => void;
  onCodeComplete: (code: string) => void;
  onShowMethods?: () => void;
  onBack: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function CodeStep({
  step,
  messages,
  resend,
  form,
  errorMessage,
  globalErrorMessage,
  isPending,
  onSubmit,
  onCodeComplete,
  onShowMethods,
  onBack,
  focusRef,
}: CodeStepProps) {
  const { value, onValueChange } = form.registerValue('code');

  return (
    <VerificationCode
      focusRef={focusRef}
      messages={messages}
      value={value}
      errorMessage={errorMessage}
      globalErrorMessage={globalErrorMessage}
      isPending={isPending}
      resend={step.channel === 'totp' ? undefined : resend}
      onValueChange={onValueChange}
      onComplete={onCodeComplete}
      onSubmit={() => onSubmit()}
      onCancel={secondaryAction(step, onShowMethods, onBack)}
    />
  );
}
