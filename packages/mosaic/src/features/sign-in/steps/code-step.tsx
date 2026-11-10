import type { Ref } from 'react';

import type { VerificationCodeMessages, VerificationCodeResend } from '../../../blocks/verification';
import { VerificationCode } from '../../../blocks/verification';
import type { SignInStep } from '../sign-in.types';

interface CodeStepProps {
  step: Extract<SignInStep, { kind: 'code' }>;
  messages: VerificationCodeMessages;
  resend?: VerificationCodeResend;
  value: string;
  errorMessage?: string;
  isPending: boolean;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onShowMethods?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function CodeStep({
  step,
  messages,
  resend,
  value,
  errorMessage,
  isPending,
  onValueChange,
  onSubmit,
  onShowMethods,
  focusRef,
}: CodeStepProps) {
  // TODO: Have the controller pass the one callback each code step offers, and omit resend for the authenticator app, so the view stops choosing by purpose and channel.
  return (
    <VerificationCode
      focusRef={focusRef}
      messages={messages}
      value={value}
      errorMessage={errorMessage}
      isPending={isPending}
      resend={step.channel === 'totp' ? undefined : resend}
      onValueChange={onValueChange}
      // TODO: Pass the completed code to onSubmit. A controller that reads its value state in onSubmit sees the value from before onValueChange.
      onComplete={code => {
        onValueChange(code);
        onSubmit();
      }}
      onSubmit={onSubmit}
      onCancel={step.purpose === 'verify-email' ? undefined : onShowMethods}
    />
  );
}
