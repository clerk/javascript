import { profileSettingsSnapshot } from './profile-settings';
import type { LoomHydration, SessionScope } from './types';
import { userSnapshot } from './user';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseHydration(value: unknown, scope?: SessionScope): LoomHydration {
  if (
    !isRecord(value) ||
    value.version !== 5 ||
    !isRecord(value.scope) ||
    typeof value.scope.instanceKey !== 'string' ||
    !value.scope.instanceKey ||
    typeof value.scope.userId !== 'string' ||
    !value.scope.userId ||
    typeof value.scope.sessionId !== 'string' ||
    !value.scope.sessionId ||
    (scope !== undefined &&
      (value.scope.instanceKey !== scope.instanceKey ||
        value.scope.userId !== scope.userId ||
        value.scope.sessionId !== scope.sessionId))
  ) {
    throw new Error('Invalid Loom hydration snapshot.');
  }
  const parsedScope = {
    instanceKey: value.scope.instanceKey,
    userId: value.scope.userId,
    sessionId: value.scope.sessionId,
  };
  let user: LoomHydration['user'];
  let profileSettings: LoomHydration['profileSettings'];
  if (value.user !== undefined) {
    if (!isRecord(value.user)) {
      throw new Error('Invalid Loom hydration snapshot.');
    }
    user = { data: userSnapshot(value.user.data, parsedScope.userId), updatedAt: updatedAt(value.user.updatedAt) };
  }
  if (value.profileSettings !== undefined) {
    if (!isRecord(value.profileSettings)) {
      throw new Error('Invalid Loom hydration snapshot.');
    }
    profileSettings = {
      data: profileSettingsSnapshot(value.profileSettings.data),
      updatedAt: updatedAt(value.profileSettings.updatedAt),
    };
  }
  if (!user && !profileSettings) {
    throw new Error('Invalid Loom hydration snapshot.');
  }
  return {
    version: 5,
    scope: parsedScope,
    ...(profileSettings ? { profileSettings } : {}),
    ...(user ? { user } : {}),
  };
}

function updatedAt(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error('Invalid Loom hydration snapshot.');
  }
  return Math.min(value, Date.now());
}
