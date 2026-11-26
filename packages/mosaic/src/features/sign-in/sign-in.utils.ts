import type { AuthEmailLinkStatusMessages } from '../../blocks/auth';
import type { MosaicMessages } from '../../localization';
import { fill } from '../../localization';
import { formatPhoneIdentifier } from '../auth-flow/auth-flow.utils';
import type { SignInFactor, SignInIdentifierField, SignInProvider, SignInStep } from './sign-in.types';

type Messages = MosaicMessages['signIn'];

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
    'choice:addresses',
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
    'notice:verify-email-link',
    'notice:loading',
    'notice:protect-check',
    'notice:restricted',
    'notice:waitlist',
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

export function backupCodeDescription(step: Extract<SignInStep, { credential: 'backup-code' }>, m: Messages): string {
  return step.resetting ? m.resetPasswordMfa.description : m.backupCodeMfa.description;
}

export function factorLabel(factor: SignInFactor, m: Messages): string {
  switch (factor.strategy) {
    case 'password':
      return m.alternativeMethods.password;
    case 'passkey':
      return m.alternativeMethods.passkey;
    case 'email_code':
      return fill(m.alternativeMethods.emailCode, { identifier: factor.identifier });
    case 'email_link':
      return fill(m.alternativeMethods.emailLink, { identifier: factor.identifier });
    case 'phone_code':
      return fill(m.alternativeMethods.phoneCode, { identifier: factor.identifier });
    case 'totp':
      return m.alternativeMethods.totp;
    case 'backup_code':
      return m.alternativeMethods.backupCode;
    case 'reset_password_email_code':
      return fill(m.resetMethods.emailCode, { identifier: factor.identifier });
    case 'reset_password_phone_code':
      return fill(m.resetMethods.phoneCode, { identifier: factor.identifier });
  }
}

const GROUPED_STRATEGIES: ReadonlySet<SignInFactor['strategy']> = new Set(['email_code', 'phone_code']);

export interface FactorGroup {
  factor: SignInFactor;
  count: number;
  members: SignInFactor[];
}

export function groupedFactors(factors: readonly SignInFactor[]): FactorGroup[] {
  const groups = new Map<string, FactorGroup>();
  for (const factor of factors) {
    const key = GROUPED_STRATEGIES.has(factor.strategy) ? `${factor.stage}:${factor.strategy}` : factor.id;
    const group = groups.get(key);
    if (group) {
      group.count += 1;
      group.members.push(factor);
    } else {
      groups.set(key, { factor, count: 1, members: [factor] });
    }
  }
  return [...groups.values()];
}

export function factorButtonLabel(factor: SignInFactor, m: Messages): string {
  const labels = m.alternativeMethods.buttons;
  switch (factor.strategy) {
    case 'password':
      return m.alternativeMethods.rows.password.label;
    case 'passkey':
      return labels.passkey;
    case 'email_code':
      return labels.emailCode;
    case 'email_link':
      return labels.emailLink;
    case 'phone_code':
      return labels.phoneCode;
    case 'totp':
      return labels.totp;
    case 'backup_code':
      return labels.backupCode;
    case 'reset_password_email_code':
    case 'reset_password_phone_code':
      return factorLabel(factor, m);
  }
}

export function passkeyFirst(groups: FactorGroup[]): FactorGroup[] {
  return groups.sort((a, b) => Number(b.factor.strategy === 'passkey') - Number(a.factor.strategy === 'passkey'));
}

export function factorIdentifier(factor: SignInFactor): string {
  return 'identifier' in factor ? factor.identifier : '';
}

export function factorRow(factor: SignInFactor, m: Messages, count = 1): { label: string; description?: string } {
  const rows = m.alternativeMethods.rows;
  if (count > 1 && factor.strategy === 'email_code') {
    return rows.emailCodeMany;
  }
  if (count > 1 && factor.strategy === 'email_link') {
    return rows.emailLinkMany;
  }
  if (count > 1 && factor.strategy === 'phone_code') {
    return rows.phoneCodeMany;
  }
  switch (factor.strategy) {
    case 'password':
      return rows.password;
    case 'passkey':
      return rows.passkey;
    case 'email_code':
      return { ...rows.emailCode, description: fill(rows.emailCode.description, { identifier: factor.identifier }) };
    case 'email_link':
      return { ...rows.emailLink, description: fill(rows.emailLink.description, { identifier: factor.identifier }) };
    case 'phone_code':
      return { ...rows.phoneCode, description: fill(rows.phoneCode.description, { identifier: factor.identifier }) };
    case 'totp':
      return rows.totp;
    case 'backup_code':
      return rows.backupCode;
    case 'reset_password_email_code':
    case 'reset_password_phone_code':
      return { label: factorLabel(factor, m) };
  }
}

export function choiceCopy(
  step: Extract<SignInStep, { kind: 'choice' }>,
  m: Messages,
): { title: string; description: string } {
  if (step.purpose === 'reset-methods') {
    return { title: m.resetMethods.title, description: m.resetMethods.description };
  }
  if (step.purpose === 'addresses') {
    const phone = step.options[0]?.strategy === 'phone_code';
    return {
      title: phone ? m.addresses.phoneTitle : m.addresses.emailTitle,
      description: addressesDescription(step.options[0], m),
    };
  }
  if (isSecondFactorChoice(step)) {
    return { title: m.alternativeMethods.secondFactorTitle, description: m.alternativeMethods.secondFactorDescription };
  }
  return { title: m.alternativeMethods.title, description: m.alternativeMethods.description };
}

