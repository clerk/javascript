import type { PasswordSettingsData, PasswordValidation } from '@clerk/shared/types';

import type { FieldFeedback } from '../../../components/form';
import type { MosaicMessages } from '../../../localization';
import { fill } from '../../../localization';

type Messages = MosaicMessages['userProfilePasswordSection'];
type Settings = Pick<PasswordSettingsData, 'min_length' | 'max_length'>;

const complexityMessageKeys = new Map<string, Exclude<keyof Messages['complexity'], 'sentence'>>([
  ['min_length', 'minimumLength'],
  ['max_length', 'maximumLength'],
  ['require_uppercase', 'uppercase'],
  ['require_lowercase', 'lowercase'],
  ['require_numbers', 'number'],
  ['require_special_char', 'special'],
]);

export function passwordStrengthMessage(codes: string[], messages: Messages): string {
  const suggestions = new Map(Object.entries(messages.suggestions));
  return [
    messages.rules.weak,
    ...codes.flatMap(code => {
      const message = suggestions.get(code);
      return message ? [message] : [];
    }),
  ].join(' ');
}

export function passwordComplexityMessage(failures: string[], settings: Settings, messages: Messages, locale: string) {
  const requirements = (failures.includes('min_length') ? ['min_length'] : failures).flatMap(code => {
    const key = complexityMessageKeys.get(code);
    if (!key) {
      return [];
    }
    const length = code === 'min_length' ? settings.min_length : settings.max_length;
    return [fill(messages.complexity[key], { length })];
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
