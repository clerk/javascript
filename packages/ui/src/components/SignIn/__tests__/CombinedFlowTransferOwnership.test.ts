import type { LoadedClerk, SignUpResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { handleCombinedFlowTransfer } from '../handleCombinedFlowTransfer';

const { load } = vi.hoisted(() => ({ load: vi.fn() }));
vi.mock('../lazy-sign-up', () => ({ lazyCompleteSignUpFlow: load }));

describe('Combined-flow transfer ownership', () => {
  beforeEach(() => {
    load.mockReset();
  });

  const setup = () => {
    const response = createDeferredPromise<SignUpResource>();
    const completion = vi.fn();
    const module = createDeferredPromise<typeof completion>();
    load.mockReturnValue(module.promise);
    const signUp = { create: vi.fn(() => response.promise), optionalFields: [], emailAddress: '' };
    const clerk = { client: { signUp }, setActive: vi.fn() };
    const navigate = vi.fn();
    const handleError = vi.fn();
    const canRun = vi.fn(() => true);
    const run = () =>
      handleCombinedFlowTransfer({
        clerk: clerk as unknown as LoadedClerk,
        canRun,
        identifierAttribute: 'emailAddress',
        identifierValue: 'user@example.com',
        signUpMode: 'public',
        navigate,
        handleError,
        afterSignUpUrl: '/done',
        passwordEnabled: false,
        navigateOnSetActive: vi.fn(),
      });
    return { run, response, module, completion, clerk, signUp, navigate, handleError, canRun };
  };

  it('does not mutate a sign-up when ownership is already lost', async () => {
    const { run, canRun, signUp } = setup();
    canRun.mockReturnValue(false);
    await run();
    expect(signUp.emailAddress).toBe('');
    expect(signUp.create).not.toHaveBeenCalled();
  });

  it.each(['owner', 'destination'] as const)('discards a lazy module result after the %s changes', async change => {
    const { run, response, module, completion, canRun, clerk } = setup();
    const pending = run();
    response.resolve({ status: 'complete' } as SignUpResource);
    await response.promise;
    expect(load).toHaveBeenCalledOnce();
    if (change === 'owner') {
      canRun.mockReturnValue(false);
    } else {
      clerk.client.signUp = { ...clerk.client.signUp };
    }
    module.resolve(completion);
    await pending;
    expect(completion).not.toHaveBeenCalled();
    expect(clerk.setActive).not.toHaveBeenCalled();
  });

  it('does not report a sign-up creation error after ownership is lost', async () => {
    const { run, response, canRun, handleError } = setup();
    const pending = run();
    canRun.mockReturnValue(false);
    response.reject(new Error('Late sign-up failure'));
    await pending;
    expect(handleError).not.toHaveBeenCalled();
    expect(load).not.toHaveBeenCalled();
  });
});
