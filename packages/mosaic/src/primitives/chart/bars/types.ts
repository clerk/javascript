import type { ChartActive, ChartCategory, ChartMessages, ChartSelection } from '../types';

export type CornerRadii = readonly [number, number, number, number];

/** A projected total for one category, drawn only above its positive stack. */
export type BarProjection = Readonly<{
  datumIndex: number;
  value: number;
}>;

export type BarSeries<TDatum> = Readonly<{
  key: string;
  value: (datum: TDatum) => number | null | undefined;
}>;

export type BarIdentity<TDatum> = Readonly<{
  seriesKey: string;
  datum: TDatum;
  datumIndex: number;
  value: number;
  positive: boolean;
}>;

export type BarMark<TDatum> = BarIdentity<TDatum> &
  Readonly<{
    x: number;
    y: number;
    width: number;
    height: number;
    radii: CornerRadii;
    paintInsetTop: number;
    paintInsetBottom: number;
  }>;

export type BarSection = 'positive' | 'negative';

/** Screen reader text for a bar chart: the shared chart text plus the Up and Down sections. */
export type BarChartMessages = ChartMessages &
  Readonly<{
    /** How Up and Down move between the positive and negative sections. */
    vertical: string;
    /** Follows the period name when the positive section is selected. */
    positiveValues: string;
    /** Follows the period name when the negative section is selected. */
    negativeValues: string;
  }>;

export type BarCategory = ChartCategory &
  Readonly<{
    /** Sections a user can select, including a projection-only positive bar. */
    sections: Readonly<Record<BarSection, boolean>>;
    /** Sections with nonzero data values. */
    hasValues: Readonly<Record<BarSection, boolean>>;
    /** True when the chart draws the projection at this category. */
    projected: boolean;
  }>;

/** A selected category and section. */
export type BarSelection = ChartSelection & Readonly<{ section: BarSection }>;

/** A selected bar resolved against the current data. */
export type ActiveBar<TDatum> = ChartActive<TDatum> &
  BarSelection &
  Readonly<{
    hasValues: BarCategory['hasValues'];
    projected: BarCategory['projected'];
  }>;
