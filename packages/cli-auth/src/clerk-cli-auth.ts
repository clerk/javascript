import { spawn } from 'node:child_process';

import { ClerkCliAuthError } from './errors';
import { startAuthServer } from './lib/auth-server';
import { createCredentialStore } from './lib/credential-store';
import { generateCodeChallenge, generateCodeVerifier, generateState } from './lib/pkce';
import { exchangeCodeForTokens, fetchIdentity, refreshAccessToken, revokeToken } from './lib/token-exchange';
import { verifyToken as verifyTokenRequest } from './lib/verify-token';
import type {
  ClerkCliAuthConfig,
  CredentialStore,
  Identity,
  LoginResult,
  OAuthScope,
  TokenSet,
  TokenSource,
  UserIdentity,
} from './types';

const DEFAULT_SCOPES: OAuthScope[] = ['profile', 'email', 'openid', 'offline_access'];

function normalizeIssuer(issuer: string): string {
  const normalized = issuer.trim().replace(/\/+$/, '');
  try {
    const url = new URL(normalized);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('issuer must use http or https');
    }
    return normalized;
  } catch (error) {
    throw new ClerkCliAuthError('config', `issuer must be a valid URL: ${(error as Error).message}`);
  }
}

function storageError(operation: string, error: unknown): ClerkCliAuthError {
  if (error instanceof ClerkCliAuthError) {
    return error;
  }
  const detail = error instanceof Error ? error.message : String(error);
  return new ClerkCliAuthError('storage', `Failed to ${operation}: ${detail}`);
}

async function openBrowserFallback(url: string): Promise<void> {
  console.log(`Open this URL to sign in:\n${url}`);

  const platform = process.platform;
  const command = platform === 'darwin' ? 'open' : platform === 'win32' ? 'cmd' : 'xdg-open';
  const args = platform === 'win32' ? ['/c', 'start', '', url] : [url];

  await new Promise<void>(resolve => {
    const child = spawn(command, args, { detached: true, stdio: 'ignore' });
    child.once('error', () => resolve());
    child.unref();
    resolve();
  });
}

export class ClerkCliAuth {
  private readonly config: Required<
    Omit<ClerkCliAuthConfig, 'openBrowser' | 'storage' | 'identityEndpoint' | 'tokenEnvVar'>
  > & {
    storage: CredentialStore;
    openBrowser?: (url: string) => Promise<void>;
    identityEndpoint?: string;
    tokenEnvVar?: string;
  };

  constructor(config: ClerkCliAuthConfig) {
    if (!config.clientId) {
      throw new ClerkCliAuthError('config', 'clientId is required');
    }
    if (!config.issuer) {
      throw new ClerkCliAuthError('config', 'issuer is required');
    }

    const environment = config.environment ?? 'default';
    const storage =
      typeof config.storage === 'object' && config.storage !== null
        ? config.storage
        : createCredentialStore(config.storage ?? 'keychain', {
            environment,
            keychainService: config.keychainService,
          });

    this.config = {
      clientId: config.clientId,
      issuer: normalizeIssuer(config.issuer),
      scopes: config.scopes ?? DEFAULT_SCOPES,
      storage,
      keychainService: config.keychainService ?? 'clerk-cli-auth',
      environment,
      callbackPort: config.callbackPort ?? 0,
      loginTimeoutMs: config.loginTimeoutMs ?? 120_000,
      requestTimeoutMs: config.requestTimeoutMs ?? 30_000,
      openBrowser: config.openBrowser,
      identityEndpoint: config.identityEndpoint,
      tokenEnvVar: config.tokenEnvVar,
    };
  }

  async login(): Promise<LoginResult> {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();

    const server = await startAuthServer({
      expectedState: state,
      port: this.config.callbackPort,
      timeoutMs: this.config.loginTimeoutMs,
    });

    try {
      const authorizeUrl = new URL(`${this.config.issuer}/oauth/authorize`);
      authorizeUrl.searchParams.set('response_type', 'code');
      authorizeUrl.searchParams.set('client_id', this.config.clientId);
      authorizeUrl.searchParams.set('redirect_uri', server.redirectUri);
      authorizeUrl.searchParams.set('scope', this.config.scopes.join(' '));
      authorizeUrl.searchParams.set('state', state);
      authorizeUrl.searchParams.set('code_challenge', codeChallenge);
      authorizeUrl.searchParams.set('code_challenge_method', 'S256');

      try {
        await (this.config.openBrowser ?? openBrowserFallback)(authorizeUrl.toString());
      } catch (error) {
        throw new ClerkCliAuthError('config', `Failed to open authorization URL: ${(error as Error).message}`);
      }

      const { code } = await server.waitForCallback();
      const tokens = await exchangeCodeForTokens({
        issuer: this.config.issuer,
        clientId: this.config.clientId,
        code,
        codeVerifier,
        redirectUri: server.redirectUri,
        timeoutMs: this.config.requestTimeoutMs,
      });

      await this.setJson('tokens', tokens);
      const user = await fetchIdentity({
        issuer: this.config.issuer,
        accessToken: tokens.accessToken,
        timeoutMs: this.config.requestTimeoutMs,
      });

      return { tokens, user };
    } finally {
      server.close();
    }
  }

