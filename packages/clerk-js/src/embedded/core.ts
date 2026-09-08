import { Clerk } from '../core/clerk';
import { eventBus, events } from '../core/events';
import type { Environment } from '../core/resources/internal';
import { Client } from '../core/resources/internal';
import { SessionTokenCache } from '../core/tokenCache';
import { createBiometricCredentialOperations } from './biometricCredentials';
import { EmbeddedInvocationError, errorEnvelope, failure } from './errors';
import { createHostedAuthOperations } from './hostedAuth';
import { type ExpectedIdentity, parseExpectedIdentity, parseInvocation } from './invocation';
import { createEmbeddedLifecycle } from './lifecycle';
import { createMagicLinkOperations } from './magicLink';
import { createNativeAuthOperations } from './nativeAuth';
import { createNativeResourceOperations } from './nativeResources';
import { createResourceRegistry } from './resources';
import { EMBEDDED_PROTOCOL_VERSION, type EmbeddedHost, type EmbeddedOptions, type EmbeddedState } from './types';
export { EMBEDDED_PROTOCOL_VERSION } from './types';
export type { EmbeddedOptions, EmbeddedHost, EmbeddedInvocation, EmbeddedState, EmbeddedError } from './types';

// One instance per isolated engine: clerk-js resources and token caches are module-scoped.
let activeInstance = false;
const nativeAdapters = new WeakMap<Clerk, ReturnType<typeof createAdapter>>();

export function createEmbeddedClerk(config: EmbeddedOptions, host: EmbeddedHost) {
  if (config.protocolVersion !== EMBEDDED_PROTOCOL_VERSION) {
    failure('protocol_mismatch', 'Unsupported embedded Clerk protocol');
  }
  if (activeInstance) {
    failure('already_initialized', 'An embedded Clerk already owns this engine');
  }
  activeInstance = true;
  return createAdapter(new Clerk(config.publishableKey, { proxyUrl: config.options?.proxyUrl }), config, host, true);
}

export function createNativeAdapter(clerk: Clerk, config: EmbeddedOptions, host: EmbeddedHost) {
  if (config.protocolVersion !== EMBEDDED_PROTOCOL_VERSION) {
    failure('protocol_mismatch', 'Unsupported embedded Clerk protocol');
  }
  if (!clerk.loaded) {
    failure('not_loaded', 'Load the existing Clerk instance before attaching native screens');
  }
  void nativeAdapters
    .get(clerk)
    ?.dispose()
    .catch(() => undefined);
  const adapter = createAdapter(clerk, config, host, false);
  nativeAdapters.set(clerk, adapter);
  return adapter;
}

