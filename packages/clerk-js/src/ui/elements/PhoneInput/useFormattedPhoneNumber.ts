import React from 'react';

import { useLocalStorage } from '../../hooks';
import { extractDigits, formatPhoneNumber } from '../../utils';
import type { CountryIso } from './countryCodeData';
import { IsoToCountryMap } from './countryCodeData';

type UseFormattedPhoneNumberProps = { defaultPhone?: string; defaultSelectedIso?: CountryIso };

const format = (str: string, iso: CountryIso) => {
  if (!str) {
    return '';
  }
  const country = IsoToCountryMap.get(iso);
  return formatPhoneNumber(str, country?.pattern, country?.code);
};

export const useFormattedPhoneNumber = (props: UseFormattedPhoneNumberProps = {}) => {
  const [selectedIso, setSelectedIso] = useLocalStorage<CountryIso>(
    'selectedCountryIso',
    props.defaultSelectedIso || 'us',
  );
  const [phoneNum, setPhoneNum] = React.useState(() => format(props.defaultPhone || '', selectedIso));

  React.useEffect(() => {
    setPhoneNumber(phoneNum);
  }, [selectedIso, phoneNum]);

  const cleanPhoneNumber = React.useMemo(() => {
    if (!phoneNum) {
      return '';
    }
    const dialCode = IsoToCountryMap.get(selectedIso)?.code || '1';
    return '+' + extractDigits(`${dialCode}${phoneNum}`);
  }, [selectedIso, phoneNum]);

  const setPhoneNumber = React.useCallback(
    (str: string, iso?: CountryIso) => {
      setPhoneNum(format(str, iso || selectedIso));
    },
    [selectedIso, phoneNum],
  );

  return { selectedIso, setSelectedIso, setPhoneNumber, cleanPhoneNumber, formattedPhoneNumber: phoneNum };
};
