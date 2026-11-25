'use client';

import React from 'react';

import { useControllableState } from '../../hooks/use-controllable-state';
import { mergeProps } from '../../utils';
import type {
  ChartActive,
  ChartCategory,
  ChartInstance,
  ChartInteractionInput,
  ChartInteractionProps,
  ChartMargin,
  ChartOptions,
  ChartPlot,
  ChartSelection,
  ChartSize,
  XTick,
  XTicksOptions,
} from '../types';
import {
  DEFAULT_CHART_MESSAGES,
  getKeyboardAnnouncement,
  getKeyboardInstructions,
  getKeyIntent,
  NO_SELECTION,
  reconcileSelection,
  sameSelection,
  selectedState,
  type SelectionAction,
  type SelectionModel,
  selectionReducer,
  type SelectionState,
  toPublicSelection,
  type VerticalMove,
} from './selection';
import { useChartSize } from './use-chart-size';
import { selectXTicks } from './x-ticks';

export const DEFAULT_CHART_MARGIN: ChartMargin = {
  top: 8,
  right: 16,
  bottom: 36,
  left: 52,
};

/** What a chart type's layout gives the shared instance. */
export type ChartLayout<TCategory extends ChartCategory> = Readonly<{
  plot: ChartPlot;
  categories: readonly TCategory[];
}>;

export type ChartFrame = Readonly<{
  rootRef: (element: HTMLElement | null) => void;
  rootElementRef: React.RefObject<HTMLElement | null>;
  /** The measured container, zero until the first measurement. */
  size: ChartSize;
  /** Stable while its four numbers are, so an inline `margin` does not relayout. */
  margin: ChartMargin;
}>;

/** Measures the chart root and resolves the margin around the plot. */
export function useChartFrame(margin: Partial<ChartMargin> | undefined): ChartFrame {
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
  const resolved = React.useMemo(() => ({ top, right, bottom, left }), [bottom, left, right, top]);
  return { rootRef, rootElementRef, size, margin: resolved };
}

