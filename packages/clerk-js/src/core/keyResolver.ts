/**
 * Derives the opaque string keys used to address entries in the token store,
 * keeping key construction out of the storage layer.
 */

const KEY_PREFIX = 'clerk';
const DELIMITER = '::';

/**
 * Identifies a cached token entry by tokenId and optional audience.
 */
export interface TokenCacheKeyJSON {
  audience?: string;
  tokenId: string;
}

export interface KeyResolver {
  /**
   * Serializes a key to its string form `prefix::tokenId::audience`.
   * Empty-string and undefined audience collapse to the same key.
   */
  toKey(key: TokenCacheKeyJSON): string;
}

/**
 * Creates a {@link KeyResolver} bound to a key prefix.
 *
 * `audience` is currently unused by production (no caller sets it) but kept as a
 * key dimension so an audience-scoped token can coexist with the session token
 * of the same id. If it is revived, the cross-tab broadcast and Web Locks lock
 * name must derive from the same key so all three agree.
 */
export const createKeyResolver = (prefix: string = KEY_PREFIX): KeyResolver => ({
  toKey: ({ tokenId, audience }) => [prefix, tokenId, audience || ''].join(DELIMITER),
});
