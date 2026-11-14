import type { MosaicMessages } from '../../localization';
import type { SignInIdentifierField, SignInProvider, SignInStep } from './sign-in.types';

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
