import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { ClerkAPIErrorJSON } from '@clerk/shared/types';

import { isRecord } from './hydration';
import type { ActiveDeviceSession, Sessions } from './types';

function optionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new Error('Invalid sessions response string.');
  }
  return value;
}

function timestamp(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error('Invalid sessions timestamp.');
  }
  return value;
}

function parseSession(value: unknown): ActiveDeviceSession {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.status !== 'string') {
    throw new Error('Invalid sessions response.');
  }
  const activity = value.latest_activity ?? {};
  if (!isRecord(activity) || (activity.is_mobile != null && typeof activity.is_mobile !== 'boolean')) {
    throw new Error('Invalid sessions activity.');
  }
  return {
    id: value.id,
    status: value.status,
    expireAt: timestamp(value.expire_at),
    abandonAt: timestamp(value.abandon_at),
    lastActiveAt: value.last_active_at == null ? null : timestamp(value.last_active_at),
    hasActor: value.actor != null,
    latestActivity: {
      id: optionalString(activity.id) ?? '',
      deviceType: optionalString(activity.device_type),
      browserName: optionalString(activity.browser_name),
      browserVersion: optionalString(activity.browser_version),
      country: optionalString(activity.country),
      city: optionalString(activity.city),
      ipAddress: optionalString(activity.ip_address),
      isMobile: activity.is_mobile ?? undefined,
    },
  };
}

export function parseSessions(value: unknown): Sessions {
  if (!Array.isArray(value)) {
    throw new Error('Invalid sessions response: expected an array.');
  }
  return value.map(parseSession);
}

function parseError(value: unknown): ClerkAPIErrorJSON {
  if (!isRecord(value) || typeof value.code !== 'string' || typeof value.message !== 'string') {
    return { code: 'invalid_api_error', message: 'Invalid Clerk error response.' };
  }
  return {
    code: value.code,
    message: value.message,
    long_message: typeof value.long_message === 'string' ? value.long_message : undefined,
  };
}

export function throwResponseError(response: Response & { payload: unknown }): never {
  const payload = response.payload;
  const errors = isRecord(payload) && Array.isArray(payload.errors) ? payload.errors.map(parseError) : [];
  const retryAfter = Number(response.headers.get('retry-after') ?? NaN);
  throw new ClerkAPIResponseError(errors[0]?.long_message ?? errors[0]?.message ?? response.statusText, {
    data: errors,
    status: response.status,
    retryAfter: Number.isFinite(retryAfter) && retryAfter >= 0 ? retryAfter : undefined,
    clerkTraceId: response.headers.get('x-clerk-trace-id') ?? undefined,
  });
}
