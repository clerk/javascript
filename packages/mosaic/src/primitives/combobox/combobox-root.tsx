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

export interface ComboboxProps {
  /** Controlled input text. */
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (value: string) => void;
  /** Controlled selected value. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
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
}

function ComboboxInner(props: ComboboxProps) {
  const { placement: placementProp = 'bottom-start', sideOffset = 4, children } = props;

  const nodeId = useFloatingNodeId();

  const [open, setOpenState] = useControllableState(props.open, props.defaultOpen ?? false, props.onOpenChange);

  const [inputValue, setInputValue] = useControllableState(
    props.inputValue,
    props.defaultInputValue ?? '',
    props.onInputValueChange,
  );

  const [selectedValue, setSelectedValue] = useControllableState<string | null>(
    props.value,
    props.defaultValue ?? null,
    props.onValueChange,
  );

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [inlineMode, setInlineMode] = useState(false);
  const [queryChanged, setQueryChanged] = useState(false);
  const initialValue = props.value ?? props.defaultValue;
  const labelsByValueRef = useRef(
    new Map<string, string>(
      initialValue != null && props.defaultInputValue !== undefined ? [[initialValue, props.defaultInputValue]] : [],
    ),
  );

  const highlightFirstRef = useRef(false);

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
  const valuesByIndexRef = useRef<Map<number, string>>(new Map());
  const registerOption = useCallback((index: number) => {
    if (index === 0 && highlightFirstRef.current) {
      highlightFirstRef.current = false;
      setActiveIndex(0);
    }
  }, []);
  const registerSelectedIndex = useCallback((index: number, value: string, label: string, selected: boolean) => {
    labelsByValueRef.current.set(value, label);
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
      return !(target instanceof Node && triggerRef.current?.contains(target));
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
    loop: true,
    scrollItemIntoView: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([dismiss, role, listNav]);
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
      labelsByValueRef.current.set(value, label);
      setSelectedValue(value);
      setSelectedIndex(index);
      setInputValue(props.inline ? '' : label);
      setActiveIndex(null);
      setOpen(false);
    },
    [props.inline, setSelectedValue, setInputValue, setOpen],
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setQueryChanged(true);
      setInputValue(value);
      if (value === '' && !props.inline) {
        setSelectedValue(null);
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
    [props.inline, setInputValue, setOpenState, setSelectedValue],
  );

  const clear = useCallback(() => {
    setQueryChanged(false);
    setInputValue('');
    setSelectedValue(null);
    setSelectedIndex(null);
    setActiveIndex(null);
    focusInput();
  }, [focusInput, setInputValue, setSelectedValue]);

  const hasValue = inputValue !== '' || selectedValue !== null;

  const contextValue = useMemo<ComboboxContextValue>(
    () => ({
      open,
      hasValue,
      clear,
      inputValue,
      filterQuery,
      selectedValue,
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
      arrowRef,
      valuesByIndexRef,
      setInlineMode,
      handleSelect,
      handleInputChange,
      setOpen,
      openOnInputClick: Boolean(props.openOnInputClick) && !props.inline,
      focusInput,
      popupId,
      mounted,
      transitionProps,
    }),
    [
      open,
      hasValue,
      clear,
      inputValue,
      filterQuery,
      selectedValue,
      floatingContext,
      refs,
      floatingStyles,
      placement,
      getReferenceProps,
      getFloatingProps,
      activeIndex,
      selectedIndex,
      handleSelect,
      handleInputChange,
      setOpen,
      props.openOnInputClick,
      props.inline,
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
    }),
    [getItemProps, handleSelect, refs, registerSelectedIndex, registerOption],
  );

  const highlightContextValue = useMemo<ComboboxHighlightContextValue>(
    () => ({ activeIndex, selectedValue }),
    [activeIndex, selectedValue],
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
