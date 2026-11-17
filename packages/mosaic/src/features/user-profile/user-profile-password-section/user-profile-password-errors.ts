import { isClerkAPIResponseError } from '@clerk/shared/error';
import type { ClerkAPIError, PasswordSettingsData } from '@clerk/shared/types';
import { snakeToCamel } from '@clerk/shared/underscore';

import type { MosaicMessages } from '../../../localization';
import { toLocalizableApiError } from '../../../localization';
import type { MosaicIssue } from '../../../utils/errors';
import { MosaicError } from '../../../utils/errors';
import { passwordComplexityMessage, passwordStrengthMessage } from './user-profile-password-feedback';

type Messages = MosaicMessages['userProfile']['password'];
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

function passwordIssue(
  errors: readonly [ClerkAPIError, ...ClerkAPIError[]],
  settings: Settings,
  messages: Messages,
  locale: string,
): MosaicIssue {
  const [first] = errors;
  if (first.code === 'form_password_not_strong_enough') {
    const suggestions: { code: string }[] | undefined = first.meta?.zxcvbn?.suggestions;
    const message = passwordStrengthMessage(suggestions?.map(suggestion => suggestion.code) ?? [], messages);
    return { code: 'password_feedback', message, field: 'newPassword' };
  }
  const failures = errors.flatMap(error => {
    const code = passwordComplexityCodes.get(error.code);
    return code ? [code] : [];
  });
  const message = passwordComplexityCodes.has(first.code)
    ? passwordComplexityMessage(failures, settings, messages, locale)
    : undefined;
  return message
    ? { code: 'password_feedback', message, field: 'newPassword' }
    : { ...toLocalizableApiError(first), field: 'newPassword' };
}

// The password field groups Clerk's complexity errors into one message and reads zxcvbn hints from `meta`, which a MosaicIssue does not carry.
export function passwordMosaicError(
  error: unknown,
  requiresCurrentPassword: boolean,
  settings: Settings,
  messages: Messages,
  locale: string,
): unknown {
  if (!(error instanceof Error) || !isClerkAPIResponseError(error)) {
    return error;
  }
  const issues: MosaicIssue[] = [];
  const passwordErrors: ClerkAPIError[] = [];
  const items: ClerkAPIError[] = error.errors;
  for (const item of items) {
    const name = snakeToCamel(item.meta?.paramName);
    if (name === 'currentPassword' && requiresCurrentPassword) {
      issues.push({ ...toLocalizableApiError(item), field: 'currentPassword' });
    } else if (name === 'newPassword' || name === 'password') {
      passwordErrors.push(item);
    } else {
      issues.push(toLocalizableApiError(item));
    }
  }
  const [firstPasswordError, ...otherPasswordErrors] = passwordErrors;
  if (firstPasswordError) {
    issues.push(passwordIssue([firstPasswordError, ...otherPasswordErrors], settings, messages, locale));
  }
  const [first, ...rest] = issues;
  return first ? new MosaicError([first, ...rest]) : error;
}
