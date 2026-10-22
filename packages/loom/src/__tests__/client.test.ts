import { describe, expect, it, vi } from 'vitest';

import { createLoomClient } from '../client';
import type { ActiveDeviceSession, Sessions } from '../types';

const scope = { instanceKey: 'test-instance', userId: 'user_a', sessionId: 'session_current' };
const device: ActiveDeviceSession = {
  id: 'session_other',
  status: 'active',
  lastActiveAt: 1_000,
  expireAt: 10_000,
  abandonAt: 10_000,
  hasActor: false,
  latestActivity: { id: 'activity_a', city: 'Denver' },
};

describe('active-device sessions', () => {
  it('projects transport and hydration inputs onto serializable session fields', async () => {
    const extra = {
      ...device,
      token: 'must-not-cache',
      resourceMethod: () => {},
      latestActivity: { ...device.latestActivity, token: 'must-not-cache' },
    };
    const transport = { read: () => Promise.resolve([extra]), revoke: () => Promise.resolve() };
    const fetched = createLoomClient({ scope, transport });
    const hydrated = createLoomClient({
      scope,
      transport,
      hydration: { version: 5, scope, sessions: { data: [extra], updatedAt: Date.now() } },
    });
    for (const client of [fetched, hydrated]) {
      expect(await client.fetch()).toEqual([device]);
      expect(client.dehydrate()?.sessions?.data).toEqual([device]);
      expect(JSON.stringify(client.dehydrate())).not.toContain('must-not-cache');
      client.dispose();
    }
  });
  it('accepts a matching server snapshot when the browser clock lags', async () => {
    const read = vi.fn(() => Promise.resolve([]));
    const loom = createLoomClient({
      scope,
      transport: { read, revoke: () => Promise.resolve() },
      hydration: { version: 5, scope, sessions: { data: [device], updatedAt: Date.now() + 30_000 } },
    });
    expect(await loom.fetch()).toEqual([device]);
    expect(read).not.toHaveBeenCalled();
    expect(loom.getSnapshot()?.dataUpdatedAt).toBeLessThanOrEqual(Date.now());
    loom.dispose();
  });
  it('returns transport snapshots through plain JavaScript', async () => {
    const read = vi.fn(() => Promise.resolve([device]));
    const loom = createLoomClient({ scope, transport: { read, revoke: async () => {} } });
    expect(await loom.fetch()).toEqual([device]);
    expect(read).toHaveBeenCalledTimes(1);
  });

  it('shares in-flight prefetch and reuses fresh data until explicitly refreshed', async () => {
    const pending = Promise.withResolvers<Sessions>();
    const read = vi.fn(() => pending.promise);
    const loom = createLoomClient({ scope, transport: { read, revoke: async () => {} } });
    const prefetch = loom.prefetch();
    const fetch = loom.fetch();
    pending.resolve([device]);
    await Promise.all([prefetch, fetch]);
    expect(await loom.fetch()).toEqual([device]);
    expect(read).toHaveBeenCalledTimes(1);
    await loom.refresh();
    expect(read).toHaveBeenCalledTimes(2);
    loom.dispose();
  });

  it('distinguishes empty success, initial failure, background failure, and recovery', async () => {
    const failure = new Error('offline');
    const read = vi
      .fn<() => Promise<Sessions>>()
      .mockRejectedValueOnce(failure)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([device])
      .mockRejectedValueOnce(failure)
      .mockResolvedValueOnce([]);
    const loom = createLoomClient({ scope, transport: { read, revoke: async () => {} } });
    await expect(loom.fetch()).rejects.toBe(failure);
    expect(loom.getSnapshot()?.status).toBe('error');
    expect(await loom.fetch()).toEqual([]);
    expect(await loom.refresh()).toEqual([device]);
    await expect(loom.refresh()).rejects.toBe(failure);
    expect(loom.getSnapshot()?.data).toEqual([device]);
    expect(loom.getSnapshot()?.error).toBe(failure);
    expect(await loom.refresh()).toEqual([]);
    loom.dispose();
  });

  it('notifies plain JavaScript observers and stops after unsubscribe', async () => {
    const loom = createLoomClient({
      scope,
      transport: { read: () => Promise.resolve([device]), revoke: async () => {} },
    });
    const listener = vi.fn();
    const unsubscribe = loom.subscribe(listener);
    await loom.fetch();
    expect(listener.mock.calls.some(([result]) => result.data?.[0]?.id === device.id)).toBe(true);
    unsubscribe();
    listener.mockClear();
    await loom.refresh();
    expect(listener).not.toHaveBeenCalled();
    loom.dispose();
  });

  it('retires an owner and rejects late reads even when the transport ignores abort', async () => {
    const pending = Promise.withResolvers<Sessions>();
    const loom = createLoomClient({ scope, transport: { read: () => pending.promise, revoke: async () => {} } });
    const result = loom.fetch();
    const rejected = expect(result).rejects.toThrow();
    loom.dispose();
    loom.dispose();
    pending.resolve([device]);
    await rejected;
    expect(loom.getSnapshot()).toBeUndefined();
    await expect(loom.fetch()).rejects.toThrow('disposed');
  });

  it('does not resurrect a revoked device from an older read', async () => {
    const pending = Promise.withResolvers<Sessions>();
    const read = vi
      .fn<() => Promise<Sessions>>()
      .mockResolvedValueOnce([device])
      .mockImplementationOnce(() => pending.promise);
    const loom = createLoomClient({ scope, transport: { read, revoke: async () => {} } });
    await loom.fetch();
    const refresh = loom.refresh();
    const rejected = expect(refresh).rejects.toThrow();
    await loom.revoke(device.id);
    pending.resolve([device]);
    await rejected;
    expect(loom.getSnapshot()?.data).toEqual([]);
    loom.dispose();
  });

  it('composes overlapping revocations against the latest cache', async () => {
    const other = { ...device, id: 'session_third' };
    const a = Promise.withResolvers<void>();
    const b = Promise.withResolvers<void>();
    const loom = createLoomClient({
      scope,
      transport: {
        read: () => Promise.resolve([device, other]),
        revoke: id => (id === device.id ? a.promise : b.promise),
      },
    });
    await loom.fetch();
    const first = loom.revoke(device.id);
    const second = loom.revoke(other.id);
    b.resolve();
    await second;
    a.resolve();
    await first;
    expect(loom.getSnapshot()?.data).toEqual([]);
    loom.dispose();
  });

  it('preserves mutation errors and refuses current, unknown, and retired targets', async () => {
    const failure = new Error('session_reverification_required');
    const revoke = vi.fn().mockRejectedValue(failure);
    const loom = createLoomClient({
      scope,
      transport: { read: () => Promise.resolve([device, { ...device, id: scope.sessionId }]), revoke },
    });
    await loom.fetch();
    await expect(loom.revoke(scope.sessionId)).rejects.toThrow('unavailable');
    await expect(loom.revoke('missing')).rejects.toThrow('unavailable');
    expect(revoke).not.toHaveBeenCalled();
    await expect(loom.revoke(device.id)).rejects.toBe(failure);
    expect(loom.getSnapshot()?.data).toHaveLength(2);
    loom.dispose();
    await expect(loom.revoke(device.id)).rejects.toThrow('disposed');
    expect(revoke).toHaveBeenCalledTimes(1);
  });

  it('isolates concurrent owners and only accepts matching initialization snapshots', async () => {
    const read = vi.fn(() => Promise.resolve([device]));
    const first = createLoomClient({ scope, transport: { read, revoke: async () => {} } });
    const second = createLoomClient({
      scope: { ...scope, userId: 'user_b' },
      transport: { read: () => Promise.resolve([]), revoke: async () => {} },
    });
    await Promise.all([first.fetch(), second.fetch()]);
    expect(second.getSnapshot()?.data).toEqual([]);
    const hydration = JSON.parse(JSON.stringify(first.dehydrate()));
    const restored = createLoomClient({ scope, transport: { read, revoke: async () => {} }, hydration });
    expect(await restored.fetch()).toEqual([device]);
    expect(read).toHaveBeenCalledTimes(1);
    expect(() =>
      createLoomClient({
        scope: { ...scope, userId: 'user_b' },
        transport: { read, revoke: async () => {} },
        hydration,
      }),
    ).toThrow('hydration');
    for (const client of [first, second, restored]) {
      client.dispose();
    }
  });
});
