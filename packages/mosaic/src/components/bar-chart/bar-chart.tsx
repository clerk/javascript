'use client';

import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useMessages } from '../../localization/context';
import { type ActiveBar, type BarSection, type BarSelection, Chart as Primitive } from '../../primitives/chart';
import type { MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { Button } from '../button';
import { Chart, type ChartFormatPlace, type ChartLegendItem, type ChartSeries } from '../chart';
import {
  ChartAxes,
  ChartFrame,
  ChartGridLines,
  ChartOverlay,
  ChartPlot,
  ChartSelectionLayer,
  type ChartState,
  ChartZeroLine,
  DefaultChartEmptyState,
} from '../chart/internal/chart-frame';
import { frameStyles } from '../chart/internal/chart-frame.styles';
import { seriesMark } from '../chart/internal/series.styles';
import { bridgeSeries, type SeriesBridge } from '../chart/internal/series-bridge';
import { type ChartFormat, useChartFormat } from '../chart/internal/use-chart-format';
import { barStyles } from './bar-chart.styles';
import {
  barActivity,
  type BarChartHighlight,
  type BarChartProjection,
  type BarChartTooltip,
  barTooltip,
  categoryGapFor,
} from './bar-chart-series';

interface BarChartBaseProps<TDatum> extends Omit<MosaicElementProps<'div'>, 'children' | 'aria-label'> {
  /** Names the chart for assistive technology. */
  'aria-label': string;
  data: readonly TDatum[];
  /** Returns a unique, stable category key for a row. Define it at module level or memoize it. */
  index: (datum: TDatum, index: number) => string;
  /** Stack order, bottom first. Define it at module level or memoize it. */
  series: readonly ChartSeries<TDatum>[];
  projection?: BarChartProjection;
  /**
   * The bars that keep full strength. Every other bar is dimmed with an opaque mix toward
   * `--cl-color-surface`. Without it no bar is dimmed.
   */
  highlight?: BarChartHighlight | null;
  /**
   * Total height, legend included.
   *
   * @default 320
   */
  height?: number | string;
  /**
   * Shows the legend above the plot. Turn it off to place a `Chart.Legend` yourself.
   *
   * @default true with two or more series or a labelled projection
   */
  showLegend?: boolean;
  /**
   * Shows the horizontal grid lines.
   *
   * @default true
   */
  showGrid?: boolean;
  /**
   * Shows the category labels below the plot.
   *
   * @default true
   */
  showXAxis?: boolean;
  /**
   * Shows the value labels beside the plot.
   *
   * @default true
   */
  showYAxis?: boolean;
  /**
   * `category` thins labels to fit. `calendar` labels calendar boundaries; its keys must be UTC dates.
   *
   * @default 'category'
   */
  xTicks?: 'category' | 'calendar';
  /** Formats a value. `place` is `'axis'` for a tick and `'tooltip'` for a tooltip row. */
  formatValue?: (value: number, place: ChartFormatPlace) => string;
  /** Formats a category key. The `'tooltip'` form also names the period in announcements. */
  formatCategory?: (key: string, place: ChartFormatPlace) => string;
  /** Replaces the default `EmptyState` shown when `data` is empty. */
  renderEmptyState?: () => React.ReactNode;
  /** Called when the Canvas fails to paint, before the built-in retry appears. */
  onRenderError?: (error: Error) => void;
}

/** Selection props exist only while the chart is interactive. */
type BarChartInteractionProps<TDatum> =
  | {
      /**
       * Pointer and keyboard selection, with the hover band and tooltip.
       *
       * @default true
       */
      interactive?: true;
      selection?: BarSelection | null;
      onSelectionChange?: (selection: BarSelection | null) => void;
      /** Called on click, Enter or Space. Makes the plot a button. */
      onActivate?: (active: ActiveBar<TDatum>) => void;
      /** Replaces the tooltip body. Return null to hide the tooltip for this period. */
      renderTooltip?: (tooltip: BarChartTooltip<TDatum>) => React.ReactNode;
    }
  | {
      /** A picture of the chart: no selection, no tooltip, no tab stop. */
      interactive: false;
      selection?: never;
      onSelectionChange?: never;
      onActivate?: never;
      renderTooltip?: never;
    };

export type BarChartProps<TDatum> = BarChartBaseProps<TDatum> & BarChartInteractionProps<TDatum>;

export type { BarChartHighlight, BarChartProjection, BarChartTooltip };
export type { ActiveBar, BarSection, BarSelection };

const renderDefaultTooltip = <TDatum,>({ heading, metrics, rows }: BarChartTooltip<TDatum>) => (
  <Chart.TooltipContent
    heading={heading}
    metrics={metrics}
    rows={rows}
  />
);

function BarChartInner<TDatum>(props: BarChartProps<TDatum>, ref: React.ForwardedRef<HTMLDivElement>) {
  const {
    'aria-label': ariaLabel,
    data,
    index,
    series,
    projection,
    highlight,
    height = 320,
    showLegend,
    showGrid = true,
    showXAxis = true,
    showYAxis = true,
    xTicks = 'category',
    formatValue,
    formatCategory,
    renderEmptyState,
    onRenderError,
    interactive = true,
    selection,
    onSelectionChange,
    onActivate,
    renderTooltip = renderDefaultTooltip,
    ...rest
  } = props;
  const messages = useMessages('chart');
  const [renderError, setRenderError] = React.useState<Error | null>(null);
  const [attempt, setAttempt] = React.useState(0);
  const bridge = React.useMemo(() => bridgeSeries(series), [series]);
  const format = useChartFormat({ formatValue, formatCategory, xTicks });

  const legend = React.useMemo((): readonly ChartLegendItem[] | null => {
    const projectionEntry: ChartLegendItem[] =
      projection?.label === undefined
        ? []
        : [
            {
              key: 'projection',
              label: projection.label,
              description: projection.description,
              color: 'var(--cl-color-foreground-secondary)',
              swatch: 'dashed',
            },
          ];
    const items = [...series, ...projectionEntry];
    return (showLegend ?? (series.length > 1 || projectionEntry.length > 0)) ? items : null;
  }, [projection, series, showLegend]);

  const state: ChartState = renderError ? 'error' : data.length === 0 ? 'empty' : 'ready';

  return (
    <ChartFrame
      ref={ref}
      type='bar'
      state={state}
      height={height}
      legend={legend}
      seriesColors={bridge.colors}
      {...rest}
    >
      {renderError ? (
        <ChartOverlay slot='chart-error'>
          <div {...stylex.props(barStyles.error)}>
            <p>{messages.renderError}</p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setRenderError(null);
                setAttempt(count => count + 1);
              }}
            >
              {messages.retry}
            </Button>
          </div>
        </ChartOverlay>
      ) : (
        <CanvasErrorBoundary
          key={attempt}
          onError={error => {
            onRenderError?.(error);
            setRenderError(error);
          }}
        >
          <BarChartPlot
            ariaLabel={ariaLabel}
            data={data}
            index={index}
            series={series}
            bridge={bridge}
            projection={projection}
            highlight={highlight}
            showGrid={showGrid}
            showXAxis={showXAxis}
            showYAxis={showYAxis}
            xTicks={xTicks}
            format={format}
            interactive={interactive}
            selection={selection}
            onSelectionChange={onSelectionChange}
            onActivate={onActivate}
            renderTooltip={renderTooltip}
          />
          {data.length === 0 ? (
            <ChartOverlay slot='chart-empty'>
              {renderEmptyState ? renderEmptyState() : <DefaultChartEmptyState label={messages.empty} />}
            </ChartOverlay>
          ) : null}
        </CanvasErrorBoundary>
      )}
    </ChartFrame>
  );
}

