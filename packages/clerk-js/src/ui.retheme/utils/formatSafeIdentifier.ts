import { stringToFormattedPhoneString } from './phoneUtils';

export const isMaskedIdentifier = (str: string | undefined | null) => str && str.includes('**');

/**
 * Formats a string that can contain an email, a username or a phone number.
 * Depending on the scenario, the string might be obfuscated (parts of the identifier replaced with "*")
 * Refer to the tests for examples.
 */
export const formatSafeIdentifier = (str: string | undefined | null) => {
  if (!str || str.includes('@') || isMaskedIdentifier(str) || str.match(/[a-zA-Z]/)) {
    return str;
  }
  return stringToFormattedPhoneString(str);
};
