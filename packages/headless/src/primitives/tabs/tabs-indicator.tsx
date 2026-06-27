'use client';

import type React from 'react';
import { useLayoutEffect, useRef, useState } from 'react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useTabsContext } from './tabs-context';

export type TabsIndicatorProps = ComponentProps<'span'>;

export function TabsIndicator(props: TabsIndicatorProps) {
  const { render, ...otherProps } = props;
  const { value, getTabElement, orientation, listElement } = useTabsContext();

  const [style, setStyle] = useState<React.CSSProperties>({});
  const previousRectRef = useRef<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  // Measure synchronously before paint so the indicator never commits a frame
  // at a stale position when the active tab changes.
  useLayoutEffect(() => {
    const el = getTabElement(value);
    const list = listElement;
    if (!el || !list) {
      return;
    }

    const measure = () => {
      const tabRect = el.getBoundingClientRect();
      const listRect = list.getBoundingClientRect();

      const newRect = {
        left: tabRect.left - listRect.left,
        top: tabRect.top - listRect.top,
        width: tabRect.width,
        height: tabRect.height,
      };

      const prev = previousRectRef.current;
      previousRectRef.current = newRect;

      const sharedVars = {
        ['--cl-tab-left' as string]: `${newRect.left}px`,
        ['--cl-tab-width' as string]: `${newRect.width}px`,
        ['--cl-tab-top' as string]: `${newRect.top}px`,
        ['--cl-tab-height' as string]: `${newRect.height}px`,
        ...(prev == null ? { transition: 'none' } : {}),
      };

      if (orientation === 'horizontal') {
        setStyle({ position: 'absolute', left: newRect.left, width: newRect.width, ...sharedVars });
      } else {
        setStyle({ position: 'absolute', top: newRect.top, height: newRect.height, ...sharedVars });
      }
    };

    measure();

    // Keep the indicator in sync when the active tab or the list changes size
    // (font load, container resize) without a tab-selection change.
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(list);
    return () => ro.disconnect();
  }, [value, getTabElement, orientation, listElement]);

  const defaultProps = {
    'data-cl-slot': 'tabs-indicator',
    'aria-hidden': true as const,
    style,
  };

  return renderElement({
    defaultTagName: 'span',
    render,
    props: mergeProps<'span'>(defaultProps, otherProps),
  });
}
