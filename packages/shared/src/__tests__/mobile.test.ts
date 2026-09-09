import { describe, expect, it } from 'vitest';
import { installMobileCredentialTransport } from '../mobile';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(r => {
    resolve = r;
  });
  return { promise, resolve };
}

function fixture() {
  let before: any;
  let after: any;
  let credential: string | null = 'original';
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
  );
  return {
    before: (r: any) => before(r),
    after: (r: any, response: Response) => after(r, response),
    transport,
    read: () => credential,
  };
}

describe('mobile credential transport', () => {
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
});
