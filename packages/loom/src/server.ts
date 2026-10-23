import { parsePublishableKey } from '@clerk/shared/keys';
import { createDeferredPromise, timeLimit } from '@clerk/shared/utils';

import { isRecord } from './hydration';
import { parseProfileSettings } from './profile-settings';
import { type ClerkScopeInstance, createClerkScope } from './scope';
import type { LoomHydration, PrefetchedProfile, ProfileSettingsSeed } from './types';
import { backendUserSnapshot, userSnapshot } from './user';

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
  const scope = createClerkScope(routing, { userId, sessionId });
  const user = await client.users.getUser(userId);
  const data = isRecord(user) && isRecord(user.raw) ? backendUserSnapshot(user, userId) : userSnapshot(user, userId);
  return { version: 5, scope, user: { data, updatedAt: Date.now() } };
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
