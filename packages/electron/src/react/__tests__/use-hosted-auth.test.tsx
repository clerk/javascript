import { createHash } from 'node:crypto';

import type { ClientJSON } from '@clerk/shared/types';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useHostedAuth } from '../use-hosted-auth';

const useClerkMock = vi.hoisted(() => vi.fn());
const getClerkInstanceMock = vi.hoisted(() => vi.fn());

vi.mock('@clerk/react', () => ({
  useClerk: useClerkMock,
}));

vi.mock('../create-clerk-instance', () => ({
  getClerkInstance: getClerkInstanceMock,
}));

const HOSTED_AUTH_URL = 'https://accounts.example.com/hosted-auth';
const REDIRECT_URL = 'my-app://renderer/';

function renderUseHostedAuth() {
  let hook: ReturnType<typeof useHostedAuth> | null = null;
  const Capture = () => {
    hook = useHostedAuth();
    return null;
  };
  renderToStaticMarkup(<Capture />);
  if (!hook) {
    throw new Error('useHostedAuth did not render');
  }
  return hook as ReturnType<typeof useHostedAuth>;
}

function fapiOk(response: Record<string, unknown>) {
  return { ok: true, status: 200, statusText: 'OK', payload: { response } };
}

function fapiError(status: number, errors: Array<Record<string, unknown>> = []) {
  return { ok: false, status, statusText: 'Error', payload: { errors } };
}

function clientJSONWith(sessionIds: string[]): ClientJSON {
  return {
    object: 'client',
    sessions: sessionIds.map(id => ({ id })),
    last_active_session_id: sessionIds[0] ?? null,
  } as unknown as ClientJSON;
}

