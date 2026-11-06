import type { CountryEntry } from '@clerk/shared/phone';
import { extractDigits } from '@clerk/shared/phone';

const E164_MAX_DIGITS = 15;

export function getNationalNumber(value: string, country: CountryEntry): string {
  const digits = extractDigits(value);
  const national = digits.startsWith(country.code) ? digits.slice(country.code.length) : digits;
  return capNationalNumber(national, country);
}

export function toE164(country: CountryEntry, input: string): string {
  const number = capNationalNumber(extractDigits(input), country);
  return number ? `+${country.code}${number}` : '';
}

export function formatNationalNumber(digits: string, pattern: string | undefined): string {
  if (!pattern || digits.length <= 3) {
    return digits;
  }
  let formatted = '';
  let next = 0;
  for (const char of pattern) {
    if (next === digits.length) {
      break;
    }
    if (char === '.') {
      formatted += digits.charAt(next);
      next++;
    } else {
      formatted += char;
    }
  }
  return formatted + digits.slice(next);
}

function capNationalNumber(digits: string, country: CountryEntry): string {
  return digits.slice(0, E164_MAX_DIGITS - country.code.length);
}
