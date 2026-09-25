import { parsePublishableKey } from '@clerk/shared/keys';

import { ClerkMcpError } from './errors';

export type ProtectedResourceMetadata = {
  resource: string;
  authorization_servers: string[];
  bearer_methods_supported: string[];
  scopes_supported?: string[];
  [property: string]: unknown;
};

const AUTHORIZATION_SERVER_METADATA_TTL_MS = 3_600_000;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
};

export function trimTrailingSlash(url: string | URL): string {
  let value = String(url);
  while (value.endsWith('/')) {
    value = value.slice(0, -1);
  }
  return value;
}

export function clerkAuthorizationServerUrl(publishableKey: string): string {
  const key = parsePublishableKey(publishableKey);
  if (!key) {
    throw new ClerkMcpError(
      'configuration',
      'Clerk MCP: invalid publishable key. Expected a key starting with pk_test_ or pk_live_.',
    );
  }
  return `https://${key.frontendApi}`;
}

export function protectedResourceMetadata({
  authorizationServerUrl,
  resource,
  scopesSupported,
  properties,
}: {
  authorizationServerUrl: string;
  resource: URL;
  scopesSupported: readonly string[];
  properties?: Record<string, unknown>;
}): ProtectedResourceMetadata {
  return {
    resource: resource.href,
    authorization_servers: [authorizationServerUrl],
    bearer_methods_supported: ['header'],
    ...(scopesSupported.length ? { scopes_supported: [...scopesSupported] } : {}),
    ...properties,
  };
}

function refuseMethod(request: Request): Response | undefined {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(null, { status: 405, headers: { ...CORS_HEADERS, Allow: 'GET, OPTIONS' } });
  }
  return undefined;
}

export function metadataResponse(request: Request, document: unknown): Response {
  return (
    refuseMethod(request) ?? Response.json(document, { headers: { ...CORS_HEADERS, 'Cache-Control': 'max-age=3600' } })
  );
}

// Clients that predate protected resource metadata look for this document on the MCP server's own origin.
// It is relayed from the authorization server so that it never drifts from the instance's real settings.
export function authorizationServerMetadataHandler(
  authorizationServerUrl: () => string,
): (request: Request) => Promise<Response> {
  let cached: { document: unknown; expiresAt: number } | undefined;

  return async request => {
    const refused = refuseMethod(request);
    if (refused) {
      return refused;
    }
    if (!cached || cached.expiresAt <= Date.now()) {
      try {
        const response = await fetch(`${authorizationServerUrl()}/.well-known/oauth-authorization-server`);
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        cached = { document: await response.json(), expiresAt: Date.now() + AUTHORIZATION_SERVER_METADATA_TTL_MS };
      } catch {
        if (!cached) {
          return Response.json(
            { error: 'temporarily_unavailable' },
            { status: 502, headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store' } },
          );
        }
      }
    }
    return metadataResponse(request, cached.document);
  };
}
