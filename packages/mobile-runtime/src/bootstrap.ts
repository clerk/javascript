import { setNativeNetworkEnvironment } from '@clerk/shared/network';
import { installMobileCredentialTransport } from '@clerk/shared/mobile';
import { Clerk } from '../../clerk-js/src/core/clerk';
import { authenticationRoots, publicCore } from './core.ts';
import { cancelCapabilities, disposeHost, emit, hostReply, hostRequest } from './host.ts';
import { bridgeError, failure, type Invocation, type JSONValue } from './protocol.ts';
import { ResourceRuntime } from './runtime.ts';
import { manifest } from '../../native-bindings/generated/schema.mjs';

type Configuration = {
  publishableKey: string;
  locale?: string;
  sdkVersion?: string;
  callbackUrl: string;
  platform: 'ios' | 'android';
  protocolVersion: number;
  contractHash: string;
  capabilities: string[];
};

let core: Clerk | undefined;
let runtime: ResourceRuntime | undefined;
let mobile: ReturnType<typeof installMobileCredentialTransport> | undefined;
let initializing = false;
let unsubscribe: (() => void) | undefined;
let disposed = false;
let active = true;
let online = true;
let recovery: Promise<void> | undefined;
let recoveryRequested = false;
let removeNativeHost: (() => void) | undefined;
let removeNetworkEnvironment: (() => void) | undefined;

async function initialize(id: string, configuration: Configuration): Promise<void> {
  if (initializing || core || disposed) throw bridgeError('runtime_already_initialized');
  if (
    configuration.protocolVersion !== manifest.protocolVersion ||
    configuration.contractHash !== manifest.contractHash
  )
    throw bridgeError('incompatible_bindings');
  for (const capability of ['http', 'storage', 'timer', 'random'])
    if (!configuration.capabilities.includes(capability)) throw bridgeError(`missing_capability:${capability}`);
  const callback = new URL(configuration.callbackUrl);
  if (
    ['http:', 'javascript:', 'data:', 'file:', 'about:'].includes(callback.protocol) ||
    callback.username ||
    callback.password ||
    callback.hash
  )
    throw bridgeError('invalid_callback_url');
  if (
    configuration.sdkVersion !== undefined &&
    (typeof configuration.sdkVersion !== 'string' || !/^[0-9A-Za-z.+-]+$/.test(configuration.sdkVersion))
  )
    throw bridgeError('invalid_sdk_version');
  initializing = true;
  removeNetworkEnvironment = setNativeNetworkEnvironment({ isOnline: () => online, isActive: () => active });
  const clerk = new Clerk(configuration.publishableKey);
  core = clerk;
  const scope = configuration.publishableKey;
  mobile = installMobileCredentialTransport(
    clerk,
    {
      read: () => hostRequest('storage.read', { scope, key: 'client' }),
      write: value => hostRequest('storage.write', { scope, key: 'client', value }),
      remove: () => hostRequest('storage.remove', { scope, key: 'client' }),
    },
    configuration.sdkVersion ? { [`x-${configuration.platform}-sdk-version`]: configuration.sdkVersion } : {},
  );
  removeNativeHost = await clerk.__internal_configureNativeHost({
    platform: configuration.platform,
    locale: configuration.locale,
    callbackUrl: configuration.callbackUrl,
    capabilities: configuration.capabilities,
    request: (capability, args) => hostRequest(capability, args as JSONValue),
    cancelAuthentication: () =>
      cancelCapabilities([
        'browser',
        'passkeys.get',
        'passkeys.create',
        'appleIdentity',
        'googleIdentity',
        'biometrics.sign',
      ]),
    invalidateCredentials: async () => {
      await mobile?.invalidate();
    },
  });
  await clerk.load({
    standardBrowser: false,
    telemetry: false,
    experimental: { runtimeEnvironment: 'headless' },
  });
  if (disposed) return;
  const facade = publicCore(clerk);
  runtime = new ResourceRuntime({
    roots: () => ({
      clerk: facade,
      ...authenticationRoots(clerk),
      session: clerk.session,
      user: clerk.user,
      organization: clerk.organization,
    }),
    emit,
  });
  let queued = false;
  const publish = () => {
    if (queued || disposed) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      try {
        runtime?.publish();
      } catch (error) {
        emit({ kind: 'runtimeError', failure: failure(error, 'bridge') });
      }
    });
  };
  unsubscribe = clerk.__internal_subscribeNativeResources({
    onState: publish,
    onReset: reason => {
      if (reason === 'signOut') runtime?.invalidate('Clerk.signOut');
      else runtime?.invalidateRoot(reason, reason === 'signIn' ? 'SignIn.reset' : 'SignUp.reset');
    },
  });
  initializing = false;
  emit({ kind: 'ready', id, manifest, state: runtime.snapshot() });
}

// Recovery policy belongs to this owner; native hosts only report OS state.
function recoverResources(): void {
  if (!active || !online || disposed || !core) return;
  if (recovery) {
    recoveryRequested = true;
    return;
  }
  recoveryRequested = false;
  let failed = false;
  recovery = core
    .__internal_reloadInitialResources()
    .then(
      () => {
        if (!disposed) runtime?.publish();
      },
      error => {
        failed = true;
        if (!disposed) emit({ kind: 'lifecycleError', failure: failure(error) });
      },
    )
    .finally(() => {
      recovery = undefined;
      if (failed && recoveryRequested) recoverResources();
    });
}

export function receive(encoded: string): void {
  let message: any;
  try {
    if (encoded.length > 16 * 1024 * 1024) throw bridgeError('message_too_large');
    message = JSON.parse(encoded);
    if (message.kind === 'hostReply') {
      hostReply(message);
      return;
    }
    if (disposed) return;
    if (message.kind === 'init') {
      void initialize(message.id, message.configuration).catch(error =>
        emit({ kind: 'initializationFailed', id: message.id, failure: failure(error, 'bridge') }),
      );
      return;
    }
    if (message.kind === 'dispose') {
      disposed = true;
      unsubscribe?.();
      removeNetworkEnvironment?.();
      removeNativeHost?.();
      mobile?.dispose();
      runtime?.dispose();
      disposeHost();
      return;
    }
    if (!runtime) throw bridgeError('runtime_not_ready');
    if (message.kind === 'invoke') {
      void runtime
        .invoke(message as Invocation)
        .catch(error => emit({ kind: 'runtimeError', failure: failure(error, 'bridge') }));
    } else if (message.kind === 'cancel') runtime.cancel(message.id);
    else if (message.kind === 'release') runtime.release(message.target);
    else if (message.kind === 'lifecycle') {
      if (!['foreground', 'background'].includes(message.state)) throw bridgeError('invalid_lifecycle_state');
      const wasActive = active;
      active = message.state === 'foreground';
      if (active && !wasActive) recoverResources();
    } else if (message.kind === 'connectivity') {
      if (typeof message.online !== 'boolean') throw bridgeError('invalid_connectivity_state');
      const wasOnline = online;
      online = message.online;
      if (online && !wasOnline) recoverResources();
    } else throw bridgeError('unknown_message');
  } catch (error) {
    emit({ kind: 'runtimeError', failure: failure(error, 'bridge') });
  }
}
