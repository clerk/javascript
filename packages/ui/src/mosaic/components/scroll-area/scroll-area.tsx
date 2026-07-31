import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { gutters, styles } from './scroll-area.styles';
import { useScrollerFocusable } from './use-scroller-focusable';

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
  { gutter = 'auto', tabIndex, className, style, ...rest },
  ref,
) {
  const [node, setNode] = React.useState<HTMLDivElement | null>(null);

  // A callback ref so the component can observe the element while still honouring whatever
  // ref the caller passed. There is no `mergeRefs` helper in the repo to reach for.
  const setRefs = React.useCallback(
    (element: HTMLDivElement | null) => {
      setNode(element);
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    },
    [ref],
  );

  // An explicit `tabIndex` always wins — a caller who has an opinion about the tab order
  // shouldn't have it silently overwritten, and passing `-1` is how you opt out entirely.
  const managed = tabIndex === undefined;
  const needsTabStop = useScrollerFocusable(node, managed);

  return (
    <div
      ref={setRefs}
      /*
        A scrollable region is the documented exception to `no-noninteractive-tabindex`: without
        a tab stop it is simply unreachable by keyboard in Safari (WCAG 2.1.1). The stop is only
        taken when the region actually overflows and holds nothing else focusable.
      */
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- see above
      tabIndex={managed ? (needsTabStop ? 0 : undefined) : tabIndex}
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
 * `--cl-scroll-area-progress-start` and `--cl-scroll-area-progress-end`. It costs nothing at
 * runtime — no measurement, no scroll listener — and participates in no layout, since the
 * mask is paint-only and so can't shift the content the way sticky shadow elements do. The
 * only JavaScript here is the tab-stop management described below.
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
 * The viewport manages its own `tabIndex`. Chrome and Firefox make an overflowing scroller
 * keyboard-focusable automatically; Safari does not, so a keyboard-only user there can't
 * scroll the region at all. The viewport closes that gap by taking a tab stop exactly when
 * the browsers themselves would: when it overflows **and** its content contains nothing
 * focusable. A list of buttons or links is already reachable, so a stop on the container
 * would only add noise. Pass an explicit `tabIndex` to take the decision back — `-1` opts
 * out completely.
 */
export const ScrollArea = {
  Root,
  Viewport,
};
