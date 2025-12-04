export function toHex(stringToConvert: string): string {
  return stringToConvert
    .split('')
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
}
