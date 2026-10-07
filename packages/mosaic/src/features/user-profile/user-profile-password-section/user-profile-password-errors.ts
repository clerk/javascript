import { isClerkAPIResponseError } from '@clerk/shared/error';
import type { ClerkAPIError, PasswordSettingsData } from '@clerk/shared/types';
import { snakeToCamel } from '@clerk/shared/underscore';

import { FormSubmitError } from '../../../components/form';
import type { ErrorDescription, MosaicMessages } from '../../../localization';
import { toLocalizableApiError } from '../../../localization';
import { toLocalizableError } from '../../../utils/errors';
import { passwordComplexityMessage, passwordStrengthMessage } from './user-profile-password-feedback';
import type { UserProfileEditPasswordValues } from './user-profile-password-section.types';

type Messages = MosaicMessages['userProfilePasswordSection'];
type Settings = Pick<PasswordSettingsData, 'min_length' | 'max_length'>;
type ComplexityRule =
  | 'min_length'
  | 'max_length'
  | 'require_uppercase'
  | 'require_lowercase'
  | 'require_numbers'
  | 'require_special_char';

const passwordComplexityCodes = new Map<string, ComplexityRule>([
  ['form_password_length_too_short', 'min_length'],
  ['form_password_length_too_long', 'max_length'],
  ['form_password_no_uppercase', 'require_uppercase'],
  ['form_password_no_lowercase', 'require_lowercase'],
  ['form_password_no_number', 'require_numbers'],
  ['form_password_no_special_char', 'require_special_char'],
]);

function passwordError(
  errors: ClerkAPIError[],
  settings: Settings,
  messages: Messages,
  locale: string,
  errorText: (error: ErrorDescription) => string,
) {
  const first = errors[0];
  if (!first) {
    return undefined;
  }
  if (first.code === 'form_password_not_strong_enough') {
    return passwordStrengthMessage(first.meta?.zxcvbn?.suggestions.map(suggestion => suggestion.code) ?? [], messages);
  }
  const failures = errors.flatMap(error => {
    const code = passwordComplexityCodes.get(error.code);
    return code ? [code] : [];
  });
  return (
    (passwordComplexityCodes.has(first.code)
      ? passwordComplexityMessage(failures, settings, messages, locale)
      : undefined) || errorText(toLocalizableApiError(first))
  );
}

// TODO: Move onto save() and drop toLocalizableApiError.
export function passwordFormError(
  error: unknown,
  requiresCurrentPassword: boolean,
  settings: Settings,
  messages: Messages,
  locale: string,
  errorText: (error: ErrorDescription) => string,
): FormSubmitError<UserProfileEditPasswordValues> {
  if (typeof error !== 'object' || error === null || !isClerkAPIResponseError(error)) {
    return new FormSubmitError({ message: errorText(toLocalizableError(error)) });
  }
  const fields: { currentPassword?: string; newPassword?: string } = {};
  const passwordErrors: ClerkAPIError[] = [];
  let message: string | undefined;
  for (const item of error.errors) {
    const text = errorText(toLocalizableApiError(item));
    const name = snakeToCamel(item.meta?.paramName);
    if (name === 'currentPassword' && requiresCurrentPassword) {
      fields.currentPassword ??= text;
    } else if (name === 'newPassword' || name === 'password') {
      passwordErrors.push(item);
    } else {
      message ??= text;
    }
  }
  if (passwordErrors.length) {
    fields.newPassword = passwordError(passwordErrors, settings, messages, locale, errorText);
  }
  return new FormSubmitError({ message, fields });
}
