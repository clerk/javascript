import { describe, expect, it, vi } from 'vitest';

import type { MosaicLocation } from '../location';
import { createMemoryLocation } from '../memory-location';
import { createRouter } from '../router';

const routes = {
  index: '',
  security: 'security',
  statement: 'billing/statement/:statementId',
} as const;

function createDeferredLocation(initialPath = '') {
  let current = initialPath;
  let finishWrite = () => {};
  const listeners = new Set<() => void>();
  const location: MosaicLocation = {
    read: () => current,
    write: vi.fn(() => new Promise<void>(resolve => (finishWrite = resolve))),
    subscribe: listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  return {
    location,
    listenerCount: () => listeners.size,
    finishWrite: () => finishWrite(),
    changeUrl: (path: string) => {
      current = path;
      for (const listener of listeners) {
        listener();
      }
    },
  };
}

describe('createRouter page', () => {
  it('parses the initial path', () => {
    const router = createRouter(routes, createMemoryLocation('billing/statement/st_1?tab=items'));

    expect(router.get()).toEqual({
      route: 'statement',
      params: { statementId: 'st_1' },
      path: 'billing/statement/st_1',
      search: { tab: 'items' },
    });
  });

  it('has no page when nothing matches', () => {
    expect(createRouter(routes, createMemoryLocation('missing')).get()).toBeUndefined();
  });

  it('follows location changes made outside the router', async () => {
    const location = createMemoryLocation();
    const router = createRouter(routes, location);
    const listener = vi.fn();
    router.subscribe(listener);

    await location.write('security', { replace: false });

    expect(router.get()?.route).toBe('security');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('keeps the same page object when the path did not change', () => {
    const fake = createDeferredLocation('security');
    const router = createRouter(routes, fake.location);
    router.subscribe(vi.fn());
    const before = router.get();

    fake.changeUrl('security');

    expect(router.get()).toBe(before);
  });

  it('stops listening to the location when the last subscriber leaves', () => {
    const fake = createDeferredLocation();
    const router = createRouter(routes, fake.location);

    const unsubscribe = router.subscribe(vi.fn());
    expect(fake.listenerCount()).toBe(1);

    unsubscribe();
    expect(fake.listenerCount()).toBe(0);
  });
});

describe('createRouter href', () => {
  it('builds a path from a route name, params and search', () => {
    const router = createRouter(routes, createMemoryLocation());

    expect(router.href('statement', { statementId: 'st 1' }, { tab: 'items' })).toBe(
      'billing/statement/st%201?tab=items',
    );
  });

  it('builds a static path without params', () => {
    expect(createRouter(routes, createMemoryLocation()).href('security')).toBe('security');
  });
});

describe('createRouter open', () => {
  it('writes to the location and commits the new page', async () => {
    const location = createMemoryLocation();
    const write = vi.spyOn(location, 'write');
    const router = createRouter(routes, location);
    const listener = vi.fn();
    router.subscribe(listener);

    await router.open('security', { replace: true });

    expect(write).toHaveBeenCalledWith('security', { replace: true });
    expect(router.get()?.route).toBe('security');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('commits only after the location write finishes', async () => {
    const fake = createDeferredLocation();
    const router = createRouter(routes, fake.location);

    const opening = router.open('security');
    expect(router.get()?.route).toBe('index');

    fake.finishWrite();
    await opening;
    expect(router.get()?.route).toBe('security');
  });

  it('commits the target even when the host leaves the URL unchanged', async () => {
    const fake = createDeferredLocation();
    const router = createRouter(routes, fake.location);

    const opening = router.open('security');
    fake.finishWrite();
    await opening;

    expect(router.get()?.route).toBe('security');
  });

  it('ignores location changes while its own write is in flight', () => {
    const fake = createDeferredLocation();
    const router = createRouter(routes, fake.location);
    router.subscribe(vi.fn());

    void router.open('billing/statement/st_1');
    fake.changeUrl('security');

    expect(router.get()?.route).toBe('index');
  });

  it('dedupes an open to the destination already in flight', async () => {
    const fake = createDeferredLocation();
    const router = createRouter(routes, fake.location);

    const first = router.open('security');
    const second = router.open('security');
    fake.finishWrite();
    await Promise.all([first, second]);

    expect(fake.location.write).toHaveBeenCalledTimes(1);
  });

  it('lets a newer open win over an older one still in flight', async () => {
    const location = createMemoryLocation();
    let finishFirst = () => {};
    vi.spyOn(location, 'write').mockImplementationOnce(() => new Promise<void>(resolve => (finishFirst = resolve)));
    const router = createRouter(routes, location);

    const first = router.open('security');
    await router.open('billing/statement/st_1');
    finishFirst();
    await first;

    expect(router.get()?.route).toBe('statement');
  });

  it('runs the commit through the commit option', async () => {
    const commit = vi.fn((update: () => void) => update());
    const router = createRouter(routes, createMemoryLocation(), { commit });

    await router.open('security');

    expect(commit).toHaveBeenCalledTimes(1);
    expect(router.get()?.route).toBe('security');
  });
});

describe('createRouter go', () => {
  it('opens a route by name with params and search', async () => {
    const location = createMemoryLocation();
    const write = vi.spyOn(location, 'write');
    const router = createRouter(routes, location);

    await router.go('statement', { statementId: 'st_1' }, { search: { tab: 'items' }, replace: true });

    expect(write).toHaveBeenCalledWith('billing/statement/st_1?tab=items', { replace: true });
    expect(router.get()?.route).toBe('statement');
  });

  it('carries preserved search params from the current page', async () => {
    const location = createMemoryLocation('?redirect_url=%2Fhome&other=1');
    const router = createRouter(routes, location, { preservedSearchParams: ['redirect_url'] });

    await router.go('security');

    expect(location.read()).toBe('security?redirect_url=%2Fhome');
  });

  it('lets explicit search params win over preserved ones', async () => {
    const location = createMemoryLocation('?redirect_url=%2Fhome');
    const router = createRouter(routes, location, { preservedSearchParams: ['redirect_url'] });

    await router.go('security', {}, { search: { redirect_url: '/next' } });

    expect(location.read()).toBe('security?redirect_url=%2Fnext');
  });
});
