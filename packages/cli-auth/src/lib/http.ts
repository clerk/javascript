import { ClerkCliAuthError, type ErrorCode } from '../errors';

export interface RequestOptions extends Omit<RequestInit, 'signal'> {
  /** Error code to attach when the request fails (network, timeout, non-2xx, parse). */
  errorCode: ErrorCode;
  /** Per-request timeout in ms. Defaults to 30_000. */
  timeoutMs?: number;
  /** Optional caller signal — aborts merge with the internal timeout. */
  signal?: AbortSignal;
}

const DEFAULT_TIMEOUT_MS = 30_000;

async function parseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

function messageFromBody(body: unknown, fallback: string): string {
  if (typeof body === 'string' && body.trim()) {
    return body.trim();
  }
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    for (const key of ['error_description', 'message', 'error']) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
  }
  return fallback;
}

function linkSignals(externalSignal: AbortSignal | undefined, controller: AbortController): () => void {
  if (!externalSignal) {
    return () => undefined;
  }
  if (externalSignal.aborted) {
    controller.abort(externalSignal.reason);
    return () => undefined;
  }
  const onAbort = () => controller.abort(externalSignal.reason);
  externalSignal.addEventListener('abort', onAbort, { once: true });
  return () => externalSignal.removeEventListener('abort', onAbort);
}

/**
 * Shared HTTP helper: applies a per-request timeout via AbortController, parses the body,
 * and maps every failure mode to a ClerkCliAuthError tagged with the caller's errorCode.
 * Timeout aborts always surface as ClerkCliAuthError('timeout').
 */
export async function request(url: string, options: RequestOptions): Promise<{ response: Response; body: unknown }> {
  const { errorCode, timeoutMs = DEFAULT_TIMEOUT_MS, signal, ...init } = options;

  const controller = new AbortController();
  const timeoutHandle = setTimeout(
    () => controller.abort(new Error(`Request timed out after ${timeoutMs}ms`)),
    timeoutMs,
  );
  const unlinkSignal = linkSignals(signal, controller);

  let response: Response;
  try {
    response = await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    const aborted = controller.signal.aborted && signal?.aborted !== true;
    if (aborted) {
      throw new ClerkCliAuthError('timeout', `Request to ${url} timed out after ${timeoutMs}ms.`);
    }
    throw new ClerkCliAuthError(errorCode, `Request to ${url} failed: ${(error as Error).message}`);
  } finally {
    clearTimeout(timeoutHandle);
    unlinkSignal();
  }

  let body: unknown;
  try {
    body = await parseBody(response);
  } catch (error) {
    throw new ClerkCliAuthError(errorCode, `Response from ${url} could not be parsed: ${(error as Error).message}`);
  }

  if (!response.ok) {
    throw new ClerkCliAuthError(
      errorCode,
      messageFromBody(body, `Request to ${url} failed with HTTP ${response.status}.`),
    );
  }

  return { response, body };
}
