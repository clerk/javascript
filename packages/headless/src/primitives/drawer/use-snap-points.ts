'use client';

import { useCallback, useEffect, useMemo } from 'react';

import { useControllableState } from '../../hooks/use-controllable-state';
import { SNAP_SKIP_VELOCITY } from './constants';
import { DrawerCssVars } from './css-vars';
import { getSnapPointSwipeMovement } from './helpers';

export interface SnapReleaseArgs {
  /** Net pointer delta on the Y axis over the gesture (`endY - startY`); positive is downward. */
  dist: number;
  /** Absolute release velocity, px/ms. */
  v: number;
  dismissible: boolean;
  close: () => void;
}

export interface SnapController {
  onDrag: (dist: number) => void;
  onRelease: (args: SnapReleaseArgs) => void;
  snapTo: (index: number) => void;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  /** Resting `translateY` of the active snap point — the sheet's displacement before any live drag. */
  restOffset: number;
  /** True when resting at the largest (full-height) snap point. */
  expanded: boolean;
}

export interface UseSnapPointsOptions {
  /** Ascending fractions (0..1) of the viewport the drawer rests at. */
  snapPoints?: number[];
  /** Controlled active index. */
  activeSnapPoint?: number;
  /** Uncontrolled initial active index. Defaults to the last (most open) point. */
  defaultActiveSnapPoint?: number;
  onActiveSnapPointChange?: (index: number) => void;
  setVar: (name: string, value: string) => void;
  setSwipe: (px: number) => void;
  /** Current open state; on close the uncontrolled active index resets to the default. */
  open: boolean;
}

/**
 * Snap-point geometry + release logic. `offset(i)` is the resting `translateY`
 * that leaves `snapPoints[i]` of the viewport visible (0 = fully open). Returns
 * `null` when no snap points are configured.
 *
 * The drag engine drives this: `onDrag` while the finger moves, `onRelease` when
 * it lifts. `snapTo` writes the rest `snapOffset` var and updates the active
 * index (which fires `onActiveSnapPointChange`).
 */
export function useSnapPoints(opts: UseSnapPointsOptions): SnapController | null {
  const { snapPoints, setVar, setSwipe, onActiveSnapPointChange, open } = opts;
  const lastIndex = snapPoints ? snapPoints.length - 1 : 0;
  const isControlled = opts.activeSnapPoint !== undefined;
  const defaultIndex = opts.defaultActiveSnapPoint ?? lastIndex;

  const [activeIndex, setActiveIndex] = useControllableState(
    opts.activeSnapPoint,
    defaultIndex,
    onActiveSnapPointChange,
  );

  // On close, an uncontrolled drawer returns to its default snap point so the
  // next open starts fresh. A canceled close keeps `open` true, so no reset.
  useEffect(() => {
    if (!open && !isControlled && activeIndex !== defaultIndex) {
      setActiveIndex(defaultIndex);
    }
  }, [open, isControlled, activeIndex, defaultIndex, setActiveIndex]);

  const offset = useCallback(
    (i: number): number => {
      if (!snapPoints) {
        return 0;
      }
      const vh = window.innerHeight;
      return vh - snapPoints[i] * vh;
    },
    [snapPoints],
  );

  // The resting `snapOffset` var is applied by `Drawer.Popup` (it owns the ref
  // and is guaranteed mounted), covering the initial position and controlled
  // `activeSnapPoint` changes; `snapTo` writes it eagerly during a release.
  // Resize is not tracked yet — see the README follow-ups.

  const snapTo = useCallback(
    (index: number): void => {
      setSwipe(0);
      setVar(DrawerCssVars.snapOffset, `${offset(index)}px`);
      setActiveIndex(index);
    },
    [setSwipe, setVar, offset, setActiveIndex],
  );

  const onDrag = useCallback(
    (dist: number): void => {
      // 1:1 with the finger, except past the fully-open edge where the movement
      // is square-root damped so the sheet resists overshooting.
      setSwipe(getSnapPointSwipeMovement(offset(activeIndex), dist));
    },
    [offset, activeIndex, setSwipe],
  );

  const onRelease = useCallback(
    ({ dist, v, dismissible, close }: SnapReleaseArgs): void => {
      const pos = offset(activeIndex) + dist;
      const down = dist > 0;

      // Fast flick: skip straight to the neighbouring snap point (or dismiss).
      if (v > SNAP_SKIP_VELOCITY) {
        if (down) {
          if (activeIndex === 0) {
            if (dismissible) {
              close();
            } else {
              snapTo(0);
            }
          } else {
            snapTo(activeIndex - 1);
          }
        } else {
          snapTo(Math.min(activeIndex + 1, lastIndex));
        }
        return;
      }

      // Otherwise settle to the closest snap point.
      let closest = 0;
      for (let i = 1; i <= lastIndex; i++) {
        if (Math.abs(offset(i) - pos) < Math.abs(offset(closest) - pos)) {
          closest = i;
        }
      }
      snapTo(closest);
    },
    [offset, activeIndex, lastIndex, snapTo],
  );

  const controller = useMemo<SnapController>(
    () => ({
      onDrag,
      onRelease,
      snapTo,
      activeIndex,
      setActiveIndex,
      restOffset: offset(activeIndex),
      expanded: activeIndex === lastIndex,
    }),
    [onDrag, onRelease, snapTo, activeIndex, setActiveIndex, offset, lastIndex],
  );

  return snapPoints ? controller : null;
}
