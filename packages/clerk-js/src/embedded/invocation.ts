import {
  nativeListedKinds,
  type NativeResourceRoute,
  nativeUserCollections,
} from '@clerk/shared/internal/clerk-js/nativeResourceRoutes';

import { failure } from './errors';

type ReceiverFor<Route> = Route extends { kind: 'clerk' | 'billing' } ? Route : Route & { id: string };
export type EmbeddedReceiver = ReceiverFor<NativeResourceRoute>;

export interface EmbeddedInvocation {
  receiver: EmbeddedReceiver;
  method: string;
  arguments?: unknown[];
}

export interface ExpectedIdentity {
  clientId: string | null;
  sessionId: string | null;
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    failure('invalid_invocation', 'Expected an invocation object');
  }
  return value as Record<string, unknown>;
}

function keys(value: Record<string, unknown>, allowed: string[]) {
  if (Object.keys(value).some(key => !allowed.includes(key))) {
    failure('invalid_invocation', 'The invocation contains unsupported fields');
  }
}

function identifier(value: unknown): string {
  if (typeof value !== 'string' || !value) {
    failure('invalid_invocation', 'A resource ID is required');
  }
  return value;
}

function member<T extends string>(value: unknown, values: readonly T[]): value is T {
  return values.some(candidate => candidate === value);
}

function receiver(value: unknown): EmbeddedReceiver {
  const input = object(value);
  const kind = input.kind;
  switch (kind) {
    case 'clerk':
    case 'billing':
      keys(input, ['kind']);
      return { kind };
    case 'signIn':
    case 'signUp':
    case 'user':
    case 'session':
    case 'organization':
      keys(input, ['kind', 'id']);
      return { kind, id: identifier(input.id) };
    case 'userResource':
      keys(input, ['kind', 'id', 'collection']);
      if (!member(input.collection, nativeUserCollections)) {
        failure('invalid_invocation', 'Unknown user collection');
      }
      return { kind, collection: input.collection, id: identifier(input.id) };
    case 'listed':
      keys(input, ['kind', 'id', 'listedKind']);
      if (!member(input.listedKind, nativeListedKinds)) {
        failure('invalid_invocation', 'Unknown listed resource kind');
      }
      return { kind, listedKind: input.listedKind, id: identifier(input.id) };
    default:
      return failure('unknown_receiver', 'Unknown Clerk resource');
  }
}

function parseResourceInvocation(value: unknown): EmbeddedInvocation {
  const input = object(value);
  keys(input, ['receiver', 'method', 'arguments']);
  if (typeof input.method !== 'string' || !input.method) {
    failure('invalid_invocation', 'An invocation method is required');
  }
  if (input.arguments !== undefined && !Array.isArray(input.arguments)) {
    failure('invalid_invocation', 'Invocation arguments must be an array');
  }
  return { receiver: receiver(input.receiver), method: input.method, arguments: input.arguments };
}

function parseExpectedIdentity(value: unknown): ExpectedIdentity {
  const input = object(value);
  keys(input, ['clientId', 'sessionId']);
  return {
    clientId: input.clientId === null ? null : identifier(input.clientId),
    sessionId: input.sessionId === null ? null : identifier(input.sessionId),
  };
}

export function parseInvocation(value: unknown): {
  invocation: EmbeddedInvocation;
  expectedIdentities: ExpectedIdentity[];
} {
  let invocation = parseResourceInvocation(value);
  const expectedIdentities: ExpectedIdentity[] = [];
  while (invocation.receiver.kind === 'clerk' && invocation.method === 'invokeForIdentity') {
    const args = invocation.arguments;
    if (args?.length !== 2) {
      failure('invalid_invocation', 'Identity-bound operations require an invocation and an identity');
    }
    expectedIdentities.push(parseExpectedIdentity(args[1]));
    invocation = parseResourceInvocation(args[0]);
  }
  return { invocation, expectedIdentities };
}
