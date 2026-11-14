import { isClerkAPIResponseError } from '@clerk/shared/error';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { SessionTransferError } from '../errors';
import { isSessionTransferError } from '../errors';
import type * as SessionTransferModule from '../sessionTransfer';

const mocks = vi.hoisted(() => {
  return {
    platformOS: 'ios',
    getClerkInstance: vi.fn(),
    request: vi.fn(),
    handleUnauthenticated: vi.fn(),
  };
});

vi.mock('react-native', () => {
  return {
    Platform: {
      get OS() {
        return mocks.platformOS;
      },
    },
  };
});

vi.mock('../../provider/singleton', () => {
  return {
    getClerkInstance: mocks.getClerkInstance,
  };
});

const DESTINATION = 'https://app.example.com/billing';
const TRANSFER_URL = 'https://clerk.example.com/v1/session_transfers/redeem?token=one-time';
const NOW = new Date('2026-11-10T12:00:00Z').getTime();

let sessionTransfer: typeof SessionTransferModule;

function mintedResponse(url = TRANSFER_URL, expiresAt = NOW + 60_000) {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    payload: { response: { object: 'session_transfer', url, expires_at: expiresAt } },
  };
}

function errorResponse(status: number, code: string, longMessage: string, headers?: Headers) {
  return {
    ok: false,
    status,
    statusText: 'Error',
    headers,
    payload: { errors: [{ code, message: longMessage, long_message: longMessage, meta: {} }] },
  };
}

function deferred<T>() {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>(r => {
    resolve = r;
  });
  return { promise, resolve };
}

async function rejectionOf(promise: Promise<unknown>): Promise<SessionTransferError> {
  const error = await promise.then(
    () => null,
    (e: unknown) => e,
  );
  if (!isSessionTransferError(error)) {
    throw new Error('Expected a SessionTransferError rejection');
  }
  return error;
}

function webviewRequest(destination = DESTINATION) {
  return sessionTransfer.resolveTransferRequest({ destination, presentation: 'webview' });
}

