export const addFullStop = (string: string | undefined) => {
  if (!string) {
    return '';
  }

  if (string.charAt(string.length - 1) === '.') {
    return string;
  }

  return string + '.';
};
