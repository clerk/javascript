import type React from 'react';

import type { colorVars } from '../../tokens.stylex';

type ChartTokenName = Extract<keyof typeof colorVars, `--cl-color-chart-${number}`>;

/**
 * A palette slot, `n` for `--cl-color-chart-n`. Derived from the tokens, so a new slot token widens
 * it and nothing else lists the slots.
 */
export type ChartPaletteSlot = ChartTokenName extends `--cl-color-chart-${infer Slot extends number}` ? Slot : never;

/**
 * A color outside the palette, for a series whose color carries meaning, such as a ramp or a brand
 * color. A bare keyword such as `'purple'` does not compile, which also catches a misspelled slot.
 */
export type ChartCustomColor =
  | `var(--${string})`
  | `light-dark(${string})`
  | `oklch(${string})`
  | `oklab(${string})`
  | `color-mix(${string})`
  | `rgb(${string})`
  | `hsl(${string})`
  | `#${string}`;

export type ChartColor = ChartPaletteSlot | ChartCustomColor;

/** Slot `n` becomes `var(--cl-color-chart-n)`. A custom color passes through. */
export function resolveChartColor(color: ChartColor): string {
  return typeof color === 'number' ? `var(--cl-color-chart-${color})` : color;
}

/**
 * One series, for any chart type. The series owns its color: marks, legend and tooltip all read
 * this field, so filtering the list never repaints the series that remain.
 */
export interface ChartSeries<TDatum> {
  /** Unique within the chart. Reflected as `data-series` on legend items and tooltip rows. */
  key: string;
  /** Shown in the legend and tooltip. */
  label: string;
  /** A palette slot or a CSS color. There is no default by position. */
  color: ChartColor;
  /** Reads the value from a row. Missing or non-finite values count as zero. */
  value: (datum: TDatum) => number | null | undefined;
  /** Shown in a tooltip on the legend item, which becomes focusable. */
  description?: string;
}

/** `square` mirrors a bar, `line` a line, `dashed` a projection. */
export type ChartSwatch = 'square' | 'line' | 'dashed';

/** What a legend shows. A `ChartSeries` is assignable to it. */
export interface ChartLegendItem {
  key: string;
  label: string;
  color: ChartColor;
  description?: string;
  /** Default: 'square' */
  swatch?: ChartSwatch;
}

/** One series row in a tooltip. `value` is already formatted. */
export interface ChartTooltipRow {
  key: string;
  label: string;
  color: ChartColor;
  value: React.ReactNode;
  /** Default: 'line' */
  swatch?: ChartSwatch;
}

/** A summary row above the series rows, such as a total or a projection. */
export interface ChartTooltipMetric {
  label: string;
  value: React.ReactNode;
}

/** Where a formatted string appears. An axis wants the short form, a tooltip the full one. */
export type ChartFormatPlace = 'axis' | 'tooltip';
