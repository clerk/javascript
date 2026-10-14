'use client';

import {
  arrow,
  autoUpdate,
  flip,
  FloatingNode,
  FloatingTree,
  offset,
  type Placement,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useInteractions,
  useListNavigation,
  useRole,
  useTypeahead,
} from '@floating-ui/react';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useControllableState } from '../hooks/use-controllable-state';
import { useReturnFocus } from '../hooks/use-return-focus';
import { useTransition } from '../hooks/use-transition';
import { cssVars } from '../utils/css-vars';
import { alignSelectedItem } from './align-selected-item';
import { SelectContext, type SelectContextValue, type SelectItem } from './select-context';

export type { SelectItem } from './select-context';

interface SelectBaseProps {
  /** Array of `{ label, value }` items for label resolution before options mount. */
  items?: SelectItem[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * When true, the popup is positioned so the selected item overlays the
   * trigger — like a native `<select>`. Defaults to `true`. Falls back to
   * menu-like placement below the trigger when opened by touch, or when the
   * trigger sits too close to a viewport edge for the overlay to be usable.
   */
  alignItemWithTrigger?: boolean;
  placement?: Placement;
  sideOffset?: number;
  children: ReactNode;
}

export interface SelectSingleProps extends SelectBaseProps {
  multiple?: false;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export interface SelectMultipleProps extends SelectBaseProps {
  /** Lets several options be selected. Picking an option toggles it and keeps the popup open. */
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type SelectProps = SelectSingleProps | SelectMultipleProps;

function toValues(value: string | undefined): string[] | undefined {
  return value === undefined ? undefined : [value];
}

function SelectInner(props: SelectProps) {
  const {
    items,
    alignItemWithTrigger: alignProp = true,
    placement: placementProp = 'bottom-start',
    sideOffset = 4,
    children,
  } = props;
  const multiple = props.multiple === true;
  const onSingleValueChange = props.multiple ? undefined : props.onValueChange;
  const onMultipleValueChange = props.multiple ? props.onValueChange : undefined;

  const nodeId = useFloatingNodeId();

  const [open, setOpen] = useControllableState(props.open, props.defaultOpen ?? false, props.onOpenChange);

  const controlledValues = props.multiple ? props.value : toValues(props.value);
  const [selectedValues, setSelectedValues] = useControllableState<string[]>(
    controlledValues,
    (props.multiple ? props.defaultValue : toValues(props.defaultValue)) ?? [],
  );

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [cachedLabels, setCachedLabels] = useState<ReadonlyMap<string, string>>(new Map());
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const elementsRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);
  const arrowRef = useRef<SVGSVGElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const valueToLabelRef = useRef<Map<string, string>>(new Map());
  const selectedItemRef = useRef<HTMLElement | null>(null);
  const openRef = useRef(open);
  openRef.current = open;
  const openMethodRef = useRef<string | null>(null);
  const updateRef = useRef<() => void>(() => {});
  const [touchOpen, setTouchOpen] = useState(false);
  const [fallback, setFallback] = useState(false);
  const alignActive = alignProp && !touchOpen && !fallback;
  // Memoized so its held position survives re-renders during the exit transition.
  const align = useMemo(
    () =>
      alignSelectedItem({
        selectedItemRef,
        openRef,
        onFallback: () => setFallback(true),
        requestUpdate: () => updateRef.current(),
      }),
    [],
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        setTouchOpen(openMethodRef.current === 'touch');
      }
      setOpen(next);
    },
    [setOpen],
  );

  const {
    refs,
    floatingStyles,
    context: floatingContext,
    placement,
    update,
  } = useFloating({
    nodeId,
    open,
    onOpenChange: handleOpenChange,
    placement: placementProp,
    middleware: alignActive
      ? [offset(0), align, cssVars({ sideOffset })]
      : [
          offset(sideOffset),
          flip(),
          shift({ padding: 5 }),
          size({
            apply({ availableHeight, elements }) {
              Object.assign(elements.floating.style, {
                maxHeight: `${availableHeight}px`,
              });
            },
          }),
          arrow({ element: arrowRef }),
          cssVars({ sideOffset }),
        ],
    whileElementsMounted: autoUpdate,
  });

  updateRef.current = update;

  const returnFocusRef = useReturnFocus(floatingContext);

  const { mounted, transitionProps } = useTransition({
    open,
    ref: popupRef,
  });

  // Reset only once the popup is gone, or the exit transition would reposition.
  useEffect(() => {
    if (!mounted) {
      setFallback(false);
    }
  }, [mounted]);

  const isControlled = controlledValues !== undefined;

  const handleSelect = useCallback(
    (value: string, index: number) => {
      if (multiple) {
        const next = selectedValues.includes(value)
          ? selectedValues.filter(selected => selected !== value)
          : [...selectedValues, value];
        setSelectedValues(next);
        onMultipleValueChange?.(next);
        if (next.length === 0) {
          setSelectedIndex(null);
        }
      } else {
        setSelectedValues([value]);
        onSingleValueChange?.(value);
        setSelectedIndex(index);
      }
      // In controlled mode the parent decides whether to accept the new value.
      // If they reject it, the selection rolls back but a cached label would not,
      // showing a stale label. Only cache labels in uncontrolled mode where
      // the value always persists after selection.
      if (!isControlled) {
        const label = valueToLabelRef.current.get(value) ?? value;
        setCachedLabels(prev => new Map(prev).set(value, label));
      }
      if (!multiple) {
        handleOpenChange(false);
      }
    },
    [
      multiple,
      selectedValues,
      isControlled,
      setSelectedValues,
      handleOpenChange,
      onSingleValueChange,
      onMultipleValueChange,
    ],
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
      setSelectedIndex,
      multiple,
      selectedValues,
      cachedLabels: isControlled ? null : cachedLabels,
      elementsRef,
      labelsRef,
      popupRef,
      arrowRef,
      returnFocusRef,
      valueToLabelRef,
      selectedItemRef,
      openMethodRef,
      alignItemWithTrigger: alignActive,
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
      setSelectedIndex,
      multiple,
      selectedValues,
      cachedLabels,
      isControlled,
      returnFocusRef,
      alignActive,
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

export function SelectRoot(props: SelectProps) {
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
