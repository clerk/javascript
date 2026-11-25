'use client';

import { autoUpdate, flip, hide, offset, shift, size, useFloating } from '@floating-ui/react';
import React from 'react';

import { useTransition } from '../hooks/use-transition';
import { Portal } from '../portal';
import { type ComponentProps, type DefaultProps, Freeze, mergeProps, useRender } from '../utils';
import { getWindow } from '../utils/dom';
import { parsePlacement } from '../utils/side-offset';
import { useChartContext, useSelectionContext } from './chart-context';
import type { ChartActive } from './types';

const PINNED_BELOW_PLOT_WIDTH = 416;

type Side = 'left' | 'right';

export type ChartTooltipProps<TActive extends ChartActive = ChartActive> = Omit<ComponentProps<'div'>, 'children'> & {
  /** Content for the selected category, such as an `ActiveBar` from a bar chart. Return null to hide the tooltip. */
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
};

type BoundaryRef = React.RefObject<HTMLElement | null>;

function useMoving(open: boolean, datumIndex: number | undefined) {
  const [openedAt, setOpenedAt] = React.useState<number | undefined>(undefined);
  const [moved, setMoved] = React.useState(false);
  if (!open) {
    if (openedAt !== undefined || moved) {
      setOpenedAt(undefined);
      setMoved(false);
    }
  } else if (openedAt === undefined) {
    setOpenedAt(datumIndex);
  } else if (!moved && datumIndex !== openedAt) {
    setMoved(true);
  }
  return open && moved;
}

/** Reads the boundary when floating-ui computes a position, not during render. */
function boundaryReader(collisionBoundary: BoundaryRef | undefined, chartBoxRef: BoundaryRef) {
  return () => collisionBoundary?.current ?? chartBoxRef.current ?? undefined;
}

function tooltipMiddleware(
  getBoundary: () => Element | undefined,
  pinned: boolean,
  sideOffset: number,
  padding: number,
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
    hide(),
  ];
}

// eslint-disable-next-line typescript/consistent-type-assertions -- The ref wrapper drops the active type parameter; the caller names the type its chart-type hook selects.
export const ChartTooltip = React.forwardRef<HTMLDivElement, ChartTooltipProps>(function ChartTooltip(props, ref) {
  const {
    children,
    side = 'right',
    sideOffset = 16,
    collisionPadding = 8,
    collisionBoundary,
    pinned: pinnedProp = 'auto',
    render,
    ...otherProps
  } = props;
  const { registerTooltip, chartBoxRef } = useSelectionContext('Tooltip');
  const { chart } = useChartContext('Tooltip');
  const { plot, selected: active } = chart;
  const chartWidth = chart.size.width;
  React.useLayoutEffect(registerTooltip, [registerTooltip]);

  const anchor = chart.tooltipAnchor;
  const content = active && anchor ? children(active) : null;
  const open = content !== null && content !== undefined;
  const anchorX = anchor?.x;
  const anchorY = anchor?.y;

  const pinned = pinnedProp === 'auto' ? plot.width < PINNED_BELOW_PLOT_WIDTH : pinnedProp;
  const popupRef = React.useRef<HTMLDivElement | null>(null);
  const middleware = React.useMemo(
    () =>
      // eslint-disable-next-line react/refs -- The middleware reads the boundary refs when floating-ui computes a position, not during render.
      tooltipMiddleware(boundaryReader(collisionBoundary, chartBoxRef), pinned, sideOffset, collisionPadding),
    [chartBoxRef, collisionBoundary, collisionPadding, pinned, sideOffset],
  );

  const [lastSide, setLastSide] = React.useState<Side>(side);
  const {
    refs,
    floatingStyles,
    placement: resolvedPlacement,
    isPositioned,
    middlewareData,
  } = useFloating({
    open,
    strategy: 'fixed',
    transform: false,
    placement: pinned ? 'bottom-start' : `${lastSide}-start`,
    middleware,
    whileElementsMounted: autoUpdate,
  });
  const resolvedSide = parsePlacement(resolvedPlacement).side;
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
  const moving = useMoving(open, active?.datumIndex);
  const anchorHidden = middlewareData.hide?.referenceHidden === true;

  const ownProps = {
    ...transitionProps,
    'data-side': resolvedSide,
    ...(moving ? { 'data-moving': '' } : null),
    ...(anchorHidden ? { 'data-anchor-hidden': '' } : null),
    style: {
      ...floatingStyles,
      pointerEvents: 'none',
      ...(isPositioned && !anchorHidden ? null : { visibility: 'hidden' }),
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
}) as <TActive extends ChartActive = ChartActive>(
  props: ChartTooltipProps<TActive> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;
