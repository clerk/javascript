import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { gutters, styles } from './scroll-area.styles';

export type ScrollAreaGutter = 'stable' | 'auto';

export type ScrollAreaRootProps = Omit<MosaicComponentProps<'div'>, 'render'>;

export interface ScrollAreaViewportProps extends Omit<MosaicComponentProps<'div'>, 'render'> {
  /**
   * Whether the scrollbar's space is held open. `auto` (the default) takes the space only
   * while the content overflows. Pass `stable` when the content can change height **in
   * place** — a filterable or paginated collection — so that crossing the overflow threshold
   * doesn't shift the rows sideways; the cost is a permanently reserved gutter next to a list
   * that may never scroll.
   *
   * Neither value does anything on platforms that overlay their scrollbars, which reserve no
   * space either way.
   *
   * The scrollbar's *size* is not a prop — it's the `--cl-scrollbar-width` theme token, so
   * every scrolling surface in Mosaic changes together.
   */
  gutter?: ScrollAreaGutter;
}

/**
 * The wrapper. Positioned, so a future scrollbar part can be placed against it; today it
 * only establishes the box the viewport flexes inside.
 */
const Root = React.forwardRef<HTMLDivElement, ScrollAreaRootProps>(function ScrollAreaRoot(
  { className, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      {...mergeStyleProps(themeProps('scroll-area-root'), stylex.props(styles.root), className, style)}
      {...rest}
    />
  );
});

/**
 * The scroll container. Owns the overflow, the scroll timelines, and the mask.
 */
const Viewport = React.forwardRef<HTMLDivElement, ScrollAreaViewportProps>(function ScrollAreaViewport(
  { gutter = 'auto', className, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      {...mergeStyleProps(
        themeProps('scroll-area-viewport', { gutter }),
        stylex.props(styles.viewport, styles.mask, styles.indicators, styles.focusRing, gutters[gutter]),
        className,
        style,
      )}
      {...rest}
    />
  );
});

/**
 * Mosaic `ScrollArea` — a vertically scrolling region that fades its content at whichever
 * edge has more to reveal. Composed via dot syntax: `ScrollArea.Root`, `ScrollArea.Viewport`.
 *
 * The fade is a mask driven by two scroll-driven animations, one per edge, which write
 * `--cl-scroll-area-progress-start` and `--cl-scroll-area-progress-end`. Nothing about it
 * runs in JavaScript, and nothing about it participates in layout — the mask is paint-only,
 * so it can't shift the content the way sticky shadow elements do.
 *
 * The indicators are a progressive enhancement. Without scroll-driven animation support the
 * progress vars hold at 0 and the mask resolves to fully opaque, leaving a plain scroll area.
 *
 * @example
 * <ScrollArea.Root style={{ height: 240 }}>
 *   <ScrollArea.Viewport>{items}</ScrollArea.Viewport>
 * </ScrollArea.Root>
 *
 * @example
 * // Hold the scrollbar's space open, for a collection that can change height in place.
 * <ScrollArea.Viewport gutter='stable'>{items}</ScrollArea.Viewport>
 *
 * @remarks
 * Chrome and Firefox make an overflowing scroll container keyboard-focusable on their own;
 * Safari does not, so a keyboard-only user can't scroll it there. `tabIndex` is deliberately
 * not set here — an always-present tab stop is wrong for a region that often isn't
 * scrollable. Pass `tabIndex={0}` (with an `aria-label` or `role='region'`) where the content
 * is known to overflow.
 */
export const ScrollArea = {
  Root,
  Viewport,
};
