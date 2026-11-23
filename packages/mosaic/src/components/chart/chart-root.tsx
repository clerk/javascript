'use client';

import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useMessages } from '../../localization/context';
import { Chart as Primitive } from '../../primitives/chart';
import type { MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { Button } from '../button';
import { EmptyState } from '../empty-state';
import { rootStyles } from './chart-root.styles';
import { CHART_STYLE, type ChartInstance, ChartStyleContext } from './internal/chart-style';
import { seriesColors } from './internal/series.styles';
import { SERIES_SLOTS } from './internal/series-bridge';

/** `ready` once there is data to draw, `empty` without rows, `error` when painting failed. */
export type ChartState = 'ready' | 'empty' | 'error';

export interface ChartRootProps extends Omit<MosaicElementProps<'div'>, 'aria-label'> {
  /** The result of a styled chart-type hook, such as `Chart.useBarChart`. */
  chart: ChartInstance;
  /** Names the chart for assistive technology. */
  'aria-label': string;
  /**
   * Total height, legend included, so the legend wrapping never changes the footprint.
   *
   * @default 320
   */
  height?: number | string;
  /** Replaces the default `EmptyState` shown when the chart has no rows. */
  renderEmptyState?: () => React.ReactNode;
  /** Called when the Canvas fails to paint, before the built-in retry appears. */
  onRenderError?: (error: Error) => void;
}

/**
 * The `cl-chart` root: a column with the legend above the plot. It sets each series color for the
 * parts inside, reflects `data-state`, and covers the plot with the empty state or, after a Canvas
 * failure, a retry.
 */
export const ChartRoot = React.forwardRef<HTMLDivElement, ChartRootProps>(function ChartRoot(
  { chart, 'aria-label': ariaLabel, height = 320, renderEmptyState, onRenderError, children, xstyle, ...rest },
  ref,
) {
  const style = chart[CHART_STYLE];
  const messages = useMessages('chart');
  const [renderError, setRenderError] = React.useState<Error | null>(null);
  const [attempt, setAttempt] = React.useState(0);
  const [legendHost, setLegendHost] = React.useState<HTMLDivElement | null>(null);
  const context = React.useMemo(() => ({ style, legendHost }), [legendHost, style]);
  const state: ChartState = renderError ? 'error' : style.empty ? 'empty' : 'ready';
  const colorStyles = style.colors.flatMap((color, position) => {
    const slot = SERIES_SLOTS[position];
    return slot === undefined ? [] : [seriesColors[slot](color)];
  });

  return (
    <div
      ref={ref}
      {...mergeStyleProps(
        themeProps('chart', { chart: style.type, state }),
        stylex.props(
          reset.base,
          rootStyles.root,
          rootStyles.height(typeof height === 'number' ? `${height}px` : height),
          colorStyles,
          xstyle,
        ),
        rest,
      )}
    >
      <div
        ref={setLegendHost}
        {...stylex.props(rootStyles.legendHost)}
      />
      <div {...stylex.props(rootStyles.plotArea)}>
        {renderError ? (
          <ChartOverlay slot='chart-error'>
            <div {...stylex.props(rootStyles.error)}>
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
            <ChartStyleContext.Provider value={context}>
              <Primitive.Root
                chart={chart}
                aria-label={ariaLabel}
                height='100%'
                {...mergeStyleProps(themeProps('chart-plot'), stylex.props(rootStyles.plot))}
              >
                {children}
              </Primitive.Root>
            </ChartStyleContext.Provider>
            {style.empty ? (
              <ChartOverlay slot='chart-empty'>
                {renderEmptyState ? (
                  renderEmptyState()
                ) : (
                  <EmptyState.Root>
                    <EmptyState.Label>{messages.empty}</EmptyState.Label>
                  </EmptyState.Root>
                )}
              </ChartOverlay>
            ) : null}
          </CanvasErrorBoundary>
        )}
      </div>
    </div>
  );
});

/** Covers the plot, for the empty and error states. */
function ChartOverlay({ slot, children }: Readonly<{ slot: string; children: React.ReactNode }>) {
  return <div {...mergeStyleProps(themeProps(slot), stylex.props(rootStyles.overlay))}>{children}</div>;
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
