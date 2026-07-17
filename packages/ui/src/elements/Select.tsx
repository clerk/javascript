import { createContextAndHook } from '@clerk/shared/react';
import type { SelectId } from '@clerk/shared/types';
import { FloatingList, useInteractions, useListItem, useListNavigation } from '@floating-ui/react';
import type { PropsWithChildren, ReactElement, ReactNode } from 'react';
import React from 'react';

import { Button, descriptors, Flex, Icon, Input, Text } from '../customizables';
import { usePopover, useSearchInput } from '../hooks';
import { ChevronDown } from '../icons';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';
import { animations, common } from '../styledSystem';
import { colors } from '../utils/colors';
import { withFloatingTree } from './contexts';
import type { InputWithIcon } from './InputWithIcon';
import { Popover } from './Popover';

type UsePopoverReturn = ReturnType<typeof usePopover>;
type UseSearchInputReturn = ReturnType<typeof useSearchInput>;
type UseInteractionsReturn = ReturnType<typeof useInteractions>;

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
  getReferenceProps: UseInteractionsReturn['getReferenceProps'];
  getFloatingProps: UseInteractionsReturn['getFloatingProps'];
  getItemProps: UseInteractionsReturn['getItemProps'];
  activeIndex: number | null;
  setActiveIndex: React.Dispatch<React.SetStateAction<number | null>>;
  elementsRef: React.MutableRefObject<Array<HTMLElement | null>>;
  onTriggerClick: () => void;
  generatedTriggerId: string;
  triggerId: string;
  setTriggerId: React.Dispatch<React.SetStateAction<string>>;
  generatedListboxId: string;
  listboxId: string;
  setListboxId: React.Dispatch<React.SetStateAction<string>>;
  portal?: boolean;
};

const [SelectStateCtx, useSelectState] = createContextAndHook<SelectState<any>>('SelectState');

const defaultRenderOption = <O extends Option>(option: O, _index?: number) => {
  return (
    <Flex
      sx={theme => ({
        position: 'relative',
        width: '100%',
        padding: `${theme.space.$2} ${theme.space.$4}`,
        margin: `0 ${theme.space.$1}`,
        borderRadius: theme.radii.$md,
        '&:hover, &[data-focused="true"]': {
          background: common.mutedBackground(theme),
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: `calc(${theme.space.$0x5} * -1) calc(${theme.space.$1} * -1)`,
        },
      })}
    >
      <Text truncate>{option.label || option.value}</Text>
    </Flex>
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
    ...rest
  } = props;
  const popoverCtx = usePopover({
    autoUpdate: true,
    // +2px compensates for the 1px border on each side of the trigger
    adjustToReferenceWidth: 2,
    referenceElement: referenceElement,
    offset: { mainAxis: 6, crossAxis: -1 },
  });
  const togglePopover = popoverCtx.toggle;
  const { context } = popoverCtx;
  const elementsRef = React.useRef<Array<HTMLElement | null>>([]);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  // Delegate keyboard interactions to floating-ui so the trigger opens the
  // listbox on ArrowUp/ArrowDown and navigation stays a single source of truth.
  // `virtual` keeps DOM focus on the listbox (or the search input in combobox
  // mode) and exposes the active option via `aria-activedescendant`.
  const selectedIndex = options.findIndex(o => o.value === value);
  const listNavigation = useListNavigation(context, {
    listRef: elementsRef,
    activeIndex,
    selectedIndex: selectedIndex === -1 ? null : selectedIndex,
    onNavigate: setActiveIndex,
    loop: true,
    virtual: true,
  });
  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([listNavigation]);

  const generatedTriggerId = React.useId();
  const generatedListboxId = React.useId();
  const [triggerId, setTriggerId] = React.useState(generatedTriggerId);
  const [listboxId, setListboxId] = React.useState(generatedListboxId);
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
          value,
          renderOption: renderOption || defaultRenderOption,
          buttonRenderOption: renderOption || defaultButtonRenderOption,
          placeholder,
          searchPlaceholder,
          comparator,
          select,
          getReferenceProps,
          getFloatingProps,
          getItemProps,
          activeIndex,
          setActiveIndex,
          elementsRef,
          onTriggerClick: togglePopover,
          generatedTriggerId,
          triggerId,
          setTriggerId,
          generatedListboxId,
          listboxId,
          setListboxId,
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
  id: string;
  renderOption: RenderOption<O>;
  handleSelect: (option: Option) => void;
  getItemProps: UseInteractionsReturn['getItemProps'];
  isFocused?: boolean;
  isSelected?: boolean;
  elementId?: SelectId;
};

