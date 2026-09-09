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

export function installMobileCredentialTransport(
  core: MobileCore,
  storage: MobileCredentialStorage,
  headers: Record<string, string> = {},
  options: { native?: boolean } = {},
) {
  let generation = 0;
  let disposed = false;
  let writes: Promise<void> = Promise.resolve();
  const requests = new WeakMap<object, number>();
  const assertCurrent = (expected: number) => {
    if (disposed || expected !== generation) {
      throw Object.assign(new Error('The client changed while the request was in flight.'), {
        code: 'stale_client_request',
      });
    }
  };

  core.__internal_onBeforeRequest(async request => {
    const current = generation;
    requests.set(request, current);
    await writes;
    assertCurrent(current);
    const credential = await storage.read();
    assertCurrent(current);
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
    const current = requests.get(request);
    if (current === undefined) throw new Error('Missing mobile request generation.');
    assertCurrent(current);
    const credential = response.headers.get('authorization');
    if (credential) {
      const write = writes.then(async () => {
        assertCurrent(current);
        await storage.write(credential);
      });
      writes = write.catch(() => undefined);
      await write;
    }
    assertCurrent(current);
  });

  return {
    async invalidate({ clearCredential = false } = {}): Promise<void> {
      ++generation;
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