/** Coalesces pointer moves into at most one selection update per frame. */
function useFramePointerUpdates<TSelection>(layout: unknown) {
  const applyRef = React.useRef<(selection: TSelection | null) => void>(() => {});
  const pendingRef = React.useRef<TSelection | null | undefined>(undefined);
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

  const schedule = (selection: TSelection | null, apply: (selection: TSelection | null) => void) => {
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
  const pending = () => pendingRef.current ?? null;
  return { schedule, cancel, pending };
}

const formatCategoryKey = (category: string) => category;

/**
 * Owns selection for every chart type: the controlled value, the reducer, one pointer update per
 * frame, touch select and outside dismissal, the remembered keyboard index, keys, activation, the
 * announcement and the X ticks. The chart type's rules come in through `model`.
 */
export function useChartInstance<
  TSelection extends ChartSelection,
  TActive extends ChartActive,
  TCategory extends ChartCategory,
>({
  frame,
  layout,
  model,
  options,
}: Readonly<{
  frame: ChartFrame;
  layout: ChartLayout<TCategory>;
  model: SelectionModel<TSelection, TActive, TCategory>;
  options: ChartOptions<TSelection, TActive>;
}>): ChartInstance<TActive, TSelection, TCategory> {
  const { onActivate, formatCategory = formatCategoryKey } = options;
  const { rootRef, rootElementRef, size } = frame;
  const { categories, plot } = layout;

  const xTicks = React.useCallback(
    ({ mode = 'category', format = formatCategoryKey }: XTicksOptions = {}): XTick[] =>
      selectXTicks({
        categories,
        plot,
        viewportWidth: size.width,
        xAxis: mode === 'calendar' ? 'calendar' : undefined,
        formatXTick: format,
      }),
    [categories, plot, size.width],
  );

  const [value, setValue] = useControllableState<TSelection | null>(
    options.selection,
    options.defaultSelection ?? null,
    options.onSelectionChange,
  );
  const [stored, setStored] = React.useState<SelectionState<TSelection>>(NO_SELECTION);
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
  const resolve = (selection: TSelection | null) => {
    const category = selection ? categoryByKey.get(selection.category) : undefined;
    return selection && category ? model.resolve(selection, category) : null;
  };
  const selected = resolve(current?.selection ?? null);
  // A selection whose category or value left the data reads as none until the user moves.
  const valid = current && currentCategory && (current.selection === null || selected) ? current : null;
  const messages = { ...DEFAULT_CHART_MESSAGES, ...options.messages };
  const announcement = getKeyboardAnnouncement(
    valid,
    valid?.selection ? selected : null,
    currentCategory,
    model,
    formatCategory,
    messages,
  );
  const keyboardInstructions = getKeyboardInstructions(messages, model.verticalInstructions, !!onActivate);
  const tooltipAnchor =
    valid?.selection && currentCategory && selected ? model.anchor(valid.selection, currentCategory) : null;
  const focusRect =
    valid?.selection && currentCategory && selected ? model.focusRect(valid.selection, currentCategory) : null;

  const lastIndexRef = React.useRef(0);
  const selectedIndex = valid ? currentCategory?.datumIndex : undefined;
  React.useLayoutEffect(() => {
    if (selectedIndex !== undefined) {
      lastIndexRef.current = selectedIndex;
    }
  }, [selectedIndex]);
  const keyboardIndex = () => selectedIndex ?? lastIndexRef.current;

  const pointerUpdates = useFramePointerUpdates<TSelection>(layout);

  const dispatch = (action: SelectionAction<TSelection>) => {
    if (action.type !== 'pointer') {
      pointerUpdates.cancel();
    }
    const previous = stateRef.current;
    const next = selectionReducer(previous, action);
    if (next === previous) {
      return next;
    }
    stateRef.current = next;
    setStored(next);
    const nextValue = toPublicSelection(next);
    if (!sameSelection(toPublicSelection(previous), nextValue)) {
      setValue(nextValue);
    }
    return next;
  };
  const dispatchRef = React.useRef(dispatch);
  React.useLayoutEffect(() => {
    dispatchRef.current = dispatch;
  });
  const select = React.useCallback((selection: TSelection) => {
    dispatchRef.current({ type: 'select', selection });
  }, []);
  const clear = React.useCallback(() => {
    dispatchRef.current({ type: 'clear' });
  }, []);

  const surfaceRef = React.useRef<HTMLElement | null>(null);
  // A removed surface fires no pointerleave or blur, so its removal ends what the user selected on it.
  const attachSurface = React.useCallback((element: HTMLElement | null) => {
    surfaceRef.current = element;
    const state = stateRef.current;
    if (!element && state.status === 'selected' && state.source !== 'external') {
      dispatchRef.current({ type: 'clear' });
    }
  }, []);

  // A tap fires no pointerleave or blur, so a tap anywhere else dismisses.
  const hasPointerSelection = valid?.source === 'pointer';
  React.useEffect(() => {
    if (!hasPointerSelection) {
      return;
    }
    const dismissOutside = (event: PointerEvent) => {
      const surface = surfaceRef.current;
      if (!(event.target instanceof Node) || !surface?.contains(event.target)) {
        clear();
      }
    };
    document.addEventListener('pointerdown', dismissOutside, true);
    return () => document.removeEventListener('pointerdown', dismissOutside, true);
  }, [clear, hasPointerSelection]);

  const currentSelection = valid?.selection ?? null;

  const pointerSelection = (clientX: number, clientY: number) => {
    const bounds = rootElementRef.current?.getBoundingClientRect();
    if (!bounds || bounds.width <= 0 || bounds.height <= 0) {
      return null;
    }
    const point = {
      x: ((clientX - bounds.left) / bounds.width) * size.width,
      y: ((clientY - bounds.top) / bounds.height) * size.height,
    };
    return model.hitTest(point, pointerUpdates.pending() ?? currentSelection);
  };

  const selectKeyboardIndex = (target: number, move: VerticalMove | undefined, from: TSelection | null) => {
    const category = categories[Math.max(0, Math.min(categories.length - 1, target))];
    return dispatch({
      type: 'keyboard',
      category: category?.key,
      selection: category ? model.land(category, move, from) : null,
    });
  };

  type ActivationEvent = React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>;
  const activate = (selection: TSelection | null, event: ActivationEvent) => {
    const active = resolve(selection);
    if (active) {
      onActivate?.(active, event);
    }
  };

  const activateKeyboardSelection = (event: ActivationEvent) => {
    const dismissed = stateRef.current.status === 'dismissed';
    const next = selectKeyboardIndex(keyboardIndex(), undefined, currentSelection);
    if (!dismissed) {
      activate(toPublicSelection(next), event);
    }
  };

  const { disabled = false } = options;
  const reads = options.selection !== undefined || !!options.onSelectionChange || !!onActivate;
  const handlers = (): React.HTMLAttributes<HTMLElement> => ({
    onPointerDown: event => {
      event.preventDefault();
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
      pointerUpdates.schedule(pointerSelection(event.clientX, event.clientY), next =>
        dispatch({ type: 'pointer', selection: next }),
      );
    },
    onFocus: () => {
      selectKeyboardIndex(keyboardIndex(), undefined, null);
    },
    onBlur: () => {
      dispatch({ type: 'clear' });
    },
    onClick: event => {
      // Assistive technology activates the chart with a synthetic click that has no coordinates.
      if (event.detail === 0 && event.clientX === 0 && event.clientY === 0) {
        activateKeyboardSelection(event);
        return;
      }
      activate(pointerSelection(event.clientX, event.clientY), event);
    },
    onKeyDown: event => {
      const intent = getKeyIntent(event.key, keyboardIndex(), categories.length - 1, !!onActivate);
      if (!intent) {
        return;
      }
      event.preventDefault();
      if (intent.type === 'dismiss') {
        dispatch({ type: 'dismiss' });
      } else if (intent.activate) {
        activateKeyboardSelection(event);
      } else {
        selectKeyboardIndex(intent.index, intent.move, currentSelection);
      }
    },
  });
  const getInteractionProps = (props: ChartInteractionInput = {}): ChartInteractionProps => {
    const own = {
      ...(disabled ? null : handlers()),
      ...model.surfaceAttributes(currentSelection),
      'aria-disabled': disabled ? (true as const) : undefined,
    };
    return {
      ...mergeProps<'div'>(own, props),
      role: onActivate ? 'button' : 'group',
      tabIndex: reads && !disabled ? 0 : undefined,
      ref: attachSurface,
      'aria-disabled': own['aria-disabled'],
    };
  };

  return {
    rootRef,
    size,
    plot,
    categories,
    xTicks,
    selected,
    selectionSource: selected ? (valid?.source ?? null) : null,
    tooltipAnchor,
    focusRect,
    announcement,
    keyboardInstructions,
    select,
    clear,
    getInteractionProps,
  };
}
