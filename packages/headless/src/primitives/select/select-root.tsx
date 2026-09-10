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

import { useControllableState } from '../../hooks/use-controllable-state';
import { useReturnFocus } from '../../hooks/use-return-focus';
import { useTransition } from '../../hooks/use-transition';
import { cssVars } from '../../utils/css-vars';
import { alignSelectedItem } from './align-selected-item';
import { SelectContext, type SelectContextValue, type SelectItem } from './select-context';

export type { SelectItem } from './select-context';

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
   * trigger — like a native `<select>`. Defaults to `true`. Falls back to
   * menu-like placement below the trigger when opened by touch, or when the
   * trigger sits too close to a viewport edge for the overlay to be usable.
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
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
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

  const isControlled = props.value !== undefined;

  const handleSelect = useCallback(
    (value: string, index: number) => {
      setSelectedValue(value);
      setSelectedIndex(index);
      // In controlled mode the parent decides whether to accept the new value.
      // If they reject it, selectedValue rolls back but selectedLabel would not,
      // showing a stale label. Only cache the label in uncontrolled mode where
      // the value always persists after selection.
      if (!isControlled) {
        setSelectedLabel(valueToLabelRef.current.get(value) ?? value);
      }
      handleOpenChange(false);
    },
    [isControlled, setSelectedValue, handleOpenChange],
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
      selectedValue,
      selectedLabel,
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
      selectedValue,
      selectedLabel,
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
