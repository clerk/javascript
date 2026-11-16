import { stringToFormattedPhoneString } from '@clerk/shared/phone';

export function formatPhoneIdentifier(identifier: string): string {
  if (!identifier || identifier.includes('*')) {
    return identifier;
  }
  return stringToFormattedPhoneString(identifier);
}
