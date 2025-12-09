import { is4xxError } from '@clerk/shared/error';
import type { GetTokenOptions } from '@clerk/shared/types';

import { Token } from '../resources/Token';

type TokenCacheKey = string;

type TokenStateIdle = {
  status: 'idle';
};

type TokenStateFetching = {
  promise: Promise<Token>;
  startedAt: number;
  status: 'fetching';
};

type TokenStateValid = {
  expiresAt: number;
  refreshTimeoutId: ReturnType<typeof setTimeout> | null;
  status: 'valid';
  token: Token;
};

type TokenStateRefreshing = {
  currentToken: Token;
  promise: Promise<Token>;
  startedAt: number;
  status: 'refreshing';
};

type TokenStateError = {
  error: Error;
  failedAt: number;
  nextRetryAt: number | null;
  retryCount: number;
  status: 'error';
};

type TokenState = TokenStateIdle | TokenStateFetching | TokenStateValid | TokenStateRefreshing | TokenStateError;

interface TokenServiceOptions {
  fetcher: TokenFetcher;
  onTokenError?: (error: Error, cacheKey: TokenCacheKey) => void;
  onTokenResolved?: (token: Token, cacheKey: TokenCacheKey) => void;
  refreshBufferSeconds?: number;
  retryConfig?: RetryConfig;
}

interface TokenFetcher {
  (params: TokenFetchParams): Promise<Token>;
}

interface TokenFetchParams {
  organizationId?: string | null;
  sessionId: string;
  template?: string;
}

interface RetryConfig {
  factor: number;
  initialDelayMs: number;
  maxDelayMs: number;
  maxRetries: number;
  shouldRetry: (error: Error) => boolean;
}

const DEFAULT_REFRESH_BUFFER_SECONDS = 10;
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  factor: 1.55,
  initialDelayMs: 3000,
  maxDelayMs: 50000,
  maxRetries: 8,
  shouldRetry: error => !is4xxError(error),
};

export class TokenService {
  private cache = new Map<TokenCacheKey, TokenState>();

  private destroyed = false;

  private options: Required<TokenServiceOptions>;

  private sessionId: string;

  constructor(sessionId: string, options: TokenServiceOptions) {
    this.sessionId = sessionId;
    this.options = {
      fetcher: options.fetcher,
      onTokenError: options.onTokenError ?? (() => {}),
      onTokenResolved: options.onTokenResolved ?? (() => {}),
      refreshBufferSeconds: options.refreshBufferSeconds ?? DEFAULT_REFRESH_BUFFER_SECONDS,
      retryConfig: { ...DEFAULT_RETRY_CONFIG, ...options.retryConfig },
    };
  }

  backgroundRefresh(cacheKey: TokenCacheKey, options?: GetTokenOptions): void {
    const currentState = this.cache.get(cacheKey);
    if (currentState?.status !== 'valid') {
      return;
    }

    const promise = this.doFetchWithRetry(cacheKey, options);

    this.cache.set(cacheKey, {
      currentToken: currentState.token,
      promise,
      startedAt: Date.now(),
      status: 'refreshing',
    });

    promise
      .then(token => {
        if (this.destroyed) {
          return;
        }

        const expiresAt = this.getTokenExpiry(token);
        const refreshTimeoutId = this.scheduleProactiveRefresh(cacheKey, expiresAt, options);

        this.cache.set(cacheKey, {
          expiresAt,
          refreshTimeoutId,
          status: 'valid',
          token,
        });

        this.options.onTokenResolved(token, cacheKey);
      })
      .catch(error => {
        if (this.destroyed) {
          return;
        }

        const refreshingState = this.cache.get(cacheKey);
        if (refreshingState?.status === 'refreshing') {
          this.cache.set(cacheKey, {
            expiresAt: this.getTokenExpiry(refreshingState.currentToken),
            refreshTimeoutId: null,
            status: 'valid',
            token: refreshingState.currentToken,
          });
        }

        console.warn('[TokenService] Background refresh failed:', error);
      });
  }

  buildCacheKey(template?: string, organizationId?: string | null): TokenCacheKey {
    const orgPart = organizationId ?? '__personal__';
    const templatePart = template ?? '__session__';
    return `${this.sessionId}:${templatePart}:${orgPart}`;
  }

  destroy(): void {
    this.destroyed = true;
    this.invalidate();
  }

