import { stringToFormattedPhoneString } from '@clerk/shared/phone';

import type { MosaicMessages } from '../../localization';
import { fill } from '../../localization';
import type { SignInEmailLinkStatus, SignInIdentifierField, SignInProvider, SignInStep } from './sign-in.types';

export const stepIds = {
  identifier: ['identifier'],
  identifierChannel: ['identifier:channel'],
  credential: ['credential:password', 'credential:backup-code', 'credential:passkey'],
  code: [
    'code:first-factor',
    'code:second-factor',
    'code:client-trust',
    'code:sso-bypass',
    'code:reset-password',
    'code:verify-email',
    'code:verify-phone',
  ],
  choice: [
    'choice:methods',
    'choice:reset-methods',
    'choice:enterprise-connections',
    'choice:accounts',
    'choice:wallets',
  ],
  notice: [
    'notice:help',
    'notice:forgot-password',
    'notice:no-methods',
    'notice:action-blocked',
    'notice:password-compromised',
    'notice:enterprise-sso',
    'notice:email-link',
    'notice:email-link-status',
    'notice:start-over',
  ],
  newPassword: ['new-password:forgot', 'new-password:required'],
  signUp: ['sign-up'],
} as const;

export type SignInStepKey = (typeof stepIds)[keyof typeof stepIds][number];

export function stepKey(step: SignInStep): SignInStepKey {
  switch (step.kind) {
    case 'identifier':
      return 'channel' in step ? 'identifier:channel' : 'identifier';
    case 'sign-up':
      return step.kind;
    case 'credential':
      return `credential:${step.credential}`;
    case 'new-password':
      return `new-password:${step.reason}`;
    case 'code':
      return `code:${step.purpose}`;
    case 'choice':
      return `choice:${step.purpose}`;
    case 'notice':
      return `notice:${step.purpose}`;
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

export function emailLinkStatusCopy(
  status: SignInEmailLinkStatus,
  m: Messages,
): { title: string; description: string } {
  switch (status) {
    case 'loading':
      return m.emailLink.loading;
    case 'signed-in':
      return m.emailLink.signedIn;
    case 'signed-in-other-tab':
      return m.emailLink.signedInOtherTab;
    case 'transferable':
      return m.emailLink.transferable;
    case 'expired':
      return m.emailLink.expired;
    case 'failed':
      return m.emailLink.failed;
    case 'client-mismatch':
      return m.emailLink.clientMismatch;
  }
}

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

interface IdentifierFieldCopy {
  label: string;
  placeholder: string;
  switchLabel: string;
}

export function identifierFieldCopy(field: SignInIdentifierField, m: Messages): IdentifierFieldCopy {
  switch (field) {
    case 'email':
      return { label: m.start.emailLabel, placeholder: m.start.emailPlaceholder, switchLabel: m.start.useEmail };
    case 'email-or-username':
      return {
        label: m.start.emailOrUsernameLabel,
        placeholder: m.start.emailOrUsernamePlaceholder,
        switchLabel: m.start.useEmailOrUsername,
      };
    case 'username':
      return {
        label: m.start.usernameLabel,
        placeholder: m.start.usernamePlaceholder,
        switchLabel: m.start.useUsername,
      };
    case 'phone':
      return { label: m.start.phoneLabel, placeholder: m.start.phonePlaceholder, switchLabel: m.start.usePhone };
  }
}

export function startPrompt(
  m: Messages,
  { onSignUp, onJoinWaitlist }: { onSignUp?: () => void; onJoinWaitlist?: () => void },
): { text: string; link: string; onClick: () => void } | undefined {
  if (onJoinWaitlist) {
    return { text: m.start.waitlistPrompt, link: m.start.waitlistLink, onClick: onJoinWaitlist };
  }
  if (onSignUp) {
    return { text: m.start.signUpPrompt, link: m.start.signUpLink, onClick: onSignUp };
  }
  return undefined;
}

export function splitLastUsedProvider(
  providers: readonly SignInProvider[],
  lastUsedProviderId: string | undefined,
): { lastUsed?: SignInProvider; others: readonly SignInProvider[] } {
  const lastUsed = providers.find(provider => provider.id === lastUsedProviderId);
  return { lastUsed, others: lastUsed ? providers.filter(provider => provider !== lastUsed) : providers };
}