  async getAccessToken(): Promise<string | null> {
    const tokens = await this.getTokenSet();
    if (!tokens) {
      return null;
    }

    const expiresAt = tokens.expiresAt ?? Number.POSITIVE_INFINITY;
    if (expiresAt >= Date.now() + 30_000) {
      return tokens.accessToken;
    }

    if (!tokens.refreshToken) {
      return null;
    }

    const refreshed = await refreshAccessToken({
      issuer: this.config.issuer,
      clientId: this.config.clientId,
      refreshToken: tokens.refreshToken,
      scopes: this.config.scopes,
      timeoutMs: this.config.requestTimeoutMs,
    });
    const nextTokens = {
      ...tokens,
      ...refreshed,
      refreshToken: refreshed.refreshToken ?? tokens.refreshToken,
    };
    await this.setJson('tokens', nextTokens);
    return nextTokens.accessToken;
  }

  async whoami(): Promise<UserIdentity | null> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      return null;
    }

    return fetchIdentity({
      issuer: this.config.issuer,
      accessToken,
      timeoutMs: this.config.requestTimeoutMs,
    });
  }

  async verifyToken(token: string): Promise<Identity> {
    if (!this.config.identityEndpoint) {
      throw new ClerkCliAuthError('config', 'identityEndpoint is not configured.');
    }
    return verifyTokenRequest({
      endpoint: this.config.identityEndpoint,
      token,
      timeoutMs: this.config.requestTimeoutMs,
    });
  }

  /**
   * Pick the credential the CLI should send. Returns the token plus where it came from,
   * which lets callers branch on the *trust model* (refreshable OAuth vs. user-supplied
   * env/arg) instead of having to introspect the bearer's shape.
   *
   * Resolution order: `tokenFromArg` → `tokenEnvVar` env var → cached OAuth session.
   */
  async resolveToken(opts: { tokenFromArg?: string } = {}): Promise<{ token: string; source: TokenSource }> {
    if (opts.tokenFromArg) {
      return { token: opts.tokenFromArg, source: 'arg' };
    }
    if (this.config.tokenEnvVar) {
      const fromEnv = process.env[this.config.tokenEnvVar];
      if (fromEnv) {
        return { token: fromEnv, source: 'env' };
      }
    }
    const accessToken = await this.getAccessToken();
    if (accessToken) {
      return { token: accessToken, source: 'oauth' };
    }

    const envHint = this.config.tokenEnvVar ? ` or set $${this.config.tokenEnvVar}` : '';
    throw new ClerkCliAuthError('not_authenticated', `Not logged in. Run \`auth login\`${envHint}.`);
  }

  async logout(options: { revoke?: boolean } = {}): Promise<void> {
    const shouldRevoke = options.revoke ?? true;
    if (shouldRevoke) {
      const tokens = await this.getTokenSet().catch(() => null);
      const token = tokens?.refreshToken ?? tokens?.accessToken;
      if (tokens && token) {
        try {
          await revokeToken({
            issuer: this.config.issuer,
            clientId: this.config.clientId,
            token,
            tokenTypeHint: tokens.refreshToken ? 'refresh_token' : 'access_token',
            timeoutMs: this.config.requestTimeoutMs,
          });
        } catch {
          // Revoke is best-effort — local cleanup proceeds regardless.
        }
      }
    }

    try {
      await this.config.storage.delete('tokens');
    } catch (error) {
      throw storageError('clear stored credentials', error);
    }
  }

  async getTokenSet(): Promise<TokenSet | null> {
    return this.getJson<TokenSet>('tokens');
  }

  private async getJson<T>(key: string): Promise<T | null> {
    let raw: string | null;
    try {
      raw = await this.config.storage.get(key);
    } catch (error) {
      throw storageError(`read ${key}`, error);
    }
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      throw storageError(`parse stored ${key}`, error);
    }
  }

  private async setJson(key: string, value: unknown): Promise<void> {
    try {
      await this.config.storage.set(key, JSON.stringify(value));
    } catch (error) {
      throw storageError(`write ${key}`, error);
    }
  }
}
