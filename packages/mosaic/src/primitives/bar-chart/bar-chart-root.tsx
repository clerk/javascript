'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { BarChartContext, type BarChartContextValue } from './bar-chart-context';
import type { BarChartInstance } from './use-bar-chart';

export type BarChartRootProps<TDatum = unknown> = Omit<ComponentProps<'div'>, 'aria-label'> & {
  /** The result of `BarChart.useBarChart`. */
  chart: BarChartInstance<TDatum>;
  /** Default: 500 */
  height?: number | string;
  /** Labels the bars image and the interaction surface. */
  'aria-label': string;
};

type InteractionMode = 'pending' | 'interactive' | 'visual-only';

// eslint-disable-next-line typescript/consistent-type-assertions -- The ref wrapper drops the row type parameter; the parts read the chart through context.
export const BarChartRoot = React.forwardRef<HTMLDivElement, BarChartRootProps>(function BarChartRoot(props, ref) {
  const { chart, height = 500, 'aria-label': ariaLabel, render, children, ...otherProps } = props;

  const [interactionLayers, setInteractionLayers] = React.useState(0);
  const registerInteraction = React.useCallback(() => {
    setInteractionLayers(count => count + 1);
    return () => setInteractionLayers(count => count - 1);
  }, []);

  const context: BarChartContextValue = { chart, ariaLabel, registerInteraction };

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

  return <BarChartContext.Provider value={context}>{element}</BarChartContext.Provider>;
}) as <TDatum = unknown>(
  props: BarChartRootProps<TDatum> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;