function addressesDescription(factor: SignInFactor | undefined, m: Messages): string {
  if (factor?.strategy === 'phone_code') {
    return m.addresses.phoneCode;
  }
  return factor?.strategy === 'email_link' ? m.addresses.emailLink : m.addresses.emailCode;
}

export function isSecondFactorChoice(step: Extract<SignInStep, { kind: 'choice' }>): boolean {
  return (
    step.purpose === 'methods' && step.options.length > 0 && step.options.every(option => option.stage === 'second')
  );
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

export function emailLinkStatusMessages(flow: 'sign-in' | 'sign-up', m: Messages): AuthEmailLinkStatusMessages {
  return flow === 'sign-up' ? { ...m.emailLink, ...m.emailLink.signUp } : m.emailLink;
}

type CodeStepData = Extract<SignInStep, { kind: 'code' }>;
type CodeResendCopy = Pick<Messages['emailCode'], 'resendText' | 'resend' | 'resendCountdown'>;

export function codeCopy(
  step: CodeStepData,
  m: Messages,
  applicationName: string,
): { title: string; description: string; fieldLabel: string } {
  const identifier = displayIdentifier(step) ?? '';
  if (step.purpose === 'reset-password') {
    return resetPasswordCodeCopy(step, m, identifier);
  }
  if (step.purpose === 'verify-email') {
    return {
      title: m.verifyEmail.title,
      description: fill<string>(m.verifyEmail.description, { identifier, applicationName }),
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
      : {
          title: m.verifyPhone.title,
          description: identifier ? fill(m.verifyPhone.descriptionSentTo, { identifier }) : m.verifyPhone.description,
          fieldLabel: m.verifyPhone.label,
        };
  }
  if (step.channel === 'totp') {
    return {
      title: m.totpMfa.title,
      description: step.resetting ? m.resetPasswordMfa.description : m.totpMfa.description,
      fieldLabel: m.totpMfa.label,
    };
  }
  const copy = channelCopy(step, m);
  const description = codeDescription(step, m, copy, { identifier, applicationName });
  const title =
    step.channel === 'phone' && step.provider
      ? fill(m.alternativePhoneCode.title, { provider: step.provider })
      : copy.title;
  return { title, description, fieldLabel: copy.label };
}

function resetPasswordCodeCopy(
  step: CodeStepData,
  m: Messages,
  identifier: string,
): { title: string; description: string; fieldLabel: string } {
  return {
    title: m.resetPasswordCode.title,
    description: identifier
      ? fill(m.resetPasswordCode.descriptionSentTo, { identifier })
      : step.channel === 'phone'
        ? m.resetPasswordCode.descriptionPhone
        : m.resetPasswordCode.descriptionEmail,
    fieldLabel: m.resetPasswordCode.label,
  };
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

function codeDescription(
  step: CodeStepData,
  m: Messages,
  copy: ReturnType<typeof channelCopy>,
  { identifier, applicationName }: { identifier: string; applicationName: string },
): string {
  if (step.resetting) {
    return identifier ? fill(m.resetPasswordMfa.descriptionSentTo, { identifier }) : m.resetPasswordMfa.description;
  }
  return identifier ? fill(copy.descriptionSentTo, { identifier }) : fill(copy.description, { applicationName });
}

function identifierEditable(step: CodeStepData): boolean {
  return (
    step.purpose === 'first-factor' ||
    step.purpose === 'sso-bypass' ||
    step.purpose === 'verify-email' ||
    step.purpose === 'verify-phone' ||
    step.purpose === 'reset-password'
  );
}

function displayIdentifier(step: CodeStepData): string | undefined {
  const { identifier } = step;
  if (step.channel !== 'phone' || !identifier) {
    return identifier;
  }
  return formatPhoneIdentifier(identifier);
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

export function differentIdentifierLabel(identifier: string, m: Messages): string {
  if (identifier.includes('@')) {
    return m.useDifferentEmail;
  }
  return /^\+?[\d\s().-]+$/.test(identifier) ? m.useDifferentPhoneNumber : m.useDifferentAccount;
}

export function codeEditLabel(step: CodeStepData, m: Messages): string {
  if (step.purpose === 'verify-email') {
    return m.useDifferentEmail;
  }
  if (step.purpose === 'verify-phone') {
    return m.useDifferentPhoneNumber;
  }
  if (step.purpose === 'second-factor' || step.purpose === 'client-trust') {
    return m.useDifferentAccount;
  }
  return step.identifier ? differentIdentifierLabel(step.identifier, m) : m.back;
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
    return { label: m.verifyAnotherWay, onClick: undefined };
  }
  if ((step.purpose === 'second-factor' || step.purpose === 'client-trust') && !onCancel) {
    return { label: m.back, onClick: onBack };
  }
  return {
    label:
      step.purpose === 'second-factor' || step.purpose === 'client-trust' ? m.verifyAnotherWay : m.useAnotherMethod,
    onClick: onCancel,
  };
}
