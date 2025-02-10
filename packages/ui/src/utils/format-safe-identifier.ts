import { stringToFormattedPhoneString } from '~/utils/phone-number';

export const isMaskedIdentifier = (str: string | undefined | null) => str && str.includes('**');

/**
 * Formats a string that can contain an email, a username or a phone number.
 * Depending on the scenario, the string might be obfuscated (parts of the identifier replaced with "*")
 * Refer to the tests for examples.
 */
export function formatSafeIdentifier(str: null): null;
export function formatSafeIdentifier(str: undefined): undefined;
export function formatSafeIdentifier(str: string): string;
export function formatSafeIdentifier(str: string | undefined | null) {
  if (!str || str.includes('@') || isMaskedIdentifier(str) || str.match(/[a-zA-Z]/)) {
    return str;
  }
  return stringToFormattedPhoneString(str);
}
