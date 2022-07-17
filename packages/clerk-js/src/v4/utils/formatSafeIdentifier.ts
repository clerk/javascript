import { stringToFormattedPhoneString } from './phoneUtils';

const isMaskedIdentifier = (str: string | undefined | null) => str && str.includes('**');

export const formatSafeIdentifier = (str: string | undefined | null) => {
  if (!str || str.includes('@') || isMaskedIdentifier(str) || str.match(/[a-zA-Z]/)) {
    return str;
  }
  return stringToFormattedPhoneString(str);
};
