import type {
  PublicKeyCredentialCreationOptionsWithoutExtensions,
  PublicKeyCredentialRequestOptionsWithoutExtensions,
} from '@clerk/shared/types';
import { setNativeNetworkEnvironment } from '@clerk/shared/network';
import { installMobileCredentialTransport } from '@clerk/shared/mobile';
import { eventBus, events } from '../../clerk-js/src/core/events';
import { Clerk } from '../../clerk-js/src/core/clerk';
import { authenticationRoots, publicCore } from './core.ts';
import { cancelCapabilities, disposeHost, emit, hostReply, hostRequest } from './host.ts';
import { bridgeError, failure, type Invocation } from './protocol.ts';
import { ResourceRuntime } from './runtime.ts';
import { binaryToJSON, nativeCredential } from './passkeys.ts';
import { manifest } from '../../native-bindings/generated/schema.mjs';

type Configuration = {
  publishableKey: string;
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
  initializing = true;
  removeNetworkEnvironment = setNativeNetworkEnvironment({ isOnline: () => true, isActive: () => active });
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
    { [`x-${configuration.platform}-sdk-version`]: 'next' },
  );
  clerk.__internal_getAppleIdentity = options => {
    if (!configuration.capabilities.includes('appleIdentity'))
      return Promise.reject(bridgeError('capability_unavailable'));
    return hostRequest('appleIdentity', options);
  };
  clerk.__internal_isWebAuthnSupported = () => configuration.capabilities.includes('passkeys');
  clerk.__internal_isWebAuthnAutofillSupported = async () => configuration.capabilities.includes('passkeys.autofill');
  clerk.__internal_isWebAuthnPlatformAuthenticatorSupported = async () =>
    configuration.capabilities.includes('passkeys');
  clerk.__internal_createPublicCredentials = (options: PublicKeyCredentialCreationOptionsWithoutExtensions) =>
    nativeCredential('create', binaryToJSON(options));
  clerk.__internal_getPublicCredentials = ({
    publicKeyOptions,
    conditionalUI,
    preferImmediatelyAvailableCredentials,
  }: {
    publicKeyOptions: PublicKeyCredentialRequestOptionsWithoutExtensions;
    conditionalUI?: boolean;
    preferImmediatelyAvailableCredentials?: boolean;
  }) =>
    nativeCredential(
      'get',
      binaryToJSON({ ...publicKeyOptions, conditionalUI, preferImmediatelyAvailableCredentials }),
    );
  await clerk.load({
    standardBrowser: false,
    telemetry: false,
    experimental: { runtimeEnvironment: 'headless' },
    __internal_oauthTransport: {
      getRedirectUrl: () => configuration.callbackUrl,
      open: url => {
        if (!configuration.capabilities.includes('browser'))
          return Promise.reject(bridgeError('capability_unavailable'));
        return hostRequest('browser', { url: url.toString(), callbackUrl: configuration.callbackUrl });
      },
    },
  });
  if (disposed) return;
  const facade = publicCore(clerk, async () => {
    cancelCapabilities(['browser', 'passkeys.get', 'passkeys.create', 'appleIdentity']);
    runtime?.invalidate('Clerk.signOut');
    await mobile?.invalidate();
  });
  runtime = new ResourceRuntime({
    roots: () => ({
      clerk: facade,
      ...authenticationRoots(clerk),
      session: clerk.session,
      user: clerk.user,
      organization: clerk.organization,
    }),
    emit,
    beforeInvoke: async operation => {
      if (operation === 'SignIn.reset' || operation === 'SignUp.reset') {
        cancelCapabilities(['browser', 'passkeys.get', 'passkeys.create', 'appleIdentity']);
        await mobile?.invalidate();
      }
    },
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
  const removeListener = clerk.addListener(publish, { skipInitialEmit: true });
  eventBus.on(events.ResourceUpdate, publish);
  eventBus.on(events.ResourceFetch, publish);
  unsubscribe = () => {
    removeListener();
    eventBus.off(events.ResourceUpdate, publish);
    eventBus.off(events.ResourceFetch, publish);
  };
  initializing = false;
  emit({ kind: 'ready', id, manifest, state: runtime.snapshot() });
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
      if (active && !wasActive)
        void core?.__internal_reloadInitialResources().then(
          () => runtime?.publish(),
          error => emit({ kind: 'lifecycleError', failure: failure(error) }),
        );
    } else throw bridgeError('unknown_message');
  } catch (error) {
    emit({ kind: 'runtimeError', failure: failure(error, 'bridge') });
  }
}
