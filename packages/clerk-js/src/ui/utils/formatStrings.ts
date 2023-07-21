import { canUseListFormat } from '../utils';

export const addFullStop = (string: string | undefined) => {
  if (!string) {
    return '';
  }

  if (string.charAt(string.length - 1) === '.') {
    return string;
  }

  return string + '.';
};

export const createListFormat = (message: string[], locale: string) => {
  let messageWithPrefix: string;
  if (canUseListFormat(locale)) {
    const formatter = new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' });
    messageWithPrefix = formatter.format(message);
  } else {
    messageWithPrefix = message.join(', ');
  }

  return messageWithPrefix;
};
