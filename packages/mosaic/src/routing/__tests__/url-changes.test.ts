import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

async function loadSubscribe() {
  vi.resetModules();
  const { subscribeToUrlChanges } = await import('../url-changes');
  return subscribeToUrlChanges;
}

const flushMicrotasks = () => new Promise<void>(resolve => queueMicrotask(resolve));

const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

afterEach(() => {
  history.pushState = originalPushState;
  history.replaceState = originalReplaceState;
  Reflect.deleteProperty(window, 'navigation');
});

describe('subscribeToUrlChanges without the Navigation API', () => {
  it.each([
    ['pushState', () => history.pushState(null, '', '/a')],
    ['replaceState', () => history.replaceState(null, '', '/b')],
    ['popstate', () => window.dispatchEvent(new PopStateEvent('popstate'))],
    ['hashchange', () => window.dispatchEvent(new HashChangeEvent('hashchange'))],
  ])('notifies on %s', async (_, change) => {
    const subscribe = await loadSubscribe();
    const listener = vi.fn();
    subscribe(listener);

    change();
    await flushMicrotasks();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('patches history once for many subscribers', async () => {
    const subscribe = await loadSubscribe();
    const first = vi.fn();
    const second = vi.fn();
    subscribe(first);
    subscribe(second);

    history.pushState(null, '', '/c');
    await flushMicrotasks();

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('stops notifying after unsubscribe', async () => {
    const subscribe = await loadSubscribe();
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    unsubscribe();
    history.pushState(null, '', '/d');
    await flushMicrotasks();

    expect(listener).not.toHaveBeenCalled();
  });
});

describe('subscribeToUrlChanges with the Navigation API', () => {
  let navigation: EventTarget;

  beforeEach(() => {
    navigation = new EventTarget();
    Object.defineProperty(window, 'navigation', { value: navigation, configurable: true });
  });

  it('notifies on currententrychange without patching history', async () => {
    const subscribe = await loadSubscribe();
    const listener = vi.fn();
    subscribe(listener);

    navigation.dispatchEvent(new Event('currententrychange'));
    await flushMicrotasks();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(history.pushState).toBe(originalPushState);
  });

  it('still notifies on hashchange', async () => {
    const subscribe = await loadSubscribe();
    const listener = vi.fn();
    subscribe(listener);

    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await flushMicrotasks();

    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('subscribeToUrlChanges without a window', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns a no-op unsubscribe and installs nothing', async () => {
    const subscribe = await loadSubscribe();
    vi.stubGlobal('window', undefined);

    const unsubscribe = subscribe(vi.fn());

    expect(unsubscribe).not.toThrow();
    expect(history.pushState).toBe(originalPushState);
  });
});
