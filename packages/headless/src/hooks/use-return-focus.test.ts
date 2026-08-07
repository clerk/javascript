import type { FloatingEvents } from '@floating-ui/react';
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useReturnFocus } from './use-return-focus';

function createEvents(): FloatingEvents & { close: (event?: Event) => void } {
  const handlers = new Map<string, Array<(data: unknown) => void>>();

  return {
    emit(event, data) {
      handlers.get(event)?.forEach(handler => handler(data));
    },
    on(event, handler) {
      handlers.set(event, [...(handlers.get(event) ?? []), handler]);
    },
    off(event, handler) {
      handlers.set(
        event,
        (handlers.get(event) ?? []).filter(h => h !== handler),
      );
    },
    close(event) {
      this.emit('openchange', { open: false, event });
    },
  };
}

function renderReturnFocus(trigger: HTMLElement) {
  const events = createEvents();

  const { result, rerender } = renderHook(
    ({ open }: { open: boolean }) =>
      useReturnFocus({ open, events, elements: { domReference: trigger, reference: trigger, floating: null } }),
    { initialProps: { open: false } },
  );

  return { events, result, open: (open: boolean) => rerender({ open }) };
}

let trigger: HTMLElement;

afterEach(() => trigger?.remove());

describe('useReturnFocus', () => {
  beforeEach(() => {
    trigger = document.createElement('button');
    document.body.append(trigger);
  });

  it('resolves to the trigger while open', () => {
    const { result, open } = renderReturnFocus(trigger);

    open(true);

    expect(result.current.current).toBe(trigger);
  });

  it('keeps the trigger when the close came from the keyboard', () => {
    const { events, result, open } = renderReturnFocus(trigger);
    open(true);

    events.close(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(result.current.current).toBe(trigger);
  });

  it('keeps the trigger when the close came from a control inside the popup', () => {
    const { events, result, open } = renderReturnFocus(trigger);
    open(true);

    // A Close button or menu item routes through the consumer's own state setter,
    // so floating-ui reports the change with no event behind it.
    events.close();

    expect(result.current.current).toBe(trigger);
  });

  it('leaves focus alone when the close came from a pointer', () => {
    const { events, result, open } = renderReturnFocus(trigger);
    open(true);

    events.close(new MouseEvent('mousedown', { detail: 1 }));

    expect(result.current.current).toBeNull();
  });

  it('restores the trigger on the next open', () => {
    const { events, result, open } = renderReturnFocus(trigger);
    open(true);
    events.close(new MouseEvent('mousedown', { detail: 1 }));

    open(false);
    open(true);

    expect(result.current.current).toBe(trigger);
  });
});
