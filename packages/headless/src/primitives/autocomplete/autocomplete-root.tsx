'use client';

import {
  arrow,
  autoUpdate,
  FloatingNode,
  FloatingTree,
  flip,
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

function AutocompleteInner(props: AutocompleteProps) {
  const { placement: placementProp = 'bottom-start', sideOffset = 4, children } = props;

  const nodeId = useFloatingNodeId();

  const [open, setOpen] = useControllableState(props.open, props.defaultOpen ?? false, props.onOpenChange);

  const [inputValue, setInputValue] = useControllableState(
    props.inputValue,
    props.defaultInputValue ?? '',
    props.onInputValueChange,
  );

  const [selectedValue, setSelectedValue] = useControllableState<string | undefined>(
    props.value,
    props.defaultValue,
    props.onValueChange as ((value: string | undefined) => void) | undefined,
  );

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [inlineMode, setInlineMode] = useState(false);

  const elementsRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);
  const arrowRef = useRef<SVGSVGElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const valuesByIndexRef = useRef<Map<number, string>>(new Map());
  const registerSelectedIndex = useCallback(
    (index: number, value: string) => {
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
          if (elements.floating.getAttribute('data-cl-slot') !== 'autocomplete-positioner') return;
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
    outsidePress: !inlineMode,
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

  const handleSelect = useCallback(
    (value: string, index: number, label: string) => {
      setSelectedValue(value);
      setSelectedIndex(index);
      setInputValue(label);
      setActiveIndex(null);
      setOpen(false);
    },
    [setSelectedValue, setInputValue, setOpen],
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      if (value) {
        setOpen(true);
        setActiveIndex(0);
      } else {
        setOpen(false);
        setActiveIndex(null);
      }
    },
    [setInputValue, setOpen],
  );

  const contextValue = useMemo<AutocompleteContextValue>(
    () => ({
      open,
      inputValue,
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
      arrowRef,
      valuesByIndexRef,
      setInlineMode,
      handleSelect,
      handleInputChange,
      registerSelectedIndex,
      mounted,
      transitionProps,
    }),
    [
      open,
      inputValue,
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

export function AutocompleteRoot(props: AutocompleteProps) {
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
