export const convertUint8ArrayToHex = (hashArray: number[]): string => {
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
