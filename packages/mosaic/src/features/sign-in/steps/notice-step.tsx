import type { Ref } from 'react';

import type { VerificationCodeResend } from '../../../blocks/verification';
import { VerificationHelp } from '../../../blocks/verification';
import { useMessages } from '../../../localization';
import type { SignInStep } from '../sign-in.types';
import { SignInActionBlocked } from './sign-in-action-blocked';
import { SignInEmailLink } from './sign-in-email-link';
import { SignInForgotPassword } from './sign-in-forgot-password';
import { SignInPasswordCompromised } from './sign-in-password-compromised';

interface NoticeStepProps {
  step: Extract<SignInStep, { kind: 'notice' }>;
  globalErrorMessage?: string;
  isPending: boolean;
  resend?: VerificationCodeResend;
  onSubmit: () => void;
  onEmailSupport: () => void;
  onBack: () => void;
  onEditIdentifier: () => void;
  onForgotPassword?: () => void;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function NoticeStep({
  step,
  globalErrorMessage,
  isPending,
  resend,
  onSubmit,
  onEmailSupport,
  onBack,
  onEditIdentifier,
  onForgotPassword,
  onCancel,
  focusRef,
}: NoticeStepProps) {
  const m = useMessages('signIn');
  const help = {
    backButton: m.back,
    supportButton: m.alternativeMethods.getHelp.emailSupport,
  };

  switch (step.purpose) {
    case 'help':
      return (
        <VerificationHelp
          messages={{
            title: m.alternativeMethods.getHelp.title,
            description: m.alternativeMethods.getHelp.description,
            ...help,
          }}
          onEmailSupport={onEmailSupport}
          onBack={onBack}
        />
      );
    case 'locked':
      return (
        <VerificationHelp
          messages={{ ...m.locked, ...help, backButton: m.forgotPassword.back }}
          onEmailSupport={onEmailSupport}
          onBack={onBack}
        />
      );
    case 'no-methods':
      return (
        <VerificationHelp
          messages={{ ...m.noAvailableMethods, ...help }}
          onEmailSupport={onEmailSupport}
          onBack={onBack}
        />
      );
    case 'forgot-password':
      return (
        <SignInForgotPassword
          focusRef={focusRef}
          identifier={step.identifier}
          globalErrorMessage={globalErrorMessage}
          isPending={isPending}
          onSubmit={onSubmit}
          onBack={onBack}
        />
      );
    case 'action-blocked':
      return <SignInActionBlocked details={step.details} />;
    case 'password-compromised':
      return (
        <SignInPasswordCompromised
          focusRef={focusRef}
          globalErrorMessage={globalErrorMessage}
          onForgotPassword={onForgotPassword}
          onCancel={onCancel}
        />
      );
    case 'email-link':
      return (
        <SignInEmailLink
          focusRef={focusRef}
          identifier={step.identifier}
          onEditIdentifier={onEditIdentifier}
          globalErrorMessage={globalErrorMessage}
          resend={resend}
          onCancel={onCancel}
        />
      );
  }
}
