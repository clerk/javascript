'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { BarSelectionContext, type BarSelectionContextValue, hasArea, useBarChartContext } from './bar-chart-context';
import type { BarChartInstance } from './use-bar-chart';

const VISUALLY_HIDDEN_STYLE: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: 0,
};

export type BarChartBarSelectionProps = ComponentProps<'div'>;

function KeyboardInstructions({
  id,
  canActivate,
  announcement,
}: Readonly<{ id: string; canActivate: boolean; announcement: string }>) {
  return (
    <>
      <span
        id={id}
        style={VISUALLY_HIDDEN_STYLE}
      >
        Use Left and Right to choose a period, or Home and End to jump to the first or last. Use Up and Down to choose
        positive or negative values. {canActivate ? 'Press Enter or Space to open the selected period. ' : ''}
        Press Escape to dismiss.
      </span>
      <span
        role='status'
        style={VISUALLY_HIDDEN_STYLE}
      >
        {announcement}
      </span>
    </>
  );
}

export const BarChartBarSelection = React.forwardRef<HTMLDivElement, BarChartBarSelectionProps>(
  function BarChartBarSelection(props, ref) {
    const { chart, ariaLabel, registerInteraction } = useBarChartContext('BarSelection');
    React.useLayoutEffect(registerInteraction, [registerInteraction]);
    if (!hasArea(chart.size) || chart.categories.length === 0) {
      return null;
    }
    return (
      <BarSelectionSurface
        {...props}
        forwardedRef={ref}
        chart={chart}
        ariaLabel={ariaLabel}
      />
    );
  },
);

type SurfaceProps = BarChartBarSelectionProps & {
  forwardedRef: React.ForwardedRef<HTMLDivElement>;
  chart: BarChartInstance;
  ariaLabel: string;
};

function BarSelectionSurface({ forwardedRef, chart, ariaLabel, children, render, ...otherProps }: SurfaceProps) {
  const chartBoxRef = React.useRef<HTMLDivElement | null>(null);
  const keyboardInstructionsId = React.useId();
  const [tooltipCount, setTooltipCount] = React.useState(0);
  const registerTooltip = React.useCallback(() => {
    setTooltipCount(count => count + 1);
    return () => setTooltipCount(count => count - 1);
  }, []);
  const selectionContext = React.useMemo<BarSelectionContextValue>(
    () => ({ chartBoxRef, registerTooltip }),
    [registerTooltip],
  );

  const interaction = chart.getInteractionProps();
  const focusable = interaction.tabIndex === 0 || tooltipCount > 0;
  const surfaceProps = { ...interaction, tabIndex: focusable ? 0 : undefined };
  const { plot } = chart;

  const ownProps = {
    style: { position: 'absolute', inset: 0, pointerEvents: 'none' },
    children: (
      <>
        <div
          {...surfaceProps}
          data-chart-interaction=''
          style={{
            position: 'absolute',
            left: plot.x,
            top: plot.y,
            width: plot.width,
            height: plot.height,
            pointerEvents: 'auto',
          }}
          aria-describedby={keyboardInstructionsId}
          aria-label={focusable ? ariaLabel : undefined}
        >
          {children}
        </div>
        <KeyboardInstructions
          id={keyboardInstructionsId}
          canActivate={interaction.role === 'button'}
          announcement={chart.announcement}
        />
      </>
    ),
  } satisfies DefaultProps<'div'>;

  const element = useRender({
    defaultTagName: 'div',
    render,
    ref: [chartBoxRef, forwardedRef],
    props: mergeProps<'div'>(ownProps, otherProps),
  });

  return <BarSelectionContext.Provider value={selectionContext}>{element}</BarSelectionContext.Provider>;
}
