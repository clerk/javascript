import React from 'react';

import { useLocalStorage } from '../../hooks';
import { extractDigits, formatPhoneNumber } from '../../utils';
import { CountryIso, IsoToCountryMap } from './countryCodeData';

type UseFormattedPhoneNumberProps = { defaultPhone?: string };

const format = (str: string, iso: CountryIso) => {
  if (!str) {
    return '';
  }
  const country = IsoToCountryMap.get(iso);
  return formatPhoneNumber(str, country?.pattern, country?.code);
};

export const useFormattedPhoneNumber = (props: UseFormattedPhoneNumberProps = {}) => {
  const [selectedIso, setSelectedIso] = useLocalStorage<CountryIso>('selectedCountryIso', 'us');
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
    (str: string) => {
      setPhoneNum(format(str, selectedIso));
    },
    [selectedIso, phoneNum],
  );

  return { selectedIso, setSelectedIso, setPhoneNumber, cleanPhoneNumber, formattedPhoneNumber: phoneNum };
};
