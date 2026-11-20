import { describe, expect, test, vi } from 'vitest';

import type { NativeDeviceBindingModule } from '../../specs/NativeClerkModule.types';
import { createDeviceBinding, type FetchAttempt, jwtClaims } from '../deviceBinding';

function token(claims: Record<string, unknown>): string {
  return `header.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.signature`;
}

const BOUND = token({ id: 'client_bound', cnf: { jkt: 'thumbprint' } });
const UNBOUND = token({ id: 'client_unbound' });

function nativeModule() {
  let proofs = 0;
  return {
    setHostSignsRequests: vi.fn<NativeDeviceBindingModule['setHostSignsRequests']>(() => Promise.resolve()),
    createDpopProof: vi.fn<NativeDeviceBindingModule['createDpopProof']>(() => Promise.resolve(`proof-${++proofs}`)),
    recordServerDate: vi.fn<NativeDeviceBindingModule['recordServerDate']>(),
  };
}

function attempt({
  authorization,
  url = 'https://clerk.example.com/v1/client?_is_native=1',
  method = 'GET',
  headers = {},
}: {
  authorization?: string;
  url?: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
}): FetchAttempt {
  const requestHeaders = new Headers(headers);
  if (authorization !== undefined) {
    requestHeaders.set('authorization', authorization);
  }
  return { url: new URL(url), method, headers: requestHeaders, attempt: 0 };
}

function response(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers });
}

function errors(...codes: string[]) {
  return { errors: codes.map(code => ({ code })) };
}

describe('jwtClaims', () => {
  test('decodes a base64url payload and returns null for anything else', () => {
    expect(jwtClaims(BOUND)).toEqual({ id: 'client_bound', cnf: { jkt: 'thumbprint' } });
    expect(jwtClaims('not-a-jwt')).toBeNull();
    expect(jwtClaims('a.%%%.c')).toBeNull();
    expect(jwtClaims(null)).toBeNull();
  });
});

describe('beforeFetch', () => {
  test('signs a request without a token, since it may create the client', async () => {
    const native = nativeModule();
    const fetchAttempt = attempt({ authorization: '' });

    await createDeviceBinding(native, vi.fn()).beforeFetch(fetchAttempt);

    expect(native.createDpopProof).toHaveBeenCalledWith(
      'GET',
      'https://clerk.example.com/v1/client?_is_native=1',
      null,
    );
    expect(fetchAttempt.headers.get('dpop')).toBe('proof-1');
  });

  test('signs a request whose token is bound, with the token as sent', async () => {
    const native = nativeModule();
    const fetchAttempt = attempt({ authorization: BOUND });

    await createDeviceBinding(native, vi.fn()).beforeFetch(fetchAttempt);

    expect(native.createDpopProof).toHaveBeenCalledWith('GET', expect.any(String), BOUND);
    expect(fetchAttempt.headers.get('dpop')).toBe('proof-1');
  });

  test('signs a request with a stale unbound token, so a client it replaces is bound', async () => {
    const native = nativeModule();
    const fetchAttempt = attempt({ authorization: UNBOUND });

    await createDeviceBinding(native, vi.fn()).beforeFetch(fetchAttempt);

    expect(native.createDpopProof).toHaveBeenCalledWith('GET', expect.any(String), UNBOUND);
    expect(fetchAttempt.headers.get('dpop')).toBe('proof-1');
  });

  test('sends a request with an unbound token unsigned when native cannot sign it', async () => {
    const native = nativeModule();
    native.createDpopProof.mockRejectedValue(new Error('E_DPOP_PROOF_FAILED'));
    const fetchAttempt = attempt({ authorization: UNBOUND });

    await createDeviceBinding(native, vi.fn()).beforeFetch(fetchAttempt);

    expect(fetchAttempt.headers.has('dpop')).toBe(false);
  });

  test('signs the wire method and URL of a method-overridden request through a proxy', async () => {
    const native = nativeModule();
    const url = 'https://example.com/__clerk/v1/client/sessions/sess_1?_method=DELETE&_is_native=1';

    await createDeviceBinding(native, vi.fn()).beforeFetch(attempt({ authorization: BOUND, method: 'POST', url }));

    expect(native.createDpopProof).toHaveBeenCalledWith('POST', url, BOUND);
  });

  test('asks for a new proof on every attempt', async () => {
    const native = nativeModule();
    const binding = createDeviceBinding(native, vi.fn());
    const first = attempt({ authorization: BOUND });
    const retry = attempt({ authorization: BOUND, url: 'https://clerk.example.com/v1/client?_clerk_retry_attempt=1' });

    await binding.beforeFetch(first);
    await binding.beforeFetch(retry);

    expect(first.headers.get('dpop')).toBe('proof-1');
    expect(retry.headers.get('dpop')).toBe('proof-2');
  });

  test('fails the request when a bound token cannot be signed', async () => {
    const native = nativeModule();
    native.createDpopProof.mockRejectedValue(new Error('E_DPOP_PROOF_UNAVAILABLE'));
    const fetchAttempt = attempt({ authorization: BOUND });

    await expect(createDeviceBinding(native, vi.fn()).beforeFetch(fetchAttempt)).rejects.toThrow(
      'E_DPOP_PROOF_UNAVAILABLE',
    );
    expect(fetchAttempt.headers.has('dpop')).toBe(false);
  });

  test('sends a request without a token unsigned when native cannot sign it', async () => {
    const native = nativeModule();
    native.createDpopProof.mockRejectedValue(new Error('E_NOT_CONFIGURED'));
    const fetchAttempt = attempt({});

    await createDeviceBinding(native, vi.fn()).beforeFetch(fetchAttempt);

    expect(fetchAttempt.headers.has('dpop')).toBe(false);
  });

  test('sends the request unsigned when native decides it goes unsigned', async () => {
    const native = nativeModule();
    native.createDpopProof.mockResolvedValue(null);
    const fetchAttempt = attempt({ authorization: BOUND });

    await createDeviceBinding(native, vi.fn()).beforeFetch(fetchAttempt);

    expect(fetchAttempt.headers.has('dpop')).toBe(false);
  });
});

