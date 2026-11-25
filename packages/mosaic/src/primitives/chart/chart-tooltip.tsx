'use client';

import { arrow, autoUpdate, flip, offset, shift, size, useFloating, useInteractions } from '@floating-ui/react';
import React from 'react';

import { useTransition } from '../hooks/use-transition';
import { TooltipContext, type TooltipContextValue } from '../tooltip/tooltip-context';
import { cssVars } from '../utils/css-vars';
import { getWindow } from '../utils/dom';
import { parsePlacement } from '../utils/side-offset';
import { useChartContext, useSelectionContext } from './chart-context';
import type { ChartActive } from './types';

const PINNED_BELOW_PLOT_WIDTH = 416;

type Side = 'left' | 'right';

export interface ChartTooltipProps<TActive extends ChartActive = ChartActive> {
  /**
   * Renders the tooltip for the selected category, usually `Chart.TooltipPortal`,
   * `Chart.TooltipPositioner` and `Chart.TooltipPopup`. While the tooltip closes it receives the
   * last selection, so the content does not change under the exit.
   */
  children: (active: TActive) => React.ReactNode;
  /** The side tried first. The tooltip flips to the other side when this one does not fit. Default: 'right' */
  side?: Side;
  /** Distance in px from the selected category's center. Default: 16 */
  sideOffset?: number;
  /** Space in px kept between the tooltip and the edges of `collisionBoundary`. Default: 8 */
  collisionPadding?: number;
  /** Element the tooltip stays inside. Default: the chart */
  collisionBoundary?: React.RefObject<HTMLElement | null>;
  /**
   * Pins the tooltip to the top left of `collisionBoundary` instead of beside the selection.
   * `'auto'` pins it while the plot is narrower than 416px. Default: 'auto'
   */
  pinned?: boolean | 'auto';
}

type BoundaryRef = React.RefObject<HTMLElement | null>;

/** Reads the boundary when floating-ui computes a position, not during render. */
function boundaryReader(collisionBoundary: BoundaryRef | undefined, chartBoxRef: BoundaryRef) {
  return () => collisionBoundary?.current ?? chartBoxRef.current ?? undefined;
}

function tooltipMiddleware(
  getBoundary: () => Element | undefined,
  pinned: boolean,
  sideOffset: number,
  padding: number,
  arrowRef: React.RefObject<SVGSVGElement | null>,
) {
  return [
    offset(pinned ? 0 : sideOffset),
    flip(() => ({ boundary: getBoundary(), padding, crossAxis: false })),
    shift(() => ({ boundary: getBoundary(), padding, crossAxis: true })),
    size(() => ({
      boundary: getBoundary(),
      padding,
      apply({ elements }) {
        const boundary = getBoundary()?.getBoundingClientRect();
        const viewportWidth = getWindow(elements.floating).document.documentElement.clientWidth;
        const left = Math.max(padding, (boundary?.left ?? 0) + padding);
        const right = Math.min(viewportWidth - padding, (boundary?.right ?? viewportWidth) - padding);
        elements.floating.style.maxWidth = `${Math.max(0, right - left)}px`;
      },
    })),
    arrow({ element: arrowRef }),
    cssVars({ sideOffset }),
  ];
}

/**
 * Positions a tooltip beside the selected category. It renders no element: it provides the
 * Tooltip primitive's context, so `Chart.TooltipPortal`, `Chart.TooltipPositioner`,
 * `Chart.TooltipPopup` and `Chart.TooltipArrow` are the Tooltip parts, anchored to the chart.
 */
