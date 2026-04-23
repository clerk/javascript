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
  type Middleware,
  offset,
  type Placement,
  type ReferenceType,
  shift,
  size,
  type UseInteractionsReturn,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useInteractions,
  useListItem,
  useListNavigation,
  useMergeRefs,
  useRole,
  useTypeahead,
} from '@floating-ui/react';
import {
  type CSSProperties,
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useControllableState } from '../../hooks/use-controllable-state';
import { type TransitionProps, useFloatingTransition } from '../../hooks/use-floating-transition';
import { floatingCssVars } from '../../utils/floating-css-vars';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SelectItem {
  label: string;
  value: string;
}

// ---------------------------------------------------------------------------
// Label resolution
// ---------------------------------------------------------------------------

function resolveLabel(
  value: string | undefined,
  items: SelectItem[] | undefined,
  valueToLabelRef: React.MutableRefObject<Map<string, string>>,
): string | null {
  if (value === undefined) return null;
  // 1. items prop (available before options mount)
  if (items) {
    const item = items.find(i => i.value === value);
    if (item) return item.label;
  }
  // 2. runtime registry (populated after options mount)
  const label = valueToLabelRef.current.get(value);
  if (label) return label;
  // 3. fallback to raw value
  return value;
}

// ---------------------------------------------------------------------------
// alignSelectedItem middleware
// ---------------------------------------------------------------------------

/**
 * Custom floating-ui middleware that positions the floating element so the
 * selected item overlays the reference (trigger), like a native `<select>`.
 * Running as middleware means it automatically re-runs on scroll/resize via
 * `autoUpdate`, preventing drift.
 */
