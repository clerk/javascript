import type { SignInSecondFactor } from '@clerk/shared/types';

import type { LocalizationKey } from '@/customizables';
import { localizationKeys } from '@/customizables';
import { formatSafeIdentifier } from '@/utils/formatSafeIdentifier';

export function getButtonLabel(factor: SignInSecondFactor): LocalizationKey {
  switch (factor.strategy) {
    case 'phone_code':
      return localizationKeys('signIn.alternativeMethods.blockButton__phoneCode', {
        identifier: formatSafeIdentifier(factor.safeIdentifier) || '',
      });
    case 'totp':
      return localizationKeys('signIn.alternativeMethods.blockButton__totp');
    case 'backup_code':
      return localizationKeys('signIn.alternativeMethods.blockButton__backupCode');
    case 'email_code':
      return localizationKeys('signIn.alternativeMethods.blockButton__emailCode', {
        identifier: formatSafeIdentifier(factor.safeIdentifier) || '',
      });
    case 'email_link':
      return localizationKeys('signIn.alternativeMethods.blockButton__emailLink', {
        identifier: formatSafeIdentifier(factor.safeIdentifier) || '',
      });
    default:
      ((_: never) => _)(factor);
      throw new Error('Invalid sign in strategy');
  }
}
