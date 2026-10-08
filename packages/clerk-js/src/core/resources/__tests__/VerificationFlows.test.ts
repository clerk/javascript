import { createDeferredPromise } from '@clerk/shared/utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EmailAddress, SignIn, SignUp } from '../internal';

function emailFlow(enterprise: boolean) {
  const resource = new EmailAddress({ id: 'email_123' }, '/me/email_addresses');
  resource.verification.status = 'verified';
  resource.verification.externalVerificationRedirectURL = new URL('https://example.com/sso');
  const prepare = vi.spyOn(resource, 'prepareVerification').mockResolvedValue(resource);
  const reload = vi.spyOn(resource, 'reload').mockResolvedValue(resource);
  if (enterprise) {
    const flow = resource.createEnterpriseSSOLinkFlow();
    return {
      resource,
      prepare,
      reload,
      pausePreparation: (pending: Promise<unknown>) =>
        prepare.mockImplementation(async () => {
          await pending;
          return resource;
        }),
      start: () => flow.startEnterpriseSSOLinkFlow({ redirectUrl: '/verify' }),
      cancel: flow.cancelEnterpriseSSOLinkFlow,
    };
  }
  const flow = resource.createEmailLinkFlow();
  return {
    resource,
    prepare,
    reload,
    pausePreparation: (pending: Promise<unknown>) =>
      prepare.mockImplementation(async () => {
        await pending;
        return resource;
      }),
    start: () => flow.startEmailLinkFlow({ redirectUrl: '/verify' }),
    cancel: flow.cancelEmailLinkFlow,
  };
}

function signInFlow(secondFactor: boolean) {
  const resource = new SignIn();
  resource.id = 'sign_in_123';
  resource.status = secondFactor ? 'needs_second_factor' : 'needs_first_factor';
  resource.firstFactorVerification.status = secondFactor ? 'unverified' : 'verified';
  resource.secondFactorVerification.status = secondFactor ? 'verified' : 'unverified';
  const prepare = vi
    .spyOn(resource, secondFactor ? 'prepareSecondFactor' : 'prepareFirstFactor')
    .mockResolvedValue(resource);
  const reload = vi.spyOn(resource, 'reload').mockResolvedValue(resource);
  const flow = resource.createEmailLinkFlow();
  return {
    resource,
    prepare,
    reload,
    pausePreparation: (pending: Promise<unknown>) =>
      prepare.mockImplementation(async () => {
        await pending;
        return resource;
      }),
    start: () => flow.startEmailLinkFlow({ emailAddressId: 'email_123', redirectUrl: '/verify' }),
    cancel: flow.cancelEmailLinkFlow,
  };
}

function signUpFlow() {
  const resource = new SignUp();
  resource.id = 'sign_up_123';
  resource.verifications.emailAddress.status = 'verified';
  const prepare = vi.spyOn(resource, 'prepareEmailAddressVerification').mockResolvedValue(resource);
  const reload = vi.spyOn(resource, 'reload').mockResolvedValue(resource);
  const flow = resource.createEmailLinkFlow();
  return {
    resource,
    prepare,
    reload,
    pausePreparation: (pending: Promise<unknown>) =>
      prepare.mockImplementation(async () => {
        await pending;
        return resource;
      }),
    start: () => flow.startEmailLinkFlow({ redirectUrl: '/verify' }),
    cancel: flow.cancelEmailLinkFlow,
  };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe.each([
  ['email address', () => emailFlow(false)],
  ['enterprise SSO', () => emailFlow(true)],
  ['sign-in first factor', () => signInFlow(false)],
  ['sign-in second factor', () => signInFlow(true)],
  ['sign-up', signUpFlow],
] as const)('%s verification flow', (name, createFlow) => {
  it('does not reload after cancellation during preparation', async () => {
    const flow = createFlow();
    const preparation = createDeferredPromise();
    flow.pausePreparation(preparation.promise);
    const settled = vi.fn();
    void flow.start().then(settled, settled);
    flow.cancel();
    preparation.resolve(flow.resource);
    await vi.advanceTimersByTimeAsync(5000);

    expect(flow.reload).not.toHaveBeenCalled();
    expect(settled).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('returns the verified resource with the existing public flow API', async () => {
    const flow = createFlow();
    await expect(flow.start()).resolves.toBe(flow.resource);
    expect(flow.prepare).toHaveBeenCalledWith(
      expect.objectContaining({
        strategy: name === 'enterprise SSO' ? 'enterprise_sso' : 'email_link',
        redirectUrl: '/verify',
      }),
    );
    expect(flow.reload).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
});
