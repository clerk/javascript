import type { Ref } from 'react';

import type { VerificationCodeMessages, VerificationCodeResend } from '../../../blocks/verification';
import { VerificationCode } from '../../../blocks/verification';
import type { UseFormResult } from '../../../components/form';
import type { SignInSubmitEvent, SignInValues } from '../sign-in.types';

interface CodeStepProps {
  messages: VerificationCodeMessages;
  resend?: VerificationCodeResend;
  form: UseFormResult<SignInValues>;
  errorMessage?: string;
  globalErrorMessage?: string;
  isPending: boolean;
  onSubmit: (event?: SignInSubmitEvent) => void;
  onCodeComplete: (code: string) => void;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function CodeStep({
  messages,
  resend,
  form,
  errorMessage,
  globalErrorMessage,
  isPending,
  onSubmit,
  onCodeComplete,
  onCancel,
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
      resend={resend}
      onValueChange={onValueChange}
      onComplete={onCodeComplete}
      onSubmit={() => onSubmit()}
      onCancel={onCancel}
    />
  );
}
