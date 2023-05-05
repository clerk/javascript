import React, { forwardRef, useLayoutEffect, useState } from 'react';

import { useCoreClerk } from '../../contexts';
import { descriptors, Flex, Input, Text } from '../../customizables';
import { Select, SelectButton, SelectOptionList } from '../../elements';
import type { PropsOfComponent } from '../../styledSystem';
import { getFlagEmojiFromCountryIso, mergeRefs } from '../../utils';
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

const PhoneInputBase = forwardRef<HTMLInputElement, PhoneInputProps>((props, ref) => {
  const { onChange: onChangeProp, value, locationBasedCountryIso, sx, ...rest } = props;
  const phoneInputRef = React.useRef<HTMLInputElement>(null);
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

  const selectedCountryOption = React.useMemo(() => {
    return countryOptions.find(o => o.country.iso === iso) || countryOptions[0];
  }, [iso]);

  React.useEffect(callOnChangeProp, [numberWithCode]);

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
      center
      hasError={rest.hasError}
      sx={theme => ({
        position: 'relative',
        borderRadius: theme.radii.$md,
        zIndex: 1,
        border: theme.borders.$normal,
        borderColor: theme.colors.$blackAlpha300, // we use this value in the Input primitive
      })}
    >
      <Select
        elementId='countryCode'
        value={selectedCountryOption.value}
        options={countryOptions}
        optionBuilder={(option, _index, isFocused) => (
          <CountryCodeListItem
            sx={theme => ({
              ...(isFocused && { backgroundColor: theme.colors.$blackAlpha200 }),
              '&:hover': {
                backgroundColor: theme.colors.$blackAlpha200,
              },
            })}
            country={option.country}
          />
        )}
        onChange={option => {
          setIso(option.country.iso);
          phoneInputRef.current?.focus();
        }}
        noResultsMessage='No countries found'
        searchPlaceholder='Search country or code'
        comparator={(term, option) => option.searchTerm.toLowerCase().includes(term.toLowerCase())}
      >
        <Flex
          sx={{
            zIndex: 2,
          }}
        >
          <SelectButton
            sx={theme => ({
              backgroundColor: theme.colors.$blackAlpha50,
              border: 'none',
              borderBottomRightRadius: '0',
              borderTopRightRadius: '0',
            })}
          >
            <Flag iso={iso} />
            <Text
              variant={'smallRegular'}
              sx={{ paddingLeft: '4px' }}
            >
              +{selectedCountryOption.country.code}
            </Text>
          </SelectButton>
        </Flex>
        <SelectOptionList
          sx={{ width: '100%', padding: '0 0' }}
          containerSx={{ gap: 0 }}
        />
      </Select>
      <Input
        value={formattedNumber}
        onPaste={handlePaste}
        onChange={handlePhoneNumberChange}
        maxLength={25}
        type='tel'
        sx={[
          {
            borderColor: 'transparent',
            height: '100%',
            borderTopLeftRadius: '0',
            borderBottomLeftRadius: '0',
          },
          sx,
        ]}
        //use our internal ref while forwarding
        //@ts-expect-error
        ref={mergeRefs(phoneInputRef, ref)}
        {...rest}
      />
    </Flex>
  );
});

type CountryCodeListItemProps = PropsOfComponent<typeof Flex> & {
  country: CountryEntry;
};
const CountryCodeListItem = React.memo((props: CountryCodeListItemProps) => {
  const { country, sx, ...rest } = props;
  return (
    <Flex
      center
      sx={[
        theme => ({
          width: '100%',
          gap: theme.space.$2,
          padding: `${theme.space.$0x5} ${theme.space.$4}`,
        }),
        sx,
      ]}
      {...rest}
    >
      <Flag iso={country.iso} />
      <Text
        as='div'
        variant='smallRegular'
        sx={{ width: '100%' }}
      >
        {country.name}
      </Text>
      <Text
        variant='smallRegular'
        colorScheme='neutral'
      >
        +{country.code}
      </Text>
    </Flex>
  );
});

const Flag = (props: { iso: CountryIso }) => {
  const [supportsCountryEmoji, setSupportsCountryEmoji] = useState(false);

  useLayoutEffect(() => {
    setSupportsCountryEmoji(!window.navigator.userAgent.includes('Windows'));
  }, []);

  return (
    <>
      {supportsCountryEmoji ? (
        <Flex sx={theme => ({ fontSize: theme.fontSizes.$md })}>{getFlagEmojiFromCountryIso(props.iso)}</Flex>
      ) : (
        <Text variant='smallBold'>{props.iso.toUpperCase()}</Text>
      )}
    </>
  );
};

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>((props, ref) => {
  // @ts-expect-error
  const { __internal_country } = useCoreClerk();

  return (
    <PhoneInputBase
      {...props}
      locationBasedCountryIso={__internal_country as CountryIso}
      ref={ref}
    />
  );
});
