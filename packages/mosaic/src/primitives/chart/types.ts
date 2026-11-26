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

/** A point in chart coordinates, relative to the top left of `Chart.Root`. */
export type ChartPoint = Readonly<{ x: number; y: number }>;

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

/** Screen reader text every chart type reads out. Pass localized strings; each defaults to English. */
export type ChartMessages = Readonly<{
  /** How Left, Right, Home and End move. */
  navigate: string;
  /** How Enter and Space open the selected period. Read only when the hook has `onActivate`. */
  activate: string;
  /** How Escape dismisses the selection. */
  dismiss: string;
  /** Announced when the keyboard lands on a period with nothing to select. */
  noValues: string;
}>;

/** Options every chart-type hook takes. */
export interface ChartOptions<TSelection extends ChartSelection, TActive extends ChartActive> {
  /** Space around the plot for the axes. Default: 8, 16, 36, 52 (top, right, bottom, left) */
  margin?: Partial<ChartMargin>;
  /** The selection, or null. Leave it undefined to let the chart hold the selection. */
  selection?: TSelection | null;
  /** The selection the chart starts with when it holds the selection. Default: null */
  defaultSelection?: TSelection | null;
  /** Called when the user or `select`/`clear` changes the selection. */
  onSelectionChange?: (selection: TSelection | null) => void;
  /**
   * Called on click, Enter or Space, with the event that activated it. Makes the interaction surface
   * a button.
   */
  onActivate?: (active: TActive, event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void;
  /** Ignores the pointer and keyboard and leaves the tab order. `select` and `selection` still apply. Default: false */
  disabled?: boolean;
  /** Names a category in announcements. Default: the category key */
  formatCategory?: (category: string) => string | null;
  /** Formats a value in announcements. Default: `String(value)` */
  formatValue?: (value: number) => string;
  /** Screen reader text. Default: English */
  messages?: Partial<ChartMessages>;
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
export type ChartInteractionProps = Omit<React.HTMLAttributes<HTMLElement>, 'role' | 'tabIndex'> &
  Readonly<{
    role: 'button' | 'group';
    /** 0 while something reads the selection: `selection`, `onSelectionChange` or `onActivate`. Never while disabled. */
    tabIndex: 0 | undefined;
    /** Removing the surface ends a pointer or keyboard selection, as leaving or blurring it does. */
    ref: React.RefCallback<HTMLElement>;
    'aria-disabled': true | undefined;
    /** State the chart type exposes on the surface, such as `data-active-section`. */
    [attribute: `data-${string}`]: string | undefined;
  }>;

/** Props a custom surface passes to `getInteractionProps`. Its handlers run after the chart's. */
export type ChartInteractionInput = Omit<React.HTMLAttributes<HTMLElement>, 'role' | 'tabIndex'> &
  Readonly<{ [attribute: `data-${string}`]: string | undefined }>;

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
  categories: readonly TCategory[];
  xTicks: (options?: XTicksOptions) => XTick[];
  /** The selection in the current data, or null. */
  selected: TActive | null;
  /** Where a tooltip for `selected` points, in chart coordinates. */
  tooltipAnchor: ChartPoint | null;
  /** The text of the keyboard selection's status announcement. */
  announcement: string;
  /** The keys the chart answers to, for the visually hidden description. */
  keyboardInstructions: string;
  select: (selection: TSelection) => void;
  clear: () => void;
  getInteractionProps: (props?: ChartInteractionInput) => ChartInteractionProps;
}>;

/**
 * A chart with a value axis, such as bars or lines. `Chart.Grid`, `Chart.YAxis` and `Chart.YLine`
 * need one; a chart without a value axis, such as a donut, is a plain `ChartInstance`.
 */
export type CartesianChartInstance<
  TActive extends ChartActive = ChartActive,
  TSelection extends ChartSelection = never,
  TCategory extends ChartCategory = ChartCategory,
> = ChartInstance<TActive, TSelection, TCategory> &
  Readonly<{
    scaleY: (value: number) => number;
    yTicks: readonly ChartTick[];
  }>;
