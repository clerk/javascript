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
        signal: expect.any(AbortSignal),
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
      expect(mocks.request.mock.calls[0][0].signal.aborted).toBe(true);
    });

    test('still rejects with signed_out when refreshing the client does not finish within 20 seconds', async () => {
      vi.useFakeTimers();
      mocks.request.mockResolvedValue(errorResponse(401, 'signed_out', 'You are signed out'));
      mocks.handleUnauthenticated.mockReturnValue(new Promise(() => {}));

      const rejection = rejectionOf(
        sessionTransfer.prepareSessionTransfer({ destination: DESTINATION, presentation: 'webview' }),
      );
      await vi.advanceTimersByTimeAsync(20_000);

      expect(await rejection).toMatchObject({ code: 'signed_out' });
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
});
