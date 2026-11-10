import type { Ref } from 'react';

import type { VerificationHelpMessages } from '../../../blocks/verification';
import { VerificationHelp } from '../../../blocks/verification';
import type { UseFormResult } from '../../../components/form';
import type { SignInStep, SignInSubmitEvent, SignInValues } from '../sign-in.types';
import { SignInForgotPassword } from './sign-in-forgot-password';

interface NoticeStepProps {
  step: Extract<SignInStep, { kind: 'notice' }>;
  messages: VerificationHelpMessages;
  form: UseFormResult<SignInValues>;
  globalErrorMessage?: string;
  isPending: boolean;
  onSubmit: (event: SignInSubmitEvent) => void;
  onEmailSupport: () => void;
  onBack: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function NoticeStep({
  step,
  messages,
  form,
  globalErrorMessage,
  isPending,
  onSubmit,
  onEmailSupport,
  onBack,
  focusRef,
}: NoticeStepProps) {
  switch (step.purpose) {
    case 'help':
      return (
        <VerificationHelp
          messages={messages}
          onEmailSupport={onEmailSupport}
          onBack={onBack}
        />
      );
    case 'forgot-password':
      return (
        <SignInForgotPassword
          focusRef={focusRef}
          identifier={step.identifier}
          form={form}
          globalErrorMessage={globalErrorMessage}
          isPending={isPending}
          onSubmit={onSubmit}
          onBack={onBack}
        />
      );
  }
}
