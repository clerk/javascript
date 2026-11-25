'use client';

import {
  arrow,
  autoUpdate,
  type ElementProps,
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
import { type ReactElement, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useControllableState } from '../hooks/use-controllable-state';
import { useReturnFocus } from '../hooks/use-return-focus';
import { useTransition } from '../hooks/use-transition';
import { cssVars } from '../utils/css-vars';
import { alignSelectedItem } from './align-selected-item';
import {
  SelectContext,
  type SelectContextValue,
  SelectHighlightContext,
  type SelectHighlightContextValue,
  type SelectItem,
  SelectItemsContext,
  type SelectItemsContextValue,
} from './select-context';

export type { SelectItem } from './select-context';

interface SelectBaseProps<Value> {
  /** Array of `{ label, value }` items for label resolution before items mount. */
  items?: SelectItem<Value>[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * When true, the popup is positioned so the selected item overlays the
   * trigger — like a native `<select>`. Defaults to `true`. Falls back to
   * menu-like placement below the trigger when opened by touch, when nothing
   * is selected, or when the trigger sits too close to a viewport edge for the
   * overlay to be usable.
   */
  alignItemWithTrigger?: boolean;
  placement?: Placement;
  sideOffset?: number;
  children: ReactNode;
}

export interface SelectSingleProps<Value = string> extends SelectBaseProps<Value> {
  multiple?: false;
  value?: Value | null;
  defaultValue?: Value | null;
  onValueChange?: (value: Value) => void;
}

export interface SelectMultipleProps<Value = string> extends SelectBaseProps<Value> {
  /** Lets several items be selected. Picking an item toggles it and keeps the popup open. */
  multiple: true;
  value?: Value[];
  defaultValue?: Value[];
  onValueChange?: (value: Value[]) => void;
}

export type SelectProps<Value = string> = SelectSingleProps<Value> | SelectMultipleProps<Value>;

function toValues(value: unknown): unknown[] | undefined {
  if (value === undefined) {
    return undefined;
  }
  return value === null ? [] : [value];
}

function SelectInner(props: SelectProps<unknown>) {
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

  const singleValue = props.multiple ? undefined : props.value;
  const controlledSingle = useMemo(() => toValues(singleValue), [singleValue]);
  const controlledValues = props.multiple ? props.value : controlledSingle;
  const [selectedValues, setSelectedValues] = useControllableState<unknown[]>(
    controlledValues,
    (props.multiple ? props.defaultValue : toValues(props.defaultValue)) ?? [],
  );

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [cachedLabels, setCachedLabels] = useState<ReadonlyMap<unknown, string>>(new Map());
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [options, setOptions] = useState<ReadonlyMap<unknown, boolean>>(new Map());
  const enabledValues = useMemo(
    () => [...options].flatMap(([value, disabled]) => (disabled ? [] : [value])),
    [options],
  );

  const elementsRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);
  const arrowRef = useRef<SVGSVGElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const valueToLabelRef = useRef<Map<unknown, string>>(new Map());
  const selectedItemRef = useRef<HTMLElement | null>(null);
  const openRef = useRef(open);
  // eslint-disable-next-line react/refs -- This ref holds an imperative resource or the latest callback outside React state.
  openRef.current = open;
  const openMethodRef = useRef<string | null>(null);
  const updateRef = useRef<() => void>(() => {});
  const [touchOpen, setTouchOpen] = useState(false);
  const [fallback, setFallback] = useState(false);
  const alignActive = alignProp && !touchOpen && !fallback;
  // Memoized so its held position survives re-renders during the exit transition.
  const align = useMemo(
    () =>
      // eslint-disable-next-line react/refs -- This ref holds an imperative resource or the latest callback outside React state.
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
    [setOpen, setTouchOpen],
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
          // eslint-disable-next-line react/refs -- This ref holds an imperative resource or the latest callback outside React state.
          arrow({ element: arrowRef }),
          cssVars({ sideOffset }),
        ],
    whileElementsMounted: autoUpdate,
  });

  // eslint-disable-next-line react/refs -- This ref holds an imperative resource or the latest callback outside React state.
  updateRef.current = update;

  const returnFocusRef = useReturnFocus(floatingContext);

  const { mounted, transitionProps } = useTransition({
    open,
    ref: popupRef,
  });

  // Reset only once the popup is gone, or the exit transition would reposition.
  useEffect(() => {
    if (!mounted) {
      // eslint-disable-next-line react/set-state-in-effect -- Recompute positioning fallback after the selected item changes.
      setFallback(false);
    }
  }, [mounted]);

  const isControlled = controlledValues !== undefined;

  const cacheLabels = useCallback(
    (values: unknown[]) => {
      // In controlled mode the parent decides whether to accept the new value.
      // If they reject it, the selection rolls back but a cached label would not,
      // showing a stale label. Only cache labels in uncontrolled mode where
      // the value always persists after selection.
      if (isControlled) {
        return;
      }
      setCachedLabels(prev => {
        const next = new Map(prev);
        for (const value of values) {
          const label = valueToLabelRef.current.get(value);
          if (label !== undefined) {
            next.set(value, label);
          }
        }
        return next;
      });
    },
    [isControlled],
  );

  const commitMultiple = useCallback(
    (next: unknown[]) => {
      setSelectedValues(next);
      onMultipleValueChange?.(next);
      if (next.length === 0) {
        setSelectedIndex(null);
      }
    },
    [setSelectedValues, onMultipleValueChange],
  );

  const handleSelect = useCallback(
    (value: unknown, index: number) => {
      if (multiple) {
        commitMultiple(
          selectedValues.some(selected => Object.is(selected, value))
            ? selectedValues.filter(selected => !Object.is(selected, value))
            : [...selectedValues, value],
        );
      } else {
        setSelectedValues([value]);
        onSingleValueChange?.(value);
        setSelectedIndex(index);
      }
      cacheLabels([value]);
      if (!multiple) {
        handleOpenChange(false);
      }
    },
    [multiple, selectedValues, setSelectedValues, commitMultiple, cacheLabels, handleOpenChange, onSingleValueChange],
  );

  const toggleAll = useCallback(() => {
    if (!multiple || enabledValues.length === 0) {
      return;
    }
    const next = toggleAllValues(selectedValues, enabledValues);
    commitMultiple(next);
    cacheLabels(next);
  }, [multiple, selectedValues, enabledValues, commitMultiple, cacheLabels]);

  const registerItem = useCallback((value: unknown, disabled: boolean) => {
    setOptions(prev => new Map(prev).set(value, disabled));
    return () =>
      setOptions(prev => {
        const next = new Map(prev);
        next.delete(value);
        return next;
      });
  }, []);

  const selectAllShortcut = useMemo<ElementProps>(
    () => ({
      floating: {
        onKeyDown(event) {
          if (multiple && event.key.toLowerCase() === 'a' && (event.ctrlKey || event.metaKey) && !event.altKey) {
            event.preventDefault();
            toggleAll();
          }
        },
      },
    }),
    [multiple, toggleAll],
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
    selectAllShortcut,
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
      enabledValues,
      toggleAll,
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
      enabledValues,
      toggleAll,
      mounted,
      transitionProps,
    ],
  );

  const itemsContextValue = useMemo<SelectItemsContextValue>(
    () => ({
      getItemProps,
      handleSelect,
      registerItem,
      setSelectedIndex,
      valueToLabelRef,
      selectedItemRef,
    }),
    [getItemProps, handleSelect, registerItem],
  );

  const highlightContextValue = useMemo<SelectHighlightContextValue>(
    () => ({ activeIndex, selectedValues }),
    [activeIndex, selectedValues],
  );

  return (
    <FloatingNode id={nodeId}>
      <SelectContext.Provider value={contextValue}>
        <SelectItemsContext.Provider value={itemsContextValue}>
          <SelectHighlightContext.Provider value={highlightContextValue}>{children}</SelectHighlightContext.Provider>
        </SelectItemsContext.Provider>
      </SelectContext.Provider>
    </FloatingNode>
  );
}

function toggleAllValues(selected: unknown[], enabled: unknown[]): unknown[] {
  const isSelected = (value: unknown) => selected.some(item => Object.is(item, value));
  if (enabled.every(isSelected)) {
    return selected.filter(item => !enabled.some(value => Object.is(value, item)));
  }
  return [...selected, ...enabled.filter(value => !isSelected(value))];
}

// eslint-disable-next-line typescript/consistent-type-assertions -- The implementation is value-agnostic; the root only hands back values its caller passed in.
export const SelectRoot = function SelectRoot(props: SelectProps<unknown>) {
  const parentId = useFloatingParentNodeId();

  if (parentId === null) {
    return (
      <FloatingTree>
        <SelectInner {...props} />
      </FloatingTree>
    );
  }

  return <SelectInner {...props} />;
} as <Value = string>(props: SelectProps<Value>) => ReactElement;
