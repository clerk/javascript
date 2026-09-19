import type { AuthInfo } from '@modelcontextprotocol/server';

export const PUBLISHABLE_KEY = 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k';
export const RESOURCE = 'https://example.com/mcp';
export const RESOURCE_METADATA_URL = 'https://example.com/.well-known/oauth-protected-resource/mcp';

export function jwt(payload: Record<string, unknown>): string {
  const encode = (value: unknown) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${encode({ alg: 'RS256', typ: 'at+jwt', kid: 'ins_123' })}.${encode(payload)}.${encode('signature')}`;
}

export function authInfoFor(overrides: Partial<AuthInfo> = {}): AuthInfo {
  return {
    token: 'mcp-access-token',
    clientId: 'client_123',
    scopes: ['user:org:read', 'applications:read'],
    expiresAt: Math.floor(Date.now() / 1000) + 3600,
    resource: new URL(RESOURCE),
    extra: { userId: 'user_123' },
    ...overrides,
  };
}

export function toolCall(name: string, args: Record<string, unknown> = {}, id = 1) {
  return { jsonrpc: '2.0', id, method: 'tools/call', params: { name, arguments: args } };
}

export function legacyInitialize() {
  return {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'test-client', version: '1.0.0' },
    },
  };
}

export function modernToolCall(name: string, args: Record<string, unknown> = {}) {
  return {
    headers: {
      Accept: 'application/json, text/event-stream',
      'Content-Type': 'application/json',
      'MCP-Protocol-Version': '2026-07-28',
      'Mcp-Method': 'tools/call',
      'Mcp-Name': name,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name,
        arguments: args,
        _meta: {
          'io.modelcontextprotocol/protocolVersion': '2026-07-28',
          'io.modelcontextprotocol/clientInfo': { name: 'vitest', version: '1.0.0' },
          'io.modelcontextprotocol/clientCapabilities': {},
        },
      },
    }),
  };
}
