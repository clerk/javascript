import type { ActiveDeviceSession, LoomHydration, SessionScope } from './types';

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

export function parseHydration(value: unknown, scope: SessionScope): LoomHydration {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !isRecord(value.scope) ||
    value.scope.instanceKey !== scope.instanceKey ||
    value.scope.userId !== scope.userId ||
    value.scope.sessionId !== scope.sessionId ||
    !Array.isArray(value.sessions) ||
    !value.sessions.every(isSession) ||
    typeof value.updatedAt !== 'number' ||
    !Number.isFinite(value.updatedAt) ||
    value.updatedAt > Date.now() ||
    value.updatedAt < 0
  ) {
    throw new Error('Invalid Loom hydration snapshot.');
  }
  return { version: 1, scope, sessions: value.sessions, updatedAt: value.updatedAt };
}
