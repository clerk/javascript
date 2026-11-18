'use client';

import { useLayoutEffect, useRef, useState } from 'react';

import { autoUpdate, getScrollDimensions } from '../utils/dom';
import { useAnimationsFinished } from './use-animations-finished';
import { useTransition } from './use-transition';

export function usePanelSize(open: boolean) {
  const panelRef = useRef<HTMLElement | null>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [width, setWidth] = useState<number | undefined>(undefined);

  const { mounted, transitionStatus, transitionProps } = useTransition({
    open,
    ref: panelRef,
  });

  const runOnAnimationsFinished = useAnimationsFinished(panelRef, open);

  useLayoutEffect(() => {
    if (!mounted) {
      return;
    }

    const panel = panelRef.current;
    if (!panel) {
      return;
    }

    return autoUpdate(panel, () => {
      const dimensions = getScrollDimensions(panel);
      setHeight(dimensions.height);
      setWidth(dimensions.width);
    });
  }, [mounted]);

  // Once the open animation settles, drop the measured pixel dimensions so the
  // panel flows naturally with its content (CSS vars omitted → auto).
  useLayoutEffect(() => {
    if (!open || !mounted) {
      return;
    }
    runOnAnimationsFinished(() => {
      setHeight(undefined);
      setWidth(undefined);
    });
  }, [open, mounted, runOnAnimationsFinished]);

  // Re-pin to measured pixel values when closing starts so the exit
  // transition animates from concrete dimensions (auto can't interpolate).
  useLayoutEffect(() => {
    if (open || transitionStatus !== 'ending') {
      return;
    }
    const panel = panelRef.current;
    if (!panel) {
      return;
    }
    const dimensions = getScrollDimensions(panel);
    setHeight(dimensions.height);
    setWidth(dimensions.width);
  }, [open, transitionStatus]);

  return { panelRef, mounted, transitionProps, height, width };
}
