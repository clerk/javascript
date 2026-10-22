import { fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Point } from '../useDragGesture';
import { useDragGesture } from '../useDragGesture';

type Options = Parameters<typeof useDragGesture>[0];

const DragTarget = (options: Options) => {
  const { onPointerDown } = useDragGesture(options);
  return (
    <div
      data-testid='target'
      onPointerDown={onPointerDown}
    >
      <span>handle</span>
      <a href='/docs'>link</a>
    </div>
  );
};

const pointer = (target: EventTarget, type: string, init: MouseEventInit & { pointerId?: number } = {}) => {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, ...init });
  Object.defineProperty(event, 'pointerId', { value: init.pointerId ?? 1 });
  fireEvent(target, event);
};

const renderDragTarget = (onDragCancel?: () => void) => {
  const onDragStart = vi.fn();
  const onDrag = vi.fn<(offset: Point) => void>();
  const onDragEnd = vi.fn();
  const result = render(
    <DragTarget
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    />,
  );
  const target = result.getByTestId('target');
  const captured = new Set<number>();
  Object.assign(target, {
    setPointerCapture: (id: number) => captured.add(id),
    hasPointerCapture: (id: number) => captured.has(id),
    releasePointerCapture: (id: number) => captured.delete(id),
  });
  return { ...result, target, captured, onDragStart, onDrag, onDragEnd };
};

describe('useDragGesture', () => {
  afterEach(() => {
    pointer(window, 'pointercancel');
    document.body.style.removeProperty('user-select');
  });

  it('treats a press that moves less than the threshold as a click', () => {
    const { target, onDragStart, onDrag, onDragEnd } = renderDragTarget();
    pointer(target, 'pointerdown', { clientX: 100, clientY: 100 });
    pointer(window, 'pointermove', { clientX: 103, clientY: 103 });
    pointer(window, 'pointerup');
    expect(onDragStart).not.toHaveBeenCalled();
    expect(onDrag).not.toHaveBeenCalled();
    expect(onDragEnd).not.toHaveBeenCalled();
  });

  it('starts dragging past the threshold and reports offsets from the press origin', () => {
    const { target, captured, onDragStart, onDrag } = renderDragTarget();
    pointer(target, 'pointerdown', { clientX: 100, clientY: 100 });
    pointer(window, 'pointermove', { clientX: 106, clientY: 100 });
    pointer(window, 'pointermove', { clientX: 80.5, clientY: 130.25 });
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDrag.mock.calls).toEqual([[{ x: 6, y: 0 }], [{ x: -19.5, y: 30.25 }]]);
    expect(captured.has(1)).toBe(true);
    expect(document.body.style.getPropertyValue('user-select')).toBe('none');
    expect(document.body.style.webkitUserSelect).toBe('none');
  });

  it('starts dragging exactly at the diagonal threshold', () => {
    const { target, onDragStart, onDrag } = renderDragTarget();
    pointer(target, 'pointerdown', { clientX: 100, clientY: 100 });
    pointer(window, 'pointermove', { clientX: 103, clientY: 104 });
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDrag).toHaveBeenCalledWith({ x: 3, y: 4 });
  });

  it.each(['pointerup', 'pointercancel'])('ends the drag on %s and restores selection', type => {
    const { target, captured, onDrag, onDragEnd } = renderDragTarget();
    pointer(target, 'pointerdown', { clientX: 100, clientY: 100 });
    pointer(window, 'pointermove', { clientX: 120, clientY: 100 });
    pointer(window, type);
    pointer(window, 'pointermove', { clientX: 200, clientY: 200 });
    expect(onDragEnd).toHaveBeenCalledTimes(1);
    expect(onDrag).toHaveBeenCalledTimes(1);
    expect(captured.size).toBe(0);
    expect(document.body.style.getPropertyValue('user-select')).toBe('');
    expect(document.body.style.webkitUserSelect).toBe('');
  });

  it('ignores other pointers', () => {
    const { target, onDrag, onDragEnd } = renderDragTarget();
    pointer(target, 'pointerdown', { clientX: 100, clientY: 100 });
    pointer(window, 'pointermove', { clientX: 200, clientY: 200, pointerId: 2 });
    pointer(window, 'pointerup', { pointerId: 2 });
    expect(onDrag).not.toHaveBeenCalled();
    pointer(window, 'pointermove', { clientX: 120, clientY: 100 });
    expect(onDrag).toHaveBeenCalledWith({ x: 20, y: 0 });
    expect(onDragEnd).not.toHaveBeenCalled();
  });

  it('does not start from a secondary button or a link', () => {
    const { target, getByText, onDrag } = renderDragTarget();
    pointer(target, 'pointerdown', { button: 2, clientX: 100, clientY: 100 });
    pointer(window, 'pointermove', { clientX: 200, clientY: 200 });
    pointer(getByText('link'), 'pointerdown', { clientX: 100, clientY: 100 });
    pointer(window, 'pointermove', { clientX: 200, clientY: 200 });
    expect(onDrag).not.toHaveBeenCalled();
  });

  it('ends the drag when unmounted', () => {
    const { target, unmount, onDrag, onDragEnd } = renderDragTarget();
    pointer(target, 'pointerdown', { clientX: 100, clientY: 100 });
    pointer(window, 'pointermove', { clientX: 120, clientY: 100 });
    unmount();
    pointer(window, 'pointermove', { clientX: 200, clientY: 200 });
    expect(onDragEnd).toHaveBeenCalledTimes(1);
    expect(onDrag).toHaveBeenCalledTimes(1);
    expect(document.body.style.getPropertyValue('user-select')).toBe('');
  });

  it.each(['pointercancel', 'unmount', 'replacement press'])('cancels without committing on %s', reason => {
    const onDragCancel = vi.fn();
    const { target, captured, unmount, onDragEnd } = renderDragTarget(onDragCancel);
    pointer(target, 'pointerdown', { clientX: 100, clientY: 100 });
    pointer(window, 'pointermove', { clientX: 120, clientY: 100 });
    if (reason === 'unmount') {
      unmount();
    } else if (reason === 'replacement press') {
      pointer(target, 'pointerdown', { clientX: 120, clientY: 100 });
    } else {
      pointer(window, 'pointercancel');
    }
    expect(onDragCancel).toHaveBeenCalledTimes(1);
    expect(onDragEnd).not.toHaveBeenCalled();
    expect(captured.size).toBe(0);
    expect(document.body.style.getPropertyValue('user-select')).toBe('');
  });

  it('commits a normal release when a cancellation callback is provided', () => {
    const onDragCancel = vi.fn();
    const { target, onDragEnd } = renderDragTarget(onDragCancel);
    pointer(target, 'pointerdown', { clientX: 100, clientY: 100 });
    pointer(window, 'pointermove', { clientX: 120, clientY: 100 });
    pointer(window, 'pointerup');
    expect(onDragEnd).toHaveBeenCalledTimes(1);
    expect(onDragCancel).not.toHaveBeenCalled();
  });
});
