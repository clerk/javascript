'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { hasArea, SelectionContext, type SelectionContextValue, useChartContext } from './chart-context';
import type { ChartInstance } from './types';

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

export type ChartSelectionProps = ComponentProps<'div'>;

function KeyboardInstructions({
  id,
  instructions,
  announcement,
}: Readonly<{ id: string; instructions: string; announcement: string }>) {
  return (
    <>
      <span
        id={id}
        style={VISUALLY_HIDDEN_STYLE}
      >
        {instructions}
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

export const ChartSelection = React.forwardRef<HTMLDivElement, ChartSelectionProps>(
  function ChartSelection(props, ref) {
    const { chart, ariaLabel, registerInteraction } = useChartContext('Selection');
    React.useLayoutEffect(registerInteraction, [registerInteraction]);
    if (!hasArea(chart.size) || chart.categories.length === 0) {
      return null;
    }
    return (
      <SelectionSurface
        {...props}
        forwardedRef={ref}
        chart={chart}
        ariaLabel={ariaLabel}
      />
    );
  },
);

type SurfaceProps = ChartSelectionProps & {
  forwardedRef: React.ForwardedRef<HTMLDivElement>;
  chart: ChartInstance;
  ariaLabel: string;
};

function SelectionSurface({ forwardedRef, chart, ariaLabel, children, render, ...otherProps }: SurfaceProps) {
  const chartBoxRef = React.useRef<HTMLDivElement | null>(null);
  const keyboardInstructionsId = React.useId();
  const [tooltipCount, setTooltipCount] = React.useState(0);
  const registerTooltip = React.useCallback(() => {
    setTooltipCount(count => count + 1);
    return () => setTooltipCount(count => count - 1);
  }, []);
  const selectionContext = React.useMemo<SelectionContextValue>(
    () => ({ chartBoxRef, registerTooltip }),
    [registerTooltip],
  );

  const interaction = chart.getInteractionProps();
  const focusable = !interaction['aria-disabled'] && (interaction.tabIndex === 0 || tooltipCount > 0);
  const surfaceProps = { ...interaction, tabIndex: focusable ? 0 : undefined };
  const { plot } = chart;

  const ownProps = {
    style: { position: 'absolute', inset: 0, pointerEvents: 'none' },
    children: (
      <>
        <div
          {...surfaceProps}
          style={{
            position: 'absolute',
            left: plot.x,
            top: plot.y,
            width: plot.width,
            height: plot.height,
            pointerEvents: 'auto',
          }}
          aria-describedby={keyboardInstructionsId}
          aria-label={focusable || surfaceProps['aria-disabled'] ? ariaLabel : undefined}
        >
          {children}
        </div>
        <KeyboardInstructions
          id={keyboardInstructionsId}
          instructions={chart.keyboardInstructions}
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

  return <SelectionContext.Provider value={selectionContext}>{element}</SelectionContext.Provider>;
}
