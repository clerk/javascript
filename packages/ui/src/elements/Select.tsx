import { createContextAndHook } from '@clerk/shared/react';
import type { SelectId } from '@clerk/shared/types';
import type { PropsWithChildren, ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';

import { Box, Button, descriptors, Flex, Icon, Image, Input, Text } from '../customizables';
import { usePopover, useSearchInput } from '../hooks';
import { Check, ChevronDown } from '../icons';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';
import { animations, common } from '../styledSystem';
import { colors } from '../utils/colors';
import { withFloatingTree } from './contexts';
import type { InputWithIcon } from './InputWithIcon';
import { Popover } from './Popover';

type UsePopoverReturn = ReturnType<typeof usePopover>;
type UseSearchInputReturn = ReturnType<typeof useSearchInput>;

type Option = { value: string | null; label?: string };

type RenderOption<O extends Option> = (option: O, index?: number, isSelected?: boolean) => ReactNode;

type SelectProps<O extends Option> = {
  options: O[];
  value: string | null;
  onChange: (option: O) => void;
  searchPlaceholder?: string;
  placeholder?: string;
  comparator?: (term: string, option: O) => boolean;
  noResultsMessage?: string;
  renderOption?: RenderOption<O>;
  elementId?: SelectId;
  portal?: boolean;
  referenceElement?: React.RefObject<HTMLElement>;
  matchTriggerWidth?: boolean;
};

type SelectState<O extends Option> = Pick<
  SelectProps<O>,
  'placeholder' | 'searchPlaceholder' | 'elementId' | 'value' | 'comparator' | 'noResultsMessage'
> & {
  popoverCtx: UsePopoverReturn;
  searchInputCtx: UseSearchInputReturn;
  renderOption: RenderOption<O>;
  buttonRenderOption: RenderOption<O>;
  selectedOption: Option | null;
  select: (option: O) => void;
  focusedItemRef: React.RefObject<HTMLDivElement>;
  onTriggerClick: () => void;
  portal?: boolean;
};

const [SelectStateCtx, useSelectState] = createContextAndHook<SelectState<any>>('SelectState');

const defaultRenderOption = <O extends Option>(option: O, _index?: number, isSelected?: boolean) => {
  return (
    <SelectOption isSelected={isSelected}>
      <SelectOption.Label>{option.label || option.value}</SelectOption.Label>
    </SelectOption>
  );
};

const defaultButtonRenderOption = <O extends Option>(option: O) => {
  return option.label || option.value;
};

export const Select = withFloatingTree(<O extends Option>(props: PropsWithChildren<SelectProps<O>>) => {
  const {
    value,
    options,
    onChange,
    renderOption,
    noResultsMessage,
    comparator,
    placeholder = 'Select an option',
    searchPlaceholder,
    elementId,
    children,
    portal = false,
    referenceElement = null,
    matchTriggerWidth = false,
    ...rest
  } = props;
  const popoverCtx = usePopover({
    autoUpdate: true,
    adjustToReferenceWidth: matchTriggerWidth || !!referenceElement,
    referenceElement: referenceElement,
  });
  const togglePopover = popoverCtx.toggle;
  const focusedItemRef = React.useRef<HTMLDivElement>(null);
  const searchInputCtx = useSearchInput({
    items: options,
    comparator: comparator || (() => true),
  });

  const select = React.useCallback(
    (option: O) => {
      onChange?.(option);
      togglePopover();
    },
    [togglePopover, onChange],
  );

  const defaultChildren = (
    <>
      <SelectOptionList />
      <SelectButton />
    </>
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
          value,
          renderOption: renderOption || defaultRenderOption,
          buttonRenderOption: renderOption || defaultButtonRenderOption,
          placeholder,
          searchPlaceholder,
          comparator,
          select,
          onTriggerClick: togglePopover,
          elementId,
          portal,
        },
      }}
      {...rest}
    >
      {React.Children.count(children) ? children : defaultChildren}
    </SelectStateCtx.Provider>
  );
}) as <O extends Option>(props: PropsWithChildren<SelectProps<O>>) => ReactElement;

type SelectrenderOptionProps<O extends Option> = {
  option: Option;
  index: number;
  renderOption: RenderOption<O>;
  handleSelect: (option: Option) => void;
  isFocused?: boolean;
  isSelected?: boolean;
  elementId?: SelectId;
};

