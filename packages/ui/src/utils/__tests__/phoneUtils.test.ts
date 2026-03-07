import type { PhoneCodeChannel } from '@clerk/shared/types';
import { beforeAll, describe, expect, it } from 'vitest';

import { loadCountryCodeData } from '../../elements/PhoneInput/countryCodeDataLoader';
import {
  extractDigits,
  formatPhoneNumber,
  getCountryFromPhoneString,
  getCountryIsoFromFormattedNumber,
  getFlagEmojiFromCountryIso,
  getPreferredPhoneCodeChannelByCountry,
} from '../phoneUtils';

beforeAll(async () => {
  await loadCountryCodeData();
});

describe('phoneUtils', () => {
  describe('countryIsoToFlagEmoji(iso)', () => {
    it('handles undefined', () => {
      const res = getFlagEmojiFromCountryIso(undefined as any);
      expect(res).toBe('🇺🇸');
    });

    it('handles us iso', () => {
      const res = getFlagEmojiFromCountryIso('us');
      expect(res).toBe('🇺🇸');
    });

    it('handles gr iso', () => {
      const res = getFlagEmojiFromCountryIso('gr');
      expect(res).toBe('🇬🇷');
    });
  });

  describe('extractDigits(formattedPhone)', () => {
    it('handles undefined', () => {
      const res = extractDigits(undefined as any);
      expect(res).toBe('');
    });

    it('handles empty string', () => {
      const res = extractDigits('');
      expect(res).toBe('');
    });

    it('extracts digits from formatted phone number', () => {
      const res = extractDigits('+1 (202) 123 123 1234');
      expect(res).toBe('12021231231234');
    });

    it('extracts digits from number with only digits', () => {
      const res = extractDigits('12021231231234');
      expect(res).toBe('12021231231234');
    });
  });

  describe('formatPhoneNumber(formattedPhone,pattern)', () => {
    it('handles edge cases', () => {
      const res = formatPhoneNumber('', undefined);
      expect(res).toBe('');
    });

    it('does not format a number with less than 3 digits', () => {
      const pattern = '(...) ... ....';
      expect(formatPhoneNumber('1', pattern)).toBe('1');
      expect(formatPhoneNumber('123', pattern)).toBe('123');
    });

    it('formats a number according to pattern before max number of digits is reached', () => {
      const pattern = '(...) ... ....';
      expect(formatPhoneNumber('1231', pattern)).toBe('(123) 1');
      expect(formatPhoneNumber('1231231', pattern)).toBe('(123) 123 1');
    });

    it('formats a number according to pattern when max number of digits is reached', () => {
      const cases = [
        {
          pattern: '(...) ... ....',
          result: '(123) 123 1234',
        },
        {
          pattern: '..........',
          result: '1231231234',
        },
        {
          pattern: '  .-.......(.).  ',
          result: '  1-2312312(3)4',
        },
      ];
      cases.forEach(({ pattern, result }) => {
        expect(formatPhoneNumber('1231231234', pattern)).toBe(result);
      });
    });

    // https://en.wikipedia.org/wiki/E.164
    it('respects the E.164 standard', () => {
      const cases = [
        {
          input: '123 45678901',
          pattern: '... .......',
          result: '123 45678901',
          countryCode: undefined,
        },
        {
          input: '123 45678901',
          pattern: '... .......',
          result: '123 45678901',
          countryCode: '49',
        },
        {
          input: '1234567890123',
          pattern: '(...) ...-....',
          result: '(123) 456-7890123',
          countryCode: '1',
        },
        {
          input: '1234567890123456',
          pattern: '(...) ...-....',
          result: '(123) 456-7890123',
          countryCode: '1',
        },
        {
          input: '123 456789012345',
          pattern: '... .......',
          result: '123 456789012',
          countryCode: '49',
        },
      ];
      cases.forEach(({ input, pattern, result, countryCode }) => {
        expect(formatPhoneNumber(input, pattern, countryCode)).toBe(result);
      });
    });

    it('immediately returns if the input is too short', () => {
      const cases = [
        {
          input: '12',
          pattern: '..-..',
          result: '12',
        },
        {
          input: '123',
          pattern: '..-..',
          result: '123',
        },
        {
          input: '1234',
          pattern: '..-..',
          result: '12-34',
        },
      ];
      cases.forEach(({ input, pattern, result }) => {
        expect(formatPhoneNumber(input, pattern)).toBe(result);
      });
    });

    it('formats a number according to pattern', () => {
      const cases = [
        {
          pattern: '....',
          result: '1234',
        },
        {
          pattern: '. ()-(..)-() .',
          result: '1 ()-(23)-() 4',
        },
      ];
      cases.forEach(({ pattern, result }) => {
        expect(formatPhoneNumber('1234', pattern)).toBe(result);
      });
    });
  });

  describe('getCountryIsoFromFormattedNumber(formattedNumber)', () => {
    it('handles edge cases', () => {
      const res = getCountryIsoFromFormattedNumber(undefined as any);
      expect(res).toBe('us');
    });

    it('fallbacks to us for very short (potentially wrong) numbers', () => {
      const res = getCountryIsoFromFormattedNumber('123');
      expect(res).toBe('us');
    });

    it('handles a US phone starting with 1 with a known US subarea following', () => {
      const res = getCountryIsoFromFormattedNumber('+1 (202) 123 1234');
      expect(res).toBe('us');
    });

    it('handles a CA phone starting with 1 with a known CA subarea following', () => {
      const res = getCountryIsoFromFormattedNumber('+1 613-555-0150');
      expect(res).toBe('ca');
    });

    it('prioritizes US for a non-US phone starting with 1 that has a potential non-US code', () => {
      const res = getCountryIsoFromFormattedNumber('+1242 123123');
      expect(res).toBe('us');
    });

    it('handles a non-US phone starting with code != 1', () => {
      const res = getCountryIsoFromFormattedNumber('+30 6999999999');
      expect(res).toBe('gr');
    });

    it('handles a non-US phone without a format pattern', () => {
      expect(getCountryIsoFromFormattedNumber('+71111111111')).toBe('ru');
    });
  });

  describe('getLongestValidCountryCode(value)', () => {
    it('finds valid country and returns phone number value without country code', () => {
      const res = getCountryFromPhoneString('+12064563059');
      expect(res.number).toBe('2064563059');
      expect(res.country).not.toBe(undefined);
      expect(res.country.code).toBe('1');
    });

    it('finds valid country by applying priority', () => {
      const res = getCountryFromPhoneString('+1242123123');
      expect(res.number).toBe('242123123');
      expect(res.country).not.toBe(undefined);
      expect(res.country.code).toBe('1');
    });

    it('falls back to US if a valid country code is not found', () => {
      const res = getCountryFromPhoneString('+699090909090');
      expect(res.number).toBe('99090909090');
      expect(res.country.iso).toBe('us');
    });
  });

  describe('getPreferredPhoneCodeChannelByCountry', () => {
    it('returns null when preferredChannels is undefined', () => {
      const res = getPreferredPhoneCodeChannelByCountry('+12064563059', undefined as any);
      expect(res).toBe(null);
    });

    it('returns null when preferredChannels is empty', () => {
      const res = getPreferredPhoneCodeChannelByCountry('+12064563059', {});
      expect(res).toBe(null);
    });

    it('returns the preferred channel for a US number', () => {
      const preferredChannels = {
        US: 'sms' as PhoneCodeChannel,
        GB: 'whatsapp' as PhoneCodeChannel,
      };
      const res = getPreferredPhoneCodeChannelByCountry('+12064563059', preferredChannels);
      expect(res).toBe('sms');
    });

    it('returns the preferred channel for a non-US number', () => {
      const preferredChannels = {
        US: 'sms' as PhoneCodeChannel,
        GB: 'whatsapp' as PhoneCodeChannel,
      };
      const res = getPreferredPhoneCodeChannelByCountry('+447911123456', preferredChannels);
      expect(res).toBe('whatsapp');
    });

    it('returns null when no preferred channel exists for the country', () => {
      const preferredChannels = {
        US: 'sms' as PhoneCodeChannel,
        GB: 'whatsapp' as PhoneCodeChannel,
      };
      const res = getPreferredPhoneCodeChannelByCountry('+306999999999', preferredChannels);
      expect(res).toBe(null);
    });
  });
});
