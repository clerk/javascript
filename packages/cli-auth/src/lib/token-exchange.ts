import { ClerkCliAuthError } from '../errors';
import type { TokenSet, UserInfo } from '../types';
import { request } from './http';

export interface ExchangeParams {
  issuer: string;
  clientId: string;
  code: string;
  codeVerifier: string;
  redirectUri: string;
  timeoutMs?: number;
}

export interface RefreshParams {
  issuer: string;
  clientId: string;
  refreshToken: string;
  scopes?: string[];
  timeoutMs?: number;
}

export interface UserInfoParams {
  issuer: string;
  accessToken: string;
  timeoutMs?: number;
}

export interface RevokeParams {
  issuer: string;
  clientId: string;
  token: string;
  tokenTypeHint?: 'access_token' | 'refresh_token';
  timeoutMs?: number;
}

interface OAuthTokenResponse {
  access_token?: unknown;
  refresh_token?: unknown;
  id_token?: unknown;
  expires_in?: unknown;
  scope?: unknown;
  token_type?: unknown;
}

function endpoint(issuer: string, path: string): string {
  return `${issuer.replace(/\/+$/, '')}${path}`;
}

function mapTokenResponse(data: OAuthTokenResponse): TokenSet {
  if (typeof data.access_token !== 'string' || data.access_token.length === 0) {
    throw new ClerkCliAuthError('token_exchange', 'Token response did not include access_token.');
  }

  const tokenSet: TokenSet = {
    accessToken: data.access_token,
  };

  if (typeof data.refresh_token === 'string') {
    tokenSet.refreshToken = data.refresh_token;
  }
  if (typeof data.id_token === 'string') {
    tokenSet.idToken = data.id_token;
  }
  if (typeof data.scope === 'string') {
    tokenSet.scope = data.scope;
  }
  if (typeof data.token_type === 'string') {
    tokenSet.tokenType = data.token_type;
  }
  if (typeof data.expires_in === 'number') {
    tokenSet.expiresAt = Date.now() + data.expires_in * 1000;
  }

  return tokenSet;
}

async function requestTokens(issuer: string, body: URLSearchParams, timeoutMs?: number): Promise<TokenSet> {
  const { body: parsed } = await request(endpoint(issuer, '/oauth/token'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    errorCode: 'token_exchange',
    timeoutMs,
  });

  if (!parsed || typeof parsed !== 'object') {
    throw new ClerkCliAuthError('token_exchange', 'Token response was not JSON.');
  }

  return mapTokenResponse(parsed as OAuthTokenResponse);
}

export async function exchangeCodeForTokens(params: ExchangeParams): Promise<TokenSet> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: params.clientId,
    code: params.code,
    code_verifier: params.codeVerifier,
    redirect_uri: params.redirectUri,
  });

  return requestTokens(params.issuer, body, params.timeoutMs);
}

export async function refreshAccessToken(params: RefreshParams): Promise<TokenSet> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: params.clientId,
    refresh_token: params.refreshToken,
  });

  if (params.scopes?.length) {
    body.set('scope', params.scopes.join(' '));
  }

  return requestTokens(params.issuer, body, params.timeoutMs);
}

export async function revokeToken(params: RevokeParams): Promise<void> {
  const body = new URLSearchParams({
    client_id: params.clientId,
    token: params.token,
  });
  if (params.tokenTypeHint) {
    body.set('token_type_hint', params.tokenTypeHint);
  }

  await request(endpoint(params.issuer, '/oauth/token/revoke'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    errorCode: 'revoke',
    timeoutMs: params.timeoutMs,
  });
}

export async function fetchUserInfo(params: UserInfoParams): Promise<UserInfo> {
  const { body: parsed } = await request(endpoint(params.issuer, '/oauth/userinfo'), {
    headers: { Authorization: `Bearer ${params.accessToken}` },
    errorCode: 'userinfo',
    timeoutMs: params.timeoutMs,
  });

  if (!parsed || typeof parsed !== 'object') {
    throw new ClerkCliAuthError('userinfo', 'Userinfo response was not JSON.');
  }

  const user = parsed as UserInfo;
  if (typeof user.sub !== 'string' || user.sub.length === 0) {
    throw new ClerkCliAuthError('userinfo', 'Userinfo response did not include sub.');
  }

  return user;
}
