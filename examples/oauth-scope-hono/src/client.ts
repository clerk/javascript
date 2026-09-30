import 'dotenv/config';

import { spawn } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { createServer, type Server, type ServerResponse } from 'node:http';

type OAuthEndpoints = {
  authorizationEndpoint: string;
  tokenEndpoint: string;
};

type CallbackServer = {
  authorizationCode: Promise<string>;
  close: () => Promise<void>;
};

const requiredEnv = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}. Copy .env.example to .env and configure it.`);
  }
  return value;
};

const optionalEnv = (name: string): string | undefined => process.env[name]?.trim() || undefined;

const metadataUrlForIssuer = (issuer: string): string => {
  const url = new URL(issuer);
  const issuerPath = url.pathname.replace(/\/+$/, '');
  url.pathname = `/.well-known/oauth-authorization-server${issuerPath === '/' ? '' : issuerPath}`;
  url.search = '';
  url.hash = '';
  return url.toString();
};

const resolveOAuthEndpoints = async (): Promise<OAuthEndpoints> => {
  const configuredAuthorizationEndpoint = optionalEnv('OAUTH_AUTHORIZE_URL');
  const configuredTokenEndpoint = optionalEnv('OAUTH_TOKEN_URL');

  if (configuredAuthorizationEndpoint && configuredTokenEndpoint) {
    return {
      authorizationEndpoint: new URL(configuredAuthorizationEndpoint).toString(),
      tokenEndpoint: new URL(configuredTokenEndpoint).toString(),
    };
  }

  const issuer = requiredEnv('OAUTH_ISSUER_URL');
  const metadataUrl = optionalEnv('OAUTH_DISCOVERY_URL') || metadataUrlForIssuer(issuer);
  const response = await fetch(metadataUrl, { headers: { Accept: 'application/json' } });

  if (!response.ok) {
    throw new Error(`OAuth metadata request failed (${response.status}) at ${metadataUrl}`);
  }

  const metadata = (await response.json()) as Record<string, unknown>;
  const discoveredAuthorizationEndpoint = metadata.authorization_endpoint;
  const discoveredTokenEndpoint = metadata.token_endpoint;
  const authorizationEndpoint = configuredAuthorizationEndpoint || discoveredAuthorizationEndpoint;
  const tokenEndpoint = configuredTokenEndpoint || discoveredTokenEndpoint;

  if (typeof authorizationEndpoint !== 'string' || typeof tokenEndpoint !== 'string') {
    throw new Error('OAuth metadata must contain authorization_endpoint and token_endpoint.');
  }

  return {
    authorizationEndpoint: new URL(authorizationEndpoint).toString(),
    tokenEndpoint: new URL(tokenEndpoint).toString(),
  };
};

const isLoopbackHostname = (hostname: string): boolean =>
  hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '::1' || hostname === '[::1]';

const writeCallbackResponse = (response: ServerResponse, status: number, message: string): void => {
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    Connection: 'close',
    'Content-Type': 'text/plain; charset=utf-8',
  });
  response.end(message);
};

const startCallbackServer = async (redirectUri: string, expectedState: string): Promise<CallbackServer> => {
  const callbackUrl = new URL(redirectUri);
  if (callbackUrl.protocol !== 'http:' || !isLoopbackHostname(callbackUrl.hostname) || !callbackUrl.port) {
    throw new Error('OAUTH_REDIRECT_URI must be an http loopback URL with an explicit port.');
  }

  let resolveCode!: (code: string) => void;
  let rejectCode!: (error: Error) => void;
  const authorizationCode = new Promise<string>((resolve, reject) => {
    resolveCode = resolve;
    rejectCode = reject;
  });

  const server = createServer((request, response) => {
    const requestUrl = new URL(request.url || '/', callbackUrl.origin);
    if (requestUrl.pathname !== callbackUrl.pathname) {
      writeCallbackResponse(response, 404, 'Not found');
      return;
    }

    if (requestUrl.searchParams.get('state') !== expectedState) {
      writeCallbackResponse(response, 400, 'OAuth state mismatch. Return to the terminal and retry.');
      return;
    }

    const oauthError = requestUrl.searchParams.get('error');
    if (oauthError) {
      const description = requestUrl.searchParams.get('error_description');
      writeCallbackResponse(response, 400, 'OAuth authorization failed. Return to the terminal.');
      rejectCode(new Error(`${oauthError}${description ? `: ${description}` : ''}`));
      return;
    }

    const code = requestUrl.searchParams.get('code');
    if (!code) {
      writeCallbackResponse(response, 400, 'Missing OAuth authorization code.');
      return;
    }

    writeCallbackResponse(response, 200, 'Authorization complete. You can close this tab.');
    resolveCode(code);
  });

  const timeoutMs = Number(optionalEnv('OAUTH_CALLBACK_TIMEOUT_MS') || '300000');
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error('OAUTH_CALLBACK_TIMEOUT_MS must be a positive number.');
  }

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(Number(callbackUrl.port), callbackUrl.hostname, () => {
      server.off('error', reject);
      resolve();
    });
  });

  const timeout = setTimeout(() => rejectCode(new Error('Timed out waiting for the OAuth callback.')), timeoutMs);
  timeout.unref();

  return {
    authorizationCode: authorizationCode.finally(() => clearTimeout(timeout)),
    close: () => closeServer(server),
  };
};

const closeServer = async (server: Server): Promise<void> => {
  if (!server.listening) {
    return;
  }
  await new Promise<void>((resolve, reject) => {
    server.close(error => (error ? reject(error) : resolve()));
  });
};

const openBrowser = (url: string): void => {
  const command =
    process.platform === 'darwin'
      ? { executable: 'open', args: [url] }
      : process.platform === 'win32'
        ? { executable: 'cmd', args: ['/c', 'start', '', url] }
        : { executable: 'xdg-open', args: [url] };

  const child = spawn(command.executable, command.args, { detached: true, stdio: 'ignore' });
  child.once('error', () => {
    console.error('Could not open a browser automatically. Open the printed URL manually.');
  });
  child.unref();
};

const exchangeCode = async (
  tokenEndpoint: string,
  code: string,
  codeVerifier: string,
): Promise<Record<string, unknown> & { access_token: string }> => {
  const clientId = requiredEnv('OAUTH_CLIENT_ID');
  const clientSecret = optionalEnv('OAUTH_CLIENT_SECRET');
  const clientAuthMethod = optionalEnv('OAUTH_CLIENT_AUTH_METHOD') || (clientSecret ? 'client_secret_post' : 'none');
  const parameters = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: requiredEnv('OAUTH_REDIRECT_URI'),
    client_id: clientId,
    code_verifier: codeVerifier,
  });
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  if (clientAuthMethod === 'client_secret_post') {
    if (!clientSecret) {
      throw new Error('OAUTH_CLIENT_SECRET is required for client_secret_post.');
    }
    parameters.set('client_secret', clientSecret);
  } else if (clientAuthMethod === 'client_secret_basic') {
    if (!clientSecret) {
      throw new Error('OAUTH_CLIENT_SECRET is required for client_secret_basic.');
    }
    headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
  } else if (clientAuthMethod !== 'none') {
    throw new Error('OAUTH_CLIENT_AUTH_METHOD must be client_secret_post, client_secret_basic, or none.');
  }

  const response = await fetch(tokenEndpoint, { method: 'POST', headers, body: parameters });
  const bodyText = await response.text();
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(bodyText) as Record<string, unknown>;
  } catch {
    throw new Error(`Token endpoint returned non-JSON (${response.status}): ${bodyText}`);
  }

  if (!response.ok || typeof body.access_token !== 'string') {
    throw new Error(`Token exchange failed (${response.status}): ${JSON.stringify(body)}`);
  }

  return body as Record<string, unknown> & { access_token: string };
};

const printResponseBody = (body: string): void => {
  try {
    console.log(JSON.stringify(JSON.parse(body), null, 2));
  } catch {
    console.log(body);
  }
};

const main = async (): Promise<void> => {
  const clientId = requiredEnv('OAUTH_CLIENT_ID');
  const redirectUri = requiredEnv('OAUTH_REDIRECT_URI');
  const requestedScope = requiredEnv('OAUTH_SCOPE');
  const resourceServerUrl = requiredEnv('RESOURCE_SERVER_URL');
  const { authorizationEndpoint, tokenEndpoint } = await resolveOAuthEndpoints();
  const state = randomBytes(24).toString('base64url');
  const codeVerifier = randomBytes(32).toString('base64url');
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');
  const authorizationUrl = new URL(authorizationEndpoint);

  authorizationUrl.searchParams.set('client_id', clientId);
  authorizationUrl.searchParams.set('redirect_uri', redirectUri);
  authorizationUrl.searchParams.set('response_type', 'code');
  authorizationUrl.searchParams.set('scope', requestedScope);
  authorizationUrl.searchParams.set('state', state);
  authorizationUrl.searchParams.set('code_challenge', codeChallenge);
  authorizationUrl.searchParams.set('code_challenge_method', 'S256');

  const callbackServer = await startCallbackServer(redirectUri, state);
  console.log(`\nAuthorize this client:\n${authorizationUrl.toString()}\n`);

  const shouldOpenBrowser = !process.argv.includes('--no-open') && optionalEnv('OAUTH_OPEN_BROWSER') !== 'false';
  if (shouldOpenBrowser) {
    openBrowser(authorizationUrl.toString());
  }

  let code: string;
  try {
    code = await callbackServer.authorizationCode;
  } finally {
    await callbackServer.close();
  }

  const tokenResponse = await exchangeCode(tokenEndpoint, code, codeVerifier);
  const accessTokenIsJwt = tokenResponse.access_token.split('.').length === 3;
  const expectJwtAccessToken = optionalEnv('OAUTH_EXPECT_JWT_ACCESS_TOKEN') !== 'false';
  if (expectJwtAccessToken && !accessTokenIsJwt) {
    throw new Error(
      'Expected a JWT access token. Enable oauth_jwt_access_tokens for the local Clerk instance or set OAUTH_EXPECT_JWT_ACCESS_TOKEN=false.',
    );
  }

  console.log('OAuth access token obtained.');
  console.log(`Access token format: ${accessTokenIsJwt ? 'JWT' : 'opaque'}`);
  console.log(
    `Granted scope: ${typeof tokenResponse.scope === 'string' ? tokenResponse.scope : '(token response omitted scope)'}`,
  );

  if (process.argv.includes('--print-token')) {
    console.log(`Access token: ${tokenResponse.access_token}`);
  }

  const resourceResponse = await fetch(resourceServerUrl, {
    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
  });
  const resourceBody = await resourceResponse.text();
  console.log(`\nResource server response: ${resourceResponse.status} ${resourceResponse.statusText}`);
  printResponseBody(resourceBody);

  if (!resourceResponse.ok) {
    process.exitCode = 1;
  }
};

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
