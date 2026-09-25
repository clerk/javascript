import type { FloatingEvents, OpenChangeReason } from '@floating-ui/react';
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { withInteractionOrigin } from '../utils/interaction-origin';
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

function renderReturnFocus(trigger: HTMLElement | null) {
  const events = createEvents();

  const { result, rerender } = renderHook(
    ({ open }: { open: boolean }) =>
      useReturnFocus({ open, events, elements: { domReference: trigger, reference: trigger, floating: null } }),
    { initialProps: { open: false } },
  );

  return {
    events,
    result,
    open: (open: boolean) => {
      events.emit('openchange', { open });
      rerender({ open });
    },
  };
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

  describe('opened from inside another floating element', () => {
    let menuTrigger: HTMLElement;

    beforeEach(() => {
      menuTrigger = document.createElement('button');
      document.body.append(menuTrigger);
    });

    afterEach(() => menuTrigger.remove());

    it('falls back to the interaction origin when it has no trigger of its own', () => {
      const { result, open } = renderReturnFocus(null);

      withInteractionOrigin(menuTrigger, () => open(true));

      expect(result.current.current).toBe(menuTrigger);
    });

    it('prefers its own trigger over the interaction origin', () => {
      const { result, open } = renderReturnFocus(trigger);

      withInteractionOrigin(menuTrigger, () => open(true));

      expect(result.current.current).toBe(trigger);
    });

    it('falls back to the origin once its own trigger has left the page', () => {
      const { result, open } = renderReturnFocus(trigger);
      withInteractionOrigin(menuTrigger, () => open(true));

      trigger.remove();

      expect(result.current.current).toBe(menuTrigger);
    });

    it('resolves to nothing once the origin has left the page too', () => {
      const { result, open } = renderReturnFocus(null);
      withInteractionOrigin(menuTrigger, () => open(true));

      menuTrigger.remove();

      expect(result.current.current).toBeNull();
    });

    it('forgets the origin on an open that has none', () => {
      const { result, open } = renderReturnFocus(null);
      withInteractionOrigin(menuTrigger, () => open(true));
      open(false);

      open(true);

      expect(result.current.current).toBeNull();
    });
  });
});
