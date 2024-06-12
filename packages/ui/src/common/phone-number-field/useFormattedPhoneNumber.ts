import * as React from 'react';

import { type CountryIso, IsoToCountryMap } from './data';
import { extractDigits, formatPhoneNumber, parsePhoneString } from './utils';

type UseFormattedPhoneNumberProps = {
  initPhoneWithCode: string;
  locationBasedCountryIso?: CountryIso;
};

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
    const dialCode = IsoToCountryMap.get(iso)?.code || '1';
    return '+' + extractDigits(`${dialCode}${number}`);
  }, [iso, number]);

  const formattedNumber = React.useMemo(() => {
    return format(number, iso);
  }, [iso, number]);

  const setNumberAndIso = React.useCallback((str: string) => {
    const { iso, number } = parsePhoneString(str);
    setNumber(number);
    setIso(iso);
  }, []);

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
