'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { BarSelectionContext, type BarSelectionContextValue, hasArea, useBarChartContext } from './bar-chart-context';
import type { StackedBarLayout } from './bar-chart-layout';
import {
  getActiveBar,
  getKeyboardAnnouncement,
  getKeyIntent,
  hitTest,
  isSelectable,
  NO_SELECTION,
  resolveSelection,
  sameSelection,
  type Selected,
  selectedState,
  type SelectionAction,
  selectionReducer,
} from './bar-chart-selection';
import type { ActiveBar, BarCategory, BarSection, BarSelection, ChartSize } from './types';

const VISUALLY_HIDDEN_STYLE: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: 0,
};

export type BarChartBarSelectionProps<TDatum = unknown> = ComponentProps<'div'> & {
  /** Receives the selected category and section, or null. Read values from current data. */
  onActiveChange?: (active: BarSelection | null) => void;
  /** Called on click, Enter or Space. Makes the surface a button. */
  onActivate?: (active: ActiveBar<TDatum>) => void;
  /** Names a category in announcements. Default: the category key */
  formatCategory?: (category: string) => string | null;
};

/** Coalesces pointer moves into at most one selection update per frame. */
function useFramePointerUpdates(onFrame: (selection: Selected | null) => void, layout: unknown) {
  const pendingRef = React.useRef<Selected | null | undefined>(undefined);
  const frameRef = React.useRef<number | null>(null);
  const cancel = React.useCallback(() => {
    pendingRef.current = undefined;
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);
  // A new layout invalidates a pending hit test.
  React.useLayoutEffect(() => cancel, [cancel, layout]);

  const schedule = (selection: Selected | null) => {
    pendingRef.current = selection;
    if (frameRef.current !== null) {
      return;
    }
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const pending = pendingRef.current;
      pendingRef.current = undefined;
      if (pending !== undefined) {
        onFrame(pending);
      }
    });
  };
  const pendingSection = () => pendingRef.current?.section ?? undefined;
  return { schedule, cancel, pendingSection };
}

/** Calls `onActiveChange` when the active bar changes and on unmount. */
function usePublishActive(
  active: BarSelection | null,
  onActiveChange: ((active: BarSelection | null) => void) | undefined,
) {
  const onActiveChangeRef = React.useRef(onActiveChange);
  const publishedRef = React.useRef<BarSelection | null>(null);
  React.useLayoutEffect(() => {
    onActiveChangeRef.current = onActiveChange;
  }, [onActiveChange]);
  React.useLayoutEffect(() => {
    if (sameSelection(active, publishedRef.current)) {
      return;
    }
    publishedRef.current = active;
    onActiveChangeRef.current?.(active);
  });
  React.useEffect(
    () => () => {
      if (publishedRef.current) {
        onActiveChangeRef.current?.(null);
      }
    },
    [],
  );
}

/** Holds the selection and drops it when its category or section disappears. */
function useBarSelection(categories: readonly BarCategory[]) {
  const [state, dispatch] = React.useReducer(selectionReducer, NO_SELECTION);
  const categoryByKey = React.useMemo(
    () => new Map(categories.map(category => [category.key, category])),
    [categories],
  );
  const stored = selectedState(state);
  const storedCategory = stored ? categoryByKey.get(stored.category) : undefined;
  const isValid = !!stored && !!storedCategory && isSelectable(stored, storedCategory);
  return {
    state,
    selection: isValid ? stored : null,
    selectedCategory: isValid ? storedCategory : undefined,
    categoryByKey,
    dispatch,
  };
}

function KeyboardInstructions({
  id,
  canActivate,
  announcement,
}: Readonly<{ id: string; canActivate: boolean; announcement: string }>) {
  return (
    <>
      <span
        id={id}
        style={VISUALLY_HIDDEN_STYLE}
      >
        Use Left and Right to choose a period, or Home and End to jump to the first or last. Use Up and Down to choose
        positive or negative values. {canActivate ? 'Press Enter or Space to open the selected period. ' : ''}
        Press Escape to dismiss.
      </span>
      <span
        role='status'
        style={VISUALLY_HIDDEN_STYLE}
      >
        {announcement}
      </span>
    </>
  );
}

