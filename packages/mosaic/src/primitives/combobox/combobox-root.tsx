'use client';

import {
  arrow,
  autoUpdate,
  flip,
  FloatingNode,
  FloatingTree,
  offset,
  type Placement,
  size,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useInteractions,
  useListNavigation,
  useRole,
} from '@floating-ui/react';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useControllableState } from '../hooks/use-controllable-state';
import { useTransition } from '../hooks/use-transition';
import { cssVars } from '../utils/css-vars';
import {
  ComboboxContext,
  type ComboboxContextValue,
  ComboboxHighlightContext,
  type ComboboxHighlightContextValue,
  ComboboxOptionsContext,
  type ComboboxOptionsContextValue,
} from './combobox-context';

interface ComboboxBaseProps {
  /** Controlled input text. */
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  sideOffset?: number;
  children: ReactNode;
  /** Separate search input inside another surface. Bind open to that surface. */
  inline?: boolean;
  /** Opens the popup when the input is clicked. Has no effect with `inline`. */
  openOnInputClick?: boolean;
  /** Disables the input, the options, the chips and the buttons, so the selection can't change. */
  disabled?: boolean;
  /** Keeps the input and the buttons focusable while `disabled`, marked `aria-disabled` instead. */
  focusableWhenDisabled?: boolean;
}

export interface ComboboxSingleProps extends ComboboxBaseProps {
  multiple?: false;
  /** Controlled selected value. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
}

export interface ComboboxMultipleProps extends ComboboxBaseProps {
  /** Lets several options be selected. Picking an option toggles it, clears the query and keeps the popup open. */
  multiple: true;
  /** Controlled selected values, in the order they were picked. */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps;

function toValues(value: string | null | undefined): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }
  return value === null ? [] : [value];
}

