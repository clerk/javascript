import type { ClerkOptions, ClientJSONSnapshot, EnvironmentJSONSnapshot } from '@clerk/shared/types';

import { Clerk } from '../core/clerk';
import { eventBus, events } from '../core/events';
import type { Environment } from '../core/resources/internal';
import {
  BillingPaymentMethod,
  Client,
  Organization,
  OrganizationDomain,
  OrganizationInvitation,
  OrganizationMembership,
  OrganizationMembershipRequest,
  OrganizationSuggestion,
  SessionWithActivities,
  UserOrganizationInvitation,
} from '../core/resources/internal';
import { SessionTokenCache } from '../core/tokenCache';
import { createBiometricCredentialOperations, type NativeBiometricCapability } from './biometricCredentials';
import { createHostedAuthOperations } from './hostedAuth';
import { createEmbeddedLifecycle } from './lifecycle';
import { createMagicLinkOperations } from './magicLink';
import { createNativeAuthOperations, NativeAuthOperationError } from './nativeAuth';
import type { NativeCrypto } from './nativeCrypto';
import { createNativeResourceOperations } from './nativeResources';
import type { NativeStorage } from './nativeStorage';

export const EMBEDDED_PROTOCOL_VERSION = 1;

export interface EmbeddedState {
  protocolVersion: number;
  generation: string;
  revision: number;
  status: string;
  client: ClientJSONSnapshot | null;
  environment: EnvironmentJSONSnapshot | null;
  clientToken: string;
  tokenEvent?: { sequence: number; sessionId: string; jwt: string };
}

export interface EmbeddedHost {
  storage?: NativeStorage;
  crypto?: NativeCrypto;
  biometricCredential?: NativeBiometricCapability;
  getToken(): Promise<string>;
  saveToken(token: string): Promise<void>;
  getCachedResources(): Promise<{ client: ClientJSONSnapshot | null; environment: EnvironmentJSONSnapshot | null }>;
  saveCachedResources(resources: {
    client: ClientJSONSnapshot | null;
    environment: EnvironmentJSONSnapshot | null;
  }): Promise<void>;
  publish(state: EmbeddedState): void;
  commitState?(state: EmbeddedState): Promise<void>;
}

export interface EmbeddedOptions {
  protocolVersion: number;
  generation: string;
  publishableKey: string;
  sdkVersion: string;
  options?: ClerkOptions & { proxyUrl?: string };
}

export interface EmbeddedInvocation {
  receiver: { kind: string; id?: string; collection?: string; scope?: string; listedKind?: string };
  method: string;
  arguments?: unknown[];
}

export interface EmbeddedError {
  kind: 'api' | 'offline' | 'runtime' | 'resolution' | 'javascript';
  code?: string;
  message: string;
  errors: unknown[];
  status?: number;
  clerkTraceId?: string;
  stage?: string;
  nativeError?: unknown;
}

type Resource = Record<string, any>;

const resourceKinds = [
  [Organization, 'organization'],
  [OrganizationDomain, 'organizationDomain'],
  [OrganizationInvitation, 'organizationInvitation'],
  [OrganizationMembership, 'organizationMembership'],
  [OrganizationMembershipRequest, 'organizationMembershipRequest'],
  [OrganizationSuggestion, 'organizationSuggestion'],
  [SessionWithActivities, 'sessionWithActivities'],
  [UserOrganizationInvitation, 'userOrganizationInvitation'],
  [BillingPaymentMethod, 'billingPaymentMethod'],
] as const;

function failure(code: string, message: string): never {
  throw Object.assign(new Error(message), { kind: 'resolution', code, errors: [] });
}

class EmbeddedInvocationError extends Error {
  constructor(readonly envelope: EmbeddedError) {
    super(envelope.message);
  }

  toString() {
    return JSON.stringify(this.envelope);
  }
}

