import { describe, expect, it, vi } from 'vitest';

import { createPageLifecycle } from '../pageLifecycle';

describe('page lifecycle cleanup', () => {
  it('removes only the disposed lifecycle focus listener', () => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    const first = createPageLifecycle();
    const second = createPageLifecycle();
    const firstFocus = vi.fn();
    const secondFocus = vi.fn();
    first.onPageFocus(firstFocus);
    second.onPageFocus(secondFocus);

    first.dispose();
    first.dispose();
    window.dispatchEvent(new Event('focus'));

    expect(firstFocus).not.toHaveBeenCalled();
    expect(secondFocus).toHaveBeenCalledOnce();
    second.dispose();
  });
});
