'use client';

import type React from 'react';
import { useLayoutEffect, useRef, useState } from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';
import { autoUpdate, getRectRelativeTo, type Rect } from '../utils/dom';
import { useTabsContext } from './tabs-context';

export type TabsIndicatorProps = ComponentProps<'span'>;

export function TabsIndicator(props: TabsIndicatorProps) {
  const { render, ...otherProps } = props;
  const { value, getTabElement, orientation, listElement } = useTabsContext();

  const [style, setStyle] = useState<React.CSSProperties>({});
  const lastMeasureRef = useRef<{ value: string; rect: Rect } | null>(null);

  // Measure synchronously before paint so the indicator never commits a frame
  // at a stale position when the active tab changes.
  useLayoutEffect(() => {
    const el = getTabElement(value);
    const list = listElement;
    if (!el || !list) {
      return;
    }

    // Keep the indicator in sync when the active tab or the list changes size
    // (font load, container resize) without a tab-selection change.
    return autoUpdate([el, list], () => {
      const newRect = getRectRelativeTo(el, list);

      const last = lastMeasureRef.current;
      lastMeasureRef.current = { value, rect: newRect };
      if (last && isSameRect(last.rect, newRect)) {
        return;
      }
      const isTabChange = last != null && last.value !== value;

      const sharedVars = {
        ['--cl-tab-left' as string]: `${newRect.x}px`,
        ['--cl-tab-width' as string]: `${newRect.width}px`,
        ['--cl-tab-top' as string]: `${newRect.y}px`,
        ['--cl-tab-height' as string]: `${newRect.height}px`,
        ...(isTabChange ? {} : { transition: 'none' }),
      };

      if (orientation === 'horizontal') {
        setStyle({ position: 'absolute', left: newRect.x, width: newRect.width, ...sharedVars });
      } else {
        setStyle({ position: 'absolute', top: newRect.y, height: newRect.height, ...sharedVars });
      }
    });
  }, [value, getTabElement, orientation, listElement]);

  const defaultProps = {
    'aria-hidden': true as const,
    style,
  };

  return useRender({
    defaultTagName: 'span',
    render,
    props: mergeProps<'span'>(defaultProps, otherProps),
  });
}

function isSameRect(a: Rect, b: Rect) {
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}
