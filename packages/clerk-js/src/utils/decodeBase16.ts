export const decodeBase16 = (input: string): string => {
  let result = '';
  for (let i = 0; i < input.length; i += 2) {
    result += String.fromCharCode(parseInt(input.substring(i, i + 2), 16));
  }
  return result;
};
