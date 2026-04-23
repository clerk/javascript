'use client';

import {
  arrow,
  autoUpdate,
  type ExtendedRefs,
  FloatingArrow,
  type FloatingContext,
  FloatingFocusManager,
  FloatingList,
  FloatingNode,
  FloatingPortal,
  FloatingTree,
  flip,
  offset,
  type Placement,
  type ReferenceType,
  size,
  type UseInteractionsReturn,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useInteractions,
  useListItem,
  useListNavigation,
  useRole,
} from '@floating-ui/react';
import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useControllableState } from '../../hooks/use-controllable-state';
import { type TransitionProps, useFloatingTransition } from '../../hooks/use-floating-transition';
import { floatingCssVars } from '../../utils/floating-css-vars';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AutocompleteContextValue {
  open: boolean;
  inputValue: string;
  selectedValue: string | undefined;
  floatingContext: FloatingContext;
  refs: ExtendedRefs<ReferenceType>;
  floatingStyles: CSSProperties;
  placement: Placement;
  getReferenceProps: UseInteractionsReturn['getReferenceProps'];
  getFloatingProps: UseInteractionsReturn['getFloatingProps'];
  getItemProps: UseInteractionsReturn['getItemProps'];
  activeIndex: number | null;
  selectedIndex: number | null;
  elementsRef: React.MutableRefObject<Array<HTMLElement | null>>;
  labelsRef: React.MutableRefObject<Array<string | null>>;
  popupRef: React.RefObject<HTMLDivElement | null>;
  arrowRef: React.MutableRefObject<SVGSVGElement | null>;
  valuesByIndexRef: React.MutableRefObject<Map<number, string>>;
  setInlineMode: React.Dispatch<React.SetStateAction<boolean>>;
  handleSelect: (value: string, index: number, label: string) => void;
  handleInputChange: (value: string) => void;
  registerSelectedIndex: (index: number, value: string) => void;
  mounted: boolean;
  transitionProps: TransitionProps;
}

const AutocompleteContext = createContext<AutocompleteContextValue | null>(null);

