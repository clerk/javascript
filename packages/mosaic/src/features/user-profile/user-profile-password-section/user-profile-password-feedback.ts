import { isClerkAPIResponseError } from '@clerk/shared/error';
import type { ClerkAPIError, PasswordSettingsData } from '@clerk/shared/types';

import { FormSubmitError } from '../../../components/form';
import type { MosaicMessages } from '../../../localization';
import { fill } from '../../../localization';
import { UserProfilePasswordUpdateError } from './user-profile-password-section.types';

type Messages = MosaicMessages['userProfilePasswordSection'];
type Settings = Pick<PasswordSettingsData, 'min_length' | 'max_length'>;

function lookup(messages: Record<string, string>, key: string): string | undefined {
  return Object.hasOwn(messages, key) ? messages[key] : undefined;
}

export function passwordStrengthMessage(codes: string[], messages: Messages): string {
  return [messages.rules.weak, ...codes.map(code => lookup(messages.suggestions, code))].filter(Boolean).join(' ');
}

function passwordError(errors: ClerkAPIError[], settings: Settings, messages: Messages, locale: string) {
  const first = errors[0];
  if (!first) {
    return undefined;
  }
  const known = lookup(messages.passwordErrors, first.code);
  if (known !== undefined) {
    return known || first.message;
  }
  if (first.code === 'form_password_not_strong_enough') {
    return passwordStrengthMessage(first.meta?.zxcvbn?.suggestions?.map(suggestion => suggestion.code) ?? [], messages);
  }
  const codes: Record<string, string> = {
    form_password_length_too_short: 'min_length',
    form_password_length_too_long: 'max_length',
    form_password_no_uppercase: 'require_uppercase',
    form_password_no_lowercase: 'require_lowercase',
    form_password_no_number: 'require_numbers',
    form_password_no_special_char: 'require_special_char',
  };
  const failures = errors.flatMap(error => {
    const code = lookup(codes, error.code);
    return code ? [code] : [];
  });
  return passwordComplexityMessage(failures, settings, messages, locale) || first.longMessage || first.message;
}

export function passwordComplexityMessage(failures: string[], settings: Settings, messages: Messages, locale: string) {
  const rules: Record<string, string> = {
    min_length: fill(messages.complexity.minimumLength, { length: settings.min_length }),
    max_length: fill(messages.complexity.maximumLength, { length: settings.max_length }),
    require_uppercase: messages.complexity.uppercase,
    require_lowercase: messages.complexity.lowercase,
    require_numbers: messages.complexity.number,
    require_special_char: messages.complexity.special,
  };
  const requirements = (failures.includes('min_length') ? ['min_length'] : failures).flatMap(code => {
    const text = lookup(rules, code);
    return text ? [text] : [];
  });
  if (!requirements.length) {
    return undefined;
  }
  const list =
    typeof Intl.ListFormat === 'function'
      ? new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format(requirements)
      : requirements.join(', ');
  return fill(messages.complexity.sentence, { requirements: list });
}

export function passwordFormError(
  error: unknown,
  requiresCurrentPassword: boolean,
  settings: Settings,
  messages: Messages,
  locale: string,
): unknown {
  if (error instanceof UserProfilePasswordUpdateError) {
    return error.code === 'current_password_required'
      ? new FormSubmitError({ fields: { currentPassword: messages.errors.currentPasswordRequired } })
      : new FormSubmitError({ message: messages.errors.unavailable });
  }
  if (!isClerkAPIResponseError(error)) {
    return error;
  }
  const fields: { currentPassword?: string; newPassword?: string } = {};
  const passwordErrors: ClerkAPIError[] = [];
  let message: string | undefined;
  for (const item of error.errors) {
    const text = item.longMessage || item.message;
    const name = item.meta?.paramName;
    if ((name === 'current_password' || name === 'currentPassword') && requiresCurrentPassword) {
      fields.currentPassword ??= text;
    } else if (name === 'new_password' || name === 'newPassword' || name === 'password') {
      passwordErrors.push(item);
    } else {
      message ??= text;
    }
  }
  if (passwordErrors.length) {
    fields.newPassword = passwordError(passwordErrors, settings, messages, locale);
  }
  return new FormSubmitError({ message, fields });
}
