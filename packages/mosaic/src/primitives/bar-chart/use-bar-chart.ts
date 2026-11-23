'use client';

import React from 'react';

import { useControllableState } from '../hooks/use-controllable-state';
import {
  DEFAULT_CHART_MARGIN,
  prepareStackedBars,
  projectStackedBars,
  type StackedBarLayout,
} from './bar-chart-layout';
import {
  getActiveBar,
  getKeyboardAnnouncement,
  getKeyIntent,
  hitTest,
  isSelectable,
  NO_SELECTION,
  reconcileSelection,
  sameSelection,
  type Selected,
  selectedState,
  type SelectionAction,
  selectionReducer,
  type SelectionState,
  toBarSelection,
} from './bar-chart-selection';
import type {
  ActiveBar,
  BarIdentity,
  BarProjection,
  BarSection,
  BarSelection,
  BarSeries,
  ChartMargin,
  ChartSize,
} from './types';
import { useChartSize } from './use-chart-size';
import { selectXTicks, type XTick } from './x-ticks';

export interface UseBarChartOptions<TDatum> {
  data: readonly TDatum[];
  /** Stack order and each series' value. Memoize it: a new array prepares the stacks again. */
  series: readonly BarSeries<TDatum>[];
  /** Returns a unique, stable category key. Memoize it: a new function prepares the stacks again. */
  index: (datum: TDatum, index: number) => string;
  /** Fraction of each category band left empty between bars. Default: 0.28 */
  categoryGap?: number;
  /** Space around the plot for the axes. Default: 8, 16, 36, 52 (top, right, bottom, left) */
  margin?: Partial<ChartMargin>;
  /** Paints a projected total behind the bar at `datumIndex`, when it rises above the bar. */
  projection?: BarProjection;
  /** Returns false for a bar that `BarChart.Bar` styles through `data-inactive`. Default: every bar is active */
  isBarActive?: (bar: BarIdentity<TDatum>) => boolean;
  /** The selected category and section, or null. Leave it undefined to let the chart hold the selection. */
  selection?: BarSelection | null;
  /** Called when the user or `select`/`clear` changes the selection. */
  onSelectionChange?: (selection: BarSelection | null) => void;
  /** Called on click, Enter or Space. Makes the interaction surface a button. */
  onActivate?: (active: ActiveBar<TDatum>) => void;
  /** Names a category in announcements. Default: the category key */
  formatCategory?: (category: string) => string | null;
}

export type XTickMode = 'category' | 'calendar';

export type XTicksOptions = Readonly<{
  /**
   * `category` thins category labels to fit. `calendar` labels calendar boundaries for long ranges;
   * category keys must be UTC dates. Default: 'category'
   */
  mode?: XTickMode;
  /** Returns the label for a category key, or null to omit it. Default: the key */
  format?: (key: string) => string | null;
}>;

/** Props for the element that takes pointer and keyboard selection, usually the plot. */
export type BarChartInteractionProps = Readonly<{
  role: 'button' | 'group';
  /** 0 while something reads the selection: `selection`, `onSelectionChange` or `onActivate`. */
  tabIndex: 0 | undefined;
  'data-active-section': BarSection | undefined;
  onPointerDown: React.PointerEventHandler<HTMLElement>;
  onPointerLeave: React.PointerEventHandler<HTMLElement>;
  onPointerCancel: React.PointerEventHandler<HTMLElement>;
  onPointerMove: React.PointerEventHandler<HTMLElement>;
  onFocus: React.FocusEventHandler<HTMLElement>;
  onBlur: React.FocusEventHandler<HTMLElement>;
  onClick: React.MouseEventHandler<HTMLElement>;
  onKeyDown: React.KeyboardEventHandler<HTMLElement>;
}>;

/** The measured layout and selection of one chart, returned by `BarChart.useBarChart`. */
export type BarChartInstance<TDatum = unknown> = StackedBarLayout<TDatum> &
  Readonly<{
    /** Measures the chart. `BarChart.Root` attaches it. */
    rootRef: (element: HTMLElement | null) => void;
    /** The measured container, zero until the first measurement. */
    size: ChartSize;
    xTicks: (options?: XTicksOptions) => XTick[];
    isBarActive: ((bar: BarIdentity<TDatum>) => boolean) | undefined;
    /** The selected bar in the current data, or null. */
    selected: ActiveBar<TDatum> | null;
    /** The text of the keyboard selection's status announcement. */
    announcement: string;
    select: (selection: BarSelection) => void;
    clear: () => void;
    getInteractionProps: () => BarChartInteractionProps;
  }>;

const formatCategoryKey = (category: string) => category;

