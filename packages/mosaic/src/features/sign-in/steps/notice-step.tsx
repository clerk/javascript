import type { Ref } from 'react';

import type { VerificationHelpMessages } from '../../../blocks/verification';
import { VerificationHelp } from '../../../blocks/verification';
import type { SignInStep } from '../sign-in.types';
import { SignInForgotPassword } from './sign-in-forgot-password';

interface NoticeStepProps {
  step: Extract<SignInStep, { kind: 'notice' }>;
  messages: VerificationHelpMessages;
  isPending: boolean;
  onSubmit: () => void;
  onEmailSupport: () => void;
  onBack: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function NoticeStep({ step, messages, isPending, onSubmit, onEmailSupport, onBack, focusRef }: NoticeStepProps) {
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
          isPending={isPending}
          onSubmit={onSubmit}
          onBack={onBack}
        />
      );
  }
}