function createAdapter(clerk: Clerk, config: EmbeddedOptions, host: EmbeddedHost, ownsRuntime: boolean) {
  if (ownsRuntime) {
    SessionTokenCache.setProactiveRefreshEnabled(false);
  }
  const lifecycle = ownsRuntime ? createEmbeddedLifecycle(clerk, commitState) : undefined;
  let tokenEvent: EmbeddedState['tokenEvent'];
  let tokenEventSequence = 0;
  let revision = 0;
  let clientToken = '';
  let disposed = false;
  let identity: string | null | undefined;
  let identityEpoch = 0;
  let sessionIdentity: string | undefined;
  const requestEpochs = new WeakMap<object, number>();
  const stagedTokens = new Map<string, { token?: string }>();
  let tokenTransactionSequence = 0;
  let publicationPause = 0;
  let persistence: Promise<void> = Promise.resolve();
  const identityContext = {
    ensureActive,
    identityEpoch: () => identityEpoch,
    credential: () => clientToken,
    commitState,
    beginTokenTransaction() {
      const id = String(++tokenTransactionSequence);
      stagedTokens.set(id, {});
      return id;
    },
    async commitTokenTransaction(id: string, update: () => void) {
      const token = stagedTokens.get(id)?.token;
      const epoch = identityEpoch;
      stagedTokens.delete(id);
      if (token !== undefined) {
        await host.saveToken(token);
      }
      ensureActive();
      if (epoch !== identityEpoch) {
        failure('stale_identity', 'The identity changed while committing this response');
      }
      publicationPause += 1;
      try {
        if (token !== undefined) {
          clientToken = token;
        }
        update();
      } finally {
        publicationPause -= 1;
      }
    },
    discardTokenTransaction(id: string) {
      stagedTokens.delete(id);
    },
  };
  const authController = createNativeAuthOperations(clerk, identityContext);
  const registry = createResourceRegistry(clerk, authController.remember);
  const authOperations = authController.operations;
  const nativeAuth = {
    ...authOperations,
    ...createNativeResourceOperations(clerk),
    ...createBiometricCredentialOperations(clerk, host.biometricCredential, identityContext),
    ...createHostedAuthOperations(clerk, identityContext, host.crypto),
    ...createMagicLinkOperations(
      clerk,
      host.storage,
      identityContext,
      (flow, result) => authController.finish(flow, result.id, result),
      host.crypto,
    ),
  };
  const clerkOperations = {
    ...nativeAuth,
    initialize: () => null,
    async signOut(params?: { sessionId?: string }) {
      await clerk.signOut(() => undefined, { ...params, redirectUrl: `https://${clerk.frontendApi}/` });
      return null;
    },
    async setApplicationActive(active: boolean, refresh = true) {
      await lifecycle?.setActive(active === true, refresh !== false);
      return null;
    },
    async refreshClient() {
      const client = await clerk.client?.reload();
      if (client) {
        clerk.updateClient(client);
      }
      return client;
    },
    async refreshEnvironment() {
      const environment = await (clerk.__internal_environment as Environment | undefined)?.fetch();
      if (environment) {
        clerk.updateEnvironment(environment);
      }
      return environment;
    },
  };
  let loadPromise: Promise<void> | undefined;
  const subscriptions: Array<() => void> = [];

  function ensureActive() {
    if (disposed) {
      failure('disposed', 'This Clerk runtime has been disposed');
    }
  }

  let externalPublication: Promise<void> = Promise.resolve();

  function observeIdentity() {
    if (clerk.loaded) {
      const next = `${clerk.client?.id || ''}:${clerk.session?.id || ''}`;
      if (sessionIdentity !== undefined && sessionIdentity !== next) {
        identityEpoch += 1;
      }
      sessionIdentity = next;
    }
    authController.observe();
    const nextIdentity = clerk.user?.id ?? null;
    if (identity !== nextIdentity) {
      registry.clear();
      identity = nextIdentity;
    }
  }

  function publish() {
    observeIdentity();
    if (ownsRuntime) {
      return publishCurrent();
    }
    externalPublication = externalPublication
      .catch(() => undefined)
      .then(async () => {
        if (disposed || publicationPause) {
          return;
        }
        clientToken = await host.getToken();
        if (disposed) {
          return;
        }
        const state = publishCurrent();
        if (state) {
          await host.commitState?.(state);
        }
      });
    void externalPublication.catch(() => undefined);
    return undefined;
  }

  function publishCurrent(): EmbeddedState | undefined {
    if (disposed || publicationPause) {
      return;
    }
    observeIdentity();
    const client = clerk.client?.id ? clerk.client.__internal_toSnapshot() : null;
    if (client) {
      client.last_active_session_id = clerk.session?.id ?? null;
    }
    const environment = clerk.__internal_environment?.__internal_toSnapshot() ?? null;
    const state = {
      protocolVersion: EMBEDDED_PROTOCOL_VERSION,
      generation: config.generation,
      revision: ++revision,
      status: clerk.status,
      client,
      environment,
      clientToken,
      tokenEvent,
    };
    host.publish(state);
    if (clerk.loaded) {
      persistence = persistence.then(() => (disposed ? undefined : host.saveCachedResources({ client, environment })));
      // Preserve the rejection for flush(), while preventing an unhandled rejection between calls.
      void persistence.catch(() => undefined);
    }
    return state;
  }

  async function commitState() {
    const state = publish();
    await persistence;
    await externalPublication;
    ensureActive();
    if (state) {
      await host.commitState?.(state);
    }
  }

  if (ownsRuntime) {
    clerk.__internal_getCachedResources = () => host.getCachedResources();
  }
  const removeBeforeRequest = ownsRuntime
    ? clerk.__internal_onBeforeRequest(request => {
        ensureActive();
        requestEpochs.set(request, identityEpoch);
        request.credentials = 'omit';
        request.url?.searchParams.set('_is_native', '1');
        const headers = new Headers(request.headers);
        request.headers = headers;
        if (clientToken) {
          headers.set('authorization', clientToken);
        }
        headers.set('x-mobile', '1');
        headers.set('x-ios-sdk-version', config.sdkVersion);
        return Promise.resolve();
      })
    : undefined;
  const removeAfterResponse = clerk.__internal_onAfterResponse(async (request, response) => {
    if (!ownsRuntime) {
      if (
        !disposed &&
        request.__internal_clientTokenTransaction &&
        stagedTokens.has(request.__internal_clientTokenTransaction)
      ) {
        const token = response?.headers.get('authorization');
        if (token) {
          stagedTokens.set(request.__internal_clientTokenTransaction, { token });
        }
      }
      return;
    }
    ensureActive();
    if (requestEpochs.get(request) !== identityEpoch) {
      failure('stale_identity', 'The request belongs to a previous authentication state');
    }
    if (response?.headers.has('authorization')) {
      const token = response.headers.get('authorization') || '';
      const transaction = request.__internal_clientTokenTransaction;
      if (token && transaction && stagedTokens.has(transaction)) {
        stagedTokens.set(transaction, { token });
        return;
      }
      clientToken = token;
      await host.saveToken(token);
      ensureActive();
      if (!token) {
        identityEpoch += 1;
        SessionTokenCache.clear();
        Client.clearInstance();
        clerk.updateClient(Client.getOrCreateInstance());
        failure('client_cleared', 'The server cleared this client credential');
      }
    }
  });

  async function load() {
    ensureActive();
    if (!loadPromise) {
      loadPromise = (async () => {
        clientToken = await host.getToken();
        ensureActive();
        subscriptions.push(clerk.addListener(() => publish()));
        for (const event of [events.TokenUpdate, events.EnvironmentUpdate, events.ResourceUpdate]) {
          const listener = () => {
            publish();
          };
          eventBus.on(event, listener);
          subscriptions.push(() => eventBus.off(event, listener));
        }
        const tokenListener = () => {
          const session = clerk.session;
          const jwt = session?.lastActiveToken?.getRawString();
          if (session && jwt) {
            tokenEvent = { sequence: ++tokenEventSequence, sessionId: session.id, jwt };
          }
          publish();
        };
        eventBus.on(events.SessionTokenResolved, tokenListener);
        subscriptions.push(() => eventBus.off(events.SessionTokenResolved, tokenListener));
        try {
          for (let attempt = 0; ownsRuntime; attempt += 1) {
            try {
              await clerk.load({
                ...config.options,
                standardBrowser: false,
                experimental: {
                  ...config.options?.experimental,
                  runtimeEnvironment: 'headless',
                  rethrowOfflineNetworkErrors: true,
                },
              });
              break;
            } catch (error) {
              if (attempt >= 2 || errorEnvelope(error).kind !== 'offline') {
                throw error;
              }
              await new Promise(resolve => setTimeout(resolve, 500 * 2 ** attempt));
              ensureActive();
            }
          }
          ensureActive();
          await commitState();
          lifecycle?.start();
        } catch (error) {
          subscriptions.splice(0).forEach(unsubscribe => unsubscribe());
          loadPromise = undefined;
          throw error;
        }
      })();
    }
    return loadPromise;
  }

  async function invoke(input: unknown, expectedIdentity?: ExpectedIdentity): Promise<unknown> {
    try {
      const invocation = parseInvocation(input);
      await load();
      ensureActive();
      if (
        expectedIdentity &&
        ((clerk.client?.id ?? null) !== expectedIdentity.clientId ||
          (clerk.session?.id ?? null) !== expectedIdentity.sessionId)
      ) {
        failure('stale_identity', 'The paired device has a different active identity. Retry after synchronizing.');
      }
      const { receiver, method, arguments: args = [] } = invocation;
      let value: unknown;
      if (receiver.kind === 'clerk' && ['signOut', 'setActive'].includes(method)) {
        identityEpoch += 1;
      }
      if (receiver.kind === 'clerk' && method === 'invokeForIdentity') {
        if (args.length !== 2) {
          failure('invalid_invocation', 'Identity-bound operations require an invocation and an identity');
        }
        return await invoke(args[0], parseExpectedIdentity(args[1]));
      } else if (receiver.kind === 'clerk' && Object.prototype.hasOwnProperty.call(clerkOperations, method)) {
        const operation = Reflect.get(clerkOperations, method);
        value = await Reflect.apply(operation, clerkOperations, args);
      } else {
        const target = await registry.resolve(receiver, method);
        ensureActive();
        if (!target) {
          failure('not_found', 'The Clerk resource is no longer available');
        }
        const operation: unknown = Reflect.get(target, method);
        if (
          method.startsWith('_') ||
          ['constructor', 'toString', 'valueOf'].includes(method) ||
          typeof operation !== 'function'
        ) {
          failure('unknown_method', `Unknown Clerk method: ${method}`);
        }
        value = await Reflect.apply(operation, target, args);
      }
      ensureActive();
      const result = registry.serialize(value);
      await commitState();
      if ((method === 'destroy' || method === 'delete') && (value == null || value === true)) {
        registry.forget(receiver);
        return { id: 'id' in receiver ? receiver.id : undefined, deleted: true };
      }
      return result;
    } catch (error) {
      try {
        await commitState();
      } catch {
        /* Preserve the operation error. */
      }
      throw new EmbeddedInvocationError(errorEnvelope(error));
    }
  }

  return {
    clerk,
    load,
    invoke,
    snapshot: publish,
    async dispose() {
      if (disposed) {
        return;
      }
      disposed = true;
      lifecycle?.dispose();
      removeBeforeRequest?.();
      removeAfterResponse();
      subscriptions.splice(0).forEach(unsubscribe => unsubscribe());
      registry.clear();
      stagedTokens.clear();
      if (ownsRuntime) {
        SessionTokenCache.clear();
      }
      await persistence;
      await externalPublication;
    },
  };
}
