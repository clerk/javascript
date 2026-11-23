'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { hasArea, useBarChartContext } from './bar-chart-context';
import { selectXTicks, type XTick } from './x-ticks';

export type BarChartXAxisProps = Omit<ComponentProps<'svg'>, 'children' | 'format'> & {
  /**
   * `category` thins category labels to fit. `calendar` labels calendar boundaries for long ranges;
   * category keys must be UTC dates. Default: 'category'
   */
  ticks?: 'category' | 'calendar';
  /** Returns the label for a category key, or null to omit it. Default: the key */
  format?: (value: string) => string | null;
  /** Renders the labels, usually one `BarChart.XTick` per entry. */
  children?: (ticks: readonly XTick[]) => React.ReactNode;
};

const formatCategory = (value: string) => value;

export const BarChartXAxis = React.forwardRef<SVGSVGElement, BarChartXAxisProps>(function BarChartXAxis(props, ref) {
  const { ticks = 'category', format = formatCategory, children, render, ...otherProps } = props;
  const { frame, layout } = useBarChartContext('XAxis');
  const xTicks = React.useMemo(
    () =>
      selectXTicks({
        categories: layout.categories,
        plot: layout.plot,
        viewportWidth: frame.size.width,
        xAxis: ticks === 'calendar' ? 'calendar' : undefined,
        formatXTick: format,
      }),
    [format, frame.size.width, layout.categories, layout.plot, ticks],
  );

  const ownProps = {
    width: frame.size.width,
    height: frame.size.height,
    'aria-hidden': 'true',
    style: { position: 'absolute', inset: 0, display: 'block', overflow: 'visible' },
    children: children?.(xTicks),
  } satisfies DefaultProps<'svg'>;

  return useRender({
    defaultTagName: 'svg',
    render,
    ref,
    enabled: hasArea(frame.size),
    props: mergeProps<'svg'>(ownProps, otherProps),
  });
});
