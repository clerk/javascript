import { MachineTokenVerificationError, MachineTokenVerificationErrorCode } from '../errors';

const TTL_MS = 30_000;
const MAX_ENTRIES = 10_000;

type Entry = { expiresAt: number };
const cache = new Map<string, Entry>();

export function isOAuthTokenCachedAsInvalid(token: string): boolean {
  const entry = cache.get(token);
  if (!entry) {
    return false;
  }
  if (Date.now() >= entry.expiresAt) {
    cache.delete(token);
    return false;
  }
  return true;
}

export function maybeCacheOAuthTokenAsInvalid(err: unknown, token: string): void {
  if (!(err instanceof MachineTokenVerificationError) || err.code !== MachineTokenVerificationErrorCode.TokenInvalid) {
    return;
  }
  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) {
      cache.delete(oldest);
    }
  }
  cache.set(token, { expiresAt: Date.now() + TTL_MS });
}

export function makeCachedInvalidOAuthTokenError(): MachineTokenVerificationError {
  return new MachineTokenVerificationError({
    message: 'OAuth token not found',
    code: MachineTokenVerificationErrorCode.TokenInvalid,
    status: 404,
  });
}

export function resetOAuthNegativeCache(): void {
  cache.clear();
}
