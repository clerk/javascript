import { noop } from '@clerk/shared/utils';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { useEffect, useRef } from 'react';

const DRAG_THRESHOLD = 5;
let activeDrags = 0;
let userSelect = '';
let webkitUserSelect = '';

export type Point = { x: number; y: number };

type UseDragGestureOptions = {
  onDragStart?: () => void;
  onDrag: (offset: Point) => void;
  onDragEnd?: () => void;
  onDragCancel?: () => void;
};

export const useDragGesture = ({
  onDragStart,
  onDrag,
  onDragEnd,
  onDragCancel,
}: UseDragGestureOptions): ((e: ReactPointerEvent<HTMLElement>) => void) => {
  const endGesture = useRef<() => void>(noop);

  useEffect(() => () => endGesture.current(), []);

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>): void => {
    if (e.button !== 0 || (e.target instanceof Element && e.target.closest('a'))) {
      return;
    }
    endGesture.current();

    const element = e.currentTarget;
    const bodyStyle = document.body.style;
    const { pointerId } = e;
    const originX = e.clientX;
    const originY = e.clientY;
    let dragging = false;

    const onPointerMove = (moveEvent: PointerEvent): void => {
      if (moveEvent.pointerId !== pointerId) {
        return;
      }
      const x = moveEvent.clientX - originX;
      const y = moveEvent.clientY - originY;
      if (!dragging) {
        if (x * x + y * y < DRAG_THRESHOLD * DRAG_THRESHOLD) {
          return;
        }
        element.setPointerCapture(pointerId);
        dragging = true;
        if (++activeDrags === 1) {
          userSelect = bodyStyle.userSelect;
          webkitUserSelect = bodyStyle.webkitUserSelect;
          bodyStyle.userSelect = 'none';
          bodyStyle.webkitUserSelect = 'none';
        }
        onDragStart?.();
      }
      onDrag({ x, y });
    };

    const end = (endEvent?: PointerEvent): void => {
      if (endEvent && endEvent.pointerId !== pointerId) {
        return;
      }
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      endGesture.current = noop;
      if (!dragging) {
        return;
      }
      dragging = false;
      if (element.hasPointerCapture(pointerId)) {
        element.releasePointerCapture(pointerId);
      }
      if (--activeDrags === 0) {
        bodyStyle.userSelect = userSelect;
        bodyStyle.webkitUserSelect = webkitUserSelect;
      }
      const onEnd = endEvent && endEvent.type === 'pointerup' ? onDragEnd : onDragCancel || onDragEnd;
      onEnd?.();
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    endGesture.current = end;
  };

  return onPointerDown;
};