interface BarChartPlotProps<TDatum> {
  ariaLabel: string;
  data: readonly TDatum[];
  index: (datum: TDatum, index: number) => string;
  series: readonly ChartSeries<TDatum>[];
  bridge: SeriesBridge<TDatum>;
  projection: BarChartProjection | undefined;
  highlight: BarChartHighlight | null | undefined;
  showGrid: boolean;
  showXAxis: boolean;
  showYAxis: boolean;
  xTicks: 'category' | 'calendar';
  format: ChartFormat;
  interactive: boolean;
  selection: BarSelection | null | undefined;
  onSelectionChange: ((selection: BarSelection | null) => void) | undefined;
  onActivate: ((active: ActiveBar<TDatum>) => void) | undefined;
  renderTooltip: (tooltip: BarChartTooltip<TDatum>) => React.ReactNode;
}

/** Owns the headless hook, so a hover re-renders the plot and not the caller. */
function BarChartPlot<TDatum>({
  ariaLabel,
  data,
  index,
  series,
  bridge,
  projection,
  highlight,
  showGrid,
  showXAxis,
  showYAxis,
  xTicks,
  format,
  interactive,
  selection,
  onSelectionChange,
  onActivate,
  renderTooltip,
}: BarChartPlotProps<TDatum>) {
  const { category, section, series: highlightSeries } = highlight ?? {};
  const isBarActive = React.useMemo(
    () => barActivity(bridge, index, { category, section, series: highlightSeries }),
    [bridge, index, category, section, highlightSeries],
  );
  const projectionDatum = projection?.datumIndex;
  const projectionValue = projection?.value;
  const projected = React.useMemo(
    () =>
      projectionDatum === undefined || projectionValue === undefined
        ? undefined
        : { datumIndex: projectionDatum, value: projectionValue },
    [projectionDatum, projectionValue],
  );
  const margin = React.useMemo(
    () => ({ top: 8, right: 0, bottom: showXAxis ? 32 : 0, left: showYAxis ? 44 : 0 }),
    [showXAxis, showYAxis],
  );
  const announceCategory = React.useCallback((key: string) => format.category(key, 'tooltip'), [format]);
  const chart = Primitive.useBarChart({
    data,
    index,
    series: bridge.positioned,
    projection: projected,
    isBarActive,
    categoryGap: categoryGapFor(data.length),
    margin,
    formatCategory: announceCategory,
    ...(interactive ? { selection, onSelectionChange, onActivate } : null),
  });

  return (
    <ChartPlot
      chart={chart}
      aria-label={ariaLabel}
    >
      {showGrid ? <ChartGridLines /> : null}
      <Primitive.StackedBars {...mergeStyleProps(themeProps('chart-marks'), stylex.props(frameStyles.marks))}>
        <Primitive.Bar
          {...mergeStyleProps(themeProps('bar-chart-bar'), stylex.props(seriesMark.mark, barStyles.bar))}
        />
        <Primitive.ProjectionOutline
          {...mergeStyleProps(themeProps('bar-chart-projection-outline'), stylex.props(barStyles.projectionOutline))}
        />
        <ChartZeroLine />
      </Primitive.StackedBars>
      <ChartAxes
        format={format}
        showXAxis={showXAxis}
        showYAxis={showYAxis}
        xTicks={xTicks}
      />
      {interactive && data.length > 0 ? (
        <ChartSelectionLayer<ActiveBar<TDatum>> activatable={onActivate !== undefined}>
          {active => {
            const tooltip = barTooltip({ active, series, projection, format });
            return tooltip ? renderTooltip(tooltip) : null;
          }}
        </ChartSelectionLayer>
      ) : null}
    </ChartPlot>
  );
}

