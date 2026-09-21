import { describe, expect, it, vi } from 'vitest';

import { createMemoryLocation } from '../memory-location';

describe('createMemoryLocation', () => {
  it('reads the initial path', () => {
    expect(createMemoryLocation('security').read()).toBe('security');
  });

  it('defaults to the empty path', () => {
    expect(createMemoryLocation().read()).toBe('');
  });

  it('reads what was written', async () => {
    const location = createMemoryLocation();

    await location.write('billing/statement/1?tab=items', { replace: false });

    expect(location.read()).toBe('billing/statement/1?tab=items');
  });

  it('notifies subscribers on write', async () => {
    const location = createMemoryLocation();
    const listener = vi.fn();
    location.subscribe(listener);

    await location.write('security', { replace: true });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('stops notifying after unsubscribe', async () => {
    const location = createMemoryLocation();
    const listener = vi.fn();
    const unsubscribe = location.subscribe(listener);

    unsubscribe();
    await location.write('security', { replace: false });

    expect(listener).not.toHaveBeenCalled();
  });

  it('never touches the browser URL', async () => {
    const before = window.location.href;

    await createMemoryLocation().write('security', { replace: false });

    expect(window.location.href).toBe(before);
  });
});
