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
      observerRef.current = new ResizeObserver(entries => {
        const entry = entries[entries.length - 1];
        const box = entry?.borderBoxSize?.[0];
        const width = toHalfPixel(box?.inlineSize ?? entry?.contentRect.width ?? 0);
        const height = toHalfPixel(box?.blockSize ?? entry?.contentRect.height ?? 0);
        if (lastSize?.width === width && lastSize.height === height) {
          return;
        }
        const next = { width, height };
        lastSize = next;
        // ResizeObserver runs before paint; committing now keeps the chart in step with its container.
        flushSync(() => setSize(next));
      });
      observerRef.current.observe(element, { box: 'border-box' });
    },
    [disconnect],
  );

  useLayoutEffect(() => disconnect, [disconnect]);

  return { ref, size } as const;
}