const SelectRenderOption = React.memo(
  React.forwardRef((props: SelectrenderOptionProps<any>, ref?: React.ForwardedRef<HTMLDivElement>) => {
    const { option, renderOption, isSelected, index, handleSelect, isFocused, elementId } = props;

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
        {React.cloneElement(renderOption(option, index, isSelected) as React.ReactElement<unknown>, {
          //@ts-expect-error
          elementDescriptor: descriptors.selectOption,
          elementId: descriptors.selectOption.setId(elementId),
          'data-selected': isSelected,
          'data-focused': isFocused,
        })}
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
  const { elementId } = useSelectState();

  return (
    <Flex sx={t => ({ padding: t.space.$0x5 })}>
      <Input
        elementDescriptor={descriptors.selectSearchInput}
        elementId={descriptors.selectSearchInput.setId(elementId)}
        focusRing={false}
        variant='unstyled'
        sx={[
          t => ({
            borderRadius: t.radii.$md,
            backgroundColor: t.colors.$neutralAlpha100,
            padding: t.space.$2,
          }),
          sx,
        ]}
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
      sx={[
        theme => ({
          width: '100%',
          padding: `${theme.space.$1} ${theme.space.$2} ${theme.space.$2} ${theme.space.$2}`,
        }),
        sx,
      ]}
      {...rest}
    />
  );
};

type SelectOptionListProps = PropsOfComponent<typeof Flex> & {
  containerSx?: ThemableCssProp;
  footer?: React.ReactNode;
  onReachEnd?: () => void;
};

export const SelectOptionList = (props: SelectOptionListProps) => {
  const { containerSx, sx, footer, onReachEnd, ...rest } = props;
  const {
    popoverCtx,
    searchInputCtx,
    value,
    renderOption,
    searchPlaceholder,
    comparator,
    focusedItemRef,
    noResultsMessage,
    select,
    onTriggerClick,
    elementId,
    portal,
  } = useSelectState();
  const { filteredItems: options, searchInputProps } = searchInputCtx;
  const [focusedIndex, setFocusedIndex] = useState(0);
  const { isOpen, floating, styles, nodeId, context } = popoverCtx;
  const containerRef = React.useRef<HTMLDivElement>(null);

  const scrollToItemOnSelectedIndexChange = () => {
    if (!isOpen) {
      setFocusedIndex(-1);
      return;
    }
    // Jest could not resolve `focusedItemRef.current` so we need to call scrollIntoView with ?.()
    focusedItemRef.current?.scrollIntoView?.({ block: 'nearest' });
  };

  React.useEffect(scrollToItemOnSelectedIndexChange, [focusedIndex, isOpen]);
  React.useEffect(() => setFocusedIndex(0), [options.length]);
  React.useEffect(() => {
    if (!comparator) {
      containerRef?.current?.focus();
    }

    if (isOpen) {
      setFocusedIndex(options.findIndex(o => o.value === value));
      // Jest could not resolve `focusedItemRef.current` so we need to call scrollIntoView with ?.()
      focusedItemRef.current?.scrollIntoView?.({ block: 'nearest' });
      return;
    }
  }, [isOpen]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        return setFocusedIndex((i = 0) => (i === 0 ? options.length - 1 : i - 1));
      }
      return onTriggerClick();
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (isOpen) {
        if (onReachEnd && focusedIndex === options.length - 1) {
          onReachEnd();
          return;
        }
        return setFocusedIndex((i = 0) => (i === options.length - 1 ? 0 : i + 1));
      }
      return onTriggerClick();
    }

    if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      return select(options[focusedIndex]);
    }
  };

  return (
    <Popover
      nodeId={nodeId}
      context={context}
      isOpen={isOpen}
      portal={portal || false}
      order={['content']}
    >
      <Flex
        elementDescriptor={descriptors.selectOptionsContainer}
        elementId={descriptors.selectOptionsContainer.setId(elementId)}
        ref={floating}
        onKeyDown={onKeyDown}
        direction='col'
        justify='start'
        sx={[
          theme => ({
            backgroundColor: colors.makeSolid(theme.colors.$colorBackground),
            borderRadius: theme.radii.$lg,
            overflow: 'hidden',
            animation: `${animations.dropdownSlideInScaleAndFade} ${theme.transitionDuration.$slower} ${theme.transitionTiming.$slowBezier}`,
            transformOrigin: 'top center',
            boxShadow: theme.shadows.$menuShadow,
            zIndex: theme.zIndices.$dropdown,
          }),
          sx,
        ]}
        // eslint-disable-next-line custom-rules/no-physical-css-properties -- Floating UI library positioning
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
              gap: theme.space.$0x5,
              outline: 'none',
              overflowY: 'auto',
              maxHeight: '18vh',
              padding: `${theme.space.$0x5} ${theme.space.$0x5}`,
              ...common.unstyledScrollbar(theme),
            }),
            containerSx,
          ]}
          {...rest}
        >
          {options.map((option, index) => {
            const isFocused = index === focusedIndex;
            const isSelected = value === option.value;

            return (
              <SelectRenderOption
                key={option.value}
                index={index}
                ref={isFocused ? focusedItemRef : undefined}
                option={option}
                renderOption={renderOption}
                isSelected={isSelected}
                isFocused={isFocused}
                handleSelect={select}
                elementId={elementId}
              />
            );
          })}
          {noResultsMessage && options.length === 0 && <SelectNoResults>{noResultsMessage}</SelectNoResults>}
          {footer}
        </Flex>
      </Flex>
    </Popover>
  );
};