describe('useHostedAuth', () => {
  const fapiRequest = vi.fn();
  const handleUnauthenticated = vi.fn();
  const setActive = vi.fn();
  const fromJSON = vi.fn();
  const getRedirectUrl = vi.fn();
  const open = vi.fn();

  const mockClient = { fromJSON };
  const mockClerk = { loaded: true, client: mockClient, setActive };

  function sentCreateBody() {
    return fapiRequest.mock.calls[0][0].body as { state: string; codeChallenge: string };
  }

  function openWithCallback(params: Partial<Record<'state' | 'rotating_token_nonce' | 'created_session_id', string>>) {
    open.mockImplementation(() => {
      const callback = new URL(REDIRECT_URL);
      const resolved = { state: sentCreateBody().state, ...params };
      for (const [key, value] of Object.entries(resolved)) {
        if (value !== undefined) {
          callback.searchParams.set(key, value);
        }
      }
      return Promise.resolve({ callbackUrl: callback.href });
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('window', {
      __clerk_internal_electron: {
        oauthTransport: { getRedirectUrl, open },
      },
    });
    useClerkMock.mockReturnValue(mockClerk);
    getClerkInstanceMock.mockReturnValue({
      getFapiClient: () => ({ request: fapiRequest }),
      handleUnauthenticated,
    });
    getRedirectUrl.mockResolvedValue(REDIRECT_URL);
    fapiRequest.mockResolvedValue(fapiOk({ object: 'hosted_auth', url: HOSTED_AUTH_URL }));
    fromJSON.mockImplementation((json: ClientJSON) => json as never);
  });

  it('completes hosted auth and activates the created session', async () => {
    fapiRequest
      .mockResolvedValueOnce(fapiOk({ object: 'hosted_auth', url: HOSTED_AUTH_URL }))
      .mockResolvedValueOnce(fapiOk(clientJSONWith(['sess_1']) as unknown as Record<string, unknown>));
    openWithCallback({ rotating_token_nonce: 'nonce_1', created_session_id: 'sess_1' });

    const { startHostedAuth } = renderUseHostedAuth();
    const result = await startHostedAuth({ mode: 'sign-in' });

    expect(result).toEqual({ createdSessionId: 'sess_1' });
    expect(fapiRequest).toHaveBeenNthCalledWith(1, {
      method: 'POST',
      path: '/client/hosted_auth',
      body: expect.objectContaining({
        redirectUrl: REDIRECT_URL,
        mode: 'sign-in',
        state: expect.any(String),
        codeChallenge: expect.any(String),
      }),
    });
    expect(open).toHaveBeenCalledWith(HOSTED_AUTH_URL);

    const redeemBody = fapiRequest.mock.calls[1][0].body as { rotatingTokenNonce: string; codeVerifier: string };
    expect(fapiRequest).toHaveBeenNthCalledWith(2, {
      method: 'POST',
      path: '/client',
      body: { _method: 'GET', rotatingTokenNonce: 'nonce_1', codeVerifier: expect.any(String) },
    });
    // The challenge sent on creation must be the S256 digest of the verifier sent on redemption.
    const expectedChallenge = createHash('sha256').update(redeemBody.codeVerifier).digest('base64url');
    expect(sentCreateBody().codeChallenge).toBe(expectedChallenge);

    expect(fromJSON).toHaveBeenCalledWith(expect.objectContaining({ object: 'client' }));
    expect(setActive).toHaveBeenCalledWith({ session: 'sess_1' });
  });

  it('returns null without side effects when Clerk is not loaded', async () => {
    useClerkMock.mockReturnValue({ ...mockClerk, loaded: false });

    const { startHostedAuth } = renderUseHostedAuth();

    await expect(startHostedAuth()).resolves.toEqual({ createdSessionId: null });
    expect(fapiRequest).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });

  it('throws when the preload bridge is not exposed', async () => {
    vi.stubGlobal('window', {});

    const { startHostedAuth } = renderUseHostedAuth();

    await expect(startHostedAuth()).rejects.toThrow(/preload bridge/);
  });

  it('throws a setup error when the deep-link transport is not registered', async () => {
    getRedirectUrl.mockRejectedValue(new Error("No handler registered for 'clerk:oauth-transport:get-redirect-url'"));

    const { startHostedAuth } = renderUseHostedAuth();

    await expect(startHostedAuth()).rejects.toThrow(/createClerkBridge\({ renderer }\)/);
    expect(fapiRequest).not.toHaveBeenCalled();
  });

  it('retries creation once after a signed_out 401', async () => {
    fapiRequest
      .mockResolvedValueOnce(fapiError(401, [{ code: 'signed_out' }]))
      .mockResolvedValueOnce(fapiOk({ object: 'hosted_auth', url: HOSTED_AUTH_URL }))
      .mockResolvedValueOnce(fapiOk(clientJSONWith(['sess_1']) as unknown as Record<string, unknown>));
    open.mockImplementation(() => {
      const body = fapiRequest.mock.calls[1][0].body as { state: string };
      return Promise.resolve({
        callbackUrl: `${REDIRECT_URL}?state=${body.state}&rotating_token_nonce=nonce_1&created_session_id=sess_1`,
      });
    });

    const { startHostedAuth } = renderUseHostedAuth();

    await expect(startHostedAuth()).resolves.toEqual({ createdSessionId: 'sess_1' });
    expect(fapiRequest).toHaveBeenCalledTimes(3);
  });

  it('throws when the callback state does not match', async () => {
    openWithCallback({ state: 'tampered', rotating_token_nonce: 'nonce_1', created_session_id: 'sess_1' });

    const { startHostedAuth } = renderUseHostedAuth();

    await expect(startHostedAuth()).rejects.toThrow(/state did not match/);
    expect(fapiRequest).toHaveBeenCalledTimes(1);
    expect(setActive).not.toHaveBeenCalled();
  });

  it('throws when the callback omits the rotating token nonce', async () => {
    openWithCallback({ created_session_id: 'sess_1' });

    const { startHostedAuth } = renderUseHostedAuth();

    await expect(startHostedAuth()).rejects.toThrow(/rotating token nonce/);
    expect(fapiRequest).toHaveBeenCalledTimes(1);
  });

  it('throws when the callback omits the created session id', async () => {
    openWithCallback({ rotating_token_nonce: 'nonce_1' });

    const { startHostedAuth } = renderUseHostedAuth();

    await expect(startHostedAuth()).rejects.toThrow(/did not include the created session/);
    expect(fapiRequest).toHaveBeenCalledTimes(1);
  });

  it('calls handleUnauthenticated and throws when redemption returns 401', async () => {
    fapiRequest
      .mockResolvedValueOnce(fapiOk({ object: 'hosted_auth', url: HOSTED_AUTH_URL }))
      .mockResolvedValueOnce(fapiError(401, [{ code: 'authentication_invalid', long_message: 'Invalid auth' }]));
    openWithCallback({ rotating_token_nonce: 'nonce_1', created_session_id: 'sess_1' });

    const { startHostedAuth } = renderUseHostedAuth();

    await expect(startHostedAuth()).rejects.toThrow('Invalid auth');
    expect(handleUnauthenticated).toHaveBeenCalled();
    expect(setActive).not.toHaveBeenCalled();
  });

  it('applies the redeemed client but throws when it lacks the created session', async () => {
    fapiRequest
      .mockResolvedValueOnce(fapiOk({ object: 'hosted_auth', url: HOSTED_AUTH_URL }))
      .mockResolvedValueOnce(fapiOk(clientJSONWith(['sess_other']) as unknown as Record<string, unknown>));
    openWithCallback({ rotating_token_nonce: 'nonce_1', created_session_id: 'sess_1' });

    const { startHostedAuth } = renderUseHostedAuth();

    await expect(startHostedAuth()).rejects.toThrow(/did not include the created session/);
    expect(fromJSON).toHaveBeenCalled();
    expect(setActive).not.toHaveBeenCalled();
  });

  it('rejects concurrent hosted auth flows', async () => {
    let resolveOpen: (value: { callbackUrl: string }) => void = () => {};
    open.mockImplementation(
      () =>
        new Promise<{ callbackUrl: string }>(resolve => {
          resolveOpen = resolve;
        }),
    );
    fapiRequest.mockResolvedValue(fapiOk({ object: 'hosted_auth', url: HOSTED_AUTH_URL }));

    const { startHostedAuth } = renderUseHostedAuth();
    const first = startHostedAuth();
    await vi.waitFor(() => expect(open).toHaveBeenCalled());

    await expect(startHostedAuth()).rejects.toThrow(/already in progress/);

    resolveOpen({ callbackUrl: `${REDIRECT_URL}?state=wrong` });
    await expect(first).rejects.toThrow(/state did not match/);
  });
});