const SelectRenderOption = React.memo((props: SelectrenderOptionProps<any>) => {
  const { option, renderOption, isSelected, index, id, handleSelect, getItemProps, isFocused, elementId } = props;
  const item = useListItem();

  return (
    <Flex
      ref={item.ref}
      id={id}
      role='option'
      aria-selected={isSelected}
      sx={{
        userSelect: 'none',
        cursor: 'pointer',
      }}
      {...getItemProps({
        onClick: () => handleSelect(option),
      })}
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
});

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
  const {
    containerSx,
    sx,
    footer,
    onReachEnd,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rest
  } = props;
  const {
    popoverCtx,
    searchInputCtx,
    value,
    renderOption,
    searchPlaceholder,
    comparator,
    noResultsMessage,
    select,
    elementId,
    triggerId,
    generatedListboxId,
    setListboxId,
    portal,
    getFloatingProps,
    getItemProps,
    activeIndex,
    setActiveIndex,
    elementsRef,
  } = useSelectState();
  const { filteredItems: options, searchInputProps } = searchInputCtx;
  const { isOpen, floating, styles, nodeId, context } = popoverCtx;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const effectiveListboxId = id ?? generatedListboxId;
  const effectiveAriaLabelledBy = ariaLabelledBy ?? (ariaLabel ? undefined : triggerId);
  const optionId = (index: number) => `${effectiveListboxId}-option-${index}`;

  React.useEffect(() => {
    setListboxId(effectiveListboxId);
  }, [effectiveListboxId, setListboxId]);

  // Reset the highlighted option to the top of the list whenever the filtered
  // results change while searching. Intentionally keyed only on the result
  // count so it does not fight floating-ui's highlight-on-open behavior.
  React.useEffect(() => {
    if (isOpen) {
      setActiveIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.length]);

  React.useEffect(() => {
    if (isOpen && !comparator) {
      containerRef.current?.focus();
    }
  }, [isOpen, comparator]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && activeIndex != null && activeIndex >= 0) {
      e.preventDefault();
      const option = options[activeIndex];
      if (option) {
        select(option);
      }
      return;
    }

    if (e.key === 'ArrowDown' && onReachEnd && activeIndex === options.length - 1) {
      onReachEnd();
    }
  };

  // floating-ui exposes the active option through `aria-activedescendant`, but
  // it puts it on this (unfocused) wrapper. Lift it onto the element that
  // actually holds focus: the listbox in select mode, the search input in
  // combobox mode.
  const { 'aria-activedescendant': rawActiveDescendant, ...floatingProps } = getFloatingProps(
    popoverCtx.getFloatingProps({ onKeyDown }),
  );
  // SAFETY: floating-ui types its prop getters as Record<string, unknown>. The
  // active descendant is the id string of the active option, or undefined.
  const activeDescendant = rawActiveDescendant as string | undefined;

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
        {...floatingProps}
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
        style={styles}
      >
        {comparator && (
          <SelectSearchbar
            placeholder={searchPlaceholder}
            role='combobox'
            aria-expanded={isOpen}
            aria-controls={effectiveListboxId}
            aria-autocomplete='list'
            aria-activedescendant={activeDescendant}
            {...searchInputProps}
          />
        )}
        <Flex
          ref={containerRef}
          id={effectiveListboxId}
          direction='col'
          role='listbox'
          aria-label={ariaLabel}
          aria-labelledby={effectiveAriaLabelledBy}
          aria-activedescendant={comparator ? undefined : activeDescendant}
          tabIndex={comparator ? undefined : 0}
          sx={[
            theme => ({
              gap: theme.space.$0x5,
              outline: 'none',
              overflowY: 'auto',
              maxHeight: '18vh',
              padding: `${theme.space.$0x5} ${theme.space.$0x5}`,
            }),
            containerSx,
          ]}
          {...rest}
        >
          <FloatingList elementsRef={elementsRef}>
            {options.map((option, index) => {
              const isFocused = index === activeIndex;
              const isSelected = value === option.value;

              return (
                <SelectRenderOption
                  key={option.value}
                  index={index}
                  id={optionId(index)}
                  option={option}
                  renderOption={renderOption}
                  getItemProps={getItemProps}
                  isSelected={isSelected}
                  isFocused={isFocused}
                  handleSelect={select}
                  elementId={elementId}
                />
              );
            })}
          </FloatingList>
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
  const { sx, children, icon, iconSx, id, 'aria-controls': ariaControls, ...rest } = props;
  const {
    popoverCtx,
    onTriggerClick,
    buttonRenderOption,
    selectedOption,
    placeholder,
    elementId,
    generatedTriggerId,
    listboxId,
    setTriggerId,
    getReferenceProps,
  } = useSelectState();
  const { reference, isOpen } = popoverCtx;
  const effectiveTriggerId = id ?? generatedTriggerId;

  React.useEffect(() => {
    setTriggerId(effectiveTriggerId);
  }, [effectiveTriggerId, setTriggerId]);

  let show: React.ReactNode = children;
  if (!children) {
    show = selectedOption ? buttonRenderOption(selectedOption) : <Text as='span'>{placeholder}</Text>;
  }

  return (
    <Button
      elementDescriptor={descriptors.selectButton}
      elementId={descriptors.selectButton.setId(elementId)}
      ref={reference}
      id={effectiveTriggerId}
      variant='outline'
      textVariant='buttonLarge'
      {...getReferenceProps({ onClick: onTriggerClick })}
      aria-expanded={isOpen}
      aria-haspopup='listbox'
      aria-controls={ariaControls ?? (isOpen ? listboxId : undefined)}
      sx={[
        theme => ({
          gap: theme.space.$2,
          paddingInlineStart: theme.space.$3x5,
          paddingInlineEnd: theme.space.$3x5,
          alignItems: 'center',
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
