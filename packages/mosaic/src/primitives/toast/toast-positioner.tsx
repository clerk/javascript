'use client';

import { arrow, autoUpdate, flip, hide, offset, type Placement, shift, useFloating } from '@floating-ui/react';
import React, { useMemo, useRef } from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { cssVars } from '../utils/css-vars';
import { ToastPositionerContext, type ToastPositionerContextValue } from './toast-context';
import type { ToastAlign, ToastObject, ToastPositionerOptions, ToastSide } from './toast-manager';

export interface ToastPositionerProps extends ComponentProps<'div'>, ToastPositionerOptions {
  toast: ToastObject;
}

function toPlacement(side: ToastSide, align: ToastAlign): Placement {
  return align === 'center' ? side : `${side}-${align}`;
}

export const ToastPositioner = React.forwardRef<HTMLDivElement, ToastPositionerProps>(
  function ToastPositioner(props, ref) {
    const { render, toast, ...positionerProps } = props;
    const {
      anchor = null,
      side = 'top',
      align = 'center',
      sideOffset = 0,
      alignOffset = 0,
      ...otherProps
    } = { ...positionerProps, ...toast.positionerProps };

    const arrowRef = useRef<SVGSVGElement | null>(null);

    const {
      refs,
      floatingStyles,
      context: floatingContext,
      placement,
      middlewareData,
    } = useFloating({
      open: true,
      placement: toPlacement(side, align),
      elements: { reference: anchor },
      middleware: [
        offset({ mainAxis: sideOffset, alignmentAxis: alignOffset }),
        flip({ padding: 5 }),
        shift({ padding: 5 }),
        arrow({ element: arrowRef }),
        hide(),
        cssVars({ sideOffset }),
      ],
      whileElementsMounted: autoUpdate,
    });

    const [placedSide, placedAlign = 'center'] = placement.split('-');

    const contextValue = useMemo<ToastPositionerContextValue>(
      () => ({ floatingContext, placement, arrowRef }),
      [floatingContext, placement],
    );

    const defaultProps = {
      'data-side': placedSide,
      'data-align': placedAlign,
      ...(middlewareData.hide?.referenceHidden && { 'data-anchor-hidden': '' }),
      style: floatingStyles,
    } satisfies DefaultProps<'div'>;

    return (
      <ToastPositionerContext.Provider value={contextValue}>
        {useRender({
          defaultTagName: 'div',
          render,
          ref: [refs.setFloating, ref],
          props: mergeProps<'div'>(defaultProps, otherProps),
        })}
      </ToastPositionerContext.Provider>
    );
  },
);
