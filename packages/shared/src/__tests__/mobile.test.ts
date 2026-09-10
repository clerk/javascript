import { describe, expect, it } from 'vitest';
import { installMobileCredentialTransport } from '../mobile';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(r => {
    resolve = r;
  });
  return { promise, resolve };
}

function fixture(
  initialCredential: string | null = 'original',
  options: { native?: boolean } = {},
  beforeRemove?: () => Promise<void>,
) {
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
        await beforeRemove?.();
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

  it.each(['Bearer', 'Bearer ', 'bEaReR\t'])(
    'clears a native credential for %j and fences older replies',
    async marker => {
      const f = fixture();
      const stale = { url: new URL('https://clerk.example/client') };
      const removing = { url: new URL('https://clerk.example/client'), method: 'DELETE' };
      await f.before(stale);
      await f.before(removing);
      await f.after(removing, new Response('{}', { headers: { authorization: marker } }));
      expect(f.read()).toBeNull();
      await expect(
        f.after(stale, new Response('{}', { headers: { authorization: 'obsolete' } })),
      ).rejects.toMatchObject({
        code: 'stale_client_request',
      });
      expect(f.read()).toBeNull();
      const next = { url: new URL('https://clerk.example/client'), headers: new Headers() };
      await f.before(next);
      expect(next.headers.get('authorization')).toBe('');
      await f.after(next, new Response('{}', { headers: { authorization: 'replacement' } }));
      expect(f.read()).toBe('replacement');
    },
  );

  it('does not interpret the native clear marker in non-native mode', async () => {
    const f = fixture('original', { native: false });
    const request = { url: new URL('https://clerk.example/client') };
    await f.before(request);
    await f.after(request, new Response('{}', { headers: { authorization: 'Bearer ' } }));
    expect(f.read()).toBe('Bearer');
  });

  it('reports a failed clear and permits another request to retry clearing', async () => {
    let fail = true;
    const f = fixture('original', {}, async () => {
      if (fail) throw new Error('storage_failure');
    });
    const first = { url: new URL('https://clerk.example/client') };
    await f.before(first);
    await expect(f.after(first, new Response('{}', { headers: { authorization: 'Bearer' } }))).rejects.toThrow(
      'storage_failure',
    );
    expect(f.read()).toBe('original');
    fail = false;
    const second = { url: new URL('https://clerk.example/client') };
    await f.before(second);
    await f.after(second, new Response('{}', { headers: { authorization: 'Bearer' } }));
    expect(f.read()).toBeNull();
    await expect(f.after(first, new Response('{}', { headers: { authorization: 'obsolete' } }))).rejects.toMatchObject({
      code: 'stale_client_request',
    });
  });

  it('waits for a queued clear before preparing the next request', async () => {
    const started = deferred<void>();
    const release = deferred<void>();
    const f = fixture('original', {}, async () => {
      started.resolve();
      await release.promise;
    });
    const first = { url: new URL('https://clerk.example/client') };
    await f.before(first);
    const clearing = f.after(first, new Response('{}', { headers: { authorization: 'Bearer' } }));
    await started.promise;
    const second = { url: new URL('https://clerk.example/client'), headers: new Headers() };
    let prepared = false;
    const preparing = f.before(second).then(() => {
      prepared = true;
    });
    await Promise.resolve();
    expect(prepared).toBe(false);
    release.resolve();
    await Promise.all([clearing, preparing]);
    expect(second.headers.get('authorization')).toBe('');
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

  it.each([100, undefined])(
    'keeps the server-date watermark when a newer request returns date=%s',
    async latestDate => {
      const f = fixture();
      const requests = Array.from({ length: 3 }, () => ({ url: new URL('https://clerk.example/client') }));
      for (const request of requests) await f.before(request);
      const response = (credential: string, seconds: number | undefined, updatedAt: number) =>
        Object.assign(
          new Response('{}', {
            headers: {
              authorization: credential,
              ...(seconds === undefined ? {} : { date: new Date(seconds * 1000).toUTCString() }),
            },
          }),
          {
            payload: { response: { object: 'client', id: 'client_ordering', updated_at: updatedAt } },
          },
        );
      await f.after(requests[1], response('original', 200, 2000));
      await f.after(requests[2], response('original', latestDate, 1000));
      expect(f.read()).toBe('original');
      await expect(f.after(requests[0], response('late-first-request', 150, 3000))).rejects.toMatchObject({
        code: 'stale_client_response',
      });
      expect(f.read()).toBe('original');
    },
  );
});
