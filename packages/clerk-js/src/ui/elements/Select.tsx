import React, { isValidElement, PropsWithChildren, useState } from 'react';

import { usePopover, useSearchInput } from '../../ui/hooks';
import { Button, Flex, Icon, Text } from '../customizables';
import { Caret, MagnifyingGlass } from '../icons';
import { animations, PropsOfComponent } from '../styledSystem';
import { colors, createContextAndHook } from '../utils';
import { InputWithIcon } from './InputWithIcon';

type UsePopoverReturn = ReturnType<typeof usePopover>;
type UseSearchInputReturn = ReturnType<typeof useSearchInput>;

type OptionBuilder<O> = (option: O, index?: number, isSelected?: boolean) => JSX.Element;

type SelectProps<O> = {
  options: O[];
  value: O;
  onChange: (option: O) => void;
  placeholder?: string;
  comparator?: (term: string, option: O) => boolean;
  noResultsMessage?: string;
  optionBuilder?: OptionBuilder<O>;
};

type SelectState<O = any> = Pick<SelectProps<O>, 'placeholder' | 'comparator' | 'noResultsMessage'> & {
  popoverCtx: UsePopoverReturn;
  searchInputCtx: UseSearchInputReturn;
  optionBuilder: OptionBuilder<O>;
  selectedOption: O;
  select: (option: O) => void;
  selectedItemRef: React.RefObject<HTMLDivElement>;
  onTriggerClick: () => void;
};

const [SelectStateCtx, useSelectState] = createContextAndHook<SelectState>('SelectState');

const defaultOptionBuilder = <O,>(option: O, _index?: number, isSelected?: boolean) => {
  if (typeof option !== 'string' && typeof option !== 'number') {
    throw new Error('Provide an optionBuilder function');
  }

  return (
    <Flex
      sx={theme => ({
        width: '100%',
        paddingLeft: theme.space.$2,
        paddingRight: theme.space.$2,
        ...(isSelected && { backgroundColor: theme.colors.$blackAlpha200 }),
        '&:hover': {
          backgroundColor: theme.colors.$blackAlpha200,
        },
      })}
    >
      <Text>{option}</Text>
    </Flex>
  );
};

export const Select = <O,>(props: PropsWithChildren<SelectProps<O>>) => {
  const {
    value,
    options,
    onChange,
    optionBuilder = defaultOptionBuilder,
    noResultsMessage,
    comparator,
    placeholder,
    ...rest
  } = props;
  const popoverCtx = usePopover({ autoUpdate: false });
  const togglePopover = popoverCtx.toggle;
  const selectedItemRef = React.useRef<HTMLDivElement>(null);
  const searchInputCtx = useSearchInput({
    items: options,
    comparator: comparator || (() => true),
  });

  const select = React.useCallback(
    option => {
      onChange?.(option);
      togglePopover();
    },
    [togglePopover, onChange],
  );

  return (
    <SelectStateCtx.Provider
      value={{
        value: {
          popoverCtx,
          searchInputCtx,
          selectedOption: value,
          noResultsMessage,
          selectedItemRef,
          optionBuilder,
          placeholder,
          comparator,
          select,
          onTriggerClick: togglePopover,
        },
      }}
      {...rest}
    />
  );
};

type SelectOptionBuilderProps<O = unknown> = {
  option: O;
  index: number;
  optionBuilder: OptionBuilder<O>;
  handleSelect: (option: O) => void;
  isSelected: boolean;
};

const _SelectOptionBuilder = (props: SelectOptionBuilderProps, ref?: React.ForwardedRef<HTMLDivElement>) => {
  const { option, optionBuilder, index, handleSelect, isSelected } = props;
  return (
    <Flex
      ref={ref}
      sx={{
        userSelect: 'none',
      }}
      onClick={() => {
        handleSelect(option);
      }}
    >
      {optionBuilder(option, index, isSelected)}
    </Flex>
  );
};

const SelectOptionBuilder = React.memo(React.forwardRef(_SelectOptionBuilder));

const SelectSearchbar = (props: PropsOfComponent<typeof InputWithIcon>) => {
  const { sx, ...rest } = props;
  React.useEffect(() => {
    // @ts-expect-error
    return () => props.onChange({ target: { value: '' } });
  }, []);

  return (
    <Flex sx={theme => ({ borderBottom: theme.borders.$normal, borderColor: theme.colors.$blackAlpha200 })}>
      <InputWithIcon
        focusRing={false}
        autoFocus
        leftIcon={
          <Icon
            colorScheme='neutral'
            icon={MagnifyingGlass}
          />
        }
        sx={[{ border: 'none', borderRadius: '0' }, sx]}
        {...rest}
      />
    </Flex>
  );
};