function useAutocompleteContext() {
  const ctx = useContext(AutocompleteContext);
  if (!ctx) {
    throw new Error('Autocomplete compound components must be used within <Autocomplete>');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Autocomplete (root)
// ---------------------------------------------------------------------------

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

  // When open transitions to true, sync activeIndex to selectedIndex.
  // Supplements useListNavigation's built-in sync for timing edge cases.
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
          // Autocomplete supports two floating targets: Positioner (portal mode)
          // and List (inline mode). Both call refs.setFloating, but only
          // Positioner should be auto-sized. Skip when the floating element is
          // the inline List.
          if (elements.floating.getAttribute('data-cl-slot') !== 'autocomplete-positioner') return;
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${availableHeight}px`,
          });
        },
        padding: 5,
      }),
      arrow({ element: arrowRef }),
      floatingCssVars({ sideOffset }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const { mounted, transitionProps } = useFloatingTransition({
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

function AutocompleteRoot(props: AutocompleteProps) {
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

// ---------------------------------------------------------------------------
// Autocomplete.Input
// ---------------------------------------------------------------------------

export interface AutocompleteInputProps extends ComponentProps<'input'> {}

function AutocompleteInput(props: AutocompleteInputProps) {
  const { render, ...otherProps } = props;
  const {
    open,
    inputValue,
    activeIndex,
    refs,
    getReferenceProps,
    handleInputChange,
    handleSelect,
    labelsRef,
    valuesByIndexRef,
  } = useAutocompleteContext();

  const state = { open };

  const defaultProps = {
    'data-cl-slot': 'autocomplete-input',
    ...(getReferenceProps({
      ref: refs.setReference,
      value: inputValue,
      'aria-autocomplete': 'list' as const,
      onChange(event: React.ChangeEvent<HTMLInputElement>) {
        handleInputChange(event.target.value);
      },
      onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter' && activeIndex != null) {
          const value = valuesByIndexRef.current.get(activeIndex);
          const label = labelsRef.current[activeIndex];
          if (value != null) {
            event.preventDefault();
            handleSelect(value, activeIndex, label ?? value);
          }
        }
      },
    }) as React.ComponentPropsWithRef<'input'>),
  };

  return renderElement({
    defaultTagName: 'input',
    render,
    state,
    stateAttributesMapping: {
      open: (v: boolean): Record<string, string> | null => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
    },
    props: mergeProps<'input'>(defaultProps, otherProps),
  });
}

// ---------------------------------------------------------------------------
// Autocomplete.Portal
// ---------------------------------------------------------------------------

export interface AutocompletePortalProps {
  children: ReactNode;
}

function AutocompletePortal(props: AutocompletePortalProps) {
  const { mounted } = useAutocompleteContext();
  if (!mounted) return null;
  return <FloatingPortal>{props.children}</FloatingPortal>;
}

// ---------------------------------------------------------------------------
// Autocomplete.Positioner
// ---------------------------------------------------------------------------

export interface AutocompletePositionerProps extends ComponentProps<'div'> {}

function AutocompletePositioner(props: AutocompletePositionerProps) {
  const { render, ...otherProps } = props;
  const { mounted, floatingContext, refs, floatingStyles, placement, getFloatingProps, elementsRef, labelsRef } =
    useAutocompleteContext();

  const side = placement.split('-')[0];

  const defaultProps = {
    'data-cl-slot': 'autocomplete-positioner',
    'data-cl-side': side,
    ref: refs.setFloating,
    style: floatingStyles,
    ...(getFloatingProps() as React.ComponentPropsWithRef<'div'>),
  };

  return (
    <FloatingFocusManager
      context={floatingContext}
      initialFocus={-1}
      visuallyHiddenDismiss
      modal={false}
    >
      <FloatingList
        elementsRef={elementsRef}
        labelsRef={labelsRef}
      >
        {renderElement({
          defaultTagName: 'div',
          render,
          enabled: mounted,
          props: mergeProps<'div'>(defaultProps, otherProps),
        })}
      </FloatingList>
    </FloatingFocusManager>
  );
}

// ---------------------------------------------------------------------------
// Autocomplete.Popup
// ---------------------------------------------------------------------------

export interface AutocompletePopupProps extends ComponentProps<'div'> {}

function AutocompletePopup(props: AutocompletePopupProps) {
  const { render, ...otherProps } = props;
  const { popupRef, transitionProps } = useAutocompleteContext();

  const defaultProps = {
    'data-cl-slot': 'autocomplete-popup',
    ref: popupRef,
    ...transitionProps,
  };

  return renderElement({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
}

// ---------------------------------------------------------------------------
// Autocomplete.Option
// ---------------------------------------------------------------------------

export interface AutocompleteOptionProps extends ComponentProps<'div'> {
  value: string;
  label?: string;
  disabled?: boolean;
}

function AutocompleteOption(props: AutocompleteOptionProps) {
  const { render, value, label, disabled, ...otherProps } = props;
  const { activeIndex, selectedValue, getItemProps, handleSelect, valuesByIndexRef, registerSelectedIndex, refs } =
    useAutocompleteContext();

  const id = useId();
  const displayLabel = label ?? value;
  const { ref: itemRef, index } = useListItem({ label: displayLabel });

  const isSelected = selectedValue === value;
  const isActive = activeIndex === index;

  // Register value for index-based lookup (used by Enter key on input)
  useEffect(() => {
    valuesByIndexRef.current.set(index, value);
    registerSelectedIndex(index, value);
    return () => {
      valuesByIndexRef.current.delete(index);
    };
  }, [index, value, valuesByIndexRef, registerSelectedIndex]);

  const state = {
    selected: isSelected,
    active: isActive,
    disabled: !!disabled,
  };

  const defaultProps = {
    'data-cl-slot': 'autocomplete-option',
    id,
    ref: itemRef,
    role: 'option' as const,
    'aria-selected': isActive,
    'aria-disabled': disabled || undefined,
    ...(getItemProps({
      onClick() {
        if (!disabled) {
          handleSelect(value, index, displayLabel);
          (refs.domReference.current as HTMLElement | null)?.focus();
        }
      },
    }) as React.ComponentPropsWithRef<'div'>),
  };

  return renderElement({
    defaultTagName: 'div',
    render,
    state,
    stateAttributesMapping: {
      selected: (v: boolean) => (v ? { 'data-cl-selected': '' } : null),
      active: (v: boolean) => (v ? { 'data-cl-active': '' } : null),
      disabled: (v: boolean) => (v ? { 'data-cl-disabled': '' } : null),
    },
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
}

// ---------------------------------------------------------------------------
// Autocomplete.Arrow
// ---------------------------------------------------------------------------

export interface AutocompleteArrowProps extends React.ComponentPropsWithRef<typeof FloatingArrow> {}

function AutocompleteArrowComponent(props: AutocompleteArrowProps) {
  const { floatingContext, arrowRef, placement } = useAutocompleteContext();
  const side = placement.split('-')[0];

  return (
    <FloatingArrow
      data-cl-slot='autocomplete-arrow'
      data-cl-side={side}
      {...props}
      ref={arrowRef}
      context={floatingContext}
    />
  );
}

// ---------------------------------------------------------------------------
// Autocomplete.List
// ---------------------------------------------------------------------------

export interface AutocompleteListProps extends ComponentProps<'div'> {}

/**
 * Inline list wrapper that provides FloatingList context without portal or
 * positioning. Use this instead of Positioner + Popup when the Autocomplete
 * is rendered inside another floating element (e.g. a Popover).
 */
function AutocompleteList(props: AutocompleteListProps) {
  const { render, ...otherProps } = props;
  const { elementsRef, labelsRef, refs, getFloatingProps, setInlineMode } = useAutocompleteContext();

  useEffect(() => {
    setInlineMode(true);
    return () => setInlineMode(false);
  }, [setInlineMode]);

  const defaultProps = {
    'data-cl-slot': 'autocomplete-list',
    ref: refs.setFloating,
    ...(getFloatingProps() as React.ComponentPropsWithRef<'div'>),
  };

  return (
    <FloatingList
      elementsRef={elementsRef}
      labelsRef={labelsRef}
    >
      {
        renderElement({
          defaultTagName: 'div',
          render,
          props: mergeProps<'div'>(defaultProps, otherProps),
        })!
      }
    </FloatingList>
  );
}

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

export const Autocomplete = Object.assign(AutocompleteRoot, {
  Input: AutocompleteInput,
  Portal: AutocompletePortal,
  Positioner: AutocompletePositioner,
  Popup: AutocompletePopup,
  List: AutocompleteList,
  Option: AutocompleteOption,
  Arrow: AutocompleteArrowComponent,
});
