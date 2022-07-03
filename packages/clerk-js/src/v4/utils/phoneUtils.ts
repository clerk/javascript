import {
  CodeToCountryIsoMap,
  CountryIso,
  IsoToCountryMap,
  SubAreaCodeSets,
} from '../elements/PhoneInput/countryCodeData';

// offset between uppercase ascii and regional indicator symbols
const OFFSET = 127397;
const emojiCache = {} as Record<CountryIso, string>;
export function getFlagEmojiFromCountryIso(iso: CountryIso, fallbackIso = 'us'): string {
  iso = iso || fallbackIso;
  if (emojiCache[iso]) {
    return emojiCache[iso];
  }
  const codePoints = [...iso.toUpperCase()].map(c => c.codePointAt(0)! + OFFSET);
  const res = String.fromCodePoint(...codePoints);
  emojiCache[iso] = res;
  return res;
}

export function getCountryIsoFromFormattedNumber(formattedNumber: string, fallbackIso = 'us'): string {
  const number = extractDigits(formattedNumber);
  if (!number || number.length < 4) {
    return fallbackIso;
  }

  if (number.startsWith('1') && phoneNumberBelongsTo('us', number)) {
    return 'us';
  }

  if (number.startsWith('1') && phoneNumberBelongsTo('ca', number)) {
    return 'ca';
  }

  return getCountryIsoFromPhoneCode(number, fallbackIso);
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

function getCountryIsoFromPhoneCode(phoneWithCode: string, fallbackIso: string): string {
  // max phone code length is 4 digits
  // try to match more specific codes first
  for (const i of [4, 3, 2]) {
    const potentialCode = phoneWithCode.substring(0, i);
    const countryIso = CodeToCountryIsoMap.get(potentialCode as any);
    if (countryIso) {
      return countryIso;
    }
  }
  return fallbackIso;
}

function phoneNumberBelongsTo(iso: 'us' | 'ca', phoneWithCode: string) {
  if (!iso || !IsoToCountryMap.get(iso) || !phoneWithCode) {
    return false;
  }

  const code = phoneWithCode[0];
  const subArea = phoneWithCode.substring(1, 4);
  return (
    code === IsoToCountryMap.get(iso)?.code &&
    phoneWithCode.length - 1 === maxDigitCountForPattern(IsoToCountryMap.get(iso)?.pattern || '') &&
    SubAreaCodeSets[iso].has(subArea)
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
  const iso = getCountryIsoFromFormattedNumber(str) as CountryIso;
  const pattern = IsoToCountryMap.get(iso)?.pattern || '';
  const code = IsoToCountryMap.get(iso)?.code || '';
  const number = str.replace(`+${code}`, '');
  return { iso, pattern, code, number };
}

export function stringToFormattedPhoneString(str: string): string {
  const parsed = parsePhoneString(str);
  return `+${parsed.code} ${formatPhoneNumber(parsed.number, parsed.pattern, parsed.code)}`;
}
