import type { MosaicMessages } from '../../localization';
import { fill } from '../../localization';
import type { SignInStep } from './sign-in.types';

export function stepKey(step: SignInStep): string {
  switch (step.kind) {
    case 'identifier':
    case 'sign-up':
      return step.kind;
    case 'credential':
      return `credential:${step.credential}`;
    case 'new-password':
      return `new-password:${step.reason}`;
    case 'code':
    case 'choice':
    case 'notice':
      return `${step.kind}:${step.purpose}`;
  }
}

export function httpsUrl(url: string | undefined): string | undefined {
  if (!url) {
    return undefined;
  }
  try {
    return new URL(url).protocol === 'https:' ? url : undefined;
  } catch {
    return undefined;
  }
}

type Messages = MosaicMessages['signIn'];
type CodeStepData = Extract<SignInStep, { kind: 'code' }>;
type CodeResendCopy = Pick<Messages['emailCode'], 'resendText' | 'resend' | 'resendCountdown'>;

export function codeCopy(step: CodeStepData, m: Messages): { title: string; description: string; fieldLabel: string } {
  const identifier = step.identifier ?? '';
  if (step.purpose === 'reset-password') {
    const description =
      step.channel === 'phone' ? m.resetPasswordCode.descriptionPhone : m.resetPasswordCode.descriptionEmail;
    return {
      title: m.resetPasswordCode.title,
      description: fill(description, { identifier }),
      fieldLabel: m.resetPasswordCode.label,
    };
  }
  if (step.purpose === 'verify-email') {
    return {
      title: m.verifyEmail.title,
      description: fill(m.verifyEmail.description, { identifier }),
      fieldLabel: m.verifyEmail.label,
    };
  }
  if (step.purpose === 'verify-phone') {
    const provider = step.provider;
    return provider
      ? {
          title: fill(m.verifyPhone.titleProvider, { provider }),
          description: fill(m.verifyPhone.descriptionProvider, { provider }),
          fieldLabel: m.verifyPhone.label,
        }
      : { title: m.verifyPhone.title, description: m.verifyPhone.description, fieldLabel: m.verifyPhone.label };
  }
  if (step.channel === 'totp') {
    return { title: m.totpMfa.title, description: m.totpMfa.description, fieldLabel: m.totpMfa.label };
  }
  if (step.channel === 'phone' && step.provider) {
    const provider = step.provider;
    return {
      title: fill(m.alternativePhoneCode.title, { provider }),
      description: fill(m.alternativePhoneCode.description, { provider }),
      fieldLabel: m.alternativePhoneCode.label,
    };
  }
  if (step.channel === 'phone') {
    const copy = step.purpose === 'first-factor' ? m.phoneCode : m.phoneCodeMfa;
    return { title: copy.title, description: copy.description, fieldLabel: copy.label };
  }
  return { title: m.emailCode.title, description: m.emailCode.description, fieldLabel: m.emailCode.label };
}

export function codeResendCopy(step: CodeStepData, m: Messages): CodeResendCopy {
  if (step.purpose === 'reset-password') {
    return m.resetPasswordCode;
  }
  if (step.purpose === 'verify-email') {
    return m.verifyEmail;
  }
  if (step.purpose === 'verify-phone') {
    return m.verifyPhone;
  }
  if (step.channel === 'phone' && step.provider) {
    return m.alternativePhoneCode;
  }
  if (step.channel === 'phone') {
    return step.purpose === 'first-factor' ? m.phoneCode : m.phoneCodeMfa;
  }
  return m.emailCode;
}

export function codeIdentity(
  step: CodeStepData,
  m: Messages,
): { identifier?: string; editLabel: string; editable: boolean; notice?: string } {
  const describesIdentifier =
    step.channel === 'totp' || step.purpose === 'reset-password' || step.purpose === 'verify-email';
  return {
    identifier: describesIdentifier ? undefined : step.identifier,
    editLabel: step.channel === 'phone' ? m.editPhoneNumber : m.editIdentifier,
    editable: step.purpose === 'first-factor' || step.purpose === 'sso-bypass' || step.purpose === 'verify-phone',
    notice:
      step.purpose === 'client-trust'
        ? m.clientTrust.notice
        : step.purpose === 'sso-bypass'
          ? m.ssoBypass.notice
          : undefined,
  };
}

export function codeSecondaryAction(
  step: CodeStepData,
  m: Messages,
  { onCancel, onBack }: { onCancel?: () => void; onBack: () => void },
): { label: string; onClick?: () => void } {
  if (step.purpose === 'reset-password') {
    return { label: m.forgotPassword.back, onClick: onCancel };
  }
  if (step.channel === 'phone' && step.provider) {
    return { label: m.alternativePhoneCode.useSms, onClick: onCancel };
  }
  if (step.purpose === 'verify-phone') {
    return { label: m.useAnotherMethod, onClick: undefined };
  }
  if ((step.purpose === 'second-factor' || step.purpose === 'client-trust') && !onCancel) {
    return { label: m.back, onClick: onBack };
  }
  return { label: m.useAnotherMethod, onClick: onCancel };
}
