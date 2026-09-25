import { describe, expect, it } from 'vitest';

import { ClerkMcpError } from '../errors';
import {
  clerkAuthorizationServerUrl,
  metadataResponse,
  protectedResourceMetadata,
  trimTrailingSlash,
} from '../metadata';
import { PUBLISHABLE_KEY, RESOURCE } from './helpers';

describe('clerkAuthorizationServerUrl', () => {
  it('derives the Frontend API origin from the publishable key', () => {
    expect(clerkAuthorizationServerUrl(PUBLISHABLE_KEY)).toBe('https://clerk.example.com');
  });

  it('fails loudly on an invalid key', () => {
    expect(() => clerkAuthorizationServerUrl('sk_test_nope')).toThrow(ClerkMcpError);
  });
});

describe('trimTrailingSlash', () => {
  it('removes every trailing slash and nothing else', () => {
    expect(trimTrailingSlash('https://clerk.example.com///')).toBe('https://clerk.example.com');
    expect(trimTrailingSlash(new URL('https://clerk.example.com/a/b/'))).toBe('https://clerk.example.com/a/b');
    expect(trimTrailingSlash('https://clerk.example.com')).toBe('https://clerk.example.com');
  });
});

describe('protectedResourceMetadata', () => {
  it('contains only RFC 9728 properties', () => {
    const metadata = protectedResourceMetadata({
      authorizationServerUrl: 'https://clerk.example.com',
      resource: new URL(RESOURCE),
      scopesSupported: ['user:org:read'],
    });

    expect(metadata).toEqual({
      resource: RESOURCE,
      authorization_servers: ['https://clerk.example.com'],
      bearer_methods_supported: ['header'],
      scopes_supported: ['user:org:read'],
    });
  });

  it('omits an empty scope list and lets properties override defaults', () => {
    const metadata = protectedResourceMetadata({
      authorizationServerUrl: 'https://auth.example.com',
      resource: new URL(RESOURCE),
      scopesSupported: [],
      properties: { resource_name: 'Notes', bearer_methods_supported: ['header', 'body'] },
    });

    expect(metadata).not.toHaveProperty('scopes_supported');
    expect(metadata.resource_name).toBe('Notes');
    expect(metadata.bearer_methods_supported).toEqual(['header', 'body']);
  });
});

describe('metadataResponse', () => {
  const document = { resource: RESOURCE };

  it('serves the document with CORS and caching headers', async () => {
    const response = metadataResponse(
      new Request('https://example.com/.well-known/oauth-protected-resource/mcp'),
      document,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Cache-Control')).toBe('max-age=3600');
    await expect(response.json()).resolves.toEqual(document);
  });

  it('answers preflight requests and refuses other methods', () => {
    const url = 'https://example.com/.well-known/oauth-protected-resource/mcp';

    expect(metadataResponse(new Request(url, { method: 'OPTIONS' }), document).status).toBe(204);
    const refused = metadataResponse(new Request(url, { method: 'POST' }), document);
    expect(refused.status).toBe(405);
    expect(refused.headers.get('Allow')).toBe('GET, OPTIONS');
  });
});
