import { createDeferredPromise } from '@clerk/shared/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProtectCheckGate } from './protectCheckGate';
import type { Clerk } from './resources/internal';

const gated = (id = 'sia_1') =>
  ({
    id,
    protectCheck: { status: 'pending', token: 'tok', sdkUrl: 'https://protect.example.com/sdk.js' },
  }) as any;

const mockClerk = (overrides: Partial<Clerk> = {}) =>
  ({
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
    const resource = gated();

    let settled = false;
    const pending = gate.resolve(clerk, 'signIn', resource).then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(clerk.__internal_openProtectCheckModal).toHaveBeenCalledWith({ resource });
    expect(settled).toBe(false);

    deferred.resolve();
    await pending;
    expect(settled).toBe(true);
  });

  it('counts registrations per flow and releases each one once', async () => {
    const clerk = mockClerk();
    const releaseCombined = gate.register(['signIn', 'signUp']);
    const releaseSignUp = gate.register(['signUp']);

    releaseCombined();
    releaseCombined();
    await gate.resolve(clerk, 'signIn', gated('sia_1'));
    await gate.resolve(clerk, 'signUp', gated('sua_1'));
    expect(clerk.__internal_openProtectCheckModal).toHaveBeenCalledTimes(1);

    releaseSignUp();
    await gate.resolve(clerk, 'signUp', gated('sua_1'));
    expect(clerk.__internal_openProtectCheckModal).toHaveBeenCalledTimes(2);
  });

  it('makes a call on the same resource share the in-flight resolution', async () => {
    const deferred = createDeferredPromise();
    const clerk = mockClerk({ __internal_openProtectCheckModal: vi.fn().mockReturnValue(deferred.promise) });

    const outer = gate.resolve(clerk, 'signIn', gated());
    let innerSettled = false;
    const inner = gate.resolve(clerk, 'signIn', gated()).then(() => {
      innerSettled = true;
    });
    await Promise.resolve();
    expect(innerSettled).toBe(false);

    deferred.resolve();
    await Promise.all([outer, inner]);
    expect(clerk.__internal_openProtectCheckModal).toHaveBeenCalledTimes(1);
  });

  it('makes a call on another resource wait, then resolve its own gate', async () => {
    const first = createDeferredPromise();
    const open = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValueOnce(undefined);
    const clerk = mockClerk({ __internal_openProtectCheckModal: open });
    const signUp = gated('sua_1');

    const outer = gate.resolve(clerk, 'signIn', gated('sia_1'));
    const other = gate.resolve(clerk, 'signUp', signUp);
    await Promise.resolve();
    expect(open).toHaveBeenCalledTimes(1);

    first.resolve();
    await Promise.all([outer, other]);
    expect(open).toHaveBeenCalledTimes(2);
    expect(open).toHaveBeenLastCalledWith({ resource: signUp });
  });

  it('releases the in-flight lock and rethrows when the modal cannot open', async () => {
    const clerk = mockClerk({ __internal_openProtectCheckModal: vi.fn().mockRejectedValue(new Error('no ui')) });
    await expect(gate.resolve(clerk, 'signIn', gated())).rejects.toThrow('no ui');

    const next = mockClerk();
    await gate.resolve(next, 'signIn', gated());
    expect(next.__internal_openProtectCheckModal).toHaveBeenCalledTimes(1);
  });
});
