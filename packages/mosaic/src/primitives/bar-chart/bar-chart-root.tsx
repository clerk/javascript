'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { BarChartActiveCategoryContext, BarChartContext, type BarChartContextValue } from './bar-chart-context';
import { DEFAULT_CHART_MARGIN } from './bar-chart-layout';
import type { ChartMargin } from './types';
import { useChartSize } from './use-chart-size';
import type { StackedBarLayoutSource } from './use-stacked-bar-layout';

export type BarChartRootProps = Omit<ComponentProps<'div'>, 'aria-label'> & {
  /** A stable layout source from `BarChart.useStackedBarLayout`. */
  layout: StackedBarLayoutSource;
  /** Default: 500 */
  height?: number | string;
  margin?: Partial<ChartMargin>;
  /** Labels the bars image and the interaction surface. */
  'aria-label': string;
};

type InteractionMode = 'pending' | 'interactive' | 'visual-only';

export const BarChartRoot = React.forwardRef<HTMLDivElement, BarChartRootProps>(function BarChartRoot(props, ref) {
  const { layout, height = 500, margin, 'aria-label': ariaLabel, render, children, ...otherProps } = props;
  const { ref: sizeRef, size } = useChartSize<HTMLDivElement>();
  const top = margin?.top ?? DEFAULT_CHART_MARGIN.top;
  const right = margin?.right ?? DEFAULT_CHART_MARGIN.right;
  const bottom = margin?.bottom ?? DEFAULT_CHART_MARGIN.bottom;
  const left = margin?.left ?? DEFAULT_CHART_MARGIN.left;
  const frame = React.useMemo(() => ({ size, margin: { top, right, bottom, left } }), [bottom, left, right, size, top]);
  const projected = React.useMemo(() => layout.project(frame), [frame, layout]);

  const [interactionLayers, setInteractionLayers] = React.useState(0);
  const registerInteraction = React.useCallback(() => {
    setInteractionLayers(count => count + 1);
    return () => setInteractionLayers(count => count - 1);
  }, []);
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  const context = React.useMemo<BarChartContextValue>(
    () => ({
      frame,
      layout: projected,
      data: layout.data,
      ariaLabel,
      registerInteraction,
      setActiveCategory,
    }),
    [ariaLabel, frame, layout.data, projected, registerInteraction],
  );

  const interactionMode: InteractionMode =
    size.width <= 0
      ? 'pending'
      : interactionLayers > 0 && projected.categories.length > 0
        ? 'interactive'
        : 'visual-only';

  const ownProps = {
    style: { position: 'relative', minWidth: 0, overflow: 'hidden', height },
    children: (
      <BarChartActiveCategoryContext.Provider value={activeCategory}>{children}</BarChartActiveCategoryContext.Provider>
    ),
  } satisfies DefaultProps<'div'>;

  const element = useRender({
    defaultTagName: 'div',
    render,
    ref: [sizeRef, ref],
    state: { interactionMode },
    stateAttributesMapping: {
      interactionMode: (mode: InteractionMode) => ({ 'data-chart-interaction-mode': mode }),
    },
    props: mergeProps<'div'>(ownProps, otherProps),
  });

  return <BarChartContext.Provider value={context}>{element}</BarChartContext.Provider>;
});