describe('sessionTransfer', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    mocks.platformOS = 'ios';
    mocks.request.mockReset();
    mocks.handleUnauthenticated.mockReset();
    mocks.handleUnauthenticated.mockResolvedValue(undefined);
    mocks.getClerkInstance.mockReset();
    mocks.getClerkInstance.mockReturnValue({
      loaded: true,
      session: { id: 'sess_1' },
      getFapiClient: () => ({ request: mocks.request }),
      handleUnauthenticated: mocks.handleUnauthenticated,
    });
    sessionTransfer = await import('../sessionTransfer');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('prepareSessionTransfer', () => {
    test('posts the destination and presentation for the active session', async () => {
      mocks.request.mockResolvedValue(mintedResponse());

      const transfer = await sessionTransfer.prepareSessionTransfer({
        destination: DESTINATION,
        presentation: 'browser',
      });

      expect(mocks.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/client/sessions/sess_1/session_transfers',
        body: { redirectUrl: DESTINATION, presentationMode: 'browser' },
      });
      expect(transfer.url).toBe(TRANSFER_URL);
      expect(transfer.expiresAt).toEqual(new Date(NOW + 60_000));
    });

    test('keeps the url out of enumeration, serialization, and spread', async () => {
      mocks.request.mockResolvedValue(mintedResponse());

      const transfer = await sessionTransfer.prepareSessionTransfer({
        destination: DESTINATION,
        presentation: 'webview',
      });

      expect(Object.keys(transfer)).toEqual(['expiresAt']);
      expect(JSON.stringify(transfer)).not.toContain('one-time');
      expect({ ...transfer }).not.toHaveProperty('url');
    });

    test('mints on every call', async () => {
      mocks.request.mockResolvedValue(mintedResponse());

      await sessionTransfer.prepareSessionTransfer({ destination: DESTINATION, presentation: 'webview' });
      await sessionTransfer.prepareSessionTransfer({ destination: DESTINATION, presentation: 'webview' });

      expect(mocks.request).toHaveBeenCalledTimes(2);
    });

    test('rejects with signed_out after one request and has Clerk drop the ended session', async () => {
      mocks.request.mockResolvedValue(errorResponse(401, 'signed_out', 'You are signed out'));

      await expect(
        sessionTransfer.prepareSessionTransfer({ destination: DESTINATION, presentation: 'webview' }),
      ).rejects.toMatchObject({ name: 'SessionTransferError', code: 'signed_out', message: 'You are signed out' });
      expect(mocks.request).toHaveBeenCalledTimes(1);
      expect(mocks.handleUnauthenticated).toHaveBeenCalledTimes(1);
    });

    test('still rejects with signed_out when Clerk cannot refresh the client', async () => {
      mocks.request.mockResolvedValue(errorResponse(401, 'signed_out', 'You are signed out'));
      mocks.handleUnauthenticated.mockRejectedValue(new Error('Network request failed'));

      await expect(
        sessionTransfer.prepareSessionTransfer({ destination: DESTINATION, presentation: 'webview' }),
      ).rejects.toMatchObject({ name: 'SessionTransferError', code: 'signed_out' });
    });

    test('maps a Clerk API refusal to its error code and keeps the API error as the cause', async () => {
      mocks.request.mockResolvedValue(
        errorResponse(
          403,
          'feature_not_enabled',
          'Session transfers are not enabled',
          new Headers({ 'retry-after': '7' }),
        ),
      );

      const error = await rejectionOf(
        sessionTransfer.prepareSessionTransfer({ destination: DESTINATION, presentation: 'webview' }),
      );

      expect(error).toMatchObject({
        code: 'feature_not_enabled',
        message: 'Session transfers are not enabled',
        cause: { status: 403, retryAfter: 7 },
      });
      expect(isClerkAPIResponseError(error.cause)).toBe(true);
      expect(mocks.request).toHaveBeenCalledTimes(1);
      expect(mocks.handleUnauthenticated).not.toHaveBeenCalled();
    });

    test('uses unexpected_response when a refusal has no error code', async () => {
      mocks.request.mockResolvedValue({ ok: false, status: 502, statusText: 'Bad Gateway', payload: null });

      await expect(
        sessionTransfer.prepareSessionTransfer({ destination: DESTINATION, presentation: 'webview' }),
      ).rejects.toMatchObject({ code: 'unexpected_response', message: 'Bad Gateway' });
    });

    test('maps a thrown request to network_error', async () => {
      const failure = new Error('Network request failed');
      mocks.request.mockRejectedValue(failure);

      await expect(
        sessionTransfer.prepareSessionTransfer({ destination: DESTINATION, presentation: 'webview' }),
      ).rejects.toMatchObject({ code: 'network_error', cause: failure });
    });

    test('rejects with network_error when Clerk does not answer within 20 seconds', async () => {
      vi.useFakeTimers();
      mocks.request.mockReturnValue(new Promise(() => {}));

      const rejection = rejectionOf(
        sessionTransfer.prepareSessionTransfer({ destination: DESTINATION, presentation: 'webview' }),
      );
      await vi.advanceTimersByTimeAsync(20_000);

      expect(await rejection).toMatchObject({ code: 'network_error' });
    });

    test.each([
      ['a different object', { response: { object: 'client', url: TRANSFER_URL, expires_at: NOW } }],
      ['a missing url', { response: { object: 'session_transfer', expires_at: NOW } }],
      ['a non-numeric expiry', { response: { object: 'session_transfer', url: TRANSFER_URL, expires_at: 'soon' } }],
      ['no response', {}],
      [
        'an http url',
        { response: { object: 'session_transfer', url: TRANSFER_URL.replace('https:', 'http:'), expires_at: NOW } },
      ],
      [
        'a url with user info',
        {
          response: {
            object: 'session_transfer',
            url: TRANSFER_URL.replace('https://', 'https://user:one-time@'),
            expires_at: NOW,
          },
        },
      ],
      ['a url that does not parse', { response: { object: 'session_transfer', url: 'https://', expires_at: NOW } }],
    ])('rejects an envelope with %s as unexpected_response', async (_, payload) => {
      mocks.request.mockResolvedValue({ ok: true, status: 200, statusText: 'OK', payload });

      const error = await rejectionOf(
        sessionTransfer.prepareSessionTransfer({ destination: DESTINATION, presentation: 'webview' }),
      );

      expect(error).toMatchObject({ code: 'unexpected_response' });
      expect(error.message).not.toContain('one-time');
    });

    test.each([
      ['unsupported_platform', () => (mocks.platformOS = 'web'), DESTINATION],
      ['invalid_destination', () => {}, '/billing'],
      ['invalid_destination', () => {}, 'myapp://billing'],
      [
        'clerk_not_loaded',
        () => mocks.getClerkInstance.mockReturnValue({ loaded: false, session: null, getFapiClient: vi.fn() }),
        DESTINATION,
      ],
      [
        'clerk_not_loaded',
        () =>
          mocks.getClerkInstance.mockImplementation(() => {
            throw new Error('Missing publishableKey');
          }),
        DESTINATION,
      ],
      [
        'signed_out',
        () => mocks.getClerkInstance.mockReturnValue({ loaded: true, session: null, getFapiClient: vi.fn() }),
        DESTINATION,
      ],
      [
        'signed_out',
        () =>
          mocks.getClerkInstance.mockReturnValue({
            loaded: true,
            session: { id: 'sess_1', status: 'pending' },
            getFapiClient: () => ({ request: mocks.request }),
          }),
        DESTINATION,
      ],
    ])('rejects with %s before any request', async (code, arrange, destination) => {
      arrange();

      await expect(
        sessionTransfer.prepareSessionTransfer({ destination, presentation: 'webview' }),
      ).rejects.toMatchObject({
        code,
      });
      expect(mocks.request).not.toHaveBeenCalled();
    });
  });

  describe('transfer ledger', () => {
    test('keys a request by session, presentation, and destination', () => {
      expect(webviewRequest().key).toBe(`sess_1\nwebview\n${DESTINATION}`);
    });

    test('hands an unclaimed lease to the next acquire for the same key', async () => {
      const minted = deferred<ReturnType<typeof mintedResponse>>();
      mocks.request.mockReturnValue(minted.promise);

      const first = sessionTransfer.acquireTransfer(webviewRequest());
      const second = sessionTransfer.acquireTransfer(webviewRequest());
      minted.resolve(mintedResponse());

      expect(second).toBe(first);
      await expect(second.transfer).resolves.toMatchObject({ url: TRANSFER_URL });
      expect(sessionTransfer.acquireTransfer(webviewRequest())).toBe(first);
      expect(mocks.request).toHaveBeenCalledTimes(1);
    });

    test('mints separately for a different destination or presentation', () => {
      mocks.request.mockResolvedValue(mintedResponse());

      const lease = sessionTransfer.acquireTransfer(webviewRequest());

      expect(sessionTransfer.acquireTransfer(webviewRequest('https://app.example.com/other'))).not.toBe(lease);
      expect(
        sessionTransfer.acquireTransfer(
          sessionTransfer.resolveTransferRequest({ destination: DESTINATION, presentation: 'browser' }),
        ),
      ).not.toBe(lease);
      expect(mocks.request).toHaveBeenCalledTimes(3);
    });

    test('mints again after the lease is claimed', async () => {
      mocks.request.mockResolvedValue(mintedResponse());

      const first = sessionTransfer.acquireTransfer(webviewRequest());
      await first.transfer;
      expect(sessionTransfer.claimTransfer(first)).toBe(true);
      expect(sessionTransfer.claimTransfer(first)).toBe(false);
      const second = sessionTransfer.acquireTransfer(webviewRequest());

      expect(second).not.toBe(first);
      expect(mocks.request).toHaveBeenCalledTimes(2);
    });

    test('leaves a newer lease alone when an older one is claimed', () => {
      mocks.request.mockResolvedValue(mintedResponse());

      const first = sessionTransfer.acquireTransfer(webviewRequest());
      sessionTransfer.claimTransfer(first);
      const second = sessionTransfer.acquireTransfer(webviewRequest());
      sessionTransfer.claimTransfer(first);

      expect(sessionTransfer.acquireTransfer(webviewRequest())).toBe(second);
    });

    test('evicts a minted lease with less than 15 seconds left', async () => {
      mocks.request.mockResolvedValue(mintedResponse());

      const first = sessionTransfer.acquireTransfer(webviewRequest());
      await first.transfer;
      vi.setSystemTime(NOW + 45_001);

      expect(sessionTransfer.acquireTransfer(webviewRequest())).not.toBe(first);
      expect(mocks.request).toHaveBeenCalledTimes(2);
    });

    test('keeps a minted lease with 15 seconds or more left', async () => {
      mocks.request.mockResolvedValue(mintedResponse());

      const first = sessionTransfer.acquireTransfer(webviewRequest());
      await first.transfer;
      vi.setSystemTime(NOW + 45_000);

      expect(sessionTransfer.acquireTransfer(webviewRequest())).toBe(first);
    });

    test('evicts expiring leases for other keys on every acquire', async () => {
      mocks.request.mockResolvedValue(mintedResponse());

      const stale = sessionTransfer.acquireTransfer(webviewRequest());
      await stale.transfer;
      vi.setSystemTime(NOW + 50_000);
      sessionTransfer.acquireTransfer(webviewRequest('https://app.example.com/other'));
      vi.setSystemTime(NOW);

      expect(sessionTransfer.acquireTransfer(webviewRequest())).not.toBe(stale);
    });

    test('mints again for a fresh acquire and retires the lease it replaces', async () => {
      mocks.request.mockReturnValueOnce(new Promise(() => {})).mockResolvedValueOnce(mintedResponse());

      const stuck = sessionTransfer.acquireTransfer(webviewRequest());
      const fresh = sessionTransfer.acquireTransfer(webviewRequest(), { fresh: true });

      expect(fresh).not.toBe(stuck);
      await expect(fresh.transfer).resolves.toMatchObject({ url: TRANSFER_URL });
      expect(sessionTransfer.claimTransfer(stuck)).toBe(false);
      expect(sessionTransfer.claimTransfer(fresh)).toBe(true);
    });

    test('deletes a lease whose mint failed', async () => {
      mocks.request
        .mockResolvedValueOnce(errorResponse(403, 'feature_not_enabled', 'Session transfers are not enabled'))
        .mockResolvedValueOnce(mintedResponse());

      const failed = sessionTransfer.acquireTransfer(webviewRequest());
      await expect(failed.transfer).rejects.toMatchObject({ code: 'feature_not_enabled' });
      const next = sessionTransfer.acquireTransfer(webviewRequest());

      expect(next).not.toBe(failed);
      await expect(next.transfer).resolves.toMatchObject({ url: TRANSFER_URL });
    });
  });
});
