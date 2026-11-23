'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { hasArea, useChartContext } from './chart-context';
import type { XTick, XTickMode } from './types';

export type ChartXAxisProps = Omit<ComponentProps<'svg'>, 'children' | 'format'> & {
  /**
   * `category` thins category labels to fit. `calendar` labels calendar boundaries for long ranges;
   * category keys must be UTC dates. Default: 'category'
   */
  ticks?: XTickMode;
  /** Returns the label for a category key, or null to omit it. Default: the key */
  format?: (value: string) => string | null;
  /** Renders the labels, usually one `Chart.XTick` per entry. */
  children?: (ticks: readonly XTick[]) => React.ReactNode;
};

const formatCategory = (value: string) => value;

export const ChartXAxis = React.forwardRef<SVGSVGElement, ChartXAxisProps>(function ChartXAxis(props, ref) {
  const { ticks = 'category', format = formatCategory, children, render, ...otherProps } = props;
  const { chart } = useChartContext('XAxis');
  const { size, xTicks: getXTicks } = chart;
  const xTicks = React.useMemo(() => getXTicks({ mode: ticks, format }), [format, getXTicks, ticks]);

  const ownProps = {
    width: size.width,
    height: size.height,
    'aria-hidden': 'true',
    style: { position: 'absolute', inset: 0, display: 'block', overflow: 'visible' },
    children: children?.(xTicks),
  } satisfies DefaultProps<'svg'>;

  return useRender({
    defaultTagName: 'svg',
    render,
    ref,
    enabled: hasArea(size),
    props: mergeProps<'svg'>(ownProps, otherProps),
  });
});
