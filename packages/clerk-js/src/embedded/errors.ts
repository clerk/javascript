import { NativeAuthOperationError } from './nativeAuth';
import type { EmbeddedError } from './types';

export function failure(code: string, message: string): never {
  throw Object.assign(new Error(message), { kind: 'resolution', code, errors: [] });
}

export class EmbeddedInvocationError extends Error {
  constructor(readonly envelope: EmbeddedError) {
    super(envelope.message);
  }

  toString() {
    return JSON.stringify(this.envelope);
  }
}

export function errorEnvelope(error: any): EmbeddedError {
  if (error instanceof EmbeddedInvocationError) {
    return error.envelope;
  }
  if (error instanceof NativeAuthOperationError) {
    return { ...errorEnvelope(error.cause), stage: error.stage };
  }
  if (error?.kind && Array.isArray(error.errors)) {
    return { ...error, message: error.message };
  }
  const errors = Array.isArray(error?.errors) ? error.errors : [];
  const code = errors[0]?.code || error?.code;
  return {
    kind: errors.length
      ? 'api'
      : code === 'network_error' || error?.name === 'ClerkOfflineError'
        ? 'offline'
        : 'javascript',
    code,
    message: errors[0]?.longMessage || errors[0]?.long_message || errors[0]?.message || error?.message || String(error),
    errors,
    nativeError: error?.nativeError,
    status: error?.status,
    clerkTraceId: error?.clerkTraceId || error?.clerk_trace_id,
  };
}