interface CanvasErrorBoundaryProps {
  onError: (error: Error) => void;
  children: React.ReactNode;
}

/** Catches a lost or missing Canvas context. Any other error keeps propagating. */
class CanvasErrorBoundary extends React.Component<CanvasErrorBoundaryProps, { error: unknown }> {
  override state: { error: unknown } = { error: null };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  override componentDidCatch(error: unknown) {
    if (error instanceof Primitive.CanvasRenderError) {
      this.props.onError(error);
    }
  }

  override render() {
    const { error } = this.state;
    if (error === null) {
      return this.props.children;
    }
    if (error instanceof Primitive.CanvasRenderError) {
      return null;
    }
    // eslint-disable-next-line typescript/only-throw-error -- Rethrows what a child threw, unchanged, so the next boundary up handles it.
    throw error;
  }
}

/**
 * A stacked bar chart with values above and below zero, over the headless `BarChart` primitive. It
 * renders the legend, grid, bars, axes, hover band and tooltip, and owns the empty and Canvas-error
 * states.
 */
// eslint-disable-next-line typescript/consistent-type-assertions -- forwardRef drops the TDatum type parameter; React 18 support rules out a generic ref prop.
export const BarChart = React.forwardRef(BarChartInner) as <TDatum>(
  props: BarChartProps<TDatum> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;
