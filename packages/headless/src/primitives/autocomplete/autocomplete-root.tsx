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

import { useControllableState } from '../../hooks/use-controllable-state';
import { useTransition } from '../../hooks/use-transition';
import { cssVars } from '../../utils/css-vars';
import { AutocompleteContext, type AutocompleteContextValue } from './autocomplete-context';

export interface AutocompleteProps {
  /** Controlled input text. */
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (value: string) => void;
  /** Controlled selected value. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  sideOffset?: number;
  children: ReactNode;
}

export interface ComboboxRootInternalProps extends Omit<AutocompleteProps, 'value' | 'defaultValue' | 'onValueChange'> {
  allowsCustomValue?: boolean;
  /** Separate search input inside another surface. Bind open to that surface. */
  inline?: boolean;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
}
function AutocompleteInner(props: ComboboxRootInternalProps) {
  const { placement: placementProp = 'bottom-start', sideOffset = 4, allowsCustomValue = true, children } = props;

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
      setQueryChanged(false);
    }
    if (allowsCustomValue || open) {
      return;
    }
    const label =
      props.inline || selectedValue === null ? '' : (labelsByValueRef.current.get(selectedValue) ?? selectedValue);
    if (inputValue !== label) {
      setInputValue(label);
    }
  }, [allowsCustomValue, open, props.inline, selectedValue, selectedIndex, inputValue, setInputValue]);

  const selectedLabel = selectedValue === null ? '' : (labelsByValueRef.current.get(selectedValue) ?? selectedValue);
  const filterQuery = !allowsCustomValue && !queryChanged && inputValue === selectedLabel ? '' : inputValue;

  const elementsRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);
  const arrowRef = useRef<SVGSVGElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const valuesByIndexRef = useRef<Map<number, string>>(new Map());
  const registerSelectedIndex = useCallback(
    (index: number, value: string, label: string) => {
      labelsByValueRef.current.set(value, label);
      if (value === selectedValue) {
        setSelectedIndex(index);
      }
    },
    [selectedValue],
  );

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
      if (value === '' && !allowsCustomValue && !props.inline) {
        setSelectedValue(null);
        setSelectedIndex(null);
      }
      if (value || !allowsCustomValue) {
        setOpenState(true);
        setActiveIndex(0);
      } else {
        setOpenState(false);
        setActiveIndex(null);
      }
    },
    [allowsCustomValue, props.inline, setInputValue, setOpenState, setSelectedValue],
  );

  const contextValue = useMemo<AutocompleteContextValue>(
    () => ({
      allowsCustomValue,
      open,
      inputValue,
      filterQuery,
      selectedValue,
      floatingContext,
      refs,
      floatingStyles,
      placement,
      getReferenceProps,
      getFloatingProps,
      getItemProps,
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
      focusInput,
      popupId,
      registerSelectedIndex,
      mounted,
      transitionProps,
    }),
    [
      allowsCustomValue,
      open,
      inputValue,
      filterQuery,
      selectedValue,
      floatingContext,
      refs,
      floatingStyles,
      placement,
      getReferenceProps,
      getFloatingProps,
      getItemProps,
      activeIndex,
      selectedIndex,
      handleSelect,
      handleInputChange,
      setOpen,
      focusInput,
      popupId,
      registerSelectedIndex,
      mounted,
      transitionProps,
    ],
  );

  return (
    <FloatingNode id={nodeId}>
      <AutocompleteContext.Provider value={contextValue}>{children}</AutocompleteContext.Provider>
    </FloatingNode>
  );
}

export function ComboboxRootInternal(props: ComboboxRootInternalProps) {
  const parentId = useFloatingParentNodeId();

  if (parentId === null) {
    return (
      <FloatingTree>
        <AutocompleteInner {...props} />
      </FloatingTree>
    );
  }

  return <AutocompleteInner {...props} />;
}

export function AutocompleteRoot({ onValueChange, ...props }: AutocompleteProps) {
  return (
    <ComboboxRootInternal
      {...props}
      onValueChange={value => {
        if (value !== null) {
          onValueChange?.(value);
        }
      }}
    />
  );
}
