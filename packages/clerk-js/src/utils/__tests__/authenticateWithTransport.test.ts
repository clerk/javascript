import type { ClerkRuntimeError } from '@clerk/shared/error';
import { describe, expect, it, vi } from 'vitest';

import { _authenticateWithTransport } from '../authenticateWithTransport';

const makeClerk = () => ({
  __internal_handleResourceCallback: vi.fn().mockResolvedValue('done'),
});

describe('_authenticateWithTransport', () => {
  it('captures the verification URL, opens the transport, reloads with the nonce, then completes', async () => {
    const clerk = makeClerk();
    const transport = {
      getRedirectUrl: vi.fn().mockResolvedValue('myapp://sso-callback'),
      open: vi.fn().mockResolvedValue({ callbackUrl: 'myapp://sso-callback?rotating_token_nonce=abc' }),
    };
    const resource = {
      reload: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue(undefined),
    } as any;
    const authenticateMethod = vi.fn(async (_params, navigate) => {
      navigate(new URL('https://provider.example/auth'));
    });
    const callbackParams = { signInUrl: '/sign-in' };

    await _authenticateWithTransport({
      clerk: clerk as any,
      transport,
      resource,
      authenticateMethod,
      params: { strategy: 'oauth_google', redirectUrl: '/x', redirectUrlComplete: '/done' } as any,
      callbackParams,
    });

    expect(authenticateMethod).toHaveBeenCalledWith(
      expect.objectContaining({ redirectUrl: 'myapp://sso-callback', redirectUrlComplete: '/done' }),
      expect.any(Function),
    );
    expect(transport.open).toHaveBeenCalledWith(new URL('https://provider.example/auth'));
    expect(resource.reload).toHaveBeenCalledWith({ rotatingTokenNonce: 'abc' });
    expect(clerk.__internal_handleResourceCallback).toHaveBeenCalledWith(resource, callbackParams);
    expect(resource.create).not.toHaveBeenCalled();
  });

  it('reloads without a nonce when the callback URL has no nonce', async () => {
    const clerk = makeClerk();
    const transport = {
      getRedirectUrl: vi.fn().mockResolvedValue('myapp://sso-callback'),
      open: vi.fn().mockResolvedValue({ callbackUrl: 'myapp://sso-callback' }),
    };
    const resource = { reload: vi.fn().mockResolvedValue(undefined) } as any;
    const authenticateMethod = vi.fn(async (_params, navigate) => navigate('https://provider.example/auth'));

    await _authenticateWithTransport({
      clerk: clerk as any,
      transport,
      resource,
      authenticateMethod,
      params: {} as any,
      callbackParams: {},
    });

    expect(resource.reload).toHaveBeenCalledWith();
    expect(clerk.__internal_handleResourceCallback).toHaveBeenCalledWith(resource, {});
  });

  it('rejects with a localizable error without reloading when the native callback reports OAuth failure', async () => {
    const clerk = makeClerk();
    const transport = {
      getRedirectUrl: vi.fn().mockResolvedValue('myapp://sso-callback'),
      open: vi.fn().mockResolvedValue({
        callbackUrl: 'myapp://sso-callback?__clerk_status=failed&__clerk_error_code=oauth_access_denied',
      }),
    };
    const resource = {
      reload: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue(undefined),
    } as any;
    const authenticateMethod = vi.fn(async (_params, navigate) => navigate('https://provider.example/auth'));

    await expect(
      _authenticateWithTransport({
        clerk: clerk as any,
        transport,
        resource,
        authenticateMethod,
        params: {} as any,
        callbackParams: {},
      }),
    ).rejects.toMatchObject({
      code: 'oauth_access_denied',
      clerkRuntimeError: true,
    } satisfies Partial<ClerkRuntimeError>);

    expect(resource.create).toHaveBeenCalledWith({});
    expect(resource.reload).not.toHaveBeenCalled();
    expect(clerk.__internal_handleResourceCallback).not.toHaveBeenCalled();
  });

  it('uses a generic error code for unknown native OAuth callback failure codes', async () => {
    const clerk = makeClerk();
    const transport = {
      getRedirectUrl: vi.fn().mockResolvedValue('myapp://sso-callback'),
      open: vi.fn().mockResolvedValue({
        callbackUrl: 'myapp://sso-callback?__clerk_status=failed&__clerk_error_code=reverification_cancelled',
      }),
    };
    const resource = {
      reload: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue(undefined),
    } as any;
    const authenticateMethod = vi.fn(async (_params, navigate) => navigate('https://provider.example/auth'));

    await expect(
      _authenticateWithTransport({
        clerk: clerk as any,
        transport,
        resource,
        authenticateMethod,
        params: {} as any,
        callbackParams: {},
      }),
    ).rejects.toMatchObject({
      code: 'oauth_callback_failed',
      clerkRuntimeError: true,
    } satisfies Partial<ClerkRuntimeError>);

    expect(resource.create).toHaveBeenCalledWith({});
    expect(resource.reload).not.toHaveBeenCalled();
    expect(clerk.__internal_handleResourceCallback).not.toHaveBeenCalled();
  });

  it('still surfaces the OAuth failure when resetting the attempt fails', async () => {
    const clerk = makeClerk();
    const transport = {
      getRedirectUrl: vi.fn().mockResolvedValue('myapp://sso-callback'),
      open: vi.fn().mockResolvedValue({
        callbackUrl: 'myapp://sso-callback?__clerk_status=failed&__clerk_error_code=oauth_access_denied',
      }),
    };
    const resource = {
      reload: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockRejectedValue(new Error('network down')),
    } as any;
    const authenticateMethod = vi.fn(async (_params, navigate) => navigate('https://provider.example/auth'));

    await expect(
      _authenticateWithTransport({
        clerk: clerk as any,
        transport,
        resource,
        authenticateMethod,
        params: {} as any,
        callbackParams: {},
      }),
    ).rejects.toMatchObject({
      code: 'oauth_access_denied',
      clerkRuntimeError: true,
    } satisfies Partial<ClerkRuntimeError>);

    expect(resource.create).toHaveBeenCalledWith({});
    expect(clerk.__internal_handleResourceCallback).not.toHaveBeenCalled();
  });

  it('propagates transport.open rejection and does not complete the callback', async () => {
    const clerk = makeClerk();
    const transport = {
      getRedirectUrl: vi.fn().mockResolvedValue('myapp://sso-callback'),
      open: vi.fn().mockRejectedValue(new Error('cancelled')),
    };
    const resource = { reload: vi.fn() } as any;
    const authenticateMethod = vi.fn(async (_params, navigate) => navigate('https://provider.example/auth'));

    await expect(
      _authenticateWithTransport({
        clerk: clerk as any,
        transport,
        resource,
        authenticateMethod,
        params: {} as any,
        callbackParams: {},
      }),
    ).rejects.toThrow('cancelled');

    expect(clerk.__internal_handleResourceCallback).not.toHaveBeenCalled();
  });

  it('throws a Clerk error and does not open the transport when no verification URL is captured', async () => {
    const clerk = makeClerk();
    const transport = { getRedirectUrl: vi.fn().mockResolvedValue('myapp://sso-callback'), open: vi.fn() };
    const resource = { reload: vi.fn() } as any;
    const authenticateMethod = vi.fn(async () => {
      return;
    });

    await expect(
      _authenticateWithTransport({
        clerk: clerk as any,
        transport,
        resource,
        authenticateMethod,
        params: {} as any,
        callbackParams: {},
      }),
    ).rejects.toMatchObject({
      code: 'oauth_transport_missing_verification_url',
      clerkRuntimeError: true,
    } satisfies Partial<ClerkRuntimeError>);

    expect(transport.open).not.toHaveBeenCalled();
    expect(clerk.__internal_handleResourceCallback).not.toHaveBeenCalled();
  });
});
