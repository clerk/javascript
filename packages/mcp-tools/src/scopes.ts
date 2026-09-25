import { classifyInboundRequest } from '@modelcontextprotocol/server';

export type ToolScopes = readonly string[] | ((args: unknown) => readonly string[]);
export type ToolScopeMap = Readonly<Record<string, ToolScopes>>;
export type ToolCall = { name: string; arguments?: unknown };

const SCOPE_TOKEN = /^[\x21\x23-\x5B\x5D-\x7E]+$/;

export function isScopeToken(scope: string): boolean {
  return SCOPE_TOKEN.test(scope);
}

// Tool names arrive in untrusted request bodies, so they are looked up in a Map and never on an object.
export function toolScopeLookup(tools: ToolScopeMap): ReadonlyMap<string, ToolScopes> {
  return new Map(Object.entries(tools));
}

export function resolveToolScopes(
  tools: ReadonlyMap<string, ToolScopes>,
  name: string,
  args: unknown,
): readonly string[] {
  if (!tools.has(name)) {
    return [];
  }
  const scopes = tools.get(name);
  return typeof scopes === 'function' ? scopes(args) : (scopes ?? []);
}

export function orderScopes(catalog: readonly string[], scopes: Iterable<string>): string[] {
  const wanted = new Set(scopes);
  const ordered = catalog.filter(scope => wanted.has(scope));
  for (const scope of wanted) {
    if (!catalog.includes(scope)) {
      ordered.push(scope);
    }
  }
  return ordered;
}

export function missingScopes(granted: readonly string[], required: readonly string[]): string[] {
  return [...new Set(required.filter(scope => !granted.includes(scope)))];
}

export function requestedToolCalls(request: { method: string; headers: Headers }, body: unknown): ToolCall[] {
  const classification = classifyInboundRequest({
    httpMethod: request.method,
    protocolVersionHeader: request.headers.get('mcp-protocol-version') ?? undefined,
    mcpMethodHeader: request.headers.get('mcp-method') ?? undefined,
    mcpNameHeader: request.headers.get('mcp-name') ?? undefined,
    body,
  });
  if (classification.kind === 'reject') {
    return [];
  }
  const messages = Array.isArray(body) ? body : [classification.kind === 'modern' ? classification.message : body];
  return messages.flatMap(message => {
    const call = toolCall(message);
    return call ? [call] : [];
  });
}

function toolCall(message: unknown): ToolCall | undefined {
  if (typeof message !== 'object' || message === null) {
    return undefined;
  }
  const { method, params } = message as { method?: unknown; params?: unknown };
  if (method !== 'tools/call' || typeof params !== 'object' || params === null) {
    return undefined;
  }
  const { name, arguments: args } = params as { name?: unknown; arguments?: unknown };
  return typeof name === 'string' ? { name, arguments: args } : undefined;
}
