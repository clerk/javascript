export type ChartSize = Readonly<{ width: number; height: number }>;

export type ChartMargin = Readonly<{
  top: number;
  right: number;
  bottom: number;
  left: number;
}>;

/** The measured container and the margin around the plot. */
export type ChartFrame = Readonly<{ size: ChartSize; margin: ChartMargin }>;

export type ChartPlot = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type ChartTick = Readonly<{ value: number; y: number }>;

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

export type BarCategory = Readonly<{
  key: string;
  datumIndex: number;
  bandX: number;
  bandWidth: number;
  center: number;
  /** Sections a user can select, including a projection-only positive bar. */
  sections: Readonly<Record<BarSection, boolean>>;
  /** Sections with nonzero data values. */
  hasValues: Readonly<Record<BarSection, boolean>>;
  /** True when the chart draws the projection at this category. */
  projected: boolean;
}>;

export type BarSelection = Readonly<{
  category: string;
  datumIndex: number;
  section: BarSection;
}>;

export type ActiveBar<TDatum> = BarSelection &
  Readonly<{
    datum: TDatum;
    hasValues: BarCategory['hasValues'];
    projected: BarCategory['projected'];
  }>;
