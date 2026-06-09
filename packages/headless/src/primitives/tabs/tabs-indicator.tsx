'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useTabsContext } from './tabs-context';

export type TabsIndicatorProps = ComponentProps<'span'>;

export function TabsIndicator(props: TabsIndicatorProps) {
  const { render, ...otherProps } = props;
  const { value, getTabElement, orientation, listRef } = useTabsContext();

  const [style, setStyle] = useState<React.CSSProperties>({});
  const previousRectRef = useRef<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const el = getTabElement(value);
    const list = listRef.current;
    if (!el || !list) {
      return;
    }

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

    if (orientation === 'horizontal') {
      setStyle({
        position: 'absolute',
        left: newRect.left,
        width: newRect.width,
        ['--cl-tab-left' as string]: `${newRect.left}px`,
        ['--cl-tab-width' as string]: `${newRect.width}px`,
        ['--cl-tab-top' as string]: `${newRect.top}px`,
        ['--cl-tab-height' as string]: `${newRect.height}px`,
        ...(prev == null ? { transition: 'none' } : {}),
      });
    } else {
      setStyle({
        position: 'absolute',
        top: newRect.top,
        height: newRect.height,
        ['--cl-tab-left' as string]: `${newRect.left}px`,
        ['--cl-tab-width' as string]: `${newRect.width}px`,
        ['--cl-tab-top' as string]: `${newRect.top}px`,
        ['--cl-tab-height' as string]: `${newRect.height}px`,
        ...(prev == null ? { transition: 'none' } : {}),
      });
    }
  }, [value, getTabElement, orientation, listRef]);

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
