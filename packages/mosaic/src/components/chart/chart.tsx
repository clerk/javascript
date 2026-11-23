'use client';

import * as stylex from '@stylexjs/stylex';
import React from 'react';
import { createPortal } from 'react-dom';

import type { MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../styles/focus-outline.styles';
import { reset } from '../../styles/reset.styles';
import { Tooltip } from '../tooltip';
import { legendStyles, swatchStyles, tooltipContentStyles } from './chart.styles';
import {
  type ChartColor,
  type ChartLegendItem,
  type ChartSwatch,
  type ChartTooltipMetric,
  type ChartTooltipRow,
  resolveChartColor,
} from './chart-series';
import { ChartStyleContext } from './internal/chart-style';

function Swatch({ color, swatch }: Readonly<{ color: ChartColor; swatch: ChartSwatch }>) {
  return (
    <span
      aria-hidden='true'
      {...mergeStyleProps(
        themeProps('chart-swatch', { swatch }),
        stylex.props(swatchStyles.base, swatchStyles[swatch], swatchStyles.color(resolveChartColor(color))),
      )}
    />
  );
}

export interface ChartLegendProps extends Omit<MosaicElementProps<'ul'>, 'children'> {
  /** The entries, in order. Default: the chart's series, then a labelled projection */
  items?: readonly ChartLegendItem[];
  /** Renders an item's label. The swatch stays. Default: `item.label` */
  children?: (item: ChartLegendItem) => React.ReactNode;
}

/**
 * A row of swatch and label pairs. Inside `Chart.Root` it reads the chart's series and renders
 * above the plot. Elsewhere it takes `items`, so it renders in a card header or beside a skeleton.
 */
export const ChartLegend = React.forwardRef<HTMLUListElement, ChartLegendProps>(function ChartLegend(
  { items, children, xstyle, ...rest },
  ref,
) {
  const chart = React.useContext(ChartStyleContext);
  const entries = items ?? chart?.style.legend;
  if (!entries) {
    throw new Error('<Chart.Legend> needs `items` outside <Chart.Root>');
  }
  const legend = (
    <ul
      ref={ref}
      {...mergeStyleProps(themeProps('chart-legend'), stylex.props(reset.base, legendStyles.root, xstyle), rest)}
    >
      {entries.map(item => {
        const content = (
          <>
            <Swatch
              color={item.color}
              swatch={item.swatch ?? 'square'}
            />
            {children ? children(item) : item.label}
          </>
        );
        return (
          <li
            key={item.key}
            data-series={item.key}
            {...mergeStyleProps(
              themeProps('chart-legend-item', { described: item.description !== undefined }),
              stylex.props(reset.base, legendStyles.item),
            )}
          >
            {item.description === undefined ? (
              content
            ) : (
              <Tooltip.Root>
                <Tooltip.Trigger
                  xstyle={[reset.base, legendStyles.trigger, focusOutline.visible]}
                  type='button'
                >
                  {content}
                </Tooltip.Trigger>
                <Tooltip.Popup>{item.description}</Tooltip.Popup>
              </Tooltip.Root>
            )}
          </li>
        );
      })}
    </ul>
  );
  if (!chart) {
    return legend;
  }
  // Rendered from inside the plot, but placed above it: the plot's layers cover the whole plot box.
  return chart.legendHost ? createPortal(legend, chart.legendHost) : null;
});

export interface ChartTooltipContentProps extends Omit<MosaicElementProps<'div'>, 'children'> {
  /** The period or category the tooltip describes. */
  heading: React.ReactNode;
  /** Sits at the end of the heading row, such as a change `Badge`. */
  trailing?: React.ReactNode;
  /** Summary rows between the heading and the series rows. */
  metrics?: readonly ChartTooltipMetric[];
  rows?: readonly ChartTooltipRow[];
  /** Sits below the rows, such as a `Banner`. */
  footer?: React.ReactNode;
}

/**
 * The body of a chart tooltip: a heading, summary metrics, one row per series and a footer. Values
 * lead in the foreground color with tabular figures; labels follow in the secondary color.
 */
export const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  function ChartTooltipContent({ heading, trailing, metrics = [], rows = [], footer, xstyle, ...rest }, ref) {
    return (
      <div
        ref={ref}
        {...mergeStyleProps(
          themeProps('chart-tooltip-content'),
          stylex.props(reset.base, tooltipContentStyles.root, xstyle),
          rest,
        )}
      >
        <div
          {...mergeStyleProps(
            themeProps('chart-tooltip-heading'),
            stylex.props(reset.base, tooltipContentStyles.heading),
          )}
        >
          <span>{heading}</span>
          {trailing}
        </div>
        {metrics.length > 0 ? (
          <dl {...stylex.props(reset.base, tooltipContentStyles.list)}>
            {metrics.map(metric => (
              <div
                key={metric.label}
                {...mergeStyleProps(
                  themeProps('chart-tooltip-metric'),
                  stylex.props(reset.base, tooltipContentStyles.row),
                )}
              >
                <dt {...stylex.props(reset.base, tooltipContentStyles.label)}>{metric.label}</dt>
                <dd {...stylex.props(reset.base, tooltipContentStyles.value)}>{metric.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {rows.length > 0 ? (
          <ul {...stylex.props(reset.base, tooltipContentStyles.list)}>
            {rows.map(row => (
              <li
                key={row.key}
                data-series={row.key}
                {...mergeStyleProps(
                  themeProps('chart-tooltip-row'),
                  stylex.props(reset.base, tooltipContentStyles.row),
                )}
              >
                <Swatch
                  color={row.color}
                  swatch={row.swatch ?? 'line'}
                />
                <span {...stylex.props(tooltipContentStyles.label)}>{row.label}</span>
                <span {...stylex.props(tooltipContentStyles.value)}>{row.value}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {footer}
      </div>
    );
  },
);
