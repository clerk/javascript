import { SHA1 } from './sha1';

export const syncDigest = (values: Record<string, string | undefined>) => {
  const sortedValues = Object.keys(values)
    .sort()
    .filter(s => values[s])
    .map(s => values[s]);

  if (!sortedValues.length) {
    return '';
  }

  return SHA1(sortedValues.join('&')).slice(0, 8);
};
