import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { loadCountryCodeData } from '../countryCodeDataLoader';
import { useFormattedPhoneNumber } from '../useFormattedPhoneNumber';

beforeAll(async () => {
  await loadCountryCodeData();
});

describe('useFormattedPhoneNumber', () => {
  afterEach(() => {
    // Empty the localStorage used within the hook
    window.localStorage.clear();
  });

  it('should parse and split the init phone value', () => {
    const { result } = renderHook(() =>
      useFormattedPhoneNumber({
        initPhoneWithCode: '+71111111111',
        locationBasedCountryIso: undefined,
      }),
    );

    const { number, iso, formattedNumber, numberWithCode } = result.current;
    expect(number).toBe('1111111111');
    expect(iso).toBe('ru');
    expect(numberWithCode).toBe('+71111111111');
    expect(formattedNumber).toBe('111 111-11-11');
  });

  it('should return the correct iso for the number even if location based iso is wrong', () => {
    const { result } = renderHook(() =>
      useFormattedPhoneNumber({
        initPhoneWithCode: '+1 (202) 123 1234',
        locationBasedCountryIso: 'gr',
      }),
    );

    const { number, iso, formattedNumber, numberWithCode } = result.current;
    expect(number).toBe('2021231234');
    expect(iso).toBe('us');
    expect(numberWithCode).toBe('+12021231234');
    expect(formattedNumber).toBe('(202) 123-1234');
  });

  it('should correctly handle initialing with an empty value', async () => {
    const { result } = renderHook(() =>
      useFormattedPhoneNumber({
        initPhoneWithCode: '',
        locationBasedCountryIso: undefined,
      }),
    );

    const { number, iso, formattedNumber, numberWithCode } = result.current;

    await waitFor(() => {
      expect(number).toBe('');
      expect(iso).toBe('us');
      expect(numberWithCode).toBe('');
      expect(formattedNumber).toBe('');
    });
  });

  it('should return the correct number and iso when pasting a number containing a country code', async () => {
    const { result, rerender, unmount } = renderHook(() =>
      useFormattedPhoneNumber({
        initPhoneWithCode: '+71111111111',
        locationBasedCountryIso: undefined,
      }),
    );

    expect(result.current.numberWithCode).toBe('+71111111111');
    expect(result.current.iso).toBe('ru');

    // change number, keep iso
    await waitFor(() => {
      result.current.setNumberAndIso('+1 (202) 123 1234');
      rerender();
    });

    expect(result.current.number).toBe('2021231234');
    expect(result.current.iso).toBe('us');
    expect(result.current.numberWithCode).toBe('+12021231234');
    expect(result.current.formattedNumber).toBe('(202) 123-1234');
    unmount();
  });

  it('should return the correct iso for the number even if location based iso is wrong', async () => {
    const { result, rerender, unmount } = renderHook(() =>
      useFormattedPhoneNumber({
        initPhoneWithCode: '',
        locationBasedCountryIso: 'gr',
      }),
    );

    expect(result.current.number).toBe('');
    expect(result.current.iso).toBe('gr');
    expect(result.current.numberWithCode).toBe('');
    expect(result.current.formattedNumber).toBe('');

    // change number, keep iso
    await waitFor(() => {
      result.current.setNumber('6949595959');
      rerender();
    });

    expect(result.current.number).toBe('6949595959');
    expect(result.current.iso).toBe('gr');
    expect(result.current.numberWithCode).toBe('+306949595959');
    expect(result.current.formattedNumber).toBe('694 9595959');

    // change iso, keep number
    await waitFor(() => {
      result.current.setIso('us');
      rerender();
    });

    expect(result.current.number).toBe('6949595959');
    expect(result.current.iso).toBe('us');
    expect(result.current.numberWithCode).toBe('+16949595959');
    expect(result.current.formattedNumber).toBe('(694) 959-5959');

    unmount();
  });
});
