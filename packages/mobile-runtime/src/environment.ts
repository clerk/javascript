import 'core-js/actual/url';
import 'core-js/actual/url-search-params';
import 'core-js/actual/atob';
import 'core-js/actual/btoa';
import { hostRequest } from './host.ts';
import { bridgeError, type JSONValue } from './protocol.ts';

class MobileHeaders {
  #values = new Map<string, string>();
  constructor(initial?: HeadersInit | MobileHeaders) {
    if (!initial) return;
    if (initial instanceof MobileHeaders || Array.isArray(initial)) {
      for (const [key, value] of initial) this.append(key, value);
    } else if (typeof (initial as Headers).forEach === 'function') {
      (initial as Headers).forEach((value, key) => this.append(key, value));
    } else for (const [key, value] of Object.entries(initial)) this.append(key, String(value));
  }
  get(key: string): string | null {
    return this.#values.get(key.toLowerCase()) ?? null;
  }
  has(key: string): boolean {
    return this.#values.has(key.toLowerCase());
  }
  set(key: string, value: string): void {
    if (!/^[!#$%&'*+.^_`|~0-9a-z-]+$/i.test(key) || /[\r\n]/.test(value)) throw new TypeError('Invalid HTTP header.');
    this.#values.set(key.toLowerCase(), String(value));
  }
  append(key: string, value: string): void {
    this.set(key, this.has(key) ? `${this.get(key)}, ${value}` : value);
  }
  delete(key: string): void {
    this.#values.delete(key.toLowerCase());
  }
  forEach(callback: (value: string, key: string) => void): void {
    this.#values.forEach(callback);
  }
  entries(): IterableIterator<[string, string]> {
    return this.#values.entries();
  }
  [Symbol.iterator](): IterableIterator<[string, string]> {
    return this.entries();
  }
}

class MobileAbortSignal {
  aborted = false;
  reason: unknown;
  onabort: (() => void) | null = null;
  #listeners = new Set<() => void>();
  addEventListener(name: string, callback: () => void): void {
    if (name === 'abort') this.#listeners.add(callback);
  }
  removeEventListener(name: string, callback: () => void): void {
    if (name === 'abort') this.#listeners.delete(callback);
  }
  throwIfAborted(): void {
    if (this.aborted) throw this.reason;
  }
  abort(reason: unknown): void {
    if (this.aborted) return;
    this.aborted = true;
    this.reason = reason;
    for (const listener of this.#listeners) listener();
    this.#listeners.clear();
    this.onabort?.();
  }
}
class MobileAbortController {
  readonly signal = new MobileAbortSignal();
  abort(reason: unknown = bridgeError('aborted')): void {
    this.signal.abort(reason);
  }
}

function utf8(value: string): Uint8Array {
  return Uint8Array.from(unescape(encodeURIComponent(value.toWellFormed())), c => c.charCodeAt(0));
}

class MobileBlob {
  readonly type: string;
  readonly bytes: Uint8Array;
  get size(): number {
    return this.bytes.length;
  }
  constructor(parts: (string | ArrayBuffer | ArrayBufferView | MobileBlob)[] = [], options: { type?: string } = {}) {
    const chunks = parts.map(part =>
      typeof part === 'string'
        ? utf8(part)
        : part instanceof MobileBlob
          ? part.bytes
          : part instanceof ArrayBuffer
            ? new Uint8Array(part)
            : new Uint8Array(part.buffer, part.byteOffset, part.byteLength),
    );
    this.bytes = new Uint8Array(chunks.reduce((count, part) => count + part.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      this.bytes.set(chunk, offset);
      offset += chunk.length;
    }
    this.type = options.type?.toLowerCase() || '';
  }
  async arrayBuffer(): Promise<ArrayBuffer> {
    return this.bytes.slice().buffer;
  }
  async text(): Promise<string> {
    return decodeURIComponent(escape(Array.from(this.bytes, c => String.fromCharCode(c)).join('')));
  }
  slice(start = 0, end = this.size, contentType = ''): MobileBlob {
    return new MobileBlob([this.bytes.slice(start, end)], { type: contentType });
  }
}
class MobileFile extends MobileBlob {
  readonly name: string;
  constructor(parts: ConstructorParameters<typeof MobileBlob>[0], name: string, options: { type?: string } = {}) {
    super(parts, options);
    this.name = name;
  }
}
class MobileFormData {
  #entries: [string, string | MobileBlob, string?][] = [];
  append(name: string, value: string | MobileBlob, filename?: string): void {
    this.#entries.push([name, value, filename]);
  }
  toWire(): JSONValue {
    return {
      multipart: this.#entries.map(
        ([name, value, filename]): JSONValue =>
          typeof value === 'string'
            ? { name, value }
            : {
                name,
                filename: filename || (value instanceof MobileFile ? value.name : 'blob'),
                contentType: value.type || 'application/octet-stream',
                base64: btoa(Array.from(value.bytes, byte => String.fromCharCode(byte)).join('')),
              },
      ),
    };
  }
}
class MobileResponse {
  readonly status: number;
  readonly statusText: string;
  readonly headers: MobileHeaders;
  readonly url: string;
  readonly redirected = false;
  bodyUsed = false;
  #body: string;
  get ok(): boolean {
    return this.status >= 200 && this.status < 300;
  }
  constructor(body = '', options: { status?: number; statusText?: string; headers?: HeadersInit; url?: string } = {}) {
    this.#body = body;
    this.status = options.status ?? 200;
    this.statusText = options.statusText || '';
    this.headers = new MobileHeaders(options.headers);
    this.url = options.url || '';
  }
  async text(): Promise<string> {
    if (this.bodyUsed) throw new TypeError('Body already read.');
    this.bodyUsed = true;
    return this.#body;
  }
  async json(): Promise<unknown> {
    return JSON.parse(await this.text());
  }
  clone(): MobileResponse {
    if (this.bodyUsed) throw new TypeError('Body already read.');
    return new MobileResponse(this.#body, {
      status: this.status,
      statusText: this.statusText,
      headers: Array.from(this.headers),
      url: this.url,
    });
  }
}

let nextTimer = 0;
const timers = new Map<number, MobileAbortController>();
function timer(callback: (...args: any[]) => void, delay = 0, repeat = false, args: any[] = []): number {
  if (typeof callback !== 'function') throw new TypeError('Timer callback must be a function.');
  const id = ++nextTimer;
  const controller = new MobileAbortController();
  timers.set(id, controller);
  const tick = () => {
    void hostRequest(
      'timer',
      { milliseconds: Math.max(0, Math.min(Number(delay) || 0, 2147483647)) },
      controller.signal as unknown as AbortSignal,
    ).then(
      () => {
        if (!timers.has(id)) return;
        if (!repeat) timers.delete(id);
        try {
          callback(...args);
        } finally {
          if (repeat && timers.has(id)) tick();
        }
      },
      () => {
        timers.delete(id);
      },
    );
  };
  tick();
  return id;
}
function clearTimer(id: number): void {
  timers.get(id)?.abort();
  timers.delete(id);
}

const globals = globalThis as unknown as Record<string, any>;
globals.Headers = MobileHeaders;
globals.Response = MobileResponse;
globals.AbortController = MobileAbortController;
globals.AbortSignal = MobileAbortSignal;
globals.Blob = MobileBlob;
globals.File = MobileFile;
globals.FormData = MobileFormData;
globals.setTimeout = (callback: (...args: any[]) => void, delay: number, ...args: any[]) =>
  timer(callback, delay, false, args);
globals.setInterval = (callback: (...args: any[]) => void, delay: number, ...args: any[]) =>
  timer(callback, delay, true, args);
globals.clearTimeout = clearTimer;
globals.clearInterval = clearTimer;
globals.queueMicrotask = (callback: () => void) => {
  void Promise.resolve().then(callback);
};
globals.crypto = {
  getRandomValues<T extends ArrayBufferView>(value: T): T {
    if (
      !ArrayBuffer.isView(value) ||
      value instanceof DataView ||
      value instanceof Float32Array ||
      value instanceof Float64Array ||
      value.byteLength > 65536
    ) {
      throw new TypeError('Expected an integer typed array of at most 65536 bytes.');
    }
    const bytes = Uint8Array.from(atob(globalThis.__clerkNativeRandom(value.byteLength)), c => c.charCodeAt(0));
    if (bytes.length !== value.byteLength) throw new Error('Invalid native randomness result.');
    new Uint8Array(value.buffer, value.byteOffset, value.byteLength).set(bytes);
    return value;
  },
  randomUUID(): string {
    const bytes: Uint8Array = this.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  },
};
globals.fetch = async (input: string | URL, init: RequestInit = {}) => {
  const url = new URL(String(input));
  if (url.protocol !== 'https:') throw bridgeError('insecure_http_url');
  const body = init.body instanceof MobileFormData ? init.body.toWire() : init.body == null ? null : String(init.body);
  const result = await hostRequest<{
    body: string;
    status: number;
    statusText?: string;
    headers: Record<string, string>;
  }>(
    'http',
    {
      url: url.toString(),
      method: init.method || 'GET',
      headers: Object.fromEntries(new MobileHeaders(init.headers)),
      body,
    },
    init.signal || undefined,
  );
  return new MobileResponse(result.body, { ...result, url: url.toString() });
};
globals.console = { log() {}, info() {}, warn() {}, error() {}, debug() {}, trace() {} };