function errorEnvelope(error: any): EmbeddedError {
  if (error instanceof NativeAuthOperationError) {
    return { ...errorEnvelope(error.cause), stage: error.stage };
  }
  if (error?.kind && Array.isArray(error.errors)) {
    return error;
  }
  const errors = Array.isArray(error?.errors) ? error.errors : [];
  const code = errors[0]?.code || error?.code;
  return {
    kind: errors.length
      ? 'api'
      : code === 'network_error' || error?.name === 'ClerkOfflineError'
        ? 'offline'
        : 'javascript',
    code,
    message: errors[0]?.longMessage || errors[0]?.long_message || errors[0]?.message || error?.message || String(error),
    errors,
    nativeError: error?.nativeError,
    status: error?.status,
    clerkTraceId: error?.clerkTraceId || error?.clerk_trace_id,
  };
}

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
  const registry = new Map<string, Resource>();
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
  const removeBeforeRequest = clerk.__internal_onBeforeRequest(request => {
    if (!ownsRuntime) {
      return Promise.resolve();
    }
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
  });
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

  function remember(value: Resource) {
    if (typeof value.id !== 'string') {
      return;
    }
    for (const [type, kind] of resourceKinds) {
      if (value instanceof type) {
        registry.set(`${kind}:${value.id}`, value);
        return;
      }
    }
  }

  function serialize(value: any): any {
    if (value == null) {
      return null;
    }
    if (typeof value !== 'object') {
      return value;
    }
    if (value instanceof Date) {
      return value.getTime();
    }
    if (Array.isArray(value)) {
      return value.map(serialize);
    }
    remember(value);
    authController.remember(value);
    if (value.organization) {
      remember(value.organization);
    }
    if (typeof value.__internal_toSnapshot === 'function') {
      return value.__internal_toSnapshot();
    }
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key, entry]) => key !== 'pathRoot' && typeof entry !== 'function')
        .map(([key, entry]) => [key, serialize(entry)]),
    );
  }

  async function resolve(receiver: EmbeddedInvocation['receiver'], method: string): Promise<Resource> {
    const find = (items?: readonly { id: string }[]) => items?.find(item => item.id === receiver.id);
    switch (receiver.kind) {
      case 'clerk':
        return clerk as unknown as Resource;
      case 'signIn':
        return clerk.client?.signIn as unknown as Resource;
      case 'signUp':
        return clerk.client?.signUp as unknown as Resource;
      case 'user':
        return clerk.user as unknown as Resource;
      case 'billing':
        return clerk.billing as unknown as Resource;
      case 'userResource':
        return find((clerk.user as unknown as Resource)?.[receiver.collection || '']) as Resource;
      case 'session': {
        const session = find(clerk.client?.sessions) as Resource;
        if (typeof session?.[method] === 'function') {
          return session;
        }
        let listed = registry.get(`sessionWithActivities:${receiver.id}`);
        if (!listed && clerk.user) {
          serialize(await clerk.user.getSessions());
          listed = registry.get(`sessionWithActivities:${receiver.id}`);
        }
        return listed as Resource;
      }
      case 'organization':
        return (
          clerk.user?.organizationMemberships.find(m => m.organization.id === receiver.id)?.organization ||
          registry.get(`organization:${receiver.id}`) ||
          (await clerk.getOrganization(receiver.id || ''))
        );
      case 'listed':
        return registry.get(`${receiver.scope || receiver.listedKind}:${receiver.id}`) as Resource;
      default:
        return failure('unknown_receiver', 'Unknown Clerk resource');
    }
  }

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

  async function invoke(
    invocation: EmbeddedInvocation,
    expectedIdentity?: { clientId: string | null; sessionId: string | null },
  ): Promise<unknown> {
    try {
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
        return await invoke(
          args[0] as EmbeddedInvocation,
          args[1] as { clientId: string | null; sessionId: string | null },
        );
      } else if (receiver.kind === 'clerk' && method === 'initialize') {
        value = null;
      } else if (receiver.kind === 'clerk' && method === 'signOut') {
        await clerk.signOut(() => undefined, {
          ...(args[0] as { sessionId?: string } | undefined),
          redirectUrl: `https://${clerk.frontendApi}/`,
        });
        value = null;
      } else if (receiver.kind === 'clerk' && method === 'setApplicationActive') {
        await lifecycle?.setActive(args[0] === true, args[1] !== false);
        value = null;
      } else if (receiver.kind === 'clerk' && Object.prototype.hasOwnProperty.call(nativeAuth, method)) {
        value = await (nativeAuth[method as keyof typeof nativeAuth] as (...args: any[]) => unknown)(...args);
      } else if (receiver.kind === 'clerk' && method === 'refreshClient') {
        const client = await clerk.client?.reload();
        if (client) {
          clerk.updateClient(client);
        }
        value = client;
      } else if (receiver.kind === 'clerk' && method === 'refreshEnvironment') {
        const environment = await (clerk.__internal_environment as Environment | undefined)?.fetch();
        if (environment) {
          clerk.updateEnvironment(environment);
        }
        value = environment;
      } else {
        const target = await resolve(receiver, method);
        ensureActive();
        if (!target) {
          failure('not_found', 'The Clerk resource is no longer available');
        }
        if (
          method.startsWith('_') ||
          ['constructor', 'toString', 'valueOf'].includes(method) ||
          typeof target[method] !== 'function'
        ) {
          failure('unknown_method', `Unknown Clerk method: ${method}`);
        }
        value = await target[method](...args);
      }
      ensureActive();
      const result = serialize(value);
      await commitState();
      if ((method === 'destroy' || method === 'delete') && (value == null || value === true)) {
        registry.delete(`${receiver.scope || receiver.listedKind}:${receiver.id}`);
        return { id: receiver.id, deleted: true };
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
      removeBeforeRequest();
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
