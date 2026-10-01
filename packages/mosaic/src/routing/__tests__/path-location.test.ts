import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createPathLocation } from '../path-location';

const flushMicrotasks = () => new Promise<void>(resolve => queueMicrotask(resolve));

function createHostNavigate() {
  return vi.fn((to: string, { replace }: { replace: boolean }) => {
    history[replace ? 'replaceState' : 'pushState'](null, '', to);
    return Promise.resolve();
  });
}

beforeEach(() => {
  history.replaceState(null, '', '/user-profile');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createPathLocation read', () => {
  it('reads the path and query relative to the base', () => {
    history.replaceState(null, '', '/user-profile/billing/statement/1?tab=items');
    const location = createPathLocation({ basePath: '/user-profile', navigate: createHostNavigate() });

    expect(location.read()).toBe('billing/statement/1?tab=items');
  });

  it('reads the empty path at the base', () => {
    const location = createPathLocation({ basePath: '/user-profile/', navigate: createHostNavigate() });

    expect(location.read()).toBe('');
  });

  it('reads a path held in the fragment', () => {
    history.replaceState(null, '', '/user-profile?a=1#/security?b=2');
    const location = createPathLocation({ basePath: '/user-profile', navigate: createHostNavigate() });

    expect(location.read()).toBe('security?a=1&b=2');
  });

  it('reads the empty path without a window', () => {
    const location = createPathLocation({ basePath: '/user-profile', navigate: createHostNavigate() });
    vi.stubGlobal('window', undefined);

    expect(location.read()).toBe('');
  });
});

describe('createPathLocation write', () => {
  it('navigates the host to the path under the base', async () => {
    const navigate = createHostNavigate();
    const location = createPathLocation({ basePath: '/user-profile', navigate });

    await location.write('security?tab=1', { replace: false });

    expect(navigate).toHaveBeenCalledWith('/user-profile/security?tab=1', { replace: false });
  });

  it('navigates the host to the base for the empty path', async () => {
    const navigate = createHostNavigate();
    const location = createPathLocation({ basePath: '/user-profile', navigate });

    await location.write('?tab=1', { replace: true });

    expect(navigate).toHaveBeenCalledWith('/user-profile?tab=1', { replace: true });
  });

  it('waits for the host navigation to finish', async () => {
    let finish = () => {};
    const navigate = vi.fn(() => new Promise<void>(resolve => (finish = resolve)));
    const location = createPathLocation({ basePath: '/user-profile', navigate });
    const done = vi.fn();

    void location.write('security', { replace: false }).then(done);
    await flushMicrotasks();
    expect(done).not.toHaveBeenCalled();

    finish();
    await flushMicrotasks();
    await flushMicrotasks();
    expect(done).toHaveBeenCalled();
  });
});

describe('createPathLocation start', () => {
  it('replaces a fragment path with the real path', async () => {
    history.replaceState(null, '', '/user-profile?a=1#/security');
    const navigate = createHostNavigate();

    await createPathLocation({ basePath: '/user-profile', navigate }).start();

    expect(navigate).toHaveBeenCalledWith('/user-profile/security?a=1', { replace: true });
  });

  it('does nothing without a fragment path', async () => {
    const navigate = createHostNavigate();

    await createPathLocation({ basePath: '/user-profile', navigate }).start();

    expect(navigate).not.toHaveBeenCalled();
  });
});

describe('createPathLocation subscribe', () => {
  it('notifies on changes inside the base', async () => {
    const location = createPathLocation({ basePath: '/user-profile', navigate: createHostNavigate() });
    const listener = vi.fn();
    location.subscribe(listener);

    history.pushState(null, '', '/user-profile/security');
    await flushMicrotasks();

    expect(listener).toHaveBeenCalled();
  });

  it('ignores changes outside the base', async () => {
    const location = createPathLocation({ basePath: '/user-profile', navigate: createHostNavigate() });
    const listener = vi.fn();
    location.subscribe(listener);

    history.pushState(null, '', '/user-profile-other');
    await flushMicrotasks();

    expect(listener).not.toHaveBeenCalled();
  });
});