/** Coalesces pointer moves into at most one selection update per frame. */
function useFramePointerUpdates(layout: unknown) {
  const applyRef = React.useRef<(selection: Selected | null) => void>(() => {});
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

  const schedule = (selection: Selected | null, apply: (selection: Selected | null) => void) => {
    pendingRef.current = selection;
    applyRef.current = apply;
    if (frameRef.current !== null) {
      return;
    }
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const pending = pendingRef.current;
      pendingRef.current = undefined;
      if (pending !== undefined) {
        applyRef.current(pending);
      }
    });
  };
  const pendingSection = () => pendingRef.current?.section ?? undefined;
  return { schedule, cancel, pendingSection };
}

/**
 * Measures, lays out and selects a stacked bar chart. Pass the result to `BarChart.Root`, or render
 * from it directly.
 */
export function useBarChart<TDatum>(options: UseBarChartOptions<TDatum>): BarChartInstance<TDatum> {
  const {
    data,
    series,
    index,
    categoryGap = 0.28,
    margin,
    projection,
    isBarActive,
    onActivate,
    formatCategory = formatCategoryKey,
  } = options;

  const { ref: sizeRef, size } = useChartSize<HTMLElement>();
  const rootElementRef = React.useRef<HTMLElement | null>(null);
  const rootRef = React.useCallback(
    (element: HTMLElement | null) => {
      rootElementRef.current = element;
      sizeRef(element);
    },
    [sizeRef],
  );

  const top = margin?.top ?? DEFAULT_CHART_MARGIN.top;
  const right = margin?.right ?? DEFAULT_CHART_MARGIN.right;
  const bottom = margin?.bottom ?? DEFAULT_CHART_MARGIN.bottom;
  const left = margin?.left ?? DEFAULT_CHART_MARGIN.left;
  // The owner re-renders on every selection change, so an inline `projection` must not relayout.
  const projectionIndex = projection?.datumIndex;
  const projectionValue = projection?.value;
  const prepared = React.useMemo(() => prepareStackedBars({ data, series, index }), [data, index, series]);
  const layout = React.useMemo(
    () =>
      projectStackedBars(prepared, {
        size,
        margin: { top, right, bottom, left },
        categoryGap,
        projection:
          projectionIndex === undefined || projectionValue === undefined
            ? undefined
            : { datumIndex: projectionIndex, value: projectionValue },
      }),
    [bottom, categoryGap, left, prepared, projectionIndex, projectionValue, right, size, top],
  );
  const { categories, plot } = layout;
  const xTicks = React.useCallback(
    ({ mode = 'category', format = formatCategoryKey }: XTicksOptions = {}) =>
      selectXTicks({
        categories,
        plot,
        viewportWidth: size.width,
        xAxis: mode === 'calendar' ? 'calendar' : undefined,
        formatXTick: format,
      }),
    [categories, plot, size.width],
  );

  const [value, setValue] = useControllableState<BarSelection | null>(
    options.selection,
    null,
    options.onSelectionChange,
  );
  const [stored, setStored] = React.useState<SelectionState>(NO_SELECTION);
  const state = reconcileSelection(stored, value);
  const stateRef = React.useRef(state);
  React.useLayoutEffect(() => {
    stateRef.current = state;
  });

  const categoryByKey = React.useMemo(
    () => new Map(categories.map(category => [category.key, category])),
    [categories],
  );
  const current = selectedState(state);
  const currentCategory = current ? categoryByKey.get(current.category) : undefined;
  // A selection whose category or section left the data reads as none until the user moves.
  const valid = current && currentCategory && isSelectable(current, currentCategory) ? current : null;
  const selected = getActiveBar(valid, data, categoryByKey);
  const announcement = getKeyboardAnnouncement(valid, currentCategory, formatCategory);

  const lastIndexRef = React.useRef(0);
  const selectedIndex = valid ? currentCategory?.datumIndex : undefined;
  React.useLayoutEffect(() => {
    if (selectedIndex !== undefined) {
      lastIndexRef.current = selectedIndex;
    }
  }, [selectedIndex]);
  const keyboardIndex = () => selectedIndex ?? lastIndexRef.current;

  const pointerUpdates = useFramePointerUpdates(layout);

  const dispatch = (action: SelectionAction) => {
    if (action.type !== 'pointer') {
      pointerUpdates.cancel();
    }
    const previous = stateRef.current;
    const next = selectionReducer(previous, action);
    stateRef.current = next;
    setStored(next);
    const nextValue = toBarSelection(next);
    if (!sameSelection(toBarSelection(previous), nextValue)) {
      setValue(nextValue);
    }
    return next;
  };
  const dispatchRef = React.useRef(dispatch);
  React.useLayoutEffect(() => {
    dispatchRef.current = dispatch;
  });
  const select = React.useCallback((selection: BarSelection) => {
    dispatchRef.current({ type: 'select', selection });
  }, []);
  const clear = React.useCallback(() => {
    dispatchRef.current({ type: 'clear' });
  }, []);

  // Only a pointer event on the surface makes a pointer selection, so its target is the surface.
  const surfaceRef = React.useRef<EventTarget | null>(null);

  // A tap fires no pointerleave or blur, so a tap anywhere else dismisses.
  const hasPointerSelection = valid?.source === 'pointer';
  React.useEffect(() => {
    if (!hasPointerSelection) {
      return;
    }
    const dismissOutside = (event: PointerEvent) => {
      const surface = surfaceRef.current;
      if (!(event.target instanceof Node) || !(surface instanceof Node) || !surface.contains(event.target)) {
        clear();
      }
    };
    document.addEventListener('pointerdown', dismissOutside, true);
    return () => document.removeEventListener('pointerdown', dismissOutside, true);
  }, [clear, hasPointerSelection]);

  const pointerSelection = (clientX: number, clientY: number) => {
    const bounds = rootElementRef.current?.getBoundingClientRect();
    const local =
      bounds && bounds.width > 0 && bounds.height > 0
        ? {
            x: ((clientX - bounds.left) / bounds.width) * size.width,
            y: ((clientY - bounds.top) / bounds.height) * size.height,
          }
        : { x: 0, y: layout.zeroY };
    return hitTest(layout, local, pointerUpdates.pendingSection() ?? valid?.section ?? undefined);
  };

  const selectKeyboardIndex = (target: number, section?: BarSection) =>
    dispatch({
      type: 'keyboard',
      category: categories[Math.max(0, Math.min(categories.length - 1, target))],
      section,
    });

  const activate = (selection: Selected | null) => {
    const bar = getActiveBar(selection, data, categoryByKey);
    if (bar) {
      onActivate?.(bar);
    }
  };

  const activateKeyboardSelection = (section: BarSection | undefined) => {
    const dismissed = stateRef.current.status === 'dismissed';
    const next = selectKeyboardIndex(keyboardIndex(), section);
    if (!dismissed) {
      activate(selectedState(next));
    }
  };

  const activeSection = valid?.section ?? undefined;
  const reads = options.selection !== undefined || !!options.onSelectionChange || !!onActivate;
  const getInteractionProps = (): BarChartInteractionProps => ({
    role: onActivate ? 'button' : 'group',
    tabIndex: reads ? 0 : undefined,
    'data-active-section': activeSection,
    onPointerDown: event => {
      event.preventDefault();
      surfaceRef.current = event.currentTarget;
      // A tap fires no pointermove, so touch selects on contact and survives the pointerleave that
      // follows the finger lifting.
      if (event.pointerType !== 'touch') {
        return;
      }
      pointerUpdates.cancel();
      dispatch({ type: 'pointer', selection: pointerSelection(event.clientX, event.clientY) });
    },
    onPointerLeave: event => {
      if (event.pointerType !== 'touch') {
        dispatch({ type: 'clear' });
      }
    },
    onPointerCancel: () => {
      dispatch({ type: 'clear' });
    },
    onPointerMove: event => {
      surfaceRef.current = event.currentTarget;
      pointerUpdates.schedule(pointerSelection(event.clientX, event.clientY), next =>
        dispatch({ type: 'pointer', selection: next }),
      );
    },
    onFocus: () => {
      selectKeyboardIndex(keyboardIndex());
    },
    onBlur: () => {
      dispatch({ type: 'clear' });
    },
    onClick: event => {
      // Assistive technology activates the chart with a synthetic click that has no coordinates.
      if (event.detail === 0 && event.clientX === 0 && event.clientY === 0) {
        activateKeyboardSelection(activeSection);
        return;
      }
      activate(pointerSelection(event.clientX, event.clientY));
    },
    onKeyDown: event => {
      const intent = getKeyIntent(event.key, keyboardIndex(), categories.length - 1, activeSection, !!onActivate);
      if (!intent) {
        return;
      }
      event.preventDefault();
      if (intent.type === 'dismiss') {
        dispatch({ type: 'dismiss' });
      } else if (intent.activate) {
        activateKeyboardSelection(intent.section);
      } else {
        selectKeyboardIndex(intent.index, intent.section);
      }
    },
  });

  return {
    ...layout,
    rootRef,
    size,
    xTicks,
    isBarActive,
    selected,
    announcement,
    select,
    clear,
    getInteractionProps,
  };
}
