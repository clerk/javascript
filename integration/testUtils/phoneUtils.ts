// TODO: remove this with the helpers from packages/clerk-js/src/ui/utils/phoneUtils.ts

export function stringPhoneNumber(phoneNumber: string) {
  // Default to the US number as we are using testing phone numbers: https://clerk.com/docs/testing/test-emails-and-phones#phone-numbers
  return `+${formatPhoneNumber(phoneNumber, '. (...) ...-....')}`;
}

export function formatPhoneNumber(phoneNumber: string, pattern: string): string {
  const digits = [...extractDigits(phoneNumber)].slice(0, 15);

  if (digits.length <= 3) {
    return digits.join('');
  }

  let res = '';
  for (let i = 0; digits.length > 0; i++) {
    if (i > pattern.length - 1) {
      res += digits.shift();
    } else {
      res += pattern[i] === '.' ? digits.shift() : pattern[i];
    }
  }
  return res;
}

export function extractDigits(formattedPhone: string): string {
  return (formattedPhone || '').replace(/[^\d]/g, '');
}
