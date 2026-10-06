import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createHashLocation } from '../hash-location';

const flushMicrotasks = () => new Promise<void>(resolve => queueMicrotask(resolve));

beforeEach(() => {
  history.replaceState(null, '', '/app');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createHashLocation', () => {
  it('reads the path and query after #/', () => {
    history.replaceState(null, '', '/app#/billing/statement/1?tab=items');

    expect(createHashLocation().read()).toBe('billing/statement/1?tab=items');
  });

  it('reads the empty path when there is no hash', () => {
    expect(createHashLocation().read()).toBe('');
  });

  it('ignores a page anchor', () => {
    history.replaceState(null, '', '/app#section');

    expect(createHashLocation().read()).toBe('');
  });

  it('reads the empty path without a window', () => {
    vi.stubGlobal('window', undefined);

    expect(createHashLocation().read()).toBe('');
  });

  it('pushes the path into the hash', async () => {
    const length = history.length;

    await createHashLocation().write('security', { replace: false });

    expect(window.location.pathname).toBe('/app');
    expect(window.location.hash).toBe('#/security');
    expect(history.length).toBe(length + 1);
  });

  it('replaces the hash without adding a history entry', async () => {
    const length = history.length;

    await createHashLocation().write('security', { replace: true });

    expect(window.location.hash).toBe('#/security');
    expect(history.length).toBe(length);
  });

  it('notifies subscribers when the hash changes', async () => {
    const listener = vi.fn();
    createHashLocation().subscribe(listener);

    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await flushMicrotasks();

    expect(listener).toHaveBeenCalled();
  });
});
