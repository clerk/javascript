import { stringToFormattedPhoneString } from '@clerk/shared/phone';

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

export function codeCopy(
  step: CodeStepData,
  m: Messages,
  applicationName: string,
): { title: string; description: string; fieldLabel: string } {
  const identifier = displayIdentifier(step) ?? '';
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
  const copy = channelCopy(step, m);
  const description = sentToIdentifier(step)
    ? fill(copy.descriptionSentTo, { identifier })
    : fill(copy.description, { applicationName });
  const title =
    step.channel === 'phone' && step.provider
      ? fill(m.alternativePhoneCode.title, { provider: step.provider })
      : copy.title;
  return { title, description, fieldLabel: copy.label };
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
  return channelCopy(step, m);
}

function channelCopy(step: CodeStepData, m: Messages) {
  if (step.channel === 'phone' && step.provider) {
    return m.alternativePhoneCode;
  }
  if (step.channel === 'phone') {
    return step.purpose === 'first-factor' ? m.phoneCode : m.phoneCodeMfa;
  }
  return m.emailCode;
}

function identifierEditable(step: CodeStepData): boolean {
  return step.purpose === 'first-factor' || step.purpose === 'sso-bypass' || step.purpose === 'verify-phone';
}

function sentToIdentifier(step: CodeStepData): boolean {
  return Boolean(step.identifier) && !identifierEditable(step);
}

function displayIdentifier(step: CodeStepData): string | undefined {
  const { identifier } = step;
  if (step.channel !== 'phone' || !identifier || identifier.includes('*')) {
    return identifier;
  }
  return stringToFormattedPhoneString(identifier);
}

export function codeIdentity(step: CodeStepData, m: Messages): { identifier?: string; editLabel: string } {
  return {
    identifier: step.channel !== 'totp' && identifierEditable(step) ? displayIdentifier(step) : undefined,
    editLabel: step.channel === 'phone' ? m.editPhoneNumber : m.editIdentifier,
  };
}

export function codeNotice(step: CodeStepData, m: Messages): string | undefined {
  switch (step.purpose) {
    case 'client-trust':
      return m.clientTrust.notice;
    case 'sso-bypass':
      return m.ssoBypass.notice;
    case 'first-factor':
    case 'second-factor':
    case 'reset-password':
    case 'verify-email':
    case 'verify-phone':
      return undefined;
  }
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
