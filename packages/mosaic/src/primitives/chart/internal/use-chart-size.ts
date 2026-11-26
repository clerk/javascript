'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import type { ChartSize } from '../types';

const EMPTY_SIZE: ChartSize = { width: 0, height: 0 };

const toHalfPixel = (value: number) => Math.round(value * 2) / 2;

export function useChartSize<TElement extends HTMLElement>() {
  const observerRef = useRef<ResizeObserver | null>(null);
  const [size, setSize] = useState<ChartSize>(EMPTY_SIZE);

  const disconnect = useCallback(() => {
    observerRef.current?.disconnect();
    observerRef.current = null;
  }, []);

  const ref = useCallback(
    (element: TElement | null) => {
      disconnect();
      if (!element) {
        return;
      }
      let lastSize: ChartSize | undefined;
      const accept = (width: number, height: number) => {
        if (lastSize?.width === width && lastSize.height === height) {
          return null;
        }
        lastSize = { width, height };
        return lastSize;
      };
      observerRef.current = new ResizeObserver(entries => {
        const entry = entries[entries.length - 1];
        const box = entry?.borderBoxSize?.[0];
        const next = accept(
          toHalfPixel(box?.inlineSize ?? entry?.contentRect.width ?? 0),
          toHalfPixel(box?.blockSize ?? entry?.contentRect.height ?? 0),
        );
        if (next) {
          // ResizeObserver runs before paint; committing now keeps the chart in step with its container.
          flushSync(() => setSize(next));
        }
      });
      observerRef.current.observe(element, { box: 'border-box' });
      // Measure now as well, so the first paint happens in the commit that attached the chart rather
      // than at the next frame's ResizeObserver callback, after any effects the page runs on hydration.
      // A scaled ancestor makes this differ from the layout size; the observer corrects it a frame later.
      const rect = element.getBoundingClientRect();
      const initial = accept(toHalfPixel(rect.width), toHalfPixel(rect.height));
      if (initial) {
        setSize(initial);
      }
    },
    [disconnect],
  );

  useLayoutEffect(() => disconnect, [disconnect]);

  return { ref, size } as const;
}
