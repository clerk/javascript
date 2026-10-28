import { describe, expect, it } from 'vitest';

import { currentInteractionOrigin, withInteractionOrigin } from './interaction-origin';

describe('withInteractionOrigin', () => {
  it('exposes the element only while the callback runs', () => {
    const trigger = document.createElement('button');
    let seen: HTMLElement | null = null;

    withInteractionOrigin(trigger, () => {
      seen = currentInteractionOrigin();
    });

    expect(seen).toBe(trigger);
    expect(currentInteractionOrigin()).toBeNull();
  });

  it('restores the enclosing origin when nested', () => {
    const outer = document.createElement('button');
    const inner = document.createElement('button');
    let afterInner: HTMLElement | null = null;

    withInteractionOrigin(outer, () => {
      withInteractionOrigin(inner, () => undefined);
      afterInner = currentInteractionOrigin();
    });

    expect(afterInner).toBe(outer);
  });

  it('clears the origin when the callback throws', () => {
    const trigger = document.createElement('button');

    expect(() =>
      withInteractionOrigin(trigger, () => {
        throw new Error('boom');
      }),
    ).toThrow('boom');

    expect(currentInteractionOrigin()).toBeNull();
  });

  it('returns what the callback returns', () => {
    expect(withInteractionOrigin(null, () => 'value')).toBe('value');
  });
});
