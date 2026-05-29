import React from 'react';

import { extractDigits, formatPhoneNumber, parsePhoneString } from '@/ui/utils/phoneUtils';

import type { CountryIso } from './countryCodeData';
import { getIsoToCountryMap } from './countryCodeDataLoader';

type UseFormattedPhoneNumberProps = { initPhoneWithCode: string; locationBasedCountryIso?: CountryIso };

const format = (str: string, iso: CountryIso) => {
  if (!str) {
    return '';
  }
  const country = getIsoToCountryMap()?.get(iso);
  return formatPhoneNumber(str, country?.pattern, country?.code);
};

export const useFormattedPhoneNumber = (props: UseFormattedPhoneNumberProps) => {
  const [number, setNumber] = React.useState(() => {
    const { number } = parsePhoneString(props.initPhoneWithCode || '');
    return number;
  });

  const [iso, setIso] = React.useState(
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
    const dialCode = getIsoToCountryMap()?.get(iso)?.code || '1';
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
