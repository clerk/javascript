import { bridgeError, type JSONValue } from './protocol.ts';

declare global {
  var __clerkNativeEmit: (json: string) => void;
  var __clerkNativeRandom: (length: number) => string;
}

let sequence = 0;
let closed = false;
const pending = new Map<
  string,
  { capability: string; resolve: (value: any) => void; reject: (error: Error) => void }
>();

export function emit(value: unknown): void {
  globalThis.__clerkNativeEmit(JSON.stringify(value));
}

export function hostRequest<T>(capability: string, args: JSONValue, signal?: AbortSignal): Promise<T> {
  if (closed) return Promise.reject(bridgeError('runtime_disposed'));
  if (signal?.aborted) return Promise.reject(signal.reason);
  const id = `h${++sequence}`;
  return new Promise((resolve, reject) => {
    const abort = () => {
      if (!pending.delete(id)) return;
      emit({ kind: 'hostCancel', id });
      reject(signal?.reason || bridgeError('host_cancelled'));
    };
    const cleanup = () => signal?.removeEventListener('abort', abort);
    pending.set(id, {
      capability,
      resolve: value => {
        cleanup();
        resolve(value);
      },
      reject: error => {
        cleanup();
        reject(error);
      },
    });
    signal?.addEventListener('abort', abort, { once: true });
    emit({ kind: 'hostRequest', id, capability, args });
  });
}

export function hostReply(reply: { id: string; result?: JSONValue; error?: { code: string } }): void {
  const callback = pending.get(reply.id);
  if (!callback) return;
  pending.delete(reply.id);
  if (reply.error) callback.reject(bridgeError(reply.error.code));
  else callback.resolve(reply.result);
}

export function disposeHost(): void {
  closed = true;
  for (const [id, callback] of pending) {
    emit({ kind: 'hostCancel', id });
    callback.reject(bridgeError('runtime_disposed'));
  }
  pending.clear();
}

export function cancelCapabilities(capabilities: string[]): void {
  for (const [id, callback] of pending) {
    if (!capabilities.includes(callback.capability)) continue;
    pending.delete(id);
    emit({ kind: 'hostCancel', id });
    callback.reject(bridgeError('stale_authentication_attempt'));
  }
}
