import type { FloatingEvents, OpenChangeReason } from '@floating-ui/react';
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useReturnFocus } from './use-return-focus';

function createEvents(): FloatingEvents & { close: (event?: Event, reason?: OpenChangeReason) => void } {
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
    close(event, reason) {
      this.emit('openchange', { open: false, event, reason });
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

    events.close(new KeyboardEvent('keydown', { key: 'Escape' }), 'escape-key');

    expect(result.current.current).toBe(trigger);
  });

  it('keeps the trigger when a forwarded event carries no dismissal reason', () => {
    const { events, result, open } = renderReturnFocus(trigger);
    open(true);

    // A Close button forwards its click through `setOpen` with no floating-ui reason.
    events.close(new MouseEvent('click', { detail: 1 }));

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

  it('leaves focus alone when the close came from a pointer dismissal', () => {
    const { events, result, open } = renderReturnFocus(trigger);
    open(true);

    events.close(new MouseEvent('mousedown', { detail: 1 }), 'outside-press');

    expect(result.current.current).toBeNull();
  });

  it('restores the trigger on the next open', () => {
    const { events, result, open } = renderReturnFocus(trigger);
    open(true);
    events.close(new MouseEvent('mousedown', { detail: 1 }), 'outside-press');

    open(false);
    open(true);

    expect(result.current.current).toBe(trigger);
  });
});
