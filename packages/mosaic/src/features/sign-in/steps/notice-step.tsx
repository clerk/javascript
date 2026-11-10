import type { Ref } from 'react';

import type { VerificationHelpMessages } from '../../../blocks/verification';
import { VerificationHelp } from '../../../blocks/verification';
import type { SignInStep } from '../sign-in.types';
import type { SignInForgotPasswordMessages } from './sign-in-forgot-password';
import { SignInForgotPassword } from './sign-in-forgot-password';

interface NoticeStepProps {
  step: Extract<SignInStep, { kind: 'notice' }>;
  messages: {
    help: VerificationHelpMessages;
    forgotPassword: SignInForgotPasswordMessages;
  };
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
          messages={messages.help}
          onEmailSupport={onEmailSupport}
          onBack={onBack}
        />
      );
    case 'forgot-password':
      return (
        <SignInForgotPassword
          focusRef={focusRef}
          messages={messages.forgotPassword}
          isPending={isPending}
          onSubmit={onSubmit}
          onBack={onBack}
        />
      );
  }
}
