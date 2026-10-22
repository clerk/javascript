import { parsePublishableKey } from '@clerk/shared/keys';
import { createDeferredPromise, timeLimit } from '@clerk/shared/utils';

import { createLoomClient } from './client';
import { parseSessions, throwResponseError } from './fapi';
import { isRecord } from './hydration';
import { parseProfileSettings } from './profile-settings';
import { type ClerkScopeIdentity, type ClerkScopeInstance, createClerkScope } from './scope';
import type { LoomHydration, PrefetchedProfile, ProfileSettingsSeed, Sessions, SessionScope } from './types';
import { backendUserSnapshot, userSnapshot } from './user';

export type ServerSessionsContext = Readonly<{
  identity: Readonly<{ userId: string | null; sessionId: string | null }>;
  resolveBackend: () => Promise<
    Readonly<{
      client: Readonly<{
        sessions: Readonly<{
          getActiveDevices(sessionId: string, options: { signal: AbortSignal }): Promise<unknown>;
        }>;
      }>;
      routing: ClerkScopeInstance;
    }>
  >;
}>;

async function prefetchScopedSessions(
  context: Readonly<{
    scope: SessionScope;
    read: (signal: AbortSignal) => Promise<Sessions>;
  }>,
): Promise<LoomHydration | undefined> {
  const client = createLoomClient({
    scope: context.scope,
    transport: {
      read: context.read,
      revoke: () => Promise.reject(new Error('Loom server transport is read-only.')),
    },
  });
  try {
    await client.fetch();
    return client.dehydrate();
  } finally {
    client.dispose();
  }
}

export async function prefetchSessions(context: ServerSessionsContext): Promise<LoomHydration | undefined> {
  const { userId, sessionId } = context.identity;
  if (!userId || !sessionId) {
    return undefined;
  }
  const { client, routing } = await context.resolveBackend();
  const scope = createClerkScope(routing, { userId, sessionId });
  return prefetchScopedSessions({
    scope,
    read: async signal => {
      const result = await client.sessions.getActiveDevices(sessionId, { signal });
      if (
        !isRecord(result) ||
        result.object !== 'active_device_sessions' ||
        !isRecord(result.subject) ||
        typeof result.subject.instance_id !== 'string' ||
        !result.subject.instance_id ||
        result.subject.user_id !== userId ||
        result.subject.session_id !== sessionId ||
        !Array.isArray(result.sessions)
      ) {
        throw new Error('Loom active devices response does not match the authenticated request.');
      }
      for (const session of result.sessions) {
        if (!isRecord(session) || typeof session.has_actor !== 'boolean') {
          throw new Error('Invalid Loom active devices response.');
        }
      }
      const sessions = parseSessions(
        result.sessions.map(session => ({
          ...session,
          actor: session.has_actor ? true : null,
          latest_activity: session.latest_activity ?? {},
        })),
      );
      if (!sessions.some(session => session.id === sessionId && session.status === 'active')) {
        throw new Error('Loom active devices response omits the authenticated session.');
      }
      return sessions;
    },
  });
}

type PrefetchOptions = Readonly<{
  publishableKey: string;
  identity: ClerkScopeIdentity;
  devBrowserToken: string;
  origin: string;
}>;

function developmentHost(publishableKey: string): string {
  const key = parsePublishableKey(publishableKey);
  if (key?.instanceType !== 'development') {
    throw new Error('Loom server prefetch requires a development publishable key.');
  }
  const hostname = key.frontendApi.toLowerCase();
  const suffixes = ['.clerk.accounts.dev', '.clerk.accountsstage.dev'];
  if (
    !/^[a-z0-9.-]+$/.test(hostname) ||
    !suffixes.some(suffix => hostname.endsWith(suffix)) ||
    hostname.startsWith('.') ||
    hostname.includes('..')
  ) {
    throw new Error('Invalid Loom development frontend API.');
  }
  return hostname;
}

function applicationOrigin(value: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error('Invalid Loom application origin.');
  }
  if (
    parsed.origin !== value ||
    parsed.username ||
    parsed.password ||
    (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && parsed.hostname === 'localhost'))
  ) {
    throw new Error('Invalid Loom application origin.');
  }
  return parsed.origin;
}

function clientHasIdentity(value: unknown, identity: ClerkScopeIdentity): boolean {
  if (!isRecord(value) || !Array.isArray(value.sessions)) {
    return false;
  }
  return value.sessions.some(
    session =>
      isRecord(session) &&
      session.id === identity.sessionId &&
      session.status === 'active' &&
      isRecord(session.user) &&
      session.user.id === identity.userId,
  );
}