function alignSelectedItem(selectedItemRef: RefObject<HTMLElement | null>): Middleware {
  return {
    name: 'alignSelectedItem',
    fn({ elements }) {
      const selectedEl = selectedItemRef.current;
      if (!selectedEl) return {};

      const floatingRect = elements.floating.getBoundingClientRect();
      const selectedRect = selectedEl.getBoundingClientRect();
      const referenceRect = (elements.reference as HTMLElement).getBoundingClientRect();

      // How far the selected item is from the top of the floating element
      const itemOffsetInPopup = selectedRect.top - floatingRect.top;

      // Position so the selected item sits at the same Y as the trigger
      const desiredTop = referenceRect.top - itemOffsetInPopup;

      // Clamp to viewport with 8px padding
      const viewportHeight = window.innerHeight;
      const clampedTop = Math.max(8, Math.min(desiredTop, viewportHeight - floatingRect.height - 8));

      return {
        x: referenceRect.left,
        y: clampedTop,
      };
    },
  };
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface SelectContextValue {
  open: boolean;
  items: SelectItem[] | undefined;
  floatingContext: FloatingContext;
  refs: ExtendedRefs<ReferenceType>;
  floatingStyles: CSSProperties;
  placement: Placement;
  getReferenceProps: UseInteractionsReturn['getReferenceProps'];
  getFloatingProps: UseInteractionsReturn['getFloatingProps'];
  getItemProps: UseInteractionsReturn['getItemProps'];
  activeIndex: number | null;
  setActiveIndex: React.Dispatch<React.SetStateAction<number | null>>;
  selectedIndex: number | null;
  selectedValue: string | undefined;
  selectedLabel: string | null;
  elementsRef: React.MutableRefObject<Array<HTMLElement | null>>;
  labelsRef: React.MutableRefObject<Array<string | null>>;
  popupRef: RefObject<HTMLDivElement | null>;
  arrowRef: React.MutableRefObject<SVGSVGElement | null>;
  valueToLabelRef: React.MutableRefObject<Map<string, string>>;
  selectedItemRef: React.MutableRefObject<HTMLElement | null>;
  alignItemWithTrigger: boolean;
  handleSelect: (value: string, index: number) => void;
  mounted: boolean;
  transitionProps: TransitionProps;
}

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const ctx = useContext(SelectContext);
  if (!ctx) {
    throw new Error('Select compound components must be used within <Select>');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Select (root)
// ---------------------------------------------------------------------------

export interface SelectProps {
  /** Array of `{ label, value }` items for label resolution before options mount. */
  items?: SelectItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * When true, the popup is positioned so the selected item overlays the
   * trigger — like a native `<select>`. Defaults to `true`.
   */
  alignItemWithTrigger?: boolean;
  placement?: Placement;
  sideOffset?: number;
  children: ReactNode;
}

function SelectInner(props: SelectProps) {
  const {
    items,
    alignItemWithTrigger: alignProp = true,
    placement: placementProp = 'bottom-start',
    sideOffset = 4,
    children,
  } = props;

  const nodeId = useFloatingNodeId();

  const [open, setOpen] = useControllableState(props.open, props.defaultOpen ?? false, props.onOpenChange);

  const [selectedValue, setSelectedValue] = useControllableState<string | undefined>(
    props.value,
    props.defaultValue,
    props.onValueChange as ((value: string | undefined) => void) | undefined,
  );

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // Label captured at selection time — survives option unmount
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const elementsRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);
  const arrowRef = useRef<SVGSVGElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const valueToLabelRef = useRef<Map<string, string>>(new Map());
  const selectedItemRef = useRef<HTMLElement | null>(null);

  const {
    refs,
    floatingStyles,
    context: floatingContext,
    placement,
  } = useFloating({
    nodeId,
    open,
    onOpenChange: setOpen,
    placement: placementProp,
    middleware: [
      offset(alignProp ? 0 : sideOffset),
      ...(!alignProp ? [flip(), shift({ padding: 5 })] : []),
      size({
        apply({ availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${availableHeight}px`,
          });
        },
      }),
      ...(!alignProp ? [arrow({ element: arrowRef })] : []),
      ...(alignProp ? [alignSelectedItem(selectedItemRef)] : []),
      floatingCssVars({ sideOffset }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const { mounted, transitionProps } = useFloatingTransition({
    open,
    ref: popupRef,
  });

  const handleSelect = useCallback(
    (value: string, index: number) => {
      setSelectedValue(value);
      setSelectedIndex(index);
      setSelectedLabel(valueToLabelRef.current.get(value) ?? value);
      setOpen(false);
    },
    [setSelectedValue, setOpen],
  );

  const handleTypeaheadMatch = useCallback(
    (index: number | null) => {
      if (open) {
        setActiveIndex(index);
      } else if (index !== null) {
        setSelectedIndex(index);
      }
    },
    [open],
  );

  const click = useClick(floatingContext);
  const dismiss = useDismiss(floatingContext);
  const role = useRole(floatingContext, { role: 'listbox' });
  const listNav = useListNavigation(floatingContext, {
    listRef: elementsRef,
    activeIndex,
    selectedIndex,
    onNavigate: setActiveIndex,
    loop: true,
  });
  const typeahead = useTypeahead(floatingContext, {
    listRef: labelsRef,
    activeIndex,
    selectedIndex,
    onMatch: handleTypeaheadMatch,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    click,
    dismiss,
    role,
    listNav,
    typeahead,
  ]);

  const contextValue = useMemo<SelectContextValue>(
    () => ({
      open,
      items,
      floatingContext,
      refs,
      floatingStyles,
      placement,
      getReferenceProps,
      getFloatingProps,
      getItemProps,
      activeIndex,
      setActiveIndex,
      selectedIndex,
      selectedValue,
      selectedLabel,
      elementsRef,
      labelsRef,
      popupRef,
      arrowRef,
      valueToLabelRef,
      selectedItemRef,
      alignItemWithTrigger: alignProp,
      handleSelect,
      mounted,
      transitionProps,
    }),
    [
      open,
      items,
      floatingContext,
      refs,
      floatingStyles,
      placement,
      getReferenceProps,
      getFloatingProps,
      getItemProps,
      activeIndex,
      setActiveIndex,
      selectedIndex,
      selectedValue,
      selectedLabel,
      alignProp,
      handleSelect,
      mounted,
      transitionProps,
    ],
  );

  return (
    <FloatingNode id={nodeId}>
      <SelectContext.Provider value={contextValue}>{children}</SelectContext.Provider>
    </FloatingNode>
  );
}

function SelectRoot(props: SelectProps) {
  const parentId = useFloatingParentNodeId();

  if (parentId === null) {
    return (
      <FloatingTree>
        <SelectInner {...props} />
      </FloatingTree>
    );
  }

  return <SelectInner {...props} />;
}

// ---------------------------------------------------------------------------
// Select.Trigger
// ---------------------------------------------------------------------------

export interface SelectTriggerProps extends ComponentProps<'button'> {}

function SelectTrigger(props: SelectTriggerProps) {
  const { render, ...otherProps } = props;
  const { open, refs, getReferenceProps } = useSelectContext();

  const state = { open };

  const defaultProps = {
    type: 'button' as const,
    'data-cl-slot': 'select-trigger',
    ref: refs.setReference,
    ...(getReferenceProps() as React.ComponentPropsWithRef<'button'>),
  };

  return renderElement({
    defaultTagName: 'button',
    render,
    state,
    stateAttributesMapping: {
      open: (v: boolean): Record<string, string> | null => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
    },
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
}

// ---------------------------------------------------------------------------
// Select.Value
// ---------------------------------------------------------------------------

export interface SelectValueProps extends ComponentProps<'span'> {
  placeholder?: ReactNode;
}

function SelectValue(props: SelectValueProps) {
  const { render, placeholder, ...otherProps } = props;
  const { selectedValue, selectedLabel, items, valueToLabelRef } = useSelectContext();

  const displayText =
    selectedValue !== undefined ? (selectedLabel ?? resolveLabel(selectedValue, items, valueToLabelRef)) : placeholder;

  const defaultProps = {
    'data-cl-slot': 'select-value',
    children: displayText,
  };

  return renderElement({
    defaultTagName: 'span',
    render,
    props: mergeProps<'span'>(defaultProps, otherProps),
  });
}

// ---------------------------------------------------------------------------
// Select.Portal
// ---------------------------------------------------------------------------

export interface SelectPortalProps {
  children: ReactNode;
}

function SelectPortal(props: SelectPortalProps) {
  const { mounted } = useSelectContext();
  if (!mounted) return null;
  return <FloatingPortal>{props.children}</FloatingPortal>;
}

// ---------------------------------------------------------------------------
// Select.Positioner
// ---------------------------------------------------------------------------

export interface SelectPositionerProps extends ComponentProps<'div'> {}

function SelectPositioner(props: SelectPositionerProps) {
  const { render, ...otherProps } = props;
  const {
    mounted,
    floatingContext,
    refs,
    floatingStyles,
    placement,
    getFloatingProps,
    elementsRef,
    labelsRef,
    setActiveIndex,
  } = useSelectContext();

  const side = placement.split('-')[0];

  const defaultProps = {
    'data-cl-slot': 'select-positioner',
    'data-cl-side': side,
    ref: refs.setFloating,
    style: floatingStyles,
    ...(getFloatingProps({
      onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
        if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          const items = elementsRef.current;
          if (event.key === 'Home') {
            const firstEnabled = items.findIndex(el => el != null && !el.hasAttribute('aria-disabled'));
            if (firstEnabled !== -1) setActiveIndex(firstEnabled);
          } else {
            for (let i = items.length - 1; i >= 0; i--) {
              if (items[i] != null && !items[i]!.hasAttribute('aria-disabled')) {
                setActiveIndex(i);
                break;
              }
            }
          }
        }
      },
    }) as React.ComponentPropsWithRef<'div'>),
  };

  return (
    <FloatingFocusManager
      context={floatingContext}
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
// Select.Popup
// ---------------------------------------------------------------------------

export interface SelectPopupProps extends ComponentProps<'div'> {}

function SelectPopup(props: SelectPopupProps) {
  const { render, ...otherProps } = props;
  const { popupRef, transitionProps } = useSelectContext();

  const defaultProps = {
    'data-cl-slot': 'select-popup',
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
// Select.Option
// ---------------------------------------------------------------------------

export interface SelectOptionProps extends ComponentProps<'button'> {
  value: string;
  label?: string;
  disabled?: boolean;
}

function SelectOption(props: SelectOptionProps) {
  const { render, value, label, disabled, ...otherProps } = props;
  const { activeIndex, selectedValue, getItemProps, handleSelect, valueToLabelRef, selectedItemRef } =
    useSelectContext();

  const displayLabel = label ?? value;
  const { ref: itemRef, index } = useListItem({ label: displayLabel });

  const isSelected = selectedValue === value;
  const isActive = activeIndex === index;

  // Register value→label mapping for Select.Value display
  useEffect(() => {
    valueToLabelRef.current.set(value, displayLabel);
    return () => {
      valueToLabelRef.current.delete(value);
    };
  }, [value, displayLabel, valueToLabelRef]);

  // Track the selected item element for alignItemWithTrigger
  const combinedRef = useMergeRefs([itemRef, isSelected ? selectedItemRef : null]);

  const state = {
    selected: isSelected,
    active: isActive,
    disabled: !!disabled,
  };

  const defaultProps = {
    'data-cl-slot': 'select-option',
    ref: combinedRef,
    role: 'option' as const,
    'aria-selected': isSelected,
    'aria-disabled': disabled || undefined,
    tabIndex: isActive ? 0 : -1,
    ...(getItemProps({
      onClick() {
        if (!disabled) handleSelect(value, index);
      },
    }) as React.ComponentPropsWithRef<'button'>),
  };

  return renderElement({
    defaultTagName: 'button',
    render,
    state,
    stateAttributesMapping: {
      selected: (v: boolean) => (v ? { 'data-cl-selected': '' } : null),
      active: (v: boolean) => (v ? { 'data-cl-active': '' } : null),
      disabled: (v: boolean) => (v ? { 'data-cl-disabled': '' } : null),
    },
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
}

// ---------------------------------------------------------------------------
// Select.Arrow
// ---------------------------------------------------------------------------

export interface SelectArrowProps extends React.ComponentPropsWithRef<typeof FloatingArrow> {}

function SelectArrowComponent(props: SelectArrowProps) {
  const { floatingContext, arrowRef, placement } = useSelectContext();
  const side = placement.split('-')[0];

  return (
    <FloatingArrow
      data-cl-slot='select-arrow'
      data-cl-side={side}
      {...props}
      ref={arrowRef}
      context={floatingContext}
    />
  );
}

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

export const Select = Object.assign(SelectRoot, {
  Trigger: SelectTrigger,
  Value: SelectValue,
  Portal: SelectPortal,
  Positioner: SelectPositioner,
  Popup: SelectPopup,
  Option: SelectOption,
  Arrow: SelectArrowComponent,
});
