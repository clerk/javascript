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
  const previousRectRef = useRef<Rect | null>(null);

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

      const prev = previousRectRef.current;
      previousRectRef.current = newRect;

      const sharedVars = {
        ['--cl-tab-left' as string]: `${newRect.x}px`,
        ['--cl-tab-width' as string]: `${newRect.width}px`,
        ['--cl-tab-top' as string]: `${newRect.y}px`,
        ['--cl-tab-height' as string]: `${newRect.height}px`,
        ...(prev == null ? { transition: 'none' } : {}),
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