export async function prefetchDevelopmentSessions(options: PrefetchOptions): Promise<LoomHydration> {
  const host = developmentHost(options.publishableKey);
  const origin = applicationOrigin(options.origin);
  const { identity, devBrowserToken } = options;
  if (!identity.userId || !identity.sessionId || !devBrowserToken) {
    throw new Error('Loom server prefetch requires an authenticated development session.');
  }
  const scope = createClerkScope({ publishableKey: options.publishableKey, frontendApi: host, domain: '' }, identity);
  const request = async (path: '/client' | '/me/sessions/active', signal?: AbortSignal): Promise<unknown> => {
    const url = new URL(`/v1${path}`, `https://${host}`);
    url.searchParams.set('__clerk_db_jwt', devBrowserToken);
    if (path === '/me/sessions/active') {
      url.searchParams.set('_clerk_session_id', identity.sessionId);
    }
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        redirect: 'error',
        headers: { Origin: origin },
        signal,
      });
    } catch {
      throw new Error('Loom development request failed.');
    }
    if (!response.ok) {
      throwResponseError(
        Object.assign(response, {
          payload: { errors: [{ code: 'loom_request_failed', message: 'Loom development request failed.' }] },
        }),
      );
    }
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new Error('Invalid Loom development response.');
    }
    return payload;
  };

  const clientPayload = await request('/client');
  if (!isRecord(clientPayload) || !clientHasIdentity(clientPayload.response, identity)) {
    throw new Error('Loom development client does not match the selected session.');
  }
  const snapshot = await prefetchScopedSessions({
    scope,
    read: async signal => {
      const sessions = parseSessions(await request('/me/sessions/active', signal));
      if (!sessions.some(session => session.id === identity.sessionId && session.status === 'active')) {
        throw new Error('Loom active sessions do not include the selected session.');
      }
      return sessions;
    },
  });
  if (!snapshot) {
    throw new Error('Loom development prefetch failed.');
  }
  return snapshot;
}

export type ServerUserContext = Readonly<{
  identity: Readonly<{ userId: string | null; sessionId: string | null }>;
  resolveBackend: () => Promise<
    Readonly<{
      client: Readonly<{ users: Readonly<{ getUser(userId: string): Promise<unknown> }> }>;
      routing: ClerkScopeInstance;
    }>
  >;
}>;

export async function prefetchUser(context: ServerUserContext): Promise<LoomHydration | undefined> {
  const { userId, sessionId } = context.identity;
  if (!userId || !sessionId) {
    return undefined;
  }
  const { client, routing } = await context.resolveBackend();
  const owner = createLoomClient({
    scope: createClerkScope(routing, { userId, sessionId }),
    readUser: async () => {
      const user = await client.users.getUser(userId);
      return isRecord(user) && isRecord(user.raw) ? backendUserSnapshot(user, userId) : userSnapshot(user, userId);
    },
  });
  try {
    await owner.fetchUser();
    return owner.dehydrate();
  } finally {
    owner.dispose();
  }
}

export type { PrefetchedProfile } from './types';

export async function prefetchProfile(context: ServerUserContext): Promise<PrefetchedProfile | undefined> {
  const { userId, sessionId } = context.identity;
  if (!userId || !sessionId) {
    return undefined;
  }
  let backend: Awaited<ReturnType<ServerUserContext['resolveBackend']>>;
  try {
    backend = await context.resolveBackend();
  } catch {
    throw new Error('Loom profile backend resolution failed.');
  }
  const { client, routing } = backend;
  const hostname = parsePublishableKey(routing.publishableKey)?.frontendApi;
  if (
    !hostname ||
    hostname.toLowerCase() !== routing.frontendApi.toLowerCase() ||
    !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(hostname)
  ) {
    throw new Error('Invalid Loom profile routing.');
  }
  const scope = createClerkScope(routing, { userId, sessionId });
  const controller = new AbortController();
  const aborted = createDeferredPromise();
  const cancelSettings = () => aborted.resolve();
  controller.signal.addEventListener('abort', cancelSettings, { once: true });
  const settings = timeLimit(
    Promise.race([
      (async (): Promise<ProfileSettingsSeed> => {
        let response: Response;
        try {
          response = await fetch(new URL('/v1/environment', `https://${hostname}`), {
            method: 'GET',
            cache: 'no-store',
            redirect: 'error',
            signal: controller.signal,
          });
        } catch (error) {
          if (controller.signal.aborted || error instanceof TypeError) {
            return { kind: 'unavailable' };
          }
          throw new Error('Loom profile settings request failed.');
        }
        if (!response.ok) {
          return { kind: 'unavailable' };
        }
        let payload: unknown;
        try {
          payload = await response.json();
        } catch (error) {
          if (controller.signal.aborted || error instanceof TypeError) {
            return { kind: 'unavailable' };
          }
          throw new Error('Invalid Loom profile settings response.');
        }
        try {
          const data = parseProfileSettings(payload);
          return { kind: 'ready', hydration: { version: 5, scope, profileSettings: { data, updatedAt: Date.now() } } };
        } catch {
          throw new Error('Invalid Loom profile settings response.');
        }
      })(),
      aborted.promise.then(() => ({ kind: 'unavailable' as const })),
    ]),
    5_000,
    controller,
  )
    .catch((error: unknown): ProfileSettingsSeed => {
      if (controller.signal.aborted) {
        return { kind: 'unavailable' };
      }
      throw error;
    })
    .finally(() => {
      controller.signal.removeEventListener('abort', cancelSettings);
    });
  void settings.catch(() => {});
  try {
    let value: unknown;
    try {
      value = await client.users.getUser(userId);
    } catch {
      throw new Error('Loom profile user read failed.');
    }
    let data;
    try {
      data = backendUserSnapshot(value, userId);
    } catch {
      throw new Error('Invalid Loom profile user response.');
    }
    return { hydration: { version: 5, scope, user: { data, updatedAt: Date.now() } }, settings };
  } catch (error) {
    controller.abort();
    throw error;
  }
}
