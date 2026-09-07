import type { ClerkOptions, ClientJSONSnapshot, EnvironmentJSONSnapshot } from '@clerk/shared/types';

import { Clerk } from '../core/clerk';
import { eventBus, events } from '../core/events';
import type { Environment } from '../core/resources/internal';
import {
  BillingPaymentMethod,
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

export const EMBEDDED_PROTOCOL_VERSION = 1;

export interface EmbeddedState {
  protocolVersion: number;
  generation: string;
  revision: number;
  status: string;
  client: ClientJSONSnapshot | null;
  environment: EnvironmentJSONSnapshot | null;
  clientToken: string;
}

export interface EmbeddedHost {
  getToken(): Promise<string>;
  saveToken(token: string): Promise<void>;
  getCachedResources(): Promise<{ client: ClientJSONSnapshot | null; environment: EnvironmentJSONSnapshot | null }>;
  saveCachedResources(resources: {
    client: ClientJSONSnapshot | null;
    environment: EnvironmentJSONSnapshot | null;
  }): Promise<void>;
  publish(state: EmbeddedState): void;
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
    status: error?.status,
    clerkTraceId: error?.clerkTraceId || error?.clerk_trace_id,
  };
}

// One instance per isolated engine: clerk-js resources and token caches are module-scoped.
let activeInstance = false;

export function createEmbeddedClerk(config: EmbeddedOptions, host: EmbeddedHost) {
  if (config.protocolVersion !== EMBEDDED_PROTOCOL_VERSION) {
    failure('protocol_mismatch', 'Unsupported embedded Clerk protocol');
  }
  if (activeInstance) {
    failure('already_initialized', 'An embedded Clerk already owns this engine');
  }
  activeInstance = true;
  const clerk: Clerk = new Clerk(config.publishableKey, { proxyUrl: config.options?.proxyUrl });
  const registry = new Map<string, Resource>();
  let revision = 0;
  let clientToken = '';
  let disposed = false;
  let identity: string | null | undefined;
  let persistence: Promise<void> = Promise.resolve();
  let loadPromise: Promise<void> | undefined;
  const subscriptions: Array<() => void> = [];

  function ensureActive() {
    if (disposed) {
      failure('disposed', 'This Clerk runtime has been disposed');
    }
  }

  function publish(): EmbeddedState | undefined {
    if (disposed) {
      return;
    }
    const nextIdentity = clerk.user?.id ?? null;
    if (identity !== nextIdentity) {
      registry.clear();
      identity = nextIdentity;
    }
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
    };
    host.publish(state);
    if (clerk.loaded) {
      persistence = persistence.then(() => (disposed ? undefined : host.saveCachedResources({ client, environment })));
      // Preserve the rejection for flush(), while preventing an unhandled rejection between calls.
      void persistence.catch(() => undefined);
    }
    return state;
  }

  clerk.__internal_getCachedResources = () => host.getCachedResources();
  clerk.__internal_onBeforeRequest(request => {
    ensureActive();
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
  clerk.__internal_onAfterResponse(async (_, response) => {
    ensureActive();
    if (response?.headers.has('authorization')) {
      const token = response.headers.get('authorization') || '';
      clientToken = token;
      await host.saveToken(token);
      ensureActive();
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
          ensureActive();
          publish();
          await persistence;
        } catch (error) {
          subscriptions.splice(0).forEach(unsubscribe => unsubscribe());
          loadPromise = undefined;
          throw error;
        }
      })();
    }
    return loadPromise;
  }

  async function invoke(invocation: EmbeddedInvocation) {
    try {
      await load();
      ensureActive();
      const { receiver, method, arguments: args = [] } = invocation;
      let value: unknown;
      if (receiver.kind === 'clerk' && method === 'refreshClient') {
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
      publish();
      await persistence;
      if ((method === 'destroy' || method === 'delete') && (value == null || value === true)) {
        registry.delete(`${receiver.scope || receiver.listedKind}:${receiver.id}`);
        return { id: receiver.id, deleted: true };
      }
      return result;
    } catch (error) {
      publish();
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
      subscriptions.splice(0).forEach(unsubscribe => unsubscribe());
      registry.clear();
      SessionTokenCache.clear();
      await persistence;
    },
  };
}