// eslint-disable-next-line typescript/consistent-type-assertions -- The ref wrapper drops the row type parameter; `onActivate` only receives rows the chart was given.
export const BarChartBarSelection = React.forwardRef<HTMLDivElement, BarChartBarSelectionProps>(
  function BarChartBarSelection(props, ref) {
    const { frame, layout, data, ariaLabel, registerInteraction, setActiveCategory } =
      useBarChartContext('BarSelection');
    React.useLayoutEffect(registerInteraction, [registerInteraction]);
    if (!hasArea(frame.size) || layout.categories.length === 0) {
      return null;
    }
    return (
      <BarSelectionSurface
        {...props}
        forwardedRef={ref}
        data={data}
        layout={layout}
        size={frame.size}
        ariaLabel={ariaLabel}
        setActiveCategory={setActiveCategory}
      />
    );
  },
) as <TDatum = unknown>(
  props: BarChartBarSelectionProps<TDatum> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;

const formatCategoryKey = (category: string) => category;

type SurfaceProps = BarChartBarSelectionProps & {
  forwardedRef: React.ForwardedRef<HTMLDivElement>;
  data: readonly unknown[];
  layout: StackedBarLayout<unknown>;
  size: ChartSize;
  ariaLabel: string;
  setActiveCategory: (category: string | null) => void;
};

function BarSelectionSurface({
  forwardedRef,
  data,
  layout,
  size,
  ariaLabel,
  setActiveCategory,
  onActiveChange,
  onActivate,
  formatCategory = formatCategoryKey,
  children,
  render,
  ...otherProps
}: SurfaceProps) {
  const chartBoxRef = React.useRef<HTMLDivElement | null>(null);
  const { state, selection, selectedCategory, categoryByKey, dispatch } = useBarSelection(layout.categories);
  const surfaceRef = React.useRef<HTMLDivElement>(null);
  const lastIndexRef = React.useRef(0);
  const keyboardInstructionsId = React.useId();
  const [tooltipCount, setTooltipCount] = React.useState(0);
  const registerTooltip = React.useCallback(() => {
    setTooltipCount(count => count + 1);
    return () => setTooltipCount(count => count - 1);
  }, []);
  const pointerUpdates = useFramePointerUpdates(next => dispatch({ type: 'pointer', selection: next }), layout);

  const selectedSection = selection?.section ?? undefined;
  const selectedIndex = selectedCategory?.datumIndex;
  React.useLayoutEffect(() => {
    if (selectedIndex !== undefined) {
      lastIndexRef.current = selectedIndex;
    }
  }, [selectedIndex]);
  const keyboardIndex = () => selectedIndex ?? lastIndexRef.current;
  const keyboardAnnouncement = getKeyboardAnnouncement(selection, selectedCategory, formatCategory);

  // A tap fires no pointerleave or blur, so a tap anywhere else dismisses.
  const hasPointerSelection = selection?.source === 'pointer';
  React.useEffect(() => {
    if (!hasPointerSelection) {
      return;
    }
    const dismissOutside = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || !surfaceRef.current?.contains(event.target)) {
        dispatch({ type: 'clear' });
      }
    };
    document.addEventListener('pointerdown', dismissOutside, true);
    return () => document.removeEventListener('pointerdown', dismissOutside, true);
  }, [dispatch, hasPointerSelection]);

  const active = resolveSelection(selection, selectedCategory);
  usePublishActive(active, onActiveChange);
  const activeCategory = active?.category ?? null;
  React.useLayoutEffect(() => {
    setActiveCategory(activeCategory);
    return () => setActiveCategory(null);
  }, [activeCategory, setActiveCategory]);

  const pointerSelection = (clientX: number, clientY: number) => {
    const bounds = chartBoxRef.current?.getBoundingClientRect();
    const local =
      bounds && bounds.width > 0 && bounds.height > 0
        ? {
            x: ((clientX - bounds.left) / bounds.width) * size.width,
            y: ((clientY - bounds.top) / bounds.height) * size.height,
          }
        : { x: 0, y: layout.zeroY };
    return hitTest(layout, local, pointerUpdates.pendingSection() ?? selectedSection);
  };

  const resolveNext = (next: Selected | null) =>
    resolveSelection(next, next ? categoryByKey.get(next.category) : undefined);

  const dispatchSelection = (action: SelectionAction) => {
    if (action.type !== 'pointer') {
      pointerUpdates.cancel();
    }
    dispatch(action);
    return resolveNext(selectedState(selectionReducer(state, action)));
  };

  const selectKeyboardIndex = (index: number, section?: BarSection) =>
    dispatchSelection({
      type: 'keyboard',
      category: layout.categories[Math.max(0, Math.min(layout.categories.length - 1, index))],
      section,
    });

  const activate = (bar: BarSelection | null) => {
    const activated = getActiveBar(bar, data, categoryByKey);
    if (activated) {
      onActivate?.(activated);
    }
  };

  const activateKeyboardSelection = (section: BarSection | undefined) => {
    const dismissed = state.status === 'dismissed';
    const bar = selectKeyboardIndex(keyboardIndex(), section);
    if (!dismissed) {
      activate(bar);
    }
  };

  const interactive = !!(onActiveChange || onActivate || tooltipCount > 0);
  const selectionContext: BarSelectionContextValue = {
    activeBar: getActiveBar(active, data, categoryByKey),
    selectedCategory: selection?.section ? selectedCategory : undefined,
    plot: layout.plot,
    chartWidth: size.width,
    chartBoxRef,
    registerTooltip,
  };

  const eventHandlers: React.HTMLAttributes<HTMLDivElement> = {
    onPointerDown: event => {
      event.preventDefault();
      // A tap fires no pointermove, so touch selects on contact and survives the pointerleave that
      // follows the finger lifting.
      if (event.pointerType !== 'touch') {
        return;
      }
      pointerUpdates.cancel();
      dispatchSelection({ type: 'pointer', selection: pointerSelection(event.clientX, event.clientY) });
    },
    onPointerLeave: event => {
      if (event.pointerType !== 'touch') {
        dispatchSelection({ type: 'clear' });
      }
    },
    onPointerCancel: () => {
      dispatchSelection({ type: 'clear' });
    },
    onPointerMove: event => {
      pointerUpdates.schedule(pointerSelection(event.clientX, event.clientY));
    },
    onFocus: () => {
      selectKeyboardIndex(keyboardIndex());
    },
    onBlur: () => {
      dispatchSelection({ type: 'clear' });
    },
    onClick: event => {
      // Assistive technology activates the chart with a synthetic click that has no coordinates.
      if (event.detail === 0 && event.clientX === 0 && event.clientY === 0) {
        activateKeyboardSelection(selectedSection);
        return;
      }
      activate(resolveNext(pointerSelection(event.clientX, event.clientY)));
    },
    onKeyDown: event => {
      const intent = getKeyIntent(
        event.key,
        keyboardIndex(),
        layout.categories.length - 1,
        selectedSection,
        !!onActivate,
      );
      if (!intent) {
        return;
      }
      event.preventDefault();
      if (intent.type === 'dismiss') {
        dispatchSelection({ type: 'dismiss' });
      } else if (intent.activate) {
        activateKeyboardSelection(intent.section);
      } else {
        selectKeyboardIndex(intent.index, intent.section);
      }
    },
  };

  const ownProps = {
    style: { position: 'absolute', inset: 0, pointerEvents: 'none' },
    children: (
      <>
        <div
          ref={surfaceRef}
          data-chart-interaction=''
          data-active-section={selectedSection}
          style={{
            position: 'absolute',
            left: layout.plot.x,
            top: layout.plot.y,
            width: layout.plot.width,
            height: layout.plot.height,
            pointerEvents: 'auto',
          }}
          tabIndex={interactive ? 0 : undefined}
          role={onActivate ? 'button' : 'group'}
          aria-describedby={keyboardInstructionsId}
          aria-label={interactive ? ariaLabel : undefined}
          {...eventHandlers}
        >
          {children}
        </div>
        <KeyboardInstructions
          id={keyboardInstructionsId}
          canActivate={!!onActivate}
          announcement={keyboardAnnouncement}
        />
      </>
    ),
  } satisfies DefaultProps<'div'>;

  const element = useRender({
    defaultTagName: 'div',
    render,
    ref: [chartBoxRef, forwardedRef],
    props: mergeProps<'div'>(ownProps, otherProps),
  });

  return <BarSelectionContext.Provider value={selectionContext}>{element}</BarSelectionContext.Provider>;
}
