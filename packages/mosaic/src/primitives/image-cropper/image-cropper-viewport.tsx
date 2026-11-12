'use client';

import React, { useEffect, useRef, useState } from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { ZOOM_STEP } from './crop';
import { useImageCropperContext } from './image-cropper-context';

export type ImageCropperViewportProps = ComponentProps<'div'>;

interface Point {
  x: number;
  y: number;
}

const KEY_PAN = 0.02;
const KEY_PAN_LARGE = 0.1;
const WHEEL_ZOOM = 0.002;

export const ImageCropperViewport = React.forwardRef<HTMLDivElement, ImageCropperViewportProps>(
  function ImageCropperViewport(props, ref) {
    const { render, ...otherProps } = props;
    const { size, disabled, area, pan, zoomBy, reset } = useImageCropperContext();
    const elementRef = useRef<HTMLDivElement | null>(null);
    const pointers = useRef(new Map<number, Point>());
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
      const element = elementRef.current;
      if (!element) {
        return;
      }
      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        zoomBy(Math.exp(-event.deltaY * WHEEL_ZOOM));
      };
      element.addEventListener('wheel', onWheel, { passive: false });
      return () => element.removeEventListener('wheel', onWheel);
    }, [zoomBy]);

    const release = (pointerId: number) => {
      pointers.current.delete(pointerId);
      if (pointers.current.size === 0) {
        setDragging(false);
      }
    };

    const ready = size !== undefined && !disabled;

    const defaultProps = {
      role: 'application',
      tabIndex: ready ? 0 : -1,
      style: { touchAction: 'none' },
      onPointerDown: event => {
        if (!ready || event.button !== 0) {
          return;
        }
        event.currentTarget.setPointerCapture?.(event.pointerId);
        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        setDragging(true);
      },
      onPointerMove: event => {
        const previous = pointers.current.get(event.pointerId);
        if (!previous) {
          return;
        }
        const before = [...pointers.current.values()];
        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        const after = [...pointers.current.values()];
        const frame = (area.current ?? event.currentTarget).getBoundingClientRect().width;
        if (frame === 0) {
          return;
        }
        const from = midpoint(before);
        const to = midpoint(after);
        pan((to.x - from.x) / frame, (to.y - from.y) / frame);
        const [a, b] = before;
        const [c, d] = after;
        if (a && b && c && d) {
          zoomBy(distance(c, d) / distance(a, b));
        }
      },
      onPointerUp: event => release(event.pointerId),
      onPointerCancel: event => release(event.pointerId),
      onLostPointerCapture: event => release(event.pointerId),
      onKeyDown: event => {
        if (!ready) {
          return;
        }
        const step = event.shiftKey ? KEY_PAN_LARGE : KEY_PAN;
        const action = keyAction(event.key, step);
        if (!action) {
          return;
        }
        event.preventDefault();
        if (action.type === 'pan') {
          pan(action.dx, action.dy);
        } else if (action.type === 'zoom') {
          zoomBy(action.factor);
        } else {
          reset();
        }
      },
    } satisfies DefaultProps<'div'>;

    return useRender({
      defaultTagName: 'div',
      ref: [elementRef, ref],
      render,
      state: { dragging, disabled },
      stateAttributesMapping: {
        dragging: (v: boolean) => (v ? { 'data-dragging': '' } : null),
        disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
      },
      // eslint-disable-next-line react/refs -- This ref holds an imperative resource or the latest callback outside React state.
      props: mergeProps<'div'>(defaultProps, otherProps),
    });
  },
);

type KeyAction = { type: 'pan'; dx: number; dy: number } | { type: 'zoom'; factor: number } | { type: 'reset' };

function keyAction(key: string, step: number): KeyAction | undefined {
  switch (key) {
    case 'ArrowLeft':
      return { type: 'pan', dx: -step, dy: 0 };
    case 'ArrowRight':
      return { type: 'pan', dx: step, dy: 0 };
    case 'ArrowUp':
      return { type: 'pan', dx: 0, dy: -step };
    case 'ArrowDown':
      return { type: 'pan', dx: 0, dy: step };
    case '+':
    case '=':
      return { type: 'zoom', factor: ZOOM_STEP };
    case '-':
    case '_':
      return { type: 'zoom', factor: 1 / ZOOM_STEP };
    case '0':
      return { type: 'reset' };
    default:
      return undefined;
  }
}

function midpoint(points: Point[]): Point {
  const sum = points.reduce((total, point) => ({ x: total.x + point.x, y: total.y + point.y }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
