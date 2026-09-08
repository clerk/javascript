import { stringToFormattedPhoneString } from './phoneUtils';

export const isMaskedIdentifier = (str: string | undefined | null) => str && str.includes('**');

/**
 * Formats a string that can contain an email, a username or a phone number.
 * Depending on the scenario, the string might be obfuscated (parts of the identifier replaced with "*")
 * Refer to the tests for examples.
 */
export const formatSafeIdentifier = (str: string | undefined | null) => {
  if (!str || str.includes('@') || isMaskedIdentifier(str) || str.match(/[a-zA-Z]/) || !str.startsWith('+')) {
    return str;
  }
  return stringToFormattedPhoneString(str);
};

/**
 * Masks the local part of an email address, e.g. `user@corp.com` -> `u***@corp.com`.
 * Needed where the server hands back the address the user typed rather than an obfuscated one.
 */
export const maskEmailAddress = (str: string | undefined | null) => {
  if (!str || isMaskedIdentifier(str)) {
    return str;
  }
  const at = str.lastIndexOf('@');
  if (at <= 0) {
    return str;
  }
  return `${str.slice(0, 1)}***${str.slice(at)}`;
};
