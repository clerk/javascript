import { stringToFormattedPhoneString } from './phoneUtils';

export const formatIdentifier = (str: string | undefined | null) => {
  if (!str || str.includes('@') || str.match(/[a-zA-Z]/)) {
    return str;
  }
  return stringToFormattedPhoneString(str);
};
