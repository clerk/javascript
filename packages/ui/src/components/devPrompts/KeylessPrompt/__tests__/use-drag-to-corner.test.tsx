import { fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { STORAGE_KEY, useDragToCorner } from '../use-drag-to-corner';

const DragTarget = () => {
  const { containerRef, onPointerDown, isDragging, corner } = useDragToCorner();
  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      data-testid='target'
      data-dragging={isDragging}
      data-corner={corner}
    />
  );
};

const pointer = (target: EventTarget, type: string, clientX: number, clientY: number): void => {
  const event = new MouseEvent(type, { bubbles: true, clientX, clientY });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  fireEvent(target, event);
};

const startDrag = () => {
  localStorage.clear();
  vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(window.innerWidth);
  const result = render(<DragTarget />);
  const target = result.getByTestId('target');
  Object.defineProperties(target, {
    offsetWidth: { value: 100 },
    offsetHeight: { value: 40 },
    setPointerCapture: { value: vi.fn() },
    hasPointerCapture: { value: () => false },
  });
  const save = vi.spyOn(Storage.prototype, 'setItem');
  pointer(target, 'pointerdown', 900, 700);
  pointer(window, 'pointermove', 100, 100);
  expect(target.dataset.dragging).toBe('true');
  return { ...result, target, save };
};

const finishTransition = (target: HTMLElement): void => {
  const event = new Event('transitionend', { bubbles: true });
  Object.defineProperty(event, 'propertyName', { value: 'transform' });
  fireEvent(target, event);
};

describe('useDragToCorner gestures', () => {
  afterEach(() => {
    pointer(window, 'pointercancel', 0, 0);
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('clears a canceled drag without snapping or saving a corner', () => {
    const { target, save } = startDrag();
    const position = target.style.transform;
    pointer(window, 'pointercancel', 100, 100);
    expect(target.dataset.dragging).toBe('false');
    expect(target.style.transform).toBe(position);
    expect(target.style.transition).toBe('');
    finishTransition(target);
    expect(save).not.toHaveBeenCalled();
    expect(target.dataset.corner).toBe('bottom-right');
  });

  it('snaps and saves the corner after normal pointer release', () => {
    const { target, save } = startDrag();
    pointer(window, 'pointerup', 100, 100);
    expect(target.dataset.dragging).toBe('false');
    expect(target.style.transition).toContain('350ms');
    finishTransition(target);
    expect(save).toHaveBeenCalledWith(STORAGE_KEY, 'top-left');
    expect(target.dataset.corner).toBe('top-left');
  });
});