function ComboboxInner(props: ComboboxProps) {
  const { placement: placementProp = 'bottom-start', sideOffset = 4, children } = props;
  const multiple = props.multiple === true;
  const disabled = props.disabled === true;
  const focusableWhenDisabled = props.focusableWhenDisabled === true;
  const onSingleValueChange = props.multiple ? undefined : props.onValueChange;
  const onMultipleValueChange = props.multiple ? props.onValueChange : undefined;

  const nodeId = useFloatingNodeId();

  const [open, setOpenState] = useControllableState(props.open, props.defaultOpen ?? false, props.onOpenChange);

  const [inputValue, setInputValue] = useControllableState(
    props.inputValue,
    props.defaultInputValue ?? '',
    props.onInputValueChange,
  );

  const onSelectedValuesChange = useCallback(
    (values: string[]) => {
      onMultipleValueChange?.(values);
      onSingleValueChange?.(values[0] ?? null);
    },
    [onSingleValueChange, onMultipleValueChange],
  );
  const singleValue = props.multiple ? undefined : props.value;
  const controlledSingleValues = useMemo(() => toValues(singleValue), [singleValue]);
  const [selectedValues, setSelectedValues] = useControllableState<string[]>(
    props.multiple ? props.value : controlledSingleValues,
    (props.multiple ? props.defaultValue : toValues(props.defaultValue)) ?? [],
    onSelectedValuesChange,
  );
  const selectedValue = multiple ? null : (selectedValues[0] ?? null);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [inlineMode, setInlineMode] = useState(false);
  const [queryChanged, setQueryChanged] = useState(false);
  const initialValue = props.multiple ? undefined : (props.value ?? props.defaultValue);
  const labelsByValueRef = useRef(
    new Map<string, string>(
      initialValue != null && props.defaultInputValue !== undefined ? [[initialValue, props.defaultInputValue]] : [],
    ),
  );

  const highlightFirstRef = useRef(false);
  const highlightValueRef = useRef<string | null>(null);

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setQueryChanged(false);
      }
      setOpenState(nextOpen);
    },
    [setOpenState],
  );

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react/set-state-in-effect -- Reset the query flag when the controlled selection changes.
      setQueryChanged(false);
      highlightFirstRef.current = false;
    }
    if (open) {
      return;
    }
    const label =
      props.inline || selectedValue === null ? '' : (labelsByValueRef.current.get(selectedValue) ?? selectedValue);
    if (inputValue !== label) {
      setInputValue(label);
    }
  }, [open, props.inline, selectedValue, selectedIndex, inputValue, setInputValue]);

  // eslint-disable-next-line react/refs -- This ref holds an imperative resource or the latest callback outside React state.
  const selectedLabel = selectedValue === null ? '' : (labelsByValueRef.current.get(selectedValue) ?? selectedValue);
  const filterQuery = !queryChanged && inputValue === selectedLabel ? '' : inputValue;

  const elementsRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);
  const arrowRef = useRef<SVGSVGElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [chipsElement, setChipsElement] = useState<HTMLDivElement | null>(null);
  const valuesByIndexRef = useRef<Map<number, string>>(new Map());
  const registerOption = useCallback((index: number) => {
    if (index === 0 && highlightFirstRef.current) {
      highlightFirstRef.current = false;
      setActiveIndex(0);
    }
  }, []);
  const registerSelectedIndex = useCallback((index: number, value: string, label: string, selected: boolean) => {
    labelsByValueRef.current.set(value, label);
    if (highlightValueRef.current === value) {
      highlightValueRef.current = null;
      setActiveIndex(index);
    }
    if (!selected) {
      return undefined;
    }
    setSelectedIndex(index);
    return () => setSelectedIndex(current => (current === index ? null : current));
  }, []);

  const previousOpenRef = useRef(open);
  useEffect(() => {
    if (open && !previousOpenRef.current && selectedIndex != null) {
      setActiveIndex(selectedIndex);
    }
    previousOpenRef.current = open;
  }, [open, selectedIndex]);

  const {
    refs,
    floatingStyles,
    context: floatingContext,
    placement,
  } = useFloating<HTMLInputElement>({
    nodeId,
    open,
    onOpenChange: setOpen,
    placement: placementProp,
    middleware: [
      offset(sideOffset),
      flip({ padding: 5 }),
      size({
        apply({ rects, availableHeight, elements }) {
          // Only size the positioner (identified by its data-side), never the input reference.
          if (!elements.floating.hasAttribute('data-side')) {
            return;
          }
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${availableHeight}px`,
          });
        },
        padding: 5,
      }),
      // eslint-disable-next-line react/refs -- This ref holds an imperative resource or the latest callback outside React state.
      arrow({ element: arrowRef }),
      cssVars({ sideOffset }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const { mounted, transitionProps } = useTransition({
    open,
    ref: popupRef,
  });

  const dismiss = useDismiss(floatingContext, {
    escapeKey: !inlineMode,
    outsidePress(event) {
      if (inlineMode) {
        return false;
      }
      const target = event.target;
      return !(target instanceof Node && (triggerRef.current?.contains(target) || chipsElement?.contains(target)));
    },
    bubbles: {
      escapeKey: inlineMode,
      outsidePress: inlineMode,
    },
  });
  const role = useRole(floatingContext, { role: 'listbox' });
  const listNav = useListNavigation(floatingContext, {
    listRef: elementsRef,
    activeIndex,
    selectedIndex,
    onNavigate: setActiveIndex,
    virtual: true,
    enabled: !disabled,
    loop: true,
    scrollItemIntoView: true,
  });

  const click = useClick(floatingContext, {
    enabled: Boolean(props.openOnInputClick) && !props.inline && !disabled,
    toggle: false,
  });
  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([dismiss, role, listNav, click]);
  const referenceProps = getReferenceProps();
  const popupId = typeof referenceProps['aria-controls'] === 'string' ? referenceProps['aria-controls'] : undefined;

  const focusInput = useCallback(() => {
    const input = refs.domReference.current;
    if (input instanceof HTMLElement) {
      input.focus();
    }
  }, [refs.domReference]);

  const handleSelect = useCallback(
    (value: string, index: number, label: string) => {
      if (disabled) {
        return;
      }
      labelsByValueRef.current.set(value, label);
      if (multiple) {
        const next = selectedValues.includes(value)
          ? selectedValues.filter(selected => selected !== value)
          : [...selectedValues, value];
        setSelectedValues(next);
        if (next.length === 0) {
          setSelectedIndex(null);
        }
        if (inputValue !== '') {
          highlightValueRef.current = value;
          setInputValue('');
        }
        return;
      }
      setSelectedValues([value]);
      setSelectedIndex(index);
      setInputValue(props.inline ? '' : label);
      setActiveIndex(null);
      setOpen(false);
    },
    [disabled, multiple, selectedValues, inputValue, props.inline, setSelectedValues, setInputValue, setOpen],
  );

  const removeValue = useCallback(
    (value: string) => {
      if (disabled) {
        return;
      }
      const next = selectedValues.filter(selected => selected !== value);
      setSelectedValues(next);
      if (next.length === 0) {
        setSelectedIndex(null);
      }
    },
    [disabled, selectedValues, setSelectedValues],
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setQueryChanged(true);
      setInputValue(value);
      if (value === '' && !props.inline && !multiple) {
        setSelectedValues([]);
        setSelectedIndex(null);
      }
      setOpenState(true);
      if (elementsRef.current[0]) {
        setActiveIndex(0);
      } else {
        highlightFirstRef.current = true;
        setActiveIndex(null);
      }
    },
    [props.inline, multiple, setInputValue, setOpenState, setSelectedValues],
  );

  const clear = useCallback(() => {
    if (disabled) {
      return;
    }
    setQueryChanged(false);
    setInputValue('');
    setSelectedValues([]);
    setSelectedIndex(null);
    setActiveIndex(null);
    focusInput();
  }, [disabled, focusInput, setInputValue, setSelectedValues]);

  const contextValue = useMemo<ComboboxContextValue>(
    () => ({
      open,
      clear,
      inputValue,
      filterQuery,
      multiple,
      disabled,
      focusableWhenDisabled,
      selectedValues,
      labelsByValueRef,
      removeValue,
      floatingContext,
      refs,
      floatingStyles,
      placement,
      getReferenceProps,
      getFloatingProps,
      activeIndex,
      selectedIndex,
      elementsRef,
      labelsRef,
      popupRef,
      triggerRef,
      chipsElement,
      setChipsElement,
      arrowRef,
      valuesByIndexRef,
      setInlineMode,
      handleSelect,
      handleInputChange,
      setOpen,
      focusInput,
      popupId,
      mounted,
      transitionProps,
    }),
    [
      open,
      clear,
      inputValue,
      filterQuery,
      multiple,
      disabled,
      focusableWhenDisabled,
      selectedValues,
      removeValue,
      floatingContext,
      refs,
      floatingStyles,
      placement,
      getReferenceProps,
      getFloatingProps,
      activeIndex,
      selectedIndex,
      chipsElement,
      setChipsElement,
      handleSelect,
      handleInputChange,
      setOpen,
      focusInput,
      popupId,
      mounted,
      transitionProps,
    ],
  );

  const optionsContextValue = useMemo<ComboboxOptionsContextValue>(
    () => ({
      getItemProps,
      handleSelect,
      refs,
      valuesByIndexRef,
      registerSelectedIndex,
      registerOption,
      disabled,
    }),
    [getItemProps, handleSelect, refs, registerSelectedIndex, registerOption, disabled],
  );

  const highlightContextValue = useMemo<ComboboxHighlightContextValue>(
    () => ({ activeIndex, selectedValues }),
    [activeIndex, selectedValues],
  );

  return (
    <FloatingNode id={nodeId}>
      <ComboboxContext.Provider value={contextValue}>
        <ComboboxOptionsContext.Provider value={optionsContextValue}>
          <ComboboxHighlightContext.Provider value={highlightContextValue}>
            {children}
          </ComboboxHighlightContext.Provider>
        </ComboboxOptionsContext.Provider>
      </ComboboxContext.Provider>
    </FloatingNode>
  );
}

export function ComboboxRoot(props: ComboboxProps) {
  const parentId = useFloatingParentNodeId();

  if (parentId === null) {
    return (
      <FloatingTree>
        <ComboboxInner {...props} />
      </FloatingTree>
    );
  }

  return <ComboboxInner {...props} />;
}
