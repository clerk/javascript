'use client';

import {
  arrow,
  autoUpdate,
  flip,
  FloatingNode,
  FloatingTree,
  type Middleware,
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
import { type ReactNode, type RefObject, useCallback, useMemo, useRef, useState } from 'react';

import { useControllableState } from '../../hooks/use-controllable-state';
import { useTransition } from '../../hooks/use-transition';
import { cssVars } from '../../utils/css-vars';
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
   * trigger — like a native `<select>`. Defaults to `true`.
   */
  alignItemWithTrigger?: boolean;
  placement?: Placement;
  sideOffset?: number;
  children: ReactNode;
}

function alignSelectedItem(selectedItemRef: RefObject<HTMLElement | null>): Middleware {
  return {
    name: 'alignSelectedItem',
    fn({ elements }) {
      const selectedEl = selectedItemRef.current;
      if (!selectedEl) {
        return {};
      }

      const floatingRect = elements.floating.getBoundingClientRect();
      const selectedRect = selectedEl.getBoundingClientRect();
      const referenceRect = (elements.reference as HTMLElement).getBoundingClientRect();

      const itemOffsetInPopup = selectedRect.top - floatingRect.top;
      const desiredTop = referenceRect.top - itemOffsetInPopup;

      const viewportHeight = window.innerHeight;
      const clampedTop = Math.max(8, Math.min(desiredTop, viewportHeight - floatingRect.height - 8));

      return {
        x: referenceRect.left,
        y: clampedTop,
      };
    },
  };
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
      cssVars({ sideOffset }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const { mounted, transitionProps } = useTransition({
    open,
    ref: popupRef,
  });

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
      setOpen(false);
    },
    [isControlled, setSelectedValue, setOpen],
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
      setSelectedIndex,
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