export function ChartTooltip<TActive extends ChartActive = ChartActive>(props: ChartTooltipProps<TActive>) {
  const {
    children,
    side = 'right',
    sideOffset = 16,
    collisionPadding = 8,
    collisionBoundary,
    pinned: pinnedProp = 'auto',
  } = props;
  const { registerTooltip, chartBoxRef } = useSelectionContext('Tooltip');
  const { chart } = useChartContext('Tooltip');
  React.useLayoutEffect(registerTooltip, [registerTooltip]);

  const { plot } = chart;
  const chartWidth = chart.size.width;
  const anchor = chart.tooltipAnchor;
  // eslint-disable-next-line typescript/consistent-type-assertions -- The context holds the chart without its active type; the caller names the type its chart-type hook selects.
  const active = chart.selected as TActive | null;
  const open = active !== null && anchor !== null;
  const anchorX = anchor?.x;
  const anchorY = anchor?.y;

  const [held, setHeld] = React.useState<TActive | null>(active);
  if (open && !Object.is(held, active)) {
    setHeld(active);
  }

  const pinned = pinnedProp === 'auto' ? plot.width < PINNED_BELOW_PLOT_WIDTH : pinnedProp;
  const popupRef = React.useRef<HTMLDivElement | null>(null);
  const arrowRef = React.useRef<SVGSVGElement | null>(null);
  const middleware = React.useMemo(
    () =>
      // eslint-disable-next-line react/refs -- The middleware reads the boundary and arrow refs when floating-ui computes a position, not during render.
      tooltipMiddleware(boundaryReader(collisionBoundary, chartBoxRef), pinned, sideOffset, collisionPadding, arrowRef),
    [chartBoxRef, collisionBoundary, collisionPadding, pinned, sideOffset],
  );

  const [lastSide, setLastSide] = React.useState<Side>(side);
  const {
    refs,
    floatingStyles,
    context: floatingContext,
    placement,
    isPositioned,
  } = useFloating({
    open,
    strategy: 'fixed',
    transform: false,
    placement: pinned ? 'bottom-start' : `${lastSide}-start`,
    middleware,
    whileElementsMounted: autoUpdate,
  });
  const resolvedSide = parsePlacement(placement).side;
  // Starting from the side chosen last time stops the tooltip crossing the selection twice near an edge.
  if (!pinned && (resolvedSide === 'left' || resolvedSide === 'right') && resolvedSide !== lastSide) {
    setLastSide(resolvedSide);
  }

  React.useLayoutEffect(() => {
    const box = chartBoxRef.current;
    if (anchorX === undefined || anchorY === undefined || !box || chartWidth <= 0) {
      return;
    }
    const getBoundingClientRect = () => {
      const chartRect = box.getBoundingClientRect();
      if (pinned) {
        const boundary = boundaryReader(collisionBoundary, chartBoxRef)()?.getBoundingClientRect() ?? chartRect;
        return new DOMRect(boundary.left + collisionPadding, boundary.top + collisionPadding, 0, 0);
      }
      const x = Math.round((chartRect.left + (anchorX / chartWidth) * chartRect.width) * 2) / 2;
      return new DOMRect(x, chartRect.top + anchorY, 0, 0);
    };
    refs.setReference({ getBoundingClientRect, contextElement: box });
  }, [anchorX, anchorY, chartBoxRef, chartWidth, collisionBoundary, collisionPadding, pinned, refs]);

  const { mounted, transitionProps } = useTransition({ open, ref: popupRef });
  const { getReferenceProps, getFloatingProps } = useInteractions([]);

  const style = React.useMemo<React.CSSProperties>(
    () => ({ ...floatingStyles, pointerEvents: 'none', ...(isPositioned ? null : { visibility: 'hidden' }) }),
    [floatingStyles, isPositioned],
  );
  const context = React.useMemo<TooltipContextValue>(
    () => ({
      open,
      floatingContext,
      refs,
      floatingStyles: style,
      placement,
      getReferenceProps,
      getFloatingProps,
      popupRef,
      arrowRef,
      mounted,
      transitionProps,
    }),
    [floatingContext, getFloatingProps, getReferenceProps, mounted, open, placement, refs, style, transitionProps],
  );

  const shown = open ? active : held;
  return <TooltipContext.Provider value={context}>{mounted && shown ? children(shown) : null}</TooltipContext.Provider>;
}
