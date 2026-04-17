import { useClerk } from '@clerk/shared/react';
import React, { forwardRef, useEffect, useMemo, useRef } from 'react';

import { mergeRefs } from '@/ui/utils/mergeRefs';
import type { FeedbackType } from '@/ui/utils/useFormControl';

import { descriptors, Flex, Input, Text } from '../../customizables';
import { ChevronUpDown } from '../../icons';
import { common, type PropsOfComponent } from '../../styledSystem';
import { Select, SelectButton, SelectOption, SelectOptionList } from '../Select';
import type { CountryEntry, CountryIso } from './countryCodeData';
import { IsoToCountryMap } from './countryCodeData';
import { useFormattedPhoneNumber } from './useFormattedPhoneNumber';

const createSelectOption = (country: CountryEntry) => {
  return {
    searchTerm: `${country.iso} ${country.name} ${country.code}`,
    value: `${country.iso} ${country.name} ${country.code}`,
    country,
    // nativeOption: createNativeSelectOption(country),
  };
};

const countryOptions = [...IsoToCountryMap.values()].map(createSelectOption);

type PhoneInputProps = PropsOfComponent<typeof Input> & { locationBasedCountryIso?: CountryIso };

const PhoneInputBase = forwardRef<HTMLInputElement, PhoneInputProps & { feedbackType?: FeedbackType }>((props, ref) => {
  const { onChange: onChangeProp, value, locationBasedCountryIso, feedbackType, sx, ...rest } = props;
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const phoneInputBox = useRef<HTMLDivElement>(null);
  const { setNumber, setIso, setNumberAndIso, numberWithCode, iso, formattedNumber } = useFormattedPhoneNumber({
    initPhoneWithCode: value as string,
    locationBasedCountryIso,
  });

  const callOnChangeProp = () => {
    // Quick and dirty way to match this component's public API
    // with every other Input component, so we can use the same helpers
    // without worrying about the underlying implementation details
    onChangeProp?.({ target: { value: numberWithCode } } as any);
  };

  const selectedCountryOption = useMemo(() => {
    return countryOptions.find(o => o.country.iso === iso) || countryOptions[0];
  }, [iso]);

  useEffect(callOnChangeProp, [numberWithCode]);

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const inputValue = e.clipboardData.getData('text');
    if (inputValue.includes('+')) {
      setNumberAndIso(inputValue);
    } else {
      setNumber(inputValue);
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue.includes('+')) {
      setNumberAndIso(inputValue);
    } else {
      setNumber(inputValue);
    }
  };

  return (
    <Flex
      elementDescriptor={descriptors.phoneInputBox}
      direction='row'
      hasError={rest.hasError}
      data-feedback={feedbackType}
      ref={phoneInputBox}
      sx={theme => ({
        ...common.borderVariants(theme, { hasError: rest.hasError }).normal,
        position: 'relative',
        borderRadius: theme.radii.$md,
        zIndex: 1,
        '&:focus-within,&[data-focus-within="true"]': {
          ...common.borderVariants(theme, { hasError: rest.hasError }).normal['&:focus'],
        },
      })}
    >
      <Select
        elementId='countryCode'
        value={selectedCountryOption.value}
        options={countryOptions}
        portal
        referenceElement={phoneInputBox}
        renderOption={(option, _index, isSelected) => (
          <SelectOption isSelected={isSelected}>
            <SelectOption.Label>{option.country.name}</SelectOption.Label>
            <SelectOption.Detail>+{option.country.code}</SelectOption.Detail>
          </SelectOption>
        )}
        onChange={option => {
          setIso(option.country.iso);
          phoneInputRef.current?.focus();
        }}
        noResultsMessage='No countries found'
        searchPlaceholder='Search country or code'
        comparator={(term, option) => option.searchTerm.toLowerCase().includes(term.toLowerCase())}
      >
        <SelectButton
          variant='ghost'
          sx={t => ({
            borderWidth: '0',
            borderRadius: t.radii.$md, // needs to be specified as we can't use overflow: hidden on the parent, hides the popover
            borderEndEndRadius: '0',
            borderStartEndRadius: '0',
            paddingInlineEnd: t.space.$2,
            ':focus': {
              zIndex: 2,
              boxShadow: 'none',
            },
            ':active': {
              zIndex: 2,
            },
          })}
          hoverAsFocus
          isDisabled={rest.isDisabled}
          icon={ChevronUpDown}
          iconSx={t => ({
            color: rest.isDisabled ? t.colors.$neutralAlpha300 : t.colors.$neutralAlpha500,
          })}
        >
          <Text
            colorScheme='body'
            as='span'
            sx={{
              textTransform: 'uppercase',
            }}
          >
            {iso}
          </Text>
        </SelectButton>
        <SelectOptionList />
      </Select>

      <Flex
        sx={{
          position: 'relative',
          width: '100%',
        }}
      >
        <Text
          sx={t => ({
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
            paddingInlineStart: t.space.$0x5,
            opacity: props.isDisabled ? t.opacity.$disabled : 1,
          })}
        >
          +{selectedCountryOption.country.code}
        </Text>
        <Input
          value={formattedNumber}
          variant='unstyled'
          onPaste={handlePaste}
          onChange={handlePhoneNumberChange}
          maxLength={25}
          type='tel'
          sx={[
            t => ({
              boxShadow: 'none',
              height: '100%',
              transitionProperty: t.transitionProperty.$common,
              transitionTimingFunction: t.transitionTiming.$common,
              transitionDuration: t.transitionDuration.$focusRing,
              // This ensures that this input will never have any border or boxShadow styles.
              '&[type=tel]': {
                borderRadius: t.radii.$md,
                borderWidth: 0,
                borderStartStartRadius: 0,
                borderEndStartRadius: 0,
                paddingInlineStart: t.space.$1,
                '&:focus': {
                  borderColor: 'unset',
                  boxShadow: 'unset',
                },
              },
            }),
            sx,
          ]}
          //use our internal ref while forwarding
          //@ts-expect-error
          ref={mergeRefs(phoneInputRef, ref)}
          {...rest}
        />
      </Flex>
    </Flex>
  );
});

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps & { feedbackType?: FeedbackType }>(
  (props, ref) => {
    const { __internal_country } = useClerk();

    return (
      <PhoneInputBase
        {...props}
        locationBasedCountryIso={__internal_country as CountryIso}
        ref={ref}
      />
    );
  },
);
