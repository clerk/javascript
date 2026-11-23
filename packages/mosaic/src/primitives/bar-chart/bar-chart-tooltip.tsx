'use client';

import { autoUpdate, flip, offset, shift, size, useFloating } from '@floating-ui/react';
import React from 'react';

import { useTransition } from '../hooks/use-transition';
import { Portal } from '../portal';
import { type ComponentProps, type DefaultProps, Freeze, mergeProps, useRender } from '../utils';
import { getWindow } from '../utils/dom';
import { parsePlacement } from '../utils/side-offset';
import { useBarSelectionContext } from './bar-chart-context';
import type { ActiveBar } from './types';

const EDGE = 8;
const SIDE_OFFSET = 16;
const PINNED_BELOW_PLOT_WIDTH = 416;

export type BarChartTooltipProps<TDatum = unknown> = Omit<ComponentProps<'div'>, 'children'> & {
  /** Content for the selected bar. Return null to hide the tooltip. */
  children: (active: ActiveBar<TDatum>) => React.ReactNode;
  /** Element the tooltip stays inside. Default: the chart */
  boundaryRef?: React.RefObject<HTMLElement | null>;
};

type Side = 'left' | 'right';

function tooltipMiddleware(getBoundary: () => Element | undefined, pinned: boolean) {
  return [
    offset(pinned ? 0 : SIDE_OFFSET),
    flip(() => ({ boundary: getBoundary(), padding: EDGE, crossAxis: false })),
    shift(() => ({ boundary: getBoundary(), padding: EDGE, crossAxis: true })),
    size(() => ({
      boundary: getBoundary(),
      padding: EDGE,
      apply({ elements }) {
        const boundary = getBoundary()?.getBoundingClientRect();
        const viewportWidth = getWindow(elements.floating).document.documentElement.clientWidth;
        const left = Math.max(EDGE, (boundary?.left ?? 0) + EDGE);
        const right = Math.min(viewportWidth - EDGE, (boundary?.right ?? viewportWidth) - EDGE);
        elements.floating.style.maxWidth = `${Math.max(0, right - left)}px`;
      },
    })),
  ];
}

// eslint-disable-next-line typescript/consistent-type-assertions -- The ref wrapper drops the row type parameter; `children` only receives rows the chart was given.
export const BarChartTooltip = React.forwardRef<HTMLDivElement, BarChartTooltipProps>(
  function BarChartTooltip(props, ref) {
    const { children, boundaryRef, render, ...otherProps } = props;
    const { activeBar, selectedCategory, registerTooltip, plot, chartWidth, chartBoxRef } =
      useBarSelectionContext('Tooltip');
    React.useLayoutEffect(registerTooltip, [registerTooltip]);

    const content = activeBar && selectedCategory ? children(activeBar) : null;
    const open = content !== null && content !== undefined;
    const anchorX = selectedCategory?.center;

    const pinned = plot.width < PINNED_BELOW_PLOT_WIDTH;
    const popupRef = React.useRef<HTMLDivElement | null>(null);
    const getBoundary = React.useCallback(
      () => boundaryRef?.current ?? chartBoxRef.current ?? undefined,
      [boundaryRef, chartBoxRef],
    );
    // eslint-disable-next-line react/refs -- The middleware reads the boundary refs when floating-ui computes a position, not during render.
    const middleware = React.useMemo(() => tooltipMiddleware(getBoundary, pinned), [getBoundary, pinned]);

    const [lastSide, setLastSide] = React.useState<Side>('right');
    const {
      refs,
      floatingStyles,
      placement: resolvedPlacement,
      isPositioned,
    } = useFloating({
      open,
      strategy: 'fixed',
      transform: false,
      placement: pinned ? 'bottom-start' : `${lastSide}-start`,
      middleware,
      whileElementsMounted: autoUpdate,
    });
    const resolvedSide = parsePlacement(resolvedPlacement).side;
    // Starting from the side chosen last time stops the tooltip crossing the bar twice near an edge.
    if (!pinned && (resolvedSide === 'left' || resolvedSide === 'right') && resolvedSide !== lastSide) {
      setLastSide(resolvedSide);
    }

    React.useLayoutEffect(() => {
      const chart = chartBoxRef.current;
      if (anchorX === undefined || !chart || chartWidth <= 0) {
        return;
      }
      const getBoundingClientRect = () => {
        const chartRect = chart.getBoundingClientRect();
        if (pinned) {
          const boundary = getBoundary()?.getBoundingClientRect() ?? chartRect;
          return new DOMRect(boundary.left + EDGE, boundary.top + EDGE, 0, 0);
        }
        const x = Math.round((chartRect.left + (anchorX / chartWidth) * chartRect.width) * 2) / 2;
        return new DOMRect(x, chartRect.top + plot.y, 0, 0);
      };
      refs.setReference({ getBoundingClientRect, contextElement: chart });
    }, [anchorX, chartBoxRef, chartWidth, getBoundary, pinned, plot, refs]);

    const { mounted, transitionProps } = useTransition({ open, ref: popupRef });

    const ownProps = {
      ...transitionProps,
      'data-side': resolvedSide,
      style: {
        ...floatingStyles,
        pointerEvents: 'none',
        ...(isPositioned ? null : { visibility: 'hidden' }),
        ...transitionProps.style,
      },
      children: <Freeze frozen={!open}>{open ? content : null}</Freeze>,
    } satisfies DefaultProps<'div'>;

    const element = useRender({
      defaultTagName: 'div',
      render,
      enabled: mounted,
      ref: [refs.setFloating, popupRef, ref],
      props: mergeProps<'div'>(ownProps, otherProps),
    });

    return mounted ? <Portal>{element}</Portal> : null;
  },
) as <TDatum = unknown>(
  props: BarChartTooltipProps<TDatum> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;
