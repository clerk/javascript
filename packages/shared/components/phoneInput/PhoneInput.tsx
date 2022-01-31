import React, { useState } from 'react';
// @ts-ignore
import styles from './PhoneInput.module.scss';
import { Input, InputProps } from '../input';
import { Dropdown, DropdownOption, DropdownSelection } from '../dropdown';
import { CountryEntry, IsoToCountryMap } from './countryCodeData';
import { useLocalStorage } from '../../hooks';
import {
  extractDigits,
  formatPhoneNumber,
  getFlagEmojiFromCountryIso,
} from './utils';
import { DropdownComparator } from '../dropdown/types';

export type PhoneInputProps = InputProps & {
  handlePhoneChange: (phoneWithCode: string) => any;
  className?: string;
  hasError?: boolean;
  style?: Record<string, unknown>;
};

// TODO: use clerk flag assets once we can bundle them
const createCountryOptionLabel = ({ name, iso, code }: CountryEntry) => {
  return (
    <div className={styles.optionContainer}>
      {/*<div className={cn(styles.flag, flags.icon, flags[iso])} />*/}
      <div className={styles.flag}>{getFlagEmojiFromCountryIso(iso)}</div>
      <div className={styles.country}>{name}</div>
      <div className={styles.code}>+{code}</div>
    </div>
  );
};

const createDropdownOption = (country: CountryEntry): DropdownOption => ({
  value: country.iso,
  label: createCountryOptionLabel(country),
  nativeOption: createNativeSelectOption(country),
});

const createNativeSelectOption = ({ iso, name, code }: CountryEntry) => (
  <option value={iso} key={iso}>
    {getFlagEmojiFromCountryIso(iso)} {name} (+{code})
  </option>
);

const dropdownOptions = [...IsoToCountryMap.values()].map(createDropdownOption);

const countryDropdownComparator: DropdownComparator = (
  term,
  option: DropdownOption,
) => {
  let searchVal: string;
  if (typeof option !== 'string') {
    const country = IsoToCountryMap.get(option.value);
    const countryName = country ? country.name : '';
    const countryCode = country ? country.code : '';
    searchVal = `${option.value} ${countryName} ${countryCode}`;
  } else {
    searchVal = option;
  }
  return (searchVal || '').toLowerCase().includes((term || '').toLowerCase());
};

export function PhoneInput({
  handlePhoneChange,
  hasError,
  autoFocus = true,
  ...rest
}: PhoneInputProps): JSX.Element {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [selectedIso, setSelectedIso] = useLocalStorage<string>(
    'selectedCountryIso',
    'us',
  );
  const [phoneNumber, setPhoneNumber] = useState('');

  const focusInput = () => {
    inputRef.current?.focus();
  };

  React.useEffect(() => {
    const dialCode = IsoToCountryMap.get(selectedIso)?.code || '1';
    handlePhoneChange('+' + extractDigits(`${dialCode}${phoneNumber}`));
  }, [handlePhoneChange, selectedIso, phoneNumber]);

  React.useEffect(() => {
    formatAndSetPhoneNumber(phoneNumber);
  }, [phoneNumber, selectedIso]);

  const formatAndSetPhoneNumber = (newPhoneNumber: string) => {
    const country = IsoToCountryMap.get(selectedIso);
    const pattern = country?.pattern;
    const code = country?.code;
    setPhoneNumber(formatPhoneNumber(newPhoneNumber, pattern, code));
  };

  const handlePhoneValueChange = (el: HTMLInputElement) => {
    formatAndSetPhoneNumber(el.value);
  };

  const handleCountrySelection = ({
    value,
  }: DropdownSelection | { value: string }) => {
    setSelectedIso(value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.dropdownContainer}>
        <Dropdown
          name='country-code-picker'
          active={false}
          className={styles.dropdown}
          options={dropdownOptions}
          selectedOption={selectedIso}
          selectedOptionClassname={styles.selectedOption}
          handleChange={handleCountrySelection}
          handleDropdownClosed={focusInput}
          searchable
          customComparator={countryDropdownComparator}
        />
      </div>
      <Input
        ref={inputRef}
        value={phoneNumber}
        handleChange={handlePhoneValueChange}
        type='tel'
        maxLength={25}
        hasError={!!hasError}
        autoFocus={autoFocus}
        {...rest}
      />
    </div>
  );
}
