import { isClerkAPIResponseError } from '@clerk/shared/error';
import type { ClerkAPIError, PasswordSettingsData, PasswordValidation } from '@clerk/shared/types';

import type { FieldFeedback } from '../../../components/form';
import { FormSubmitError } from '../../../components/form';
import type { LocalizableError, MosaicMessages } from '../../../localization';
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

function passwordError(
  errors: ClerkAPIError[],
  settings: Settings,
  messages: Messages,
  locale: string,
  errorText: (error: LocalizableError) => string,
) {
  const first = errors[0];
  if (!first) {
    return undefined;
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
  if (!lookup(codes, first.code)) {
    return errorText({
      code: first.code,
      paramName: first.meta?.paramName,
      message: first.longMessage || first.message,
    });
  }
  const failures = errors.flatMap(error => {
    const code = lookup(codes, error.code);
    return code ? [code] : [];
  });
  return (
    passwordComplexityMessage(failures, settings, messages, locale) ||
    errorText({ code: first.code, paramName: first.meta?.paramName, message: first.longMessage || first.message })
  );
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

export function passwordFieldFeedback(
  { complexity, strength }: PasswordValidation,
  settings: Settings & Pick<PasswordSettingsData, 'show_zxcvbn'>,
  messages: Messages,
  locale: string,
): FieldFeedback | undefined {
  const failures = Object.entries(complexity ?? {})
    .filter(([, failed]) => failed)
    .map(([code]) => code);
  const message = passwordComplexityMessage(failures, settings, messages, locale);
  if (message) {
    return { type: complexity?.min_length ? 'info' : 'error', message };
  }
  if (strength?.state === 'fail') {
    return { type: 'error', message: passwordStrengthMessage(strength.result.feedback.suggestions, messages) };
  }
  if (strength?.state === 'pass') {
    return { type: 'warning', message: messages.rules.stronger };
  }
  if (!strength && settings.show_zxcvbn) {
    return undefined;
  }
  return { type: 'success', message: messages.rules.strong };
}

export function passwordFormError(
  error: unknown,
  requiresCurrentPassword: boolean,
  settings: Settings,
  messages: Messages,
  locale: string,
  errorText: (error: LocalizableError) => string,
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
    const text = errorText({
      code: item.code,
      paramName: item.meta?.paramName,
      message: item.longMessage || item.message,
    });
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
    fields.newPassword = passwordError(passwordErrors, settings, messages, locale, errorText);
  }
  return new FormSubmitError({ message, fields });
}
