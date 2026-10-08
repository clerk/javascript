import type { SignInFactor } from '@clerk/shared/types';

import type { LocalizationKey } from '../../customizables';
import { localizationKeys } from '../../customizables';
import { Envelope, Fingerprint, Link, Lock, LockArrow, SpeechBubble } from '../../icons';
import { formatSafeIdentifier } from '../../utils/formatSafeIdentifier';
import type { AlternativeMethodsMode } from './AlternativeMethods';

export function getButtonLabel(factor: SignInFactor): LocalizationKey {
  switch (factor.strategy) {
    case 'email_link':
      return localizationKeys('signIn.alternativeMethods.blockButton__emailLink', {
        identifier: formatSafeIdentifier(factor.safeIdentifier) || '',
      });
    case 'email_code':
      return localizationKeys('signIn.alternativeMethods.blockButton__emailCode', {
        identifier: formatSafeIdentifier(factor.safeIdentifier) || '',
      });
    case 'phone_code':
      return localizationKeys('signIn.alternativeMethods.blockButton__phoneCode', {
        identifier: formatSafeIdentifier(factor.safeIdentifier) || '',
      });
    case 'password':
      return localizationKeys('signIn.alternativeMethods.blockButton__password');
    case 'passkey':
      return localizationKeys('signIn.alternativeMethods.blockButton__passkey');
    case 'reset_password_email_code':
      return localizationKeys('signIn.forgotPasswordAlternativeMethods.blockButton__resetPassword');
    case 'reset_password_phone_code':
      return localizationKeys('signIn.forgotPasswordAlternativeMethods.blockButton__resetPassword');
    default:
      throw new Error(`Invalid sign in strategy: "${factor.strategy}"`);
  }
}

export function getButtonIcon(factor: SignInFactor) {
  const icons = {
    email_link: Link,
    email_code: Envelope,
    phone_code: SpeechBubble,
    reset_password_email_code: LockArrow,
    reset_password_phone_code: LockArrow,
    password: Lock,
    passkey: Fingerprint,
  } as const;

  return icons[factor.strategy as keyof typeof icons];
}

export function determineFlowPart(mode: AlternativeMethodsMode) {
  switch (mode) {
    case 'forgot':
      return 'forgotPasswordMethods';
    case 'pwned':
      return 'passwordPwnedMethods';
    case 'passwordCompromised':
      return 'passwordCompromisedMethods';
    default:
      return 'alternativeMethods';
  }
}

export function determineTitle(mode: AlternativeMethodsMode): LocalizationKey {
  switch (mode) {
    case 'forgot':
      return localizationKeys('signIn.forgotPasswordAlternativeMethods.title');
    case 'pwned':
      return localizationKeys('signIn.passwordPwned.title');
    case 'passwordCompromised':
      return localizationKeys('signIn.passwordCompromised.title');
    default:
      return localizationKeys('signIn.alternativeMethods.title');
  }
}

export function determineIsReset(mode: AlternativeMethodsMode): boolean {
  switch (mode) {
    case 'forgot':
    case 'pwned':
      return true;
    case 'passwordCompromised':
      return false;
    default:
      return false;
  }
}
