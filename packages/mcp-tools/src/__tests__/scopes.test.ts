import { describe, expect, it } from 'vitest';

import { missingScopes, orderScopes, requestedToolCalls, resolveToolScopes, toolScopeLookup } from '../scopes';
import { modernToolCall, toolCall } from './helpers';

const catalog = ['user:org:read', 'applications:read', 'applications:manage'];

describe('orderScopes', () => {
  it('keeps catalog order and appends unknown scopes once', () => {
    expect(orderScopes(catalog, ['applications:manage', 'custom:x', 'user:org:read', 'custom:x'])).toEqual([
      'user:org:read',
      'applications:manage',
      'custom:x',
    ]);
  });
});

describe('missingScopes', () => {
  it('lists required scopes the grant lacks without duplicates', () => {
    expect(missingScopes(['a'], ['a', 'b', 'b', 'c'])).toEqual(['b', 'c']);
  });
});

describe('resolveToolScopes', () => {
  const tools = toolScopeLookup({
    list: ['applications:read'],
    keys: (args: unknown) =>
      typeof args === 'object' && args !== null && (args as { secret?: boolean }).secret
        ? ['applications:read', 'secret:read']
        : ['applications:read'],
  });

  it('returns static scopes, argument-dependent scopes, and nothing for unknown or inherited names', () => {
    expect(resolveToolScopes(tools, 'list', undefined)).toEqual(['applications:read']);
    expect(resolveToolScopes(tools, 'keys', { secret: true })).toEqual(['applications:read', 'secret:read']);
    expect(resolveToolScopes(tools, 'keys', {})).toEqual(['applications:read']);
    expect(resolveToolScopes(tools, 'unknown', undefined)).toEqual([]);
    expect(resolveToolScopes(tools, 'constructor', undefined)).toEqual([]);
    expect(resolveToolScopes(tools, '__proto__', undefined)).toEqual([]);
  });
});

describe('requestedToolCalls', () => {
  const request = (init: { method?: string; headers?: Record<string, string> } = {}) => ({
    method: init.method ?? 'POST',
    headers: new Headers({ 'content-type': 'application/json', ...init.headers }),
  });

  it('reads tool calls from a legacy request body and from batches', () => {
    expect(requestedToolCalls(request(), toolCall('list', { a: 1 }))).toEqual([{ name: 'list', arguments: { a: 1 } }]);
    expect(requestedToolCalls(request(), [toolCall('list'), toolCall('keys', { secret: true }, 2)])).toEqual([
      { name: 'list', arguments: {} },
      { name: 'keys', arguments: { secret: true } },
    ]);
  });

  it('reads the body of a modern request rather than its routing headers', () => {
    const { headers, body } = modernToolCall('keys', { secret: true });

    expect(requestedToolCalls(request({ headers }), JSON.parse(body))).toEqual([
      { name: 'keys', arguments: { secret: true } },
    ]);
  });

  it('ignores requests without tool calls', () => {
    expect(requestedToolCalls(request({ method: 'GET' }), undefined)).toEqual([]);
    expect(requestedToolCalls(request(), { jsonrpc: '2.0', id: 1, method: 'tools/list' })).toEqual([]);
    expect(requestedToolCalls(request(), { jsonrpc: '2.0', id: 1, method: 'tools/call', params: {} })).toEqual([]);
    expect(requestedToolCalls(request(), 'not json-rpc')).toEqual([]);
  });
});
