import { createContextAndHook } from '@clerk/shared';
import React, { PropsWithChildren, useState } from 'react';

import { usePopover, useSearchInput } from '../../ui/hooks';
import { Button, Flex, Icon, Text } from '../customizables';
import { Caret, MagnifyingGlass } from '../icons';
import { animations, common, PropsOfComponent, ThemableCssProp } from '../styledSystem';
import { colors } from '../utils';
import { InputWithIcon } from './InputWithIcon';

type UsePopoverReturn = ReturnType<typeof usePopover>;
type UseSearchInputReturn = ReturnType<typeof useSearchInput>;

type Option = { value: string | null; label?: string };

type OptionBuilder<O extends Option> = (option: O, index?: number, isFocused?: boolean) => JSX.Element;

type SelectProps<O extends Option> = {
  options: O[];
  value: string | null;
  onChange: (option: O) => void;
  searchPlaceholder?: string;
  placeholder?: string;
  comparator?: (term: string, option: O) => boolean;
  noResultsMessage?: string;
  optionBuilder?: OptionBuilder<O>;
};

type SelectState<O extends Option> = Pick<
  SelectProps<O>,
  'placeholder' | 'searchPlaceholder' | 'comparator' | 'noResultsMessage'
> & {
  popoverCtx: UsePopoverReturn;
  searchInputCtx: UseSearchInputReturn;
  optionBuilder: OptionBuilder<O>;
  buttonOptionBuilder: OptionBuilder<O>;
  selectedOption: Option | null;
  select: (option: Option) => void;
  focusedItemRef: React.RefObject<HTMLDivElement>;
  onTriggerClick: () => void;
};

const [SelectStateCtx, useSelectState] = createContextAndHook<SelectState<any>>('SelectState');

const defaultOptionBuilder = <O extends Option>(option: O, _index?: number, isFocused?: boolean) => {
  return (
    <Flex
      sx={theme => ({
        width: '100%',
        padding: `${theme.space.$2} ${theme.space.$4}`,
        margin: `0 ${theme.space.$1}`,
        borderRadius: theme.radii.$md,
        ...(isFocused && { backgroundColor: theme.colors.$blackAlpha200 }),
        '&:hover': {
          backgroundColor: theme.colors.$blackAlpha200,
        },
      })}
    >
      <Text truncate>{option.label || option.value}</Text>
    </Flex>
  );
};

const defaultButtonOptionBuilder = <O extends Option>(option: O) => {
  return <>{option.label || option.value}</>;
};

export const Select = <O extends Option>(props: PropsWithChildren<SelectProps<O>>) => {
  const {
    value,
    options,
    onChange,
    optionBuilder,
    noResultsMessage,
    comparator,
    placeholder = 'Select an option',
    searchPlaceholder,
    ...rest
  } = props;
  const popoverCtx = usePopover({ autoUpdate: false });
  const togglePopover = popoverCtx.toggle;
  const focusedItemRef = React.useRef<HTMLDivElement>(null);
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
          selectedOption: options.find(o => o.value === value) || null,
          noResultsMessage,
          focusedItemRef,
          optionBuilder: optionBuilder || defaultOptionBuilder,
          buttonOptionBuilder: optionBuilder || defaultButtonOptionBuilder,
          placeholder,
          searchPlaceholder,
          comparator,
          select,
          onTriggerClick: togglePopover,
        },
      }}
      {...rest}
    />
  );
};

type SelectOptionBuilderProps<O extends Option> = {
  option: Option;
  index: number;
  optionBuilder: OptionBuilder<O>;
  handleSelect: (option: Option) => void;
  isFocused: boolean;
};

const SelectOptionBuilder = React.memo(
  React.forwardRef((props: SelectOptionBuilderProps<any>, ref?: React.ForwardedRef<HTMLDivElement>) => {
    const { option, optionBuilder, index, handleSelect, isFocused } = props;
    return (
      <Flex
        ref={ref}
        sx={{
          userSelect: 'none',
          cursor: 'pointer',
        }}
        onClick={() => {
          handleSelect(option);
        }}
      >
        {optionBuilder(option, index, isFocused)}
      </Flex>
    );
  }),
);

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

type SelectOptionListProps = PropsOfComponent<typeof Flex> & {
  containerSx?: ThemableCssProp;
};

export const SelectOptionList = (props: SelectOptionListProps) => {
  const { containerSx, sx, ...rest } = props;
  const {
    popoverCtx,
    searchInputCtx,
    optionBuilder,
    placeholder,
    searchPlaceholder,
    comparator,
    focusedItemRef,
    noResultsMessage,
    select,
    onTriggerClick,
  } = useSelectState();
  const { filteredItems: options, searchInputProps } = searchInputCtx;
  const [focusedIndex, setFocusedIndex] = useState(0);
  const { isOpen, floating, styles } = popoverCtx;
  const containerRef = React.useRef<HTMLDivElement>(null);

  const scrollToItemOnSelectedIndexChange = () => {
    if (!isOpen) {
      setFocusedIndex(-1);
      return;
    }
    focusedItemRef.current?.scrollIntoView({ block: 'nearest' });
  };

  React.useEffect(scrollToItemOnSelectedIndexChange, [focusedIndex, isOpen]);
  React.useEffect(() => {
    if (!comparator) {
      containerRef?.current?.focus();
    }
  }, [isOpen]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        return setFocusedIndex((i = 0) => Math.max(i - 1, 0));
      }
      return onTriggerClick();
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (isOpen) {
        return setFocusedIndex((i = 0) => Math.min(i + 1, options.length - 1));
      }
      return onTriggerClick();
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      return select(options[focusedIndex]);
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
          animation: `${animations.dropdownSlideInScaleAndFade} ${theme.transitionDuration.$slower} ${theme.transitionTiming.$slowBezier}`,
          transformOrigin: 'top center',
          boxShadow: theme.shadows.$cardDropShadow,
          zIndex: theme.zIndices.$dropdown,
        }),
        sx,
      ]}
      style={{ ...styles, left: styles.left - 1 }}
    >
      {comparator && (
        <SelectSearchbar
          placeholder={searchPlaceholder}
          {...searchInputProps}
        />
      )}
      <Flex
        ref={containerRef}
        direction='col'
        tabIndex={comparator ? undefined : 0}
        sx={[
          theme => ({
            gap: theme.space.$1,
            outline: 'none',
            overflowY: 'auto',
            maxHeight: '18vh',
            padding: `${theme.space.$2} 0`,
          }),
          containerSx,
        ]}
        {...rest}
      >
        {options.map((option, index) => {
          const isFocused = index === focusedIndex;
          return (
            <SelectOptionBuilder
              key={index}
              index={index}
              ref={isFocused ? focusedItemRef : undefined}
              option={option}
              optionBuilder={optionBuilder}
              isFocused={isFocused}
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
  const { popoverCtx, onTriggerClick, buttonOptionBuilder, selectedOption, placeholder } = useSelectState();
  const { isOpen, reference } = popoverCtx;

  let show: React.ReactNode = children;
  if (!children) {
    show = selectedOption ? (
      buttonOptionBuilder(selectedOption)
    ) : (
      <Text sx={t => ({ opacity: t.opacity.$inactive })}>{placeholder}</Text>
    );
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
          color: theme.colors.$colorInputText,
          backgroundColor: theme.colors.$colorInputBackground,
          ...common.borderVariants(theme).normal,
          paddingLeft: theme.space.$3x5,
          paddingRight: theme.space.$3x5,
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
