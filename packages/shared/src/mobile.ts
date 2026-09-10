export type {
  MobileClerk,
  MobileNativeHost,
  MobileAuthResetReason,
  MobileResourceObserver,
  MobileAuthenticationResources,
  MobileAuthenticationResult,
  MobileAuthCallback,
  MobileSSOParams,
  MobileIdentifierParams,
} from './types/mobile';

export interface MobileCredentialStorage {
  read(): Promise<string | null>;
  write(credential: string): Promise<void>;
  remove(): Promise<void>;
}

type MobileRequest = RequestInit & { url?: URL };
type MobileResponse = Response & { payload?: unknown };
type MobileCore = {
  __internal_onBeforeRequest(callback: (request: MobileRequest) => Promise<void>): void;
  __internal_onAfterResponse(callback: (request: MobileRequest, response?: MobileResponse) => Promise<void>): void;
};

function responseClientVersion(payload: unknown): { updatedAt?: number } | undefined {
  const object = (value: unknown): Record<string, unknown> | undefined =>
    value !== null && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : undefined;
  const body = object(payload);
  // FAPI carries the client beside a resource, in meta, or as the /client result.
  const client = object(body?.client) || object(object(body?.meta)?.client) || object(body?.response);
  if (client?.object !== 'client') return;
  return {
    updatedAt:
      typeof client.updated_at === 'number' && Number.isFinite(client.updated_at) ? client.updated_at : undefined,
  };
}

export function installMobileCredentialTransport(
  core: MobileCore,
  storage: MobileCredentialStorage,
  headers: Record<string, string> = {},
  options: { native?: boolean } = {},
) {
  let generation = 0;
  let disposed = false;
  let writes: Promise<void> = Promise.resolve();
  let sequence = 0;
  let credentialRevision = 0;
  let acceptedClient: { sequence: number; serverDate?: number; updatedAt?: number } | undefined;
  const requests = new WeakMap<
    object,
    { generation: number; sequence: number; credentialRevision: number; credential: string | null }
  >();
  const assertCurrent = (expected: number) => {
    if (disposed || expected !== generation) {
      throw Object.assign(new Error('The client changed while the request was in flight.'), {
        code: 'stale_client_request',
      });
    }
  };
  const assertCredentialCurrent = (expected: number) => {
    if (expected !== credentialRevision) {
      throw Object.assign(new Error('The client credential changed while the request was in flight.'), {
        code: 'stale_client_request',
      });
    }
  };

  core.__internal_onBeforeRequest(async request => {
    const current = generation;
    let credential: string | null;
    let revision: number;
    let pendingWrites: Promise<void>;
    do {
      pendingWrites = writes;
      await pendingWrites;
      assertCurrent(current);
      revision = credentialRevision;
      credential = await storage.read();
      assertCurrent(current);
    } while (pendingWrites !== writes || revision !== credentialRevision);
    requests.set(request, { generation: current, sequence: ++sequence, credentialRevision: revision, credential });
    request.credentials = 'omit';
    request.url?.searchParams.set('_is_native', '1');
    const requestHeaders = request.headers instanceof Headers ? request.headers : new Headers(request.headers);
    requestHeaders.set('authorization', credential || '');
    if (options.native !== false) requestHeaders.set('x-mobile', '1');
    for (const [key, value] of Object.entries(headers)) requestHeaders.set(key, value);
    request.headers = requestHeaders;
  });

  core.__internal_onAfterResponse(async (request, response) => {
    if (!response) return;
    const issued = requests.get(request);
    if (issued === undefined) throw new Error('Missing mobile request generation.');
    assertCurrent(issued.generation);
    const credential = response.headers.get('authorization');
    // Native FAPI uses a blank Bearer value because intermediaries strip empty headers.
    const clearCredential = options.native !== false && credential?.trim().toLowerCase() === 'bearer';
    const client = responseClientVersion(response.payload);
    if (!credential && !client) return;
    const parsedDate = Date.parse(response.headers.get('date') || '');
    const serverDate = Number.isFinite(parsedDate) ? parsedDate : undefined;
    // Decide freshness in the same queue as persistence, before either a stale
    // credential write or FAPI resource hydration can occur.
    const commit = writes.then(async () => {
      assertCurrent(issued.generation);
      assertCredentialCurrent(issued.credentialRevision);
      if (client && options.native !== false && !credential && !(await storage.read())) {
        throw Object.assign(new Error('The native client response has no client credential.'), {
          code: 'missing_client_credential',
        });
      }
      assertCurrent(issued.generation);
      if (client && acceptedClient && issued.sequence <= acceptedClient.sequence) {
        const newerServerState =
          serverDate !== undefined &&
          acceptedClient.serverDate !== undefined &&
          (serverDate > acceptedClient.serverDate ||
            (serverDate === acceptedClient.serverDate &&
              client.updatedAt !== undefined &&
              acceptedClient.updatedAt !== undefined &&
              client.updatedAt > acceptedClient.updatedAt));
        if (!newerServerState)
          throw Object.assign(new Error('A newer client response has already been accepted.'), {
            code: 'stale_client_response',
          });
      }
      if (clearCredential) await storage.remove();
      else if (credential) await storage.write(credential);
      assertCurrent(issued.generation);
      if (clearCredential || (credential && credential !== issued.credential)) ++credentialRevision;
      if (client) {
        acceptedClient = {
          sequence: Math.max(acceptedClient?.sequence ?? issued.sequence, issued.sequence),
          serverDate:
            serverDate === undefined
              ? acceptedClient?.serverDate
              : Math.max(acceptedClient?.serverDate ?? serverDate, serverDate),
          updatedAt: client.updatedAt,
        };
      }
    });
    writes = commit.catch(() => undefined);
    await commit;
    assertCurrent(issued.generation);
  });

  return {
    async invalidate({ clearCredential = false } = {}): Promise<void> {
      ++generation;
      acceptedClient = undefined;
      if (clearCredential) {
        const remove = writes.then(() => storage.remove());
        writes = remove.catch(() => undefined);
        await remove;
      } else {
        await writes;
      }
    },
    dispose(): void {
      disposed = true;
      ++generation;
    },
  };
}
