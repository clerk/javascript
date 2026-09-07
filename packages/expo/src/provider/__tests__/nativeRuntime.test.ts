import type { Clerk, EmbeddedHost, EmbeddedOptions } from '@clerk/clerk-js';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { connectNativeRuntime } from '../nativeRuntime';

const mocks = vi.hoisted(() => ({
  host: undefined as EmbeddedHost | undefined,
  config: undefined as EmbeddedOptions | undefined,
  operation: undefined as ((event: unknown) => void) | undefined,
  application: undefined as ((state: string) => void) | undefined,
  adapterInvoke: vi.fn(),
  adapterDispose: vi.fn(),
  createAdapter: vi.fn(),
  removeOperation: vi.fn(),
  removeApplication: vi.fn(),
  native: {
    addListener: vi.fn(),
    configureExternalRuntime: vi.fn(),
    publishRuntimeState: vi.fn(),
    completeRuntimeOperation: vi.fn(),
    detachRuntime: vi.fn(),
    performRuntimeCapability: vi.fn(),
  },
}));
vi.mock('@clerk/clerk-js', () => ({
  __internal_createNativeAdapter: mocks.createAdapter,
  __internal_installNativePasskeyHooks: vi.fn(),
  __internal_installNativeAppleHooks: vi.fn(),
  __internal_installNativeBiometricHooks: vi.fn(),
  __internal_installNativeAppAttestHooks: vi.fn(),
}));
vi.mock('../../utils/native-module', () => ({ ClerkExpoModule: mocks.native }));
vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  AppState: {
    addEventListener: (_: string, listener: (state: string) => void) => {
      mocks.application = listener;
      return { remove: mocks.removeApplication };
    },
  },
}));

function state(revision = 1) {
  return {
    protocolVersion: 1,
    generation: mocks.config!.generation,
    revision,
    status: 'ready',
    client: null,
    environment: null,
    clientToken: '',
  };
}
const cleanup: Array<() => Promise<void>> = [];
beforeEach(() => {
  vi.resetAllMocks();
  mocks.native.addListener.mockImplementation((_: string, listener: (event: unknown) => void) => {
    mocks.operation = listener;
    return { remove: mocks.removeOperation };
  });
  mocks.createAdapter.mockImplementation((_clerk: Clerk, config: EmbeddedOptions, host: EmbeddedHost) => {
    mocks.config = config;
    mocks.host = host;
    return { load: () => host.commitState!(state()), invoke: mocks.adapterInvoke, dispose: mocks.adapterDispose };
  });
  mocks.adapterInvoke.mockResolvedValue(null);
  mocks.native.performRuntimeCapability.mockResolvedValue('{"result":null}');
});
afterEach(async () => {
  await Promise.all(cleanup.splice(0).map(dispose => dispose()));
});

async function connect() {
  const clerk = { __internal_reloadInitialResources: vi.fn(), session: { getToken: vi.fn() } };
  const cache = { getToken: vi.fn().mockResolvedValue('owner-token'), saveToken: vi.fn() };
  const dispose = await connectNativeRuntime(clerk as unknown as Clerk, 'pk_owner', cache, () => true);
  cleanup.push(dispose);
  return { clerk, cache, dispose, runtimeId: mocks.config!.generation };
}

test('registers the operation channel before configuring a projection of the existing owner', async () => {
  const f = await connect();
  expect(mocks.createAdapter.mock.calls[0][0]).toBe(f.clerk);
  expect(mocks.native.addListener.mock.invocationCallOrder[0]).toBeLessThan(
    mocks.native.configureExternalRuntime.mock.invocationCallOrder[0],
  );
  expect(mocks.native.configureExternalRuntime).toHaveBeenCalledWith('pk_owner', f.runtimeId, JSON.stringify(state()));
  expect(await mocks.host!.getToken()).toBe('owner-token');
  await mocks.host!.saveToken('rotated');
  expect(f.cache.saveToken).toHaveBeenCalledWith('__clerk_client_jwt', 'rotated');
});

test('completes an operation only after its state has been committed to native', async () => {
  const f = await connect();
  let release!: () => void;
  mocks.native.publishRuntimeState.mockReturnValue(
    new Promise<void>(resolve => {
      release = resolve;
    }),
  );
  mocks.adapterInvoke.mockImplementation(async () => {
    await mocks.host!.commitState!(state(2));
    return 'jwt';
  });
  mocks.operation!({
    runtimeId: f.runtimeId,
    requestId: 'request',
    invocation: '{"receiver":{"kind":"session","id":"session"},"method":"getToken"}',
  });
  await vi.waitFor(() => expect(mocks.native.publishRuntimeState).toHaveBeenCalled());
  expect(mocks.native.completeRuntimeOperation).not.toHaveBeenCalled();
  release();
  await vi.waitFor(() =>
    expect(mocks.native.completeRuntimeOperation).toHaveBeenCalledWith(f.runtimeId, 'request', '{"result":"jwt"}'),
  );
});

test('preserves structured operation and platform errors', async () => {
  const f = await connect();
  const error = {
    kind: 'api',
    code: 'form_password_incorrect',
    errors: [{ code: 'form_password_incorrect', message: 'Incorrect password' }],
    message: 'Incorrect password',
  };
  mocks.adapterInvoke.mockRejectedValue({ envelope: error });
  mocks.operation!({ runtimeId: f.runtimeId, requestId: 'request', invocation: '{}' });
  await vi.waitFor(() =>
    expect(mocks.native.completeRuntimeOperation).toHaveBeenCalledWith(
      f.runtimeId,
      'request',
      JSON.stringify({ error }),
    ),
  );
  mocks.native.performRuntimeCapability.mockResolvedValue(
    '{"error":{"code":"key_unavailable","message":"Key unavailable"}}',
  );
  await expect(mocks.host!.storage!({ operation: 'read', key: 'flow' })).rejects.toMatchObject({
    code: 'key_unavailable',
  });
});

test('ignores obsolete requests and detaches without disposing the JS owner', async () => {
  const f = await connect();
  mocks.adapterInvoke.mockClear();
  mocks.operation!({ runtimeId: 'obsolete', requestId: 'request', invocation: '{}' });
  expect(mocks.adapterInvoke).not.toHaveBeenCalled();
  await f.dispose();
  mocks.operation!({ runtimeId: f.runtimeId, requestId: 'request', invocation: '{}' });
  expect(mocks.adapterInvoke).not.toHaveBeenCalled();
  expect(mocks.native.detachRuntime).toHaveBeenCalledWith(f.runtimeId);
  expect(mocks.removeOperation).toHaveBeenCalledTimes(1);
  expect(mocks.removeApplication).toHaveBeenCalledTimes(1);
});

test('refreshes the existing owner once on foreground without a second startup fetch', async () => {
  const f = await connect();
  expect(f.clerk.__internal_reloadInitialResources).not.toHaveBeenCalled();
  let release!: () => void;
  f.clerk.__internal_reloadInitialResources.mockReturnValue(
    new Promise<void>(resolve => {
      release = resolve;
    }),
  );
  mocks.application!('background');
  mocks.application!('active');
  mocks.application!('active');
  expect(f.clerk.__internal_reloadInitialResources).toHaveBeenCalledTimes(1);
  release();
  await vi.waitFor(() => expect(f.clerk.session.getToken).toHaveBeenCalledTimes(1));
});