describe('onFetchResponse', () => {
  const signed = () => attempt({ authorization: BOUND, headers: { dpop: 'proof-1' } });

  test('feeds every response date to the native clock', async () => {
    const native = nativeModule();

    await createDeviceBinding(native, vi.fn()).onFetchResponse(
      attempt({}),
      response(200, {}, { date: 'Wed, 18 Nov 2026 12:00:00 GMT' }),
    );

    expect(native.recordServerDate).toHaveBeenCalledWith('Wed, 18 Nov 2026 12:00:00 GMT');
  });

  test.each(['device_binding_proof_invalid', 'device_binding_proof_replayed'])(
    'fetches a signed request once more after %s',
    async code => {
      const binding = createDeviceBinding(nativeModule(), vi.fn());

      await expect(binding.onFetchResponse(signed(), response(401, errors(code)))).resolves.toBe(true);
    },
  );

  test('records the server date before the refetch signs its proof', async () => {
    const native = nativeModule();

    await createDeviceBinding(native, vi.fn()).onFetchResponse(
      signed(),
      response(401, errors('device_binding_proof_invalid'), { date: 'Wed, 18 Nov 2026 12:20:00 GMT' }),
    );

    expect(native.recordServerDate).toHaveBeenCalledWith('Wed, 18 Nov 2026 12:20:00 GMT');
  });

  test('does not fetch again for an unsigned request, another error, or a success', async () => {
    const binding = createDeviceBinding(nativeModule(), vi.fn());

    await expect(
      binding.onFetchResponse(attempt({ authorization: BOUND }), response(401, errors('device_binding_proof_invalid'))),
    ).resolves.toBe(false);
    await expect(
      binding.onFetchResponse(signed(), response(401, errors('device_binding_proof_missing'))),
    ).resolves.toBe(false);
    await expect(
      binding.onFetchResponse(signed(), response(503, errors('device_binding_proof_invalid'))),
    ).resolves.toBe(false);
    await expect(binding.onFetchResponse(signed(), response(200, {}))).resolves.toBe(false);
  });

  test('leaves the body for clerk-js to read', async () => {
    const binding = createDeviceBinding(nativeModule(), vi.fn());
    const rejected = response(401, errors('device_binding_proof_invalid'));

    await binding.onFetchResponse(signed(), rejected);

    await expect(rejected.json()).resolves.toEqual(errors('device_binding_proof_invalid'));
  });
});

describe('afterResponse', () => {
  test.each(['device_binding_proof_missing', 'device_binding_key_mismatch'])(
    'drops the token the request sent after %s',
    async code => {
      const dropClientToken = vi.fn().mockResolvedValue(undefined);

      await createDeviceBinding(nativeModule(), dropClientToken).afterResponse(BOUND, {
        status: 401,
        payload: errors(code),
      });

      expect(dropClientToken).toHaveBeenCalledWith(BOUND);
    },
  );

  test('keeps the token after any other response', async () => {
    const dropClientToken = vi.fn();
    const binding = createDeviceBinding(nativeModule(), dropClientToken);

    await binding.afterResponse(BOUND, { status: 503, payload: errors('device_binding_proof_missing') });
    await binding.afterResponse(BOUND, { status: 401, payload: errors('device_binding_proof_invalid') });
    await binding.afterResponse(BOUND, { status: 401, payload: errors('authentication_invalid') });
    await binding.afterResponse(null, { status: 401, payload: errors('device_binding_proof_missing') });

    expect(dropClientToken).not.toHaveBeenCalled();
  });
});
