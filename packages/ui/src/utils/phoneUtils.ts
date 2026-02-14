import type { PhoneCodeChannel } from '@clerk/shared/types';

import type { CountryEntry, CountryIso } from '../elements/PhoneInput/countryCodeData';
import {
  getCodeToCountriesMap,
  getIsoToCountryMap,
  getSubAreaCodeSets,
  loadCountryCodeData,
  US_FALLBACK_ENTRY,
} from '../elements/PhoneInput/countryCodeDataLoader';

// offset between uppercase ascii and regional indicator symbols
const OFFSET = 127397;
const emojiCache = {} as Record<CountryIso, string>;
export function getFlagEmojiFromCountryIso(iso: CountryIso, fallbackIso = 'us'): string {
  iso = iso || fallbackIso;
  if (emojiCache[iso]) {
    return emojiCache[iso];
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const codePoints = [...iso.toUpperCase()].map(c => c.codePointAt(0)! + OFFSET);
  const res = String.fromCodePoint(...codePoints);
  emojiCache[iso] = res;
  return res;
}

export function getCountryIsoFromFormattedNumber(formattedNumber: string, fallbackIso = 'us'): string {
  void loadCountryCodeData();
  const number = extractDigits(formattedNumber);
  if (!number || number.length < 4) {
    return fallbackIso;
  }

  // Try to match US first based on subarea code
  if (number.startsWith('1') && phoneNumberBelongsTo('us', number)) {
    return 'us';
  }

  // Try to match CA first based on subarea code
  if (number.startsWith('1') && phoneNumberBelongsTo('ca', number)) {
    return 'ca';
  }

  // Otherwise, use the most specific code or fallback to US
  return getCountryFromPhoneString(number).country.iso;
}

export function formatPhoneNumber(phoneNumber: string, pattern: string | undefined, countryCode?: string): string {
  if (!phoneNumber || !pattern) {
    return phoneNumber;
  }

  const digits = [...extractDigits(phoneNumber)].slice(0, maxE164CompliantLength(countryCode));

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

function phoneNumberBelongsTo(iso: 'us' | 'ca', phoneWithCode: string) {
  const isoMap = getIsoToCountryMap();
  const subAreaSets = getSubAreaCodeSets();
  if (!iso || !isoMap?.get(iso) || !phoneWithCode) {
    return false;
  }

  const code = phoneWithCode[0];
  const subArea = phoneWithCode.substring(1, 4);
  return (
    code === isoMap.get(iso)?.code &&
    phoneWithCode.length - 1 === maxDigitCountForPattern(isoMap.get(iso)?.pattern || '') &&
    (subAreaSets?.[iso]?.has(subArea) ?? false)
  );
}

function maxDigitCountForPattern(pattern: string) {
  return (pattern.match(/\./g) || []).length;
}

// https://en.wikipedia.org/wiki/E.164
const MAX_PHONE_NUMBER_LENGTH = 15;
function maxE164CompliantLength(countryCode?: string) {
  const usCountryCode = '1';
  countryCode = countryCode || usCountryCode;
  const codeWithPrefix = countryCode.includes('+') ? countryCode : '+' + countryCode;
  return MAX_PHONE_NUMBER_LENGTH - codeWithPrefix.length;
}

export function parsePhoneString(str: string) {
  void loadCountryCodeData();
  const digits = extractDigits(str);
  const iso = getCountryIsoFromFormattedNumber(digits) as CountryIso;
  const isoMap = getIsoToCountryMap();
  const pattern = isoMap?.get(iso)?.pattern || '';
  const code = isoMap?.get(iso)?.code || '';
  const number = digits.slice(code.length);
  const formattedNumberWithCode = `+${code} ${formatPhoneNumber(number, pattern, code)}`;
  return { iso, pattern, code, number, formattedNumberWithCode };
}

export function stringToFormattedPhoneString(str: string): string {
  void loadCountryCodeData();
  const parsed = parsePhoneString(str);
  return `+${parsed.code} ${formatPhoneNumber(parsed.number, parsed.pattern, parsed.code)}`;
}

export const byPriority = (a: CountryEntry, b: CountryEntry) => {
  return b.priority - a.priority;
};

export function getCountryFromPhoneString(phone: string): { number: string; country: CountryEntry } {
  void loadCountryCodeData();
  const phoneWithCode = extractDigits(phone);
  const matchingCountries = [];
  const codeMap = getCodeToCountriesMap();

  // Max country code length is 4. Try to match more specific codes first
  for (const i of [4, 3, 2, 1]) {
    const potentialCode = phoneWithCode.substring(0, i);
    const countries = codeMap?.get(potentialCode as any) || [];

    if (countries.length) {
      matchingCountries.push(...countries);
    }
  }

  const fallbackCountry = getIsoToCountryMap()?.get('us') ?? US_FALLBACK_ENTRY;
  const country: CountryEntry = matchingCountries.sort(byPriority)[0] || fallbackCountry;
  const number = phoneWithCode.slice(country?.code.length || 0);

  return { number, country };
}

export function getPreferredPhoneCodeChannelByCountry(
  phoneNumber: string,
  preferredChannels: Record<string, PhoneCodeChannel>,
): PhoneCodeChannel | null {
  if (!preferredChannels) {
    return null;
  }
  const { country } = getCountryFromPhoneString(phoneNumber);
  return preferredChannels[country.iso.toUpperCase()] || null;
}
