import React from 'react';

import { useLocalStorage } from '../../hooks';
import { extractDigits, formatPhoneNumber, parsePhoneString } from '../../utils';
import type { CountryIso } from './countryCodeData';
import { IsoToCountryMap } from './countryCodeData';

type UseFormattedPhoneNumberProps = { initPhoneWithCode: string; locationBasedCountryIso?: CountryIso };

const format = (str: string, iso: CountryIso) => {
  if (!str) {
    return '';
  }
  const country = IsoToCountryMap.get(iso);
  return formatPhoneNumber(str, country?.pattern, country?.code);
};

export const useFormattedPhoneNumber = (props: UseFormattedPhoneNumberProps) => {
  const [number, setNumber] = React.useState(() => {
    const { number } = parsePhoneString(props.initPhoneWithCode || '');
    return number;
  });

  // Initialise local storage with the iso we get from the headers
  // but respect and remember an iso explicitly set by the user (picker or paste)
  const [iso, setIso] = useLocalStorage<CountryIso>(
    'selectedCountryIso',
    parsePhoneString(props.initPhoneWithCode || '').number
      ? parsePhoneString(props.initPhoneWithCode || '').iso
      : props.locationBasedCountryIso || 'us',
  );

  React.useEffect(() => {
    setNumber(extractDigits(number));
  }, [iso, number]);

  const numberWithCode = React.useMemo(() => {
    if (!number) {
      return '';
    }
    const dialCode = IsoToCountryMap.get(iso)?.code || '1';
    return '+' + extractDigits(`${dialCode}${number}`);
  }, [iso, number]);

  const formattedNumber = React.useMemo(() => {
    return format(number, iso);
  }, [iso, number]);

  const setNumberAndIso = React.useCallback(
    (str: string) => {
      const { iso, number } = parsePhoneString(str);
      setNumber(number);
      setIso(iso);
    },
    [iso, number],
  );

  return {
    setNumber,
    setIso,
    setNumberAndIso,
    iso,
    number,
    numberWithCode,
    formattedNumber,
  };
};
