import { afterEach, describe, expect, test, vi } from 'vitest';
import type { MobileNativeHost } from '@clerk/shared/mobile';
import type { Clerk } from '@clerk/shared/types';
import type { NativeResourceModule } from '../../specs/NativeClerkModule.types';

const projection = vi.hoisted(() => ({ received: [] as string[], disposed: false }));
vi.mock('../../generated/attached-core', () => ({
  attachResourceCore: (_clerk: unknown, emit: (value: unknown) => void) => ({
    receive(message: string) {
      projection.received.push(message);
      emit({ kind: 'ready' });
    },
    dispose() {
      projection.disposed = true;
    },
  }),
}));
vi.mock('../singleton/createClerkInstance', () => ({ invalidateMobileCredentials: async () => {} }));
import { connectNativeResources, waitForNativeResources } from '../nativeResourceConnection';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
function fixture() {
  projection.received = [];
  projection.disposed = false;
  let listener: ((event: { connectionId: string; message: string }) => void) | undefined;
  let host!: MobileNativeHost;
  const detached: string[] = [],
    cancelled: string[][] = [],
    replies: string[] = [];
  const configuration = {
    connectionId: 'connection-a',
    platform: 'ios' as const,
    callbackUrl: 'app://auth',
    capabilities: [],
  };
  const native: NativeResourceModule = {
    prepareCore: async () => configuration,
    startCore: async () => {
      listener?.({ connectionId: configuration.connectionId, message: '{"kind":"init"}' });
    },
    addListener: (_event, callback) => {
      listener = callback;
      return { remove() {} };
    },
    receiveCoreMessage: (_id, message) => {
      replies.push(message);
    },
    detachCore: id => {
      detached.push(id);
    },
    cancelCoreCapabilities: (_id, ids) => {
      cancelled.push(ids);
    },
    performCoreCapability: async () => 'null',
  };
  const clerk = {
    publishableKey: 'pk_test_existing',
    __internal_configureNativeHost: async (value: MobileNativeHost) => {
      host = value;
      return () => value.cancelAuthentication();
    },
  } as Clerk;
  return {
    native,
    clerk,
    detached,
    cancelled,
    replies,
    host: () => host,
    emit: (id: string) => listener?.({ connectionId: id, message: '{"kind":"state"}' }),
  };
}

afterEach(() => vi.restoreAllMocks());
describe('Expo resource connection lifecycle', () => {
  test('forwards only the current native connection and completes its initialization', async () => {
    const f = fixture();
    const connection = connectNativeResources(f.clerk, f.native);
    await waitForNativeResources(f.clerk);
    expect(projection.received).toEqual(['{"kind":"init"}']);
    expect(f.replies).toEqual(['{"kind":"ready"}']);
    f.emit('other-connection');
    expect(projection.received).toEqual(['{"kind":"init"}']);
    connection.dispose();
    f.emit('connection-a');
    expect(projection.received).toEqual(['{"kind":"init"}']);
    expect(f.detached).toEqual(['connection-a']);
    await expect(waitForNativeResources(f.clerk)).rejects.toMatchObject({ code: 'environment_unavailable' });
  });

  test('disposal during preparation detaches the late native connection without initializing it', async () => {
    const f = fixture(),
      preparation = deferred<Awaited<ReturnType<NativeResourceModule['prepareCore']>>>();
    f.native.prepareCore = () => preparation.promise;
    const connection = connectNativeResources(f.clerk, f.native);
    connection.dispose();
    preparation.resolve({ connectionId: 'late', platform: 'ios', callbackUrl: 'app://auth', capabilities: [] });
    await connection.ready;
    expect(f.detached).toEqual(['late']);
    expect(projection.received).toEqual([]);
  });

  test('auth reset rejects the OS prompt immediately and ignores its late successful result', async () => {
    const f = fixture(),
      result = deferred<string>();
    f.native.performCoreCapability = () => result.promise;
    const connection = connectNativeResources(f.clerk, f.native);
    await connection.ready;
    const prompt = f.host().request('browser', { url: 'https://provider.test/auth' });
    f.host().cancelAuthentication();
    await expect(prompt).rejects.toMatchObject({ code: 'stale_authentication_attempt' });
    expect(f.cancelled).toEqual([['1']]);
    result.resolve('{"callbackUrl":"app://auth?late=true"}');
    connection.dispose();
  });

  test('a failed native handshake closes the projection and unregisters availability', async () => {
    const f = fixture();
    f.native.startCore = async () => {
      throw Object.assign(new Error('incompatible'), { code: 'incompatible_bindings' });
    };
    const connection = connectNativeResources(f.clerk, f.native);
    await expect(connection.ready).rejects.toMatchObject({ code: 'incompatible_bindings' });
    expect(projection.disposed).toBe(true);
    expect(f.detached).toEqual(['connection-a']);
    await expect(waitForNativeResources(f.clerk)).rejects.toMatchObject({ code: 'environment_unavailable' });
  });
});
