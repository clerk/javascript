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
    const bodyStyle = document.body.style;
    const { pointerId } = e;
    const originX = e.clientX;
    const originY = e.clientY;
    let selectionStyles: [userSelect: string, webkitUserSelect: string] | undefined;

    const onPointerMove = (moveEvent: PointerEvent): void => {
      if (moveEvent.pointerId !== pointerId) {
        return;
      }
      const x = moveEvent.clientX - originX;
      const y = moveEvent.clientY - originY;
      if (!selectionStyles) {
        if (x * x + y * y < DRAG_THRESHOLD * DRAG_THRESHOLD) {
          return;
        }
        element.setPointerCapture(pointerId);
        selectionStyles = [bodyStyle.userSelect, bodyStyle.webkitUserSelect];
        bodyStyle.userSelect = 'none';
        bodyStyle.webkitUserSelect = 'none';
        onDragStart?.();
      }
      onDrag({ x, y });
    };

    const onPointerEnd = (endEvent: PointerEvent): void => {
      if (endEvent.pointerId === pointerId) {
        end(endEvent.type === 'pointercancel');
      }
    };

    const end = (cancelled: boolean): void => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerEnd);
      window.removeEventListener('pointercancel', onPointerEnd);
      endGesture.current = null;
      if (!selectionStyles) {
        return;
      }
      if (element.hasPointerCapture(pointerId)) {
        element.releasePointerCapture(pointerId);
      }
      bodyStyle.userSelect = selectionStyles[0];
      bodyStyle.webkitUserSelect = selectionStyles[1];
      const onEnd = (cancelled && onDragCancel) || onDragEnd;
      onEnd?.();
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerEnd);
    window.addEventListener('pointercancel', onPointerEnd);
    endGesture.current = (): void => end(true);
  };

  return { onPointerDown };
};
