import type React from 'react';

export type ChartSize = Readonly<{ width: number; height: number }>;

export type ChartMargin = Readonly<{
  top: number;
  right: number;
  bottom: number;
  left: number;
}>;

export type ChartPlot = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type ChartTick = Readonly<{ value: number; y: number }>;

/**
 * One datum's place on the X axis. A bar chart gives each category a band; a point chart gives it a
 * point, so `width` is 0. Shared parts read only these numbers.
 */
export type ChartCategory = Readonly<{
  key: string;
  datumIndex: number;
  /** The pointer snaps to the nearest center. Ticks label it and the tooltip anchors on it. */
  center: number;
  /** Left edge of the extent the category's marks occupy. `Chart.Cursor` covers it. */
  x: number;
  width: number;
}>;

/** What a selection names. Each chart type extends it with what else a user can pick there. */
export type ChartSelection = Readonly<{ category: string }>;

/** A selection resolved against the current data. */
export type ChartActive<TDatum = unknown> = ChartSelection & Readonly<{ datumIndex: number; datum: TDatum }>;

/** Options every chart-type hook takes. */
export interface ChartOptions<TSelection extends ChartSelection, TActive extends ChartActive> {
  /** Space around the plot for the axes. Default: 8, 16, 36, 52 (top, right, bottom, left) */
  margin?: Partial<ChartMargin>;
  /** The selection, or null. Leave it undefined to let the chart hold the selection. */
  selection?: TSelection | null;
  /** Called when the user or `select`/`clear` changes the selection. */
  onSelectionChange?: (selection: TSelection | null) => void;
  /** Called on click, Enter or Space. Makes the interaction surface a button. */
  onActivate?: (active: TActive) => void;
  /** Names a category in announcements. Default: the category key */
  formatCategory?: (category: string) => string | null;
}

export type XTick = Readonly<{
  key: string;
  /** The labelled category key, or null for a calendar boundary label. */
  category: string | null;
  label: string;
  x: number;
  textAnchor: 'start' | 'middle' | 'end';
}>;

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
export type ChartInteractionProps = Readonly<{
  role: 'button' | 'group';
  /** 0 while something reads the selection: `selection`, `onSelectionChange` or `onActivate`. */
  tabIndex: 0 | undefined;
  /** Removing the surface ends a pointer or keyboard selection, as leaving or blurring it does. */
  ref: React.RefCallback<HTMLElement>;
  onPointerDown: React.PointerEventHandler<HTMLElement>;
  onPointerLeave: React.PointerEventHandler<HTMLElement>;
  onPointerCancel: React.PointerEventHandler<HTMLElement>;
  onPointerMove: React.PointerEventHandler<HTMLElement>;
  onFocus: React.FocusEventHandler<HTMLElement>;
  onBlur: React.FocusEventHandler<HTMLElement>;
  onClick: React.MouseEventHandler<HTMLElement>;
  onKeyDown: React.KeyboardEventHandler<HTMLElement>;
  /** State the chart type exposes on the surface, such as `data-active-section`. */
  [attribute: `data-${string}`]: string | undefined;
}>;

/**
 * The measured layout and selection of one chart, returned by a chart-type hook such as
 * `Chart.useBarChart`. `TSelection` defaults to `never`, so `Chart.Root` takes any chart and the
 * shared parts cannot call `select`.
 */
export type ChartInstance<
  TActive extends ChartActive = ChartActive,
  TSelection extends ChartSelection = never,
  TCategory extends ChartCategory = ChartCategory,
> = Readonly<{
  /** Measures the chart. `Chart.Root` attaches it. */
  rootRef: (element: HTMLElement | null) => void;
  /** The measured container, zero until the first measurement. */
  size: ChartSize;
  plot: ChartPlot;
  scaleY: (value: number) => number;
  yTicks: readonly ChartTick[];
  categories: readonly TCategory[];
  xTicks: (options?: XTicksOptions) => XTick[];
  /** The selection in the current data, or null. */
  selected: TActive | null;
  /** Where a tooltip for `selected` points, in chart coordinates. */
  tooltipAnchor: Readonly<{ x: number; y: number }> | null;
  /** The text of the keyboard selection's status announcement. */
  announcement: string;
  /** The keys the chart answers to, for the visually hidden description. */
  keyboardInstructions: string;
  select: (selection: TSelection) => void;
  clear: () => void;
  getInteractionProps: () => ChartInteractionProps;
}>;
