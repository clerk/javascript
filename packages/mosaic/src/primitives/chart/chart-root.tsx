'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { ChartContext, type ChartContextValue } from './chart-context';
import type { ChartInstance } from './types';

export type ChartRootProps = Omit<ComponentProps<'div'>, 'aria-label'> & {
  /** The result of a chart-type hook, such as `BarChart.useBarChart`. */
  chart: ChartInstance;
  /** Default: 500 */
  height?: number | string;
  /** Labels the chart image and the interaction surface. */
  'aria-label': string;
};

type InteractionMode = 'pending' | 'interactive' | 'visual-only';

export const ChartRoot = React.forwardRef<HTMLDivElement, ChartRootProps>(function ChartRoot(props, ref) {
  const { chart, height = 500, 'aria-label': ariaLabel, render, children, ...otherProps } = props;

  const [interactionLayers, setInteractionLayers] = React.useState(0);
  const registerInteraction = React.useCallback(() => {
    setInteractionLayers(count => count + 1);
    return () => setInteractionLayers(count => count - 1);
  }, []);

  const context = React.useMemo<ChartContextValue>(
    () => ({ chart, ariaLabel, registerInteraction }),
    [chart, ariaLabel, registerInteraction],
  );

  const interactionMode: InteractionMode =
    chart.size.width <= 0
      ? 'pending'
      : interactionLayers > 0 && chart.categories.length > 0
        ? 'interactive'
        : 'visual-only';

  const ownProps = {
    style: { position: 'relative', minWidth: 0, overflow: 'hidden', height },
    children,
  } satisfies DefaultProps<'div'>;

  const element = useRender({
    defaultTagName: 'div',
    render,
    ref: [chart.rootRef, ref],
    state: { interactionMode },
    stateAttributesMapping: {
      interactionMode: (mode: InteractionMode) => ({ 'data-chart-interaction-mode': mode }),
    },
    props: mergeProps<'div'>(ownProps, otherProps),
  });

  return <ChartContext.Provider value={context}>{element}</ChartContext.Provider>;
});
