import { ClerkMcpError } from './errors';
import type { ClerkMcpTelemetry } from './telemetry';

const TOKEN_EXCHANGE_GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:token-exchange';
const ACCESS_TOKEN_TYPE = 'urn:ietf:params:oauth:token-type:access_token';
const DEFAULT_TIMEOUT_MS = 10_000;
const CACHE_SKEW_MS = 30_000;
const MAX_CACHE_ENTRIES = 1_000;

export type TokenExchangeOptions = {
  tokenEndpoint: string | URL;
  clientId: string;
  clientSecret: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
  cache?: boolean;
  telemetry?: ClerkMcpTelemetry;
};

export type TokenExchangeInput = {
  subjectToken: string;
  resource: string | URL;
  scopes?: readonly string[];
};

export type ExchangedToken = {
  accessToken: string;
  /**
   * Lifetime in seconds, as reported by the token endpoint.
   */
  expiresIn: number;
  /**
   * Expiry as a Unix timestamp in milliseconds.
   */
  expiresAt: number;
  scope?: string;
};

export type TokenExchange = (input: TokenExchangeInput) => Promise<ExchangedToken>;

function formComponent(value: string): string {
  return new URLSearchParams({ value }).toString().slice('value='.length);
}

function targetResource(resource: string | URL): string {
  let url: URL;
  try {
    url = new URL(resource);
  } catch {
    throw new ClerkMcpError('configuration', 'Token exchange resource must be an absolute URL.');
  }
  if (url.hash || url.href.endsWith('#')) {
    throw new ClerkMcpError('configuration', 'Token exchange resource must not include a fragment.');
  }
  return url.href;
}

function exchangeErrorCode(status: number): ClerkMcpError['code'] {
  if (status === 400) {
    return 'rejected';
  }
  if (status === 403) {
    return 'forbidden';
  }
  if (status === 429) {
    return 'rate_limited';
  }
  return 'unavailable';
}

function parseTokenResponse(payload: unknown): { accessToken: string; expiresIn: number; scope?: string } | undefined {
  if (typeof payload !== 'object' || payload === null) {
    return undefined;
  }
  const token = payload as Record<string, unknown>;
  if (
    typeof token.access_token !== 'string' ||
    !token.access_token ||
    typeof token.token_type !== 'string' ||
    token.token_type.toLowerCase() !== 'bearer' ||
    token.issued_token_type !== ACCESS_TOKEN_TYPE ||
    typeof token.expires_in !== 'number' ||
    !Number.isInteger(token.expires_in) ||
    token.expires_in <= 0 ||
    (token.scope !== undefined && (typeof token.scope !== 'string' || !token.scope))
  ) {
    return undefined;
  }
  return {
    accessToken: token.access_token,
    expiresIn: token.expires_in,
    ...(typeof token.scope === 'string' ? { scope: token.scope } : {}),
  };
}

async function cacheKey(subjectToken: string, resource: string, scopes: readonly string[]): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(subjectToken));
  const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hash}|${resource}|${[...scopes].sort().join(' ')}`;
}

export function createTokenExchange(options: TokenExchangeOptions): TokenExchange {
  if (!options.clientId || !options.clientSecret) {
    throw new ClerkMcpError('configuration', 'Clerk MCP: token exchange requires a clientId and a clientSecret.');
  }
  const request = options.fetch ?? fetch;
  const tokenEndpoint = new URL(options.tokenEndpoint).href;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const authorization = `Basic ${btoa(`${formComponent(options.clientId)}:${formComponent(options.clientSecret)}`)}`;
  const cache = options.cache === false ? undefined : new Map<string, ExchangedToken>();

  return async ({ subjectToken, resource, scopes = [] }) => {
    const start = Date.now();
    const target = targetResource(resource);
    const fail = (code: ClerkMcpError['code'], message: string, status?: number) => {
      options.telemetry?.({
        type: 'token_exchange',
        resource: target,
        durationMs: Date.now() - start,
        success: false,
        code,
        ...(status === undefined ? {} : { status }),
      });
      return new ClerkMcpError(code, message);
    };

    const requested = [...new Set(scopes.map(scope => scope.trim()).filter(Boolean))];
    const key = cache ? await cacheKey(subjectToken, target, requested) : undefined;
    const cached = key === undefined ? undefined : cache?.get(key);
    if (cached && cached.expiresAt - CACHE_SKEW_MS > Date.now()) {
      return cached;
    }

    const body = new URLSearchParams({
      grant_type: TOKEN_EXCHANGE_GRANT_TYPE,
      subject_token: subjectToken,
      subject_token_type: ACCESS_TOKEN_TYPE,
      requested_token_type: ACCESS_TOKEN_TYPE,
      resource: target,
    });
    if (requested.length) {
      body.set('scope', requested.join(' '));
    }

    let response: Response;
    try {
      response = await request(tokenEndpoint, {
        method: 'POST',
        headers: { authorization, 'content-type': 'application/x-www-form-urlencoded' },
        body,
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch {
      throw fail('unavailable', 'Token exchange request failed.');
    }

    if (!response.ok) {
      throw fail(
        exchangeErrorCode(response.status),
        `Token exchange failed with status ${response.status}.`,
        response.status,
      );
    }

    const token = parseTokenResponse(await response.json().catch(() => undefined));
    if (!token) {
      throw fail('unavailable', 'Token exchange returned a malformed token response.', response.status);
    }
    const granted = token.scope?.split(/\s+/) ?? [];
    if (requested.length && granted.some(scope => !requested.includes(scope))) {
      throw fail('unavailable', 'Token exchange granted scopes that were not requested.', response.status);
    }

    const exchanged: ExchangedToken = { ...token, expiresAt: Date.now() + token.expiresIn * 1000 };
    if (cache && key !== undefined) {
      cache.delete(key);
      if (cache.size >= MAX_CACHE_ENTRIES) {
        cache.delete(cache.keys().next().value as string);
      }
      cache.set(key, exchanged);
    }
    options.telemetry?.({ type: 'token_exchange', resource: target, durationMs: Date.now() - start, success: true });
    return exchanged;
  };
}
