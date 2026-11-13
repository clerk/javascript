import type { Ref } from 'react';

import type { VerificationCodeResend } from '../../../blocks/verification';
import { VerificationHelp } from '../../../blocks/verification';
import { useMessages } from '../../../localization';
import type { SignInStep } from '../sign-in.types';
import { SignInActionBlocked } from './sign-in-action-blocked';
import { SignInEmailLink } from './sign-in-email-link';
import { SignInEmailLinkStatus } from './sign-in-email-link-status';
import { SignInEnterpriseSso } from './sign-in-enterprise-sso';
import { SignInForgotPassword } from './sign-in-forgot-password';
import { SignInLoading } from './sign-in-loading';
import { SignInPasswordCompromised } from './sign-in-password-compromised';
import { SignInProtectCheck } from './sign-in-protect-check';
import { SignInStartOver } from './sign-in-start-over';

interface NoticeStepProps {
  step: Extract<SignInStep, { kind: 'notice' }>;
  applicationName: string;
  logo?: { src: string; alt: string };
  globalErrorMessage?: string;
  isPending: boolean;
  resend?: VerificationCodeResend;
  onSubmit: () => void;
  onEmailSupport: () => void;
  onBack: () => void;
  onStartOver: () => void;
  onRetry?: () => void;
  protectCheckRef?: Ref<HTMLDivElement>;
  onEditIdentifier: () => void;
  onForgotPassword?: () => void;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function NoticeStep({
  step,
  applicationName,
  logo,
  globalErrorMessage,
  isPending,
  resend,
  onSubmit,
  onEmailSupport,
  onBack,
  onStartOver,
  onRetry,
  protectCheckRef,
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
          isPending={isPending}
          onForgotPassword={onForgotPassword}
          onCancel={onCancel}
        />
      );
    case 'enterprise-sso':
      return (
        <SignInEnterpriseSso
          focusRef={focusRef}
          applicationName={applicationName}
          logo={logo}
          globalErrorMessage={globalErrorMessage}
          isPending={isPending}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      );
    case 'email-link':
      return (
        <SignInEmailLink
          focusRef={focusRef}
          title={m.emailLink.title}
          description={m.emailLink.description}
          notice={step.newDevice ? m.clientTrust.notice : undefined}
          identifier={step.identifier}
          onEditIdentifier={onEditIdentifier}
          globalErrorMessage={globalErrorMessage}
          isPending={isPending}
          resend={resend}
          onCancel={onCancel}
        />
      );
    case 'verify-email-link':
      return (
        <SignInEmailLink
          focusRef={focusRef}
          title={m.verifyEmailLink.title}
          description={m.verifyEmailLink.description}
          identifier={step.identifier}
          onEditIdentifier={onEditIdentifier}
          globalErrorMessage={globalErrorMessage}
          isPending={isPending}
          resend={resend}
        />
      );
    case 'loading':
      return <SignInLoading globalErrorMessage={globalErrorMessage} />;
    case 'protect-check':
      return (
        <SignInProtectCheck
          challenge={step.challenge}
          logo={logo}
          globalErrorMessage={globalErrorMessage}
          isPending={isPending}
          containerRef={protectCheckRef}
          onRetry={onRetry}
        />
      );
    case 'start-over':
      return <SignInStartOver onStartOver={onStartOver} />;
    case 'email-link-status':
      return (
        <SignInEmailLinkStatus
          step={step}
          globalErrorMessage={globalErrorMessage}
        />
      );
  }
}
