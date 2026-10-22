import type { PointerEvent as ReactPointerEvent } from 'react';
import { useEffect, useRef } from 'react';

const DRAG_THRESHOLD = 5;

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
}: UseDragGestureOptions): { onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void } => {
  const endGesture = useRef<(() => void) | null>(null);

  useEffect(() => () => endGesture.current?.(), []);

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>): void => {
    if (e.button !== 0 || (e.target instanceof Element && e.target.closest('a'))) {
      return;
    }
    endGesture.current?.();

    const element = e.currentTarget;
    const { pointerId } = e;
    const origin = { x: e.clientX, y: e.clientY };
    let dragging = false;

    const onPointerMove = (moveEvent: PointerEvent): void => {
      if (moveEvent.pointerId !== pointerId) {
        return;
      }
      const offset = { x: moveEvent.clientX - origin.x, y: moveEvent.clientY - origin.y };
      if (!dragging) {
        if (Math.hypot(offset.x, offset.y) < DRAG_THRESHOLD) {
          return;
        }
        dragging = true;
        element.setPointerCapture(pointerId);
        document.body.style.setProperty('user-select', 'none');
        document.body.style.setProperty('-webkit-user-select', 'none');
        onDragStart?.();
      }
      onDrag(offset);
    };

    const onPointerEnd = (endEvent: PointerEvent): void => {
      if (endEvent.pointerId === pointerId) {
        end(endEvent.type === 'pointercancel');
      }
    };

    const end = (cancelled = false): void => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerEnd);
      window.removeEventListener('pointercancel', onPointerEnd);
      endGesture.current = null;
      if (!dragging) {
        return;
      }
      if (element.hasPointerCapture(pointerId)) {
        element.releasePointerCapture(pointerId);
      }
      document.body.style.removeProperty('user-select');
      document.body.style.removeProperty('-webkit-user-select');
      if (cancelled) {
        (onDragCancel ?? onDragEnd)?.();
      } else {
        onDragEnd?.();
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerEnd);
    window.addEventListener('pointercancel', onPointerEnd);
    endGesture.current = (): void => end(true);
  };

  return { onPointerDown };
};
