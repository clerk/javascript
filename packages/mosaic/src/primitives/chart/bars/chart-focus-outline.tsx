'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { useBarsContext } from './bar-context';

export type ChartFocusOutlineProps = ComponentProps<'rect'> & {
  /** Space in px between the painted bars and the outline. Default: 2 */
  offset?: number;
  /** The smallest width and height in px, so the outline stays findable around thin or short bars. Default: 12 */
  minSize?: number;
};

/**
 * Outlines the painted bars of the selected section while the keyboard made the selection. A
 * `rect` in the `Chart.Bars` SVG, so CSS styles its `stroke`, `stroke-width` and `rx` directly.
 */
export const ChartFocusOutline = React.forwardRef<SVGRectElement, ChartFocusOutlineProps>(
  function ChartFocusOutline(props, ref) {
    const { offset = 2, minSize = 12, render, ...otherProps } = props;
    const { focusBounds } = useBarsContext('FocusOutline');

    const width = focusBounds ? Math.max(focusBounds.width + offset * 2, minSize) : 0;
    const height = focusBounds ? Math.max(focusBounds.height + offset * 2, minSize) : 0;
    const ownProps = {
      'aria-hidden': true,
      x: focusBounds ? focusBounds.x + focusBounds.width / 2 - width / 2 : 0,
      y: focusBounds ? focusBounds.y + focusBounds.height / 2 - height / 2 : 0,
      width,
      height,
      fill: 'none',
      pointerEvents: 'none',
    } satisfies DefaultProps<'rect'>;

    return useRender({
      defaultTagName: 'rect',
      render,
      enabled: focusBounds !== null,
      ref,
      props: mergeProps<'rect'>(ownProps, otherProps),
    });
  },
);
