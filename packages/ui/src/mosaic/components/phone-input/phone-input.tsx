'use client';

import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { CountryEntry, CountryIso } from '../../../elements/PhoneInput/countryCodeData';
import { IsoToCountryMap } from '../../../elements/PhoneInput/countryCodeData';
import {
  extractDigits,
  formatPhoneNumber,
  getFlagEmojiFromCountryIso,
  parsePhoneString,
} from '../../../utils/phoneUtils';
import type { MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { Combobox } from '../combobox';
import { Field } from '../field';
import { useOptionalFieldContext } from '../field/field.context';
import { Icon } from '../icon';
import { Input } from '../input';
import { InputGroup } from '../input-group';
import { Popover } from '../popover';
import { styles } from './phone-input.styles';

const countryOptions = [...IsoToCountryMap.values()];

function getCountry(iso: CountryIso | undefined): CountryEntry {
  const country = iso ? IsoToCountryMap.get(iso) : undefined;
  const fallback = IsoToCountryMap.get('us') ?? countryOptions[0];
  if (!fallback) {
    throw new Error('PhoneInput requires at least one country');
  }
  return country ?? fallback;
}

function getInitialCountry(value: string | undefined, defaultCountry: CountryIso | undefined): CountryIso {
  return value ? parsePhoneString(value).iso : getCountry(defaultCountry).iso;
}

function getNationalNumber(value: string, country: CountryEntry): string {
  const digits = extractDigits(value);
  return digits.startsWith(country.code) ? digits.slice(country.code.length) : digits;
}

function toE164(country: CountryEntry, nationalNumber: string): string {
  const number = extractDigits(nationalNumber);
  return number ? `+${country.code}${number}` : '';
}

export interface PhoneInputProps extends Omit<
  MosaicElementProps<'input'>,
  'className' | 'style' | 'type' | 'size' | 'value' | 'defaultValue' | 'onChange'
> {
  /** The normalized E.164 value. */
  value?: string;
  /** The initial normalized E.164 value for an uncontrolled input. */
  defaultValue?: string;
  /** Called with the normalized E.164 value whenever the number or country changes. */
  onValueChange?: (value: string) => void;
  /** Controls the selected country independently when calling codes are ambiguous. */
  country?: CountryIso;
  /** Initial country when neither `country` nor a phone number selects one. @default 'us' */
  defaultCountry?: CountryIso;
  onCountryChange?: (country: CountryIso) => void;
  size?: 'sm' | 'md' | 'lg';
  countrySearchPlaceholder?: string;
  noResultsMessage?: string;
  /** Applied to the grouped root. */
  className?: string;
  /** Applied to the grouped root. */
  style?: React.CSSProperties;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(function MosaicPhoneInput(
  {
    value: valueProp,
    defaultValue = '',
    onValueChange,
    country: countryProp,
    defaultCountry,
    onCountryChange,
    size = 'md',
    countrySearchPlaceholder = 'Search country or code',
    noResultsMessage = 'No countries found',
    disabled: disabledProp,
    required: requiredProp,
    id,
    name,
    form,
    autoComplete = 'tel-national',
    inputMode = 'tel',
    maxLength = 25,
    spellCheck = false,
    className,
    style,
    'aria-invalid': ariaInvalidProp,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...inputProps
  },
  forwardedRef,
) {
  const field = useOptionalFieldContext();
  const disabled = disabledProp ?? field?.disabled ?? false;
  const ariaInvalid = ariaInvalidProp ?? (field?.invalid ? true : undefined);
  const invalid = ariaInvalid === true || ariaInvalid === 'true';
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const value = valueProp ?? uncontrolledValue;
  const [uncontrolledCountry, setUncontrolledCountry] = React.useState<CountryIso>(() =>
    getInitialCountry(valueProp ?? defaultValue, defaultCountry),
  );
  const country = getCountry(countryProp ?? uncontrolledCountry);
  const nationalNumber = getNationalNumber(value, country);
  const formattedNumber = formatPhoneNumber(nationalNumber, country.pattern, country.code);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const setInputRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef],
  );

  React.useEffect(() => {
    if (countryProp === undefined && valueProp) {
      setUncontrolledCountry(parsePhoneString(valueProp).iso);
    }
  }, [countryProp, valueProp]);

  React.useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  const filteredCountries = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return countryOptions;
    }
    return countryOptions.filter(option =>
      `${option.name} ${option.iso} +${option.code}`.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  const setValue = React.useCallback(
    (nextValue: string) => {
      if (valueProp === undefined) {
        setUncontrolledValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [onValueChange, valueProp],
  );

  const setCountry = React.useCallback(
    (nextCountry: CountryEntry) => {
      if (countryProp === undefined) {
        setUncontrolledCountry(nextCountry.iso);
      }
      onCountryChange?.(nextCountry.iso);
      setValue(toE164(nextCountry, nationalNumber));
      setOpen(false);
      inputRef.current?.focus();
    },
    [countryProp, nationalNumber, onCountryChange, setValue],
  );

  const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    if (nextValue.includes('+')) {
      const parsed = parsePhoneString(nextValue);
      const parsedCountry = getCountry(parsed.iso);
      if (countryProp === undefined) {
        setUncontrolledCountry(parsedCountry.iso);
      }
      onCountryChange?.(parsedCountry.iso);
      setValue(toE164(parsedCountry, parsed.number));
      return;
    }
    setValue(toE164(country, nextValue));
  };

  return (
    <>
      <InputGroup.Root
        size={size}
        disabled={disabled}
        invalid={invalid}
        {...mergeStyleProps(themeProps('phone-input', { size, disabled, invalid }), className, style)}
      >
        <Popover.Root
          open={open}
          onOpenChange={setOpen}
          placement='bottom-start'
        >
          <Popover.Trigger
            render={
              <InputGroup.Action
                size='xs'
                {...mergeStyleProps(themeProps('phone-input-country-trigger'), stylex.props(styles.trigger))}
              />
            }
            type='button'
            disabled={disabled}
            aria-label={`Country, ${country.name}`}
          >
            <span {...stylex.props(reset.base, styles.triggerContent)}>
              <span
                aria-hidden='true'
                {...mergeStyleProps(themeProps('phone-input-flag'), stylex.props(reset.base, styles.flag))}
              >
                {getFlagEmojiFromCountryIso(country.iso)}
              </span>
              <Icon
                name='chevron-down'
                size='sm'
                aria-hidden='true'
              />
            </span>
          </Popover.Trigger>
          <Popover.Popup
            aria-label='Choose a country'
            size='sm'
            {...mergeStyleProps(themeProps('phone-input-popup'), stylex.props(reset.base, styles.popup))}
          >
            <Combobox.Root
              open
              inputValue={query}
              onInputValueChange={setQuery}
              value={country.iso}
              onValueChange={iso => {
                const nextCountry = countryOptions.find(option => option.iso === iso);
                if (nextCountry) {
                  setCountry(nextCountry);
                }
              }}
            >
              <Field.Root>
                <InputGroup.Root
                  size='md'
                  {...mergeStyleProps(themeProps('phone-input-country-search'), stylex.props(styles.countrySearch))}
                >
                  <InputGroup.Text>
                    <Icon
                      name='search'
                      size='sm'
                      aria-hidden='true'
                    />
                  </InputGroup.Text>
                  <Combobox.Input
                    variant='headless'
                    aria-label='Search countries'
                    placeholder={countrySearchPlaceholder}
                    spellCheck={false}
                  />
                </InputGroup.Root>
              </Field.Root>
              <Combobox.List {...themeProps('phone-input-country-list')}>
                {filteredCountries.length > 0 ? (
                  filteredCountries.map(option => (
                    <Combobox.Option
                      key={option.iso}
                      value={option.iso}
                      label={option.name}
                      {...themeProps('phone-input-country-option')}
                    >
                      <span
                        aria-hidden='true'
                        {...stylex.props(reset.base, styles.flag)}
                      >
                        {getFlagEmojiFromCountryIso(option.iso)}
                      </span>
                      <span {...stylex.props(reset.base, styles.optionName)}>{option.name}</span>
                      <span {...stylex.props(reset.base, styles.optionCode)}>+{option.code}</span>
                      <Icon
                        name='check'
                        size='sm'
                        aria-hidden='true'
                        {...(option.iso === country.iso ? {} : stylex.props(styles.checkHidden))}
                      />
                    </Combobox.Option>
                  ))
                ) : (
                  <Combobox.Empty>{noResultsMessage}</Combobox.Empty>
                )}
              </Combobox.List>
            </Combobox.Root>
          </Popover.Popup>
        </Popover.Root>

        <InputGroup.Text
          aria-hidden='true'
          {...mergeStyleProps(themeProps('phone-input-prefix'), stylex.props(styles.prefix))}
        >
          <span
            aria-hidden='true'
            {...mergeStyleProps(themeProps('phone-input-divider'), stylex.props(reset.base, styles.divider))}
          />
          +{country.code}
        </InputGroup.Text>
        <Input
          ref={setInputRef}
          variant='headless'
          {...mergeStyleProps(themeProps('phone-input-control'), stylex.props(styles.control))}
          {...inputProps}
          id={id}
          type='tel'
          value={formattedNumber}
          disabled={disabledProp}
          required={requiredProp}
          form={form}
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={maxLength}
          spellCheck={spellCheck}
          aria-invalid={ariaInvalidProp}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          onChange={handleNumberChange}
        />
      </InputGroup.Root>
      {name ? (
        <input
          type='hidden'
          name={name}
          form={form}
          value={value}
          disabled={disabled}
        />
      ) : null}
    </>
  );
});