export const SelectNoResults = (props: PropsOfComponent<typeof Text>) => {
  const { sx, ...rest } = props;
  return (
    <Text
      as='div'
      variant='smallRegular'
      sx={[theme => ({ width: '100%', padding: `${theme.space.$2} 0 0 ${theme.space.$4}` }), sx]}
      {...rest}
    />
  );
};

type SelectOptionListProps = PropsOfComponent<typeof Flex>;

export const SelectOptionList = (props: SelectOptionListProps) => {
  const { sx, ...rest } = props;
  const {
    popoverCtx,
    searchInputCtx,
    optionBuilder,
    placeholder,
    comparator,
    selectedItemRef,
    noResultsMessage,
    select,
    onTriggerClick,
  } = useSelectState();
  const { filteredItems: options, searchInputProps } = searchInputCtx;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { isOpen, floating, styles } = popoverCtx;
  const containerRef = React.useRef<HTMLDivElement>(null);

  const scrollToItemOnSelectedIndexChange = () => {
    if (!isOpen) {
      setSelectedIndex(0);
      return;
    }
    selectedItemRef.current?.scrollIntoView({ block: 'nearest' });
  };

  React.useEffect(scrollToItemOnSelectedIndexChange, [selectedIndex, isOpen]);
  React.useEffect(() => {
    if (!comparator) {
      containerRef?.current?.focus();
    }
  }, [isOpen]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        return setSelectedIndex((i = 0) => Math.max(i - 1, 0));
      }
      return onTriggerClick();
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (isOpen) {
        return setSelectedIndex((i = 0) => Math.min(i + 1, options.length - 1));
      }
      return onTriggerClick();
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      return select(options[selectedIndex]);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Flex
      ref={floating}
      onKeyDown={onKeyDown}
      direction='col'
      justify='start'
      sx={[
        theme => ({
          backgroundColor: colors.makeSolid(theme.colors.$colorBackground),
          border: theme.borders.$normal,
          borderRadius: theme.radii.$lg,
          borderColor: theme.colors.$blackAlpha200,
          overflow: 'hidden',
          width: '100%',
          animation: `${animations.dropdownSlideInScaleAndFade} ${theme.transitionDuration.$slower} ${theme.transitionTiming.$slowBezier}`,
          transformOrigin: 'top center',
          boxShadow: theme.shadows.$cardDropShadow,
          zIndex: theme.zIndices.$dropdown,
        }),
        sx,
      ]}
      style={{ ...styles, left: styles.left - 1 }}
      {...rest}
    >
      {comparator && (
        <SelectSearchbar
          placeholder={placeholder}
          {...searchInputProps}
        />
      )}
      <Flex
        ref={containerRef}
        direction='col'
        tabIndex={comparator ? undefined : 0}
        sx={[
          theme => ({
            outline: 'none',
            overflowY: 'scroll',
            maxHeight: '18vh',
            paddingBottom: theme.space.$2,
          }),
          sx,
        ]}
        {...rest}
      >
        {options.map((option, index) => {
          const isSelected = index === selectedIndex;
          return (
            <SelectOptionBuilder
              key={index}
              index={index}
              ref={isSelected ? selectedItemRef : undefined}
              option={option}
              optionBuilder={optionBuilder}
              isSelected={isSelected}
              handleSelect={select}
            />
          );
        })}
        {noResultsMessage && options.length === 0 && <SelectNoResults>{noResultsMessage}</SelectNoResults>}
      </Flex>
    </Flex>
  );
};

export const SelectButton = (props: PropsOfComponent<typeof Button>) => {
  const { sx, children, ...rest } = props;
  const { popoverCtx, onTriggerClick, optionBuilder, selectedOption } = useSelectState();
  const { isOpen, reference } = popoverCtx;

  let show: React.ReactNode = children;
  if (!isValidElement(children)) {
    show = optionBuilder(selectedOption);
  }

  return (
    <Button
      ref={reference}
      colorScheme='neutral'
      variant='ghost'
      textVariant='smallMedium'
      onClick={onTriggerClick}
      sx={[
        theme => ({
          paddingLeft: theme.space.$3x5,
          paddingRight: theme.space.$3x5,
          border: theme.borders.$normal,
          borderColor: theme.colors.$blackAlpha300,
          borderRadius: theme.radii.$md,
          '> *': { pointerEvents: 'none' },
        }),
        sx,
      ]}
      {...rest}
    >
      {show}
      <Icon
        icon={Caret}
        sx={theme => ({
          width: theme.sizes.$3x5,
          marginLeft: theme.space.$1,
          transitionProperty: theme.transitionProperty.$common,
          transitionDuration: theme.transitionDuration.$controls,
          transform: `rotate(${isOpen ? '180' : '0'}deg)`,
        })}
      />
    </Button>
  );
};
