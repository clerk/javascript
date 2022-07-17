import React from 'react';

import { Button, Flex, Icon, Input, Text } from '../../customizables';
import { usePopover, useSearchInput } from '../../hooks';
import { Caret } from '../../icons';
import { PropsOfComponent } from '../../styledSystem';
import { getFlagEmojiFromCountryIso } from '../../utils';
import { CountryEntry, CountryIso, IsoToCountryMap } from './countryCodeData';
import { DropdownBox, DropdownItemContainer, DropdownSearchbar } from './Dropdown';
import { useFormattedPhoneNumber } from './useFormattedPhoneNumber';

const createDropdownOption = (country: CountryEntry) => {
  return {
    searchTerm: `${country.iso} ${country.name} ${country.code}`,
    country,
    // nativeOption: createNativeSelectOption(country),
  };
};

const countryOptions = [...IsoToCountryMap.values()].map(createDropdownOption);

type PhoneInputProps = PropsOfComponent<typeof Input>;

export const PhoneInput = (props: PhoneInputProps) => {
  const { onChange: onChangeProp, value, ...rest } = props;
  const phoneInputRef = React.useRef<HTMLInputElement>(null);
  const selectedItemRef = React.useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const { floating, reference, styles, toggle: togglePopover, isOpen } = usePopover({ autoUpdate: false });
  const { selectedIso, setPhoneNumber, cleanPhoneNumber, formattedPhoneNumber, setSelectedIso } =
    useFormattedPhoneNumber({ defaultPhone: value as string });
  const { filteredItems, searchInputProps } = useSearchInput({
    items: countryOptions,
    comparator: (term, item) => item.searchTerm.toLowerCase().includes(term.toLowerCase()),
  });

  const scrollToItemOnSelectedIndexChange = () => {
    if (!isOpen) {
      setSelectedIndex(0);
      return;
    }
    selectedItemRef.current?.scrollIntoView({ block: 'nearest' });
  };

  const callOnChangeProp = () => {
    // Quick and dirty way to match this component's public API
    // with every other Input component, so we can use the same helpers
    // without worrying about the underlying implementation details
    onChangeProp?.({ target: { value: cleanPhoneNumber } } as any);
  };

  React.useEffect(callOnChangeProp, [cleanPhoneNumber]);
  React.useEffect(scrollToItemOnSelectedIndexChange, [selectedIndex, isOpen]);

  const selectIso = React.useCallback(
    (iso: CountryIso) => {
      setSelectedIso(iso);
      togglePopover();
      phoneInputRef.current?.focus();
    },
    [togglePopover, setSelectedIso],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        return setSelectedIndex((i = 0) => Math.max(i - 1, 0));
      }
      return togglePopover();
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (isOpen) {
        return setSelectedIndex((i = 0) => Math.min(i + 1, filteredItems.length - 1));
      }
      return togglePopover();
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      return selectIso(filteredItems[selectedIndex].country.iso);
    }
  };

  return (
    <Flex
      direction='col'
      justify='center'
      sx={theme => ({ position: 'relative', borderRadius: theme.radii.$md })}
    >
      <DropdownTrigger
        selectedIso={selectedIso}
        ref={reference}
        isOpen={isOpen}
        onClick={togglePopover}
        isDisabled={rest.isDisabled}
      />
      <Input
        value={formattedPhoneNumber}
        onChange={el => setPhoneNumber(el.target.value)}
        maxLength={25}
        type='tel'
        sx={theme => ({ paddingLeft: theme.space.$20 })}
        {...rest}
        ref={phoneInputRef}
      />
      <DropdownBox
        isOpen={isOpen}
        ref={floating}
        style={{ ...styles, left: styles.left - 1 }}
        onKeyDown={onKeyDown}
      >
        <DropdownSearchbar
          placeholder='Search country or code'
          {...searchInputProps}
        />
        <DropdownItemContainer>
          {filteredItems.map((item, i) => (
            <CountryCodeListItem
              key={i}
              country={item.country}
              selectIso={selectIso}
              isSelected={i === selectedIndex}
              innerRef={i === selectedIndex ? selectedItemRef : undefined}
            />
          ))}
          {filteredItems.length === 0 && <NoResults />}
        </DropdownItemContainer>
      </DropdownBox>
    </Flex>
  );
};

const DropdownTrigger = React.forwardRef<
  HTMLButtonElement,
  PropsOfComponent<typeof Button> & { selectedIso: CountryIso; isOpen: boolean }
>((props, ref) => {
  return (
    <Button
      ref={ref}
      onClick={props.onClick}
      colorScheme='neutral'
      variant='ghost'
      textVariant='smallMedium'
      focusRing={false}
      isDisabled={props.isDisabled}
      sx={theme => ({
        paddingLeft: theme.space.$3x5,
        paddingRight: theme.space.$3x5,
        backgroundColor: theme.colors.$blackAlpha50,
        position: 'absolute',
        height: 'calc(100% - 2px)',
        marginLeft: '1px',
        width: theme.space.$16,
        borderRadius: theme.radii.$md,
        borderBottomRightRadius: '0',
        borderTopRightRadius: '0',
      })}
    >
      <Flag iso={props.selectedIso} />
      <Icon
        icon={Caret}
        sx={theme => ({
          width: theme.sizes.$3x5,
          marginLeft: theme.space.$1,
          transitionProperty: theme.transitionProperty.$common,
          transitionDuration: theme.transitionDuration.$controls,
          transform: `rotate(${props.isOpen ? '180' : '0'}deg)`,
        })}
      />
    </Button>
  );
});

type CountryCodeListItem = React.PropsWithChildren<{
  country: CountryEntry;
  selectIso: (iso: CountryIso) => void;
  isSelected: boolean;
  innerRef: any;
}>;

const NoResults = () => {
  return (
    <Text
      as='div'
      variant='smallRegular'
      sx={theme => ({ width: '100%', padding: `${theme.space.$2} 0 0 ${theme.space.$4}` })}
    >
      No countries found
    </Text>
  );
};

const CountryCodeListItem = React.memo((props: CountryCodeListItem) => {
  const { country, selectIso, isSelected, innerRef, ...rest } = props;
  return (
    <Flex
      ref={innerRef}
      onClick={() => selectIso(country.iso)}
      center
      sx={theme => ({
        userSelect: 'none',
        gap: theme.space.$2,
        padding: `${theme.space.$0x5} ${theme.space.$4}`,
        ...(isSelected && { backgroundColor: theme.colors.$blackAlpha200 }),
        '&:hover': {
          backgroundColor: theme.colors.$blackAlpha200,
        },
      })}
    >
      <Flag iso={country.iso} />
      <Text
        as='div'
        variant='smallRegular'
        {...rest}
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
  return <Flex sx={theme => ({ fontSize: theme.fontSizes.$md })}>{getFlagEmojiFromCountryIso(props.iso)}</Flex>;
};