  private async doFetchWithRetry(cacheKey: TokenCacheKey, options?: GetTokenOptions): Promise<Token> {
    const { organizationId, template } = this.parseCacheKey(cacheKey);
    const config = this.options.retryConfig;

    let delay = config.initialDelayMs;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= config.maxRetries; attempt += 1) {
      try {
        return await this.options.fetcher({
          organizationId,
          sessionId: this.sessionId,
          template,
        });
      } catch (error) {
        lastError = error as Error;

        if (!config.shouldRetry(lastError) || attempt === config.maxRetries) {
          throw lastError;
        }

        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * config.factor, config.maxDelayMs);
      }
    }

    throw lastError!;
  }

  private async fetchToken(cacheKey: TokenCacheKey, options?: GetTokenOptions): Promise<string | null> {
    const promise = this.doFetchWithRetry(cacheKey, options);

    this.cache.set(cacheKey, {
      promise,
      startedAt: Date.now(),
      status: 'fetching',
    });

    try {
      const token = await promise;

      if (this.destroyed) {
        return token.getRawString() || null;
      }

      const expiresAt = this.getTokenExpiry(token);
      const refreshTimeoutId = this.scheduleProactiveRefresh(cacheKey, expiresAt, options);

      this.cache.set(cacheKey, {
        expiresAt,
        refreshTimeoutId,
        status: 'valid',
        token,
      });

      this.options.onTokenResolved(token, cacheKey);

      return token.getRawString() || null;
    } catch (error) {
      if (this.destroyed) {
        throw error;
      }

      this.cache.set(cacheKey, {
        error: error as Error,
        failedAt: Date.now(),
        nextRetryAt: null,
        retryCount: 0,
        status: 'error',
      });

      this.options.onTokenError(error as Error, cacheKey);
      throw error;
    }
  }

  getState(cacheKey: TokenCacheKey): TokenState {
    return this.cache.get(cacheKey) ?? { status: 'idle' };
  }

  async getToken(options?: GetTokenOptions): Promise<string | null> {
    if (this.destroyed) {
      throw new Error('TokenService has been destroyed');
    }

    const cacheKey = this.buildCacheKey(options?.template, options?.organizationId ?? null);
    const state = this.cache.get(cacheKey) ?? { status: 'idle' };

    if (options?.skipCache) {
      return this.fetchToken(cacheKey, options);
    }

    switch (state.status) {
      case 'idle':
        return this.fetchToken(cacheKey, options);
      case 'fetching':
        return state.promise.then(token => token.getRawString() || null);
      case 'valid': {
        const leeway = (options?.leewayInSeconds ?? 0) * 1000;
        const now = Date.now();
        const effectiveExpiry = state.expiresAt - leeway;

        if (now >= effectiveExpiry) {
          return this.fetchToken(cacheKey, options);
        }

        const refreshThreshold = state.expiresAt - this.options.refreshBufferSeconds * 1000;
        if (now >= refreshThreshold && !state.refreshTimeoutId) {
          this.backgroundRefresh(cacheKey, options);
        }

        return state.token.getRawString() || null;
      }
      case 'refreshing':
        return state.currentToken.getRawString() || null;
      case 'error': {
        if (state.nextRetryAt && state.nextRetryAt - Date.now() < 1000) {
          const waitMs = Math.max(state.nextRetryAt - Date.now() + 100, 0);
          await new Promise(resolve => setTimeout(resolve, waitMs));
          return this.getToken(options);
        }
        return this.fetchToken(cacheKey, options);
      }
      default:
        return null;
    }
  }

  private getTokenExpiry(token: Token): number {
    const claims = token.jwt?.claims;
    if (claims?.exp) {
      return claims.exp * 1000;
    }
    return Date.now() + 60000;
  }

  hasValidToken(cacheKey: TokenCacheKey): boolean {
    const state = this.cache.get(cacheKey);
    if (!state) {
      return false;
    }

    if (state.status === 'valid') {
      return Date.now() < state.expiresAt;
    }
    if (state.status === 'refreshing') {
      return Date.now() < this.getTokenExpiry(state.currentToken);
    }
    return false;
  }

  ingestToken(token: Token, cacheKey: TokenCacheKey): void {
    const existingState = this.cache.get(cacheKey);
    if (existingState?.status === 'valid' && existingState.refreshTimeoutId) {
      clearTimeout(existingState.refreshTimeoutId);
    }

    const expiresAt = this.getTokenExpiry(token);
    const refreshTimeoutId = this.scheduleProactiveRefresh(cacheKey, expiresAt);

    this.cache.set(cacheKey, {
      expiresAt,
      refreshTimeoutId,
      status: 'valid',
      token,
    });
  }

  invalidate(cacheKey?: TokenCacheKey): void {
    if (cacheKey) {
      const state = this.cache.get(cacheKey);
      if (state?.status === 'valid' && state.refreshTimeoutId) {
        clearTimeout(state.refreshTimeoutId);
      }
      this.cache.delete(cacheKey);
      return;
    }

    for (const [key, state] of this.cache) {
      if (state.status === 'valid' && state.refreshTimeoutId) {
        clearTimeout(state.refreshTimeoutId);
      }
      this.cache.delete(key);
    }
  }

  private parseCacheKey(cacheKey: TokenCacheKey): { organizationId?: string | null; template?: string } {
    const [, templatePart, orgPart] = cacheKey.split(':');
    return {
      organizationId: orgPart === '__personal__' ? null : orgPart,
      template: templatePart === '__session__' ? undefined : templatePart,
    };
  }

  private scheduleProactiveRefresh(
    cacheKey: TokenCacheKey,
    expiresAt: number,
    options?: GetTokenOptions,
  ): ReturnType<typeof setTimeout> | null {
    const refreshAt = expiresAt - this.options.refreshBufferSeconds * 1000;
    const delay = refreshAt - Date.now();

    if (delay <= 0) {
      return null;
    }

    return setTimeout(() => {
      if (!this.destroyed) {
        this.backgroundRefresh(cacheKey, options);
      }
    }, delay);
  }
}
