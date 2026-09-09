import { getPasskeyFailureStage, type PasskeyFailureStage } from '../../clerk-js/src/utils/passkeyFailureStage.ts';

export type JSONValue = null | boolean | number | string | JSONValue[] | { [key: string]: JSONValue };
export type Handle = { id: string; generation: number; type: string };
export type Failure = {
  kind: 'clerk' | 'rejection' | 'bridge' | 'cancelled';
  code: string;
  message: string;
  passkeyStage?: PasskeyFailureStage;
  status?: number;
  retryAfter?: number;
  clerkTraceId?: string;
  errors?: { code: string; message: string; longMessage?: string; meta?: Record<string, JSONValue> }[];
};
export type Projection = { handle: Handle; state: Record<string, JSONValue> };
export type State = {
  epoch: number;
  revision: number;
  roots: Record<string, Handle | null>;
  resources: Projection[];
  invalidated: Handle[];
};
export type Invocation = { kind: 'invoke'; id: string; operation: string; target: Handle; args: JSONValue[] };
export type Completion = { kind: 'complete'; id: string; state: State; result?: JSONValue; failure?: Failure };

const safeMetadata = new Set(['paramName', 'sessionId', 'identifier', 'strategy', 'totalCount']);

export function failure(error: unknown, kind: Failure['kind'] = 'rejection'): Failure {
  const value = error && typeof error === 'object' ? (error as Record<string, unknown>) : {};
  if (kind === 'rejection' && value.__clerkBridgeError === true) kind = 'bridge';
  const code = typeof value.code === 'string' ? value.code : kind === 'bridge' ? 'bridge_failure' : 'operation_failed';
  const errors = Array.isArray(value.errors)
    ? value.errors.map(item => {
        const meta =
          item.meta && typeof item.meta === 'object'
            ? Object.fromEntries(
                Object.entries(item.meta).filter(
                  ([key, val]) => safeMetadata.has(key) && ['string', 'number', 'boolean'].includes(typeof val),
                ),
              )
            : undefined;
        return {
          code: String(item.code || code),
          message: String(item.message || 'The operation failed.'),
          ...(typeof item.longMessage === 'string' ? { longMessage: item.longMessage } : {}),
          ...(meta ? { meta: meta as Record<string, JSONValue> } : {}),
        };
      })
    : undefined;
  return {
    kind,
    code,
    message:
      kind === 'clerk' && typeof value.message === 'string' ? value.message : 'The operation could not be completed.',
    ...(errors ? { errors } : {}),
    ...(typeof value.status === 'number' && Number.isInteger(value.status) && value.status >= 100 && value.status <= 599
      ? { status: value.status }
      : {}),
    ...(typeof value.retryAfter === 'number' && Number.isFinite(value.retryAfter) && value.retryAfter >= 0
      ? { retryAfter: value.retryAfter }
      : {}),
    ...(typeof value.clerkTraceId === 'string' ? { clerkTraceId: value.clerkTraceId } : {}),
    ...(getPasskeyFailureStage(error) ? { passkeyStage: getPasskeyFailureStage(error) } : {}),
  };
}

export function bridgeError(code: string): Error {
  return Object.assign(new Error(code), { code, __clerkBridgeError: true });
}
