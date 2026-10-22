import { profileSettingsSnapshot } from './profile-settings';
import type { ActiveDeviceSession, LoomHydration, Sessions, SessionScope } from './types';
import { userSnapshot } from './user';

export function sessionSnapshots(sessions: Sessions): Sessions {
  return sessions.map(({ id, status, lastActiveAt, expireAt, abandonAt, hasActor, latestActivity }) => {
    const {
      id: activityId,
      browserName,
      browserVersion,
      deviceType,
      ipAddress,
      city,
      country,
      isMobile,
    } = latestActivity;
    return {
      id,
      status,
      lastActiveAt,
      expireAt,
      abandonAt,
      hasActor,
      latestActivity: { id: activityId, browserName, browserVersion, deviceType, ipAddress, city, country, isMobile },
    };
  });
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSession(value: unknown): value is ActiveDeviceSession {
  if (!isRecord(value) || !isRecord(value.latestActivity)) {
    return false;
  }
  const activity = value.latestActivity;
  return (
    typeof value.id === 'string' &&
    typeof value.status === 'string' &&
    (value.lastActiveAt === null || (typeof value.lastActiveAt === 'number' && Number.isFinite(value.lastActiveAt))) &&
    typeof value.expireAt === 'number' &&
    Number.isFinite(value.expireAt) &&
    typeof value.abandonAt === 'number' &&
    Number.isFinite(value.abandonAt) &&
    typeof value.hasActor === 'boolean' &&
    typeof activity.id === 'string' &&
    ['browserName', 'browserVersion', 'deviceType', 'ipAddress', 'city', 'country'].every(
      key => activity[key] === undefined || typeof activity[key] === 'string',
    ) &&
    (activity.isMobile === undefined || typeof activity.isMobile === 'boolean')
  );
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
  let sessions: LoomHydration['sessions'];
  let user: LoomHydration['user'];
  let profileSettings: LoomHydration['profileSettings'];
  if (value.sessions !== undefined) {
    if (!isRecord(value.sessions) || !Array.isArray(value.sessions.data) || !value.sessions.data.every(isSession)) {
      throw new Error('Invalid Loom hydration snapshot.');
    }
    sessions = { data: sessionSnapshots(value.sessions.data), updatedAt: updatedAt(value.sessions.updatedAt) };
  }
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
  if (!sessions && !user && !profileSettings) {
    throw new Error('Invalid Loom hydration snapshot.');
  }
  return {
    version: 5,
    scope: parsedScope,
    ...(profileSettings ? { profileSettings } : {}),
    ...(sessions ? { sessions } : {}),
    ...(user ? { user } : {}),
  };
}

function updatedAt(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error('Invalid Loom hydration snapshot.');
  }
  return Math.min(value, Date.now());
}