export const SelectButton = (
  props: PropsOfComponent<typeof Button> & {
    icon?: React.ReactElement | React.ComponentType;
    iconSx?: ThemableCssProp;
  },
) => {
  const { sx, children, icon, iconSx, ...rest } = props;
  const { popoverCtx, onTriggerClick, buttonRenderOption, selectedOption, placeholder, elementId } = useSelectState();
  const { reference } = popoverCtx;

  let show: React.ReactNode = children;
  if (!children) {
    show = selectedOption ? buttonRenderOption(selectedOption) : <Text as='span'>{placeholder}</Text>;
  }

  // Wrap plain string/number children in a truncating Text
  if (typeof show === 'string' || typeof show === 'number') {
    show = (
      <Text
        as='span'
        truncate
        colorScheme='body'
        sx={{ flex: 1, minWidth: 0, textAlign: 'start' as const }}
      >
        {show}
      </Text>
    );
  }

  return (
    <Button
      elementDescriptor={descriptors.selectButton}
      elementId={descriptors.selectButton.setId(elementId)}
      ref={reference}
      variant='outline'
      textVariant='buttonLarge'
      onClick={onTriggerClick}
      sx={[
        theme => ({
          gap: theme.space.$2,
          paddingInlineStart: theme.space.$3x5,
          paddingInlineEnd: theme.space.$3x5,
          alignItems: 'center',
          overflow: 'hidden',
          '> *': { pointerEvents: 'none' },
        }),
        sx,
      ]}
      {...rest}
    >
      {show}
      <Icon
        elementDescriptor={descriptors.selectButtonIcon}
        elementId={descriptors.selectButtonIcon.setId(elementId)}
        size='md'
        icon={icon || ChevronDown}
        sx={iconSx}
      />
    </Button>
  );
};

// --- SelectOption compound component ---

const SelectOptionImage = (props: { src: string; alt?: string; sx?: ThemableCssProp }) => {
  const { src, alt = '', sx } = props;
  return (
    <Image
      data-slot='image'
      src={src}
      alt={alt}
      sx={[
        theme => ({
          width: theme.sizes.$5,
          height: theme.sizes.$5,
          objectFit: 'contain',
          flexShrink: 0,
          borderRadius: theme.radii.$md,
        }),
        sx,
      ]}
    />
  );
};

const SelectOptionLabel = (props: PropsOfComponent<typeof Text>) => {
  const { children, sx, ...rest } = props;
  return (
    <Text
      data-slot='label'
      truncate
      as='span'
      variant='subtitle'
      sx={[{ textAlign: 'start', minWidth: 0 }, sx]}
      {...rest}
    >
      {children}
    </Text>
  );
};

const SelectOptionDetail = (props: PropsOfComponent<typeof Text>) => {
  const { children, sx, ...rest } = props;
  return (
    <Text
      data-slot='detail'
      as='span'
      colorScheme='secondary'
      sx={sx}
      {...rest}
    >
      {children}
    </Text>
  );
};

type SelectOptionRootProps = {
  isSelected?: boolean;
  children: ReactNode;
  sx?: ThemableCssProp;
  [key: string]: unknown;
};

const SelectOptionRoot = ({ isSelected = false, children, sx, ...rest }: SelectOptionRootProps) => {
  return (
    <Box
      as='span'
      sx={[
        theme => ({
          width: '100%',
          display: 'grid',
          gridTemplateColumns: `1fr ${theme.sizes.$3}`,
          columnGap: theme.space.$2,
          paddingInlineStart: theme.space.$1,
          paddingInlineEnd: theme.space.$1x5,
          paddingBlock: theme.space.$1,
          alignItems: 'center',
          borderRadius: theme.radii.$md,
          '&:hover, &[data-focused="true"]': {
            background: common.mutedBackground(theme),
          },
          '&[data-selected="true"]': {
            background: common.mutedBackground(theme),
          },
          '&:has([data-slot="image"])': {
            gridTemplateColumns: `${theme.sizes.$5} 1fr ${theme.sizes.$3}`,
          },
          '&:has([data-slot="detail"])': {
            gridTemplateColumns: `${theme.sizes.$3} 1fr auto`,
            '& [data-slot="check"]': {
              order: -1,
            },
          },
        }),
        sx,
      ]}
      {...rest}
    >
      {children}
      <Flex
        data-slot='check'
        as='span'
        center
        sx={theme => ({
          color: theme.colors.$primary500,
          visibility: isSelected ? 'visible' : 'hidden',
        })}
      >
        <Icon
          icon={Check}
          size='sm'
        />
      </Flex>
    </Box>
  );
};

export const SelectOption = Object.assign(SelectOptionRoot, {
  Image: SelectOptionImage,
  Label: SelectOptionLabel,
  Detail: SelectOptionDetail,
});
