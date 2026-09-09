import { describe, expect, it } from 'vitest';
import { installMobileCredentialTransport } from '../mobile';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(r => {
    resolve = r;
  });
  return { promise, resolve };
}

function fixture(initialCredential: string | null = 'original', options: { native?: boolean } = {}) {
  let before: any;
  let after: any;
  let credential = initialCredential;
  const transport = installMobileCredentialTransport(
    {
      __internal_onBeforeRequest: callback => {
        before = callback;
      },
      __internal_onAfterResponse: callback => {
        after = callback;
      },
    },
    {
      read: async () => credential,
      write: async value => {
        credential = value;
      },
      remove: async () => {
        credential = null;
      },
    },
    { 'x-ios-sdk-version': 'next' },
    options,
  );
  return {
    before: (r: any) => before(r),
    after: (r: any, response: Response) => after(r, response),
    transport,
    read: () => credential,
  };
}

describe('mobile credential transport', () => {
  it('refreshes a credential read that overlaps a completed rotation before issuing the request', async () => {
    let before: any;
    let after: any;
    let credential = 'original';
    let readCount = 0;
    const started = deferred<void>();
    const finish = deferred<void>();
    installMobileCredentialTransport(
      {
        __internal_onBeforeRequest: callback => {
          before = callback;
        },
        __internal_onAfterResponse: callback => {
          after = callback;
        },
      },
      {
        read: async () => {
          const value = credential;
          if (++readCount === 2) {
            started.resolve();
            await finish.promise;
          }
          return value;
        },
        write: async value => {
          credential = value;
        },
        remove: async () => {},
      },
    );
    const first = { url: new URL('https://clerk.example/client') };
    const second = { url: new URL('https://clerk.example/client'), headers: new Headers() };
    await before(first);
    const preparing = before(second);
    await started.promise;
    await after(first, new Response('{}', { headers: { authorization: 'rotated' } }));
    finish.resolve();
    await preparing;
    expect(second.headers.get('authorization')).toBe('rotated');
    await expect(after(second, new Response('{}', { headers: { authorization: 'rotated' } }))).resolves.toBeUndefined();
  });

  it.each([true, false])('requires a credential for native client hydration: native=%s', async native => {
    const f = fixture(null, { native });
    const request = { url: new URL('https://clerk.example/client') };
    await f.before(request);
    const response = Object.assign(new Response('{}'), {
      payload: { response: { object: 'client', id: 'client_native', updated_at: 1 } },
    });
    if (native) await expect(f.after(request, response)).rejects.toMatchObject({ code: 'missing_client_credential' });
    else await expect(f.after(request, response)).resolves.toBeUndefined();
    expect(f.read()).toBeNull();
  });

  it('uses the native client credential independently of session JWTs and cookies', async () => {
    const f = fixture();
    const request = { url: new URL('https://clerk.example/client'), headers: new Headers() };
    await f.before(request);
    expect(request).toMatchObject({ credentials: 'omit' });
    expect(request.url.searchParams.get('_is_native')).toBe('1');
    expect(request.headers.get('authorization')).toBe('original');
    expect(request.headers.get('x-mobile')).toBe('1');
    await f.after(request, new Response('{}', { headers: { authorization: 'rotated-client' } }));
    expect(f.read()).toBe('rotated-client');
  });

  it('rejects a response from before invalidation before persistence or hydration', async () => {
    const f = fixture();
    const request = { url: new URL('https://clerk.example/client') };
    await f.before(request);
    await f.transport.invalidate({ clearCredential: true });
    await expect(
      f.after(request, new Response('{}', { headers: { authorization: 'late-client' } })),
    ).rejects.toMatchObject({ code: 'stale_client_request' });
    expect(f.read()).toBeNull();
  });

  it('orders clearing after a storage write already in flight', async () => {
    let before: any;
    let after: any;
    let credential: string | null = 'original';
    const started = deferred<void>();
    const finish = deferred<void>();
    const transport = installMobileCredentialTransport(
      {
        __internal_onBeforeRequest: callback => {
          before = callback;
        },
        __internal_onAfterResponse: callback => {
          after = callback;
        },
      },
      {
        read: async () => credential,
        write: async value => {
          started.resolve();
          await finish.promise;
          credential = value;
        },
        remove: async () => {
          credential = null;
        },
      },
    );
    const request = { url: new URL('https://clerk.example/client') };
    await before(request);
    const response = after(request, new Response('{}', { headers: { authorization: 'late-client' } }));
    const rejected = expect(response).rejects.toMatchObject({ code: 'stale_client_request' });
    await started.promise;
    const reset = transport.invalidate({ clearCredential: true });
    finish.resolve();
    await Promise.all([reset, rejected]);
    expect(credential).toBeNull();
  });

  it('prevents a disposed owner from starting new requests', async () => {
    const f = fixture();
    f.transport.dispose();
    await expect(f.before({ url: new URL('https://clerk.example/client') })).rejects.toMatchObject({
      code: 'stale_client_request',
    });
  });

  it('keeps the server-date watermark when a newer request returns an older date', async () => {
    const f = fixture();
    const requests = Array.from({ length: 3 }, () => ({ url: new URL('https://clerk.example/client') }));
    for (const request of requests) await f.before(request);
    const response = (credential: string, seconds: number, updatedAt: number) =>
      Object.assign(
        new Response('{}', { headers: { authorization: credential, date: new Date(seconds * 1000).toUTCString() } }),
        {
          payload: { response: { object: 'client', id: 'client_ordering', updated_at: updatedAt } },
        },
      );
    await f.after(requests[1], response('original', 200, 2000));
    await f.after(requests[2], response('original', 100, 1000));
    expect(f.read()).toBe('original');
    await expect(f.after(requests[0], response('late-first-request', 150, 3000))).rejects.toMatchObject({
      code: 'stale_client_response',
    });
    expect(f.read()).toBe('original');
  });
});
