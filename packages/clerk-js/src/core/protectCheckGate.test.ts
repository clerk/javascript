import { createDeferredPromise } from '@clerk/shared/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProtectCheckGate } from './protectCheckGate';
import type { Clerk } from './resources/internal';

const gated = () => ({
  protectCheck: { status: 'pending', token: 'tok', sdkUrl: 'https://protect.example.com/sdk.js' },
});
const clear = () => ({ protectCheck: null });

const mockClerk = (overrides: Partial<Clerk> = {}) =>
  ({
    __internal_hasProtectCheckHandler: false,
    __internal_openProtectCheckModal: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }) as unknown as Clerk;

describe('ProtectCheckGate', () => {
  let gate: ProtectCheckGate;

  beforeEach(() => {
    gate = ProtectCheckGate.getInstance();
  });

  it('opens the modal for a gated resource and waits for it to resolve', async () => {
    const deferred = createDeferredPromise();
    const clerk = mockClerk({ __internal_openProtectCheckModal: vi.fn().mockReturnValue(deferred.promise) });
    const resource = gated() as any;

    let settled = false;
    const pending = gate.resolve(clerk, resource).then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(clerk.__internal_openProtectCheckModal).toHaveBeenCalledWith({ resource });
    expect(settled).toBe(false);

    deferred.resolve();
    await pending;
    expect(settled).toBe(true);
  });

  it('does nothing for a resource that cannot carry a gate', async () => {
    const clerk = mockClerk();
    await gate.resolve(clerk, { id: 'user_1' } as any);
    expect(clerk.__internal_openProtectCheckModal).not.toHaveBeenCalled();
  });

  it('does nothing when the resource has no gate', async () => {
    const clerk = mockClerk();
    await gate.resolve(clerk, clear() as any);
    expect(clerk.__internal_openProtectCheckModal).not.toHaveBeenCalled();
  });

  it('leaves the gate to a registered prebuilt handler', async () => {
    const clerk = mockClerk({ __internal_hasProtectCheckHandler: true });
    await gate.resolve(clerk, gated() as any);
    expect(clerk.__internal_openProtectCheckModal).not.toHaveBeenCalled();
  });

  it('returns immediately for requests made while a resolution is in flight', async () => {
    const deferred = createDeferredPromise();
    const clerk = mockClerk({ __internal_openProtectCheckModal: vi.fn().mockReturnValue(deferred.promise) });

    const outer = gate.resolve(clerk, gated() as any);
    await gate.resolve(clerk, gated() as any);
    expect(clerk.__internal_openProtectCheckModal).toHaveBeenCalledTimes(1);

    deferred.resolve();
    await outer;
  });

  it('opens again for a later gate once the previous resolution finished', async () => {
    const clerk = mockClerk();
    await gate.resolve(clerk, gated() as any);
    await gate.resolve(clerk, gated() as any);
    expect(clerk.__internal_openProtectCheckModal).toHaveBeenCalledTimes(2);
  });

  it('releases the in-flight lock and rethrows when the modal cannot open', async () => {
    const clerk = mockClerk({ __internal_openProtectCheckModal: vi.fn().mockRejectedValue(new Error('no ui')) });
    await expect(gate.resolve(clerk, gated() as any)).rejects.toThrow('no ui');

    const next = mockClerk();
    await gate.resolve(next, gated() as any);
    expect(next.__internal_openProtectCheckModal).toHaveBeenCalledTimes(1);
  });
});
