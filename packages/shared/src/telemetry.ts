import type { InstanceType } from '@clerk/types';

import { parsePublishableKey } from './keys';
import { isTruthy } from './underscore';

export type TelemetryCollectorOptions = {
  /**
   * If true, telemetry will not be collected.
   */
  disabled?: boolean;
  /**
   * If true, telemetry will not be sent, but collected events will be logged to the console.
   */
  debug?: boolean;
  /**
   * Sampling rate, 0-1
   */
  samplingRate?: number;
  /**
   * Set a custom buffer size to control how often events are sent
   */
  maxBufferSize?: number;
  /**
   * The publishableKey to associate with the collected events.
   */
  publishableKey?: string;
  /**
   * The secretKey to associate with the collected events.
   */
  secretKey?: string;
  /**
   * The current clerk-js version.
   */
  clerkVersion?: string;
  /**
   * The SDK being used, e.g. `@clerk/nextjs` or `@clerk/remix`.
   */
  sdk?: string;
  /**
   * The version of the SDK being used.
   */
  sdkVersion?: string;
};

type TelemetryCollectorConfig = Pick<
  TelemetryCollectorOptions,
  'samplingRate' | 'disabled' | 'debug' | 'maxBufferSize'
> & {
  endpoint: string;
};

type TelemetryMetadata = Required<
  Pick<TelemetryCollectorOptions, 'clerkVersion' | 'sdk' | 'sdkVersion' | 'publishableKey' | 'secretKey'>
> & {
  /**
   * The instance type, derived from the provided publishableKey.
   */
  instanceType: InstanceType;
};

type TelemetryEvent = {
  event: string;
  /**
   * publishableKey
   */
  pk?: string;
  /**
   * secretKey
   */
  sk?: string;
  /**
   * instanceType
   */
  it: InstanceType;
  /**
   * clerkVersion
   */
  cv: string;
  /**
   * SDK
   */
  sdk?: string;
  /**
   * SDK Version
   */
  sdkv?: string;
  payload: Record<string, string | number | boolean>;
};

const DEFAULT_CONFIG: Partial<Required<TelemetryCollectorConfig>> = {
  samplingRate: 1,
  maxBufferSize: 5,
  endpoint: 'https://staging.clerk-telemetry.com',
};

// TODO: determine some type of throttle/dedupe heuristic to avoid sending excessive events for e.g. a component render
export class TelemetryCollector {
  #config: Required<TelemetryCollectorConfig>;
  #metadata: TelemetryMetadata = {} as TelemetryMetadata;
  #buffer: TelemetryEvent[] = [];
  #pendingFlush: any;

  constructor(options: TelemetryCollectorOptions) {
    this.#config = {
      maxBufferSize: options.maxBufferSize ?? DEFAULT_CONFIG.maxBufferSize,
      samplingRate: options.samplingRate ?? DEFAULT_CONFIG.samplingRate,
      disabled: options.disabled ?? false,
      debug: options.debug ?? false,
    } as Required<TelemetryCollectorConfig>;

    if (!options.clerkVersion && typeof window === 'undefined') {
      // N/A in a server environment
      this.#metadata.clerkVersion = '';
    } else {
      this.#metadata.clerkVersion = options.clerkVersion ?? '';
    }

    // We will try to grab the SDK data lazily when an event is triggered, so it should always be defined once the event is sent.
    this.#metadata.sdk = options.sdk!;
    this.#metadata.sdkVersion = options.sdkVersion!;

    this.#metadata.publishableKey = options.publishableKey ?? '';

    const parsedKey = parsePublishableKey(options.publishableKey);
    if (parsedKey) {
      this.#metadata.instanceType = parsedKey.instanceType;
    }

    if (options.secretKey) {
      // Only send the first 16 characters of the secret key to to avoid sending the full key. We can still query against the partial key.
      this.#metadata.secretKey = options.secretKey.substring(0, 16);
    }

    // this.#config.endpoint = 'http://localhost:8787';
  }

  get isEnabled(): boolean {
    if (this.#metadata.instanceType !== 'development') {
      return false;
    }

    // In browser or client environments, we most likely pass the disabled option to the collector, but in environments
    // where environment variables are available we also check for `CLERK_TELEMETRY_DISABLED`.
    if (this.#config.disabled || (typeof process !== 'undefined' && isTruthy(process.env.CLERK_TELEMETRY_DISABLED))) {
      return false;
    }

    return true;
  }

  get isDebug(): boolean {
    return this.#config.debug || (typeof process !== 'undefined' && isTruthy(process.env.CLERK_TELEMETRY_DEBUG));
  }

  record(event: TelemetryEvent['event'], payload: TelemetryEvent['payload']) {
    const preparedPayload = this.#preparePayload(event, payload);

    this.#logEvent(preparedPayload.event, preparedPayload);

    if (!this.#shouldRecord()) {
      return;
    }

    this.#buffer.push(preparedPayload);

    this.#scheduleFlush();
  }

  #shouldRecord(): boolean {
    return this.isEnabled && !this.isDebug && Math.random() <= this.#config.samplingRate;
  }

  #scheduleFlush(): void {
    // On the server, we want to flush immediately as we have less guarantees about the lifecycle of the process
    if (typeof window === 'undefined') {
      this.#flush();
      return;
    }

    const isBufferFull = this.#buffer.length >= this.#config.maxBufferSize;
    if (isBufferFull) {
      // If the buffer is full, flush immediately to make sure we minimize the chance of event loss.
      // Cancel any pending flushes as we're going to flush immediately
      if (this.#pendingFlush) {
        const cancel = typeof cancelIdleCallback !== 'undefined' ? cancelIdleCallback : clearTimeout;
        cancel(this.#pendingFlush);
      }
      this.#flush();
      return;
    }

    // If we have a pending flush, do nothing
    if (this.#pendingFlush) return;

    if ('requestIdleCallback' in window) {
      this.#pendingFlush = requestIdleCallback(() => {
        this.#flush();
      });
    } else {
      // This is not an ideal solution, but it at least waits until the next tick
      this.#pendingFlush = setTimeout(() => {
        this.#flush();
      }, 0);
    }
  }

  #flush(): void {
    fetch(new URL('/v1/event', this.#config.endpoint), {
      method: 'POST',
      // TODO: We send an array here with that idea that we can eventually send multiple events.
      body: JSON.stringify({
        events: this.#buffer,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .catch(() => void 0)
      .then(() => {
        this.#buffer = [];
      })
      .catch(() => void 0);
  }

  /**
   * If running in debug mode, log the event and its payload to the console.
   */
  #logEvent(event: TelemetryEvent['event'], payload: Record<string, any>) {
    if (!this.isDebug) {
      return;
    }

    if (typeof console.groupCollapsed !== 'undefined') {
      console.groupCollapsed('[clerk/telemetry]', event);
      console.log(payload);
      console.groupEnd();
    } else {
      console.log('[clerk/telemetry]', event, payload);
    }
  }

  /**
   * If in browser, attempt to lazily grab the SDK metadata from the Clerk singleton, otherwise fallback to the initially passed in values.
   *
   * This is necessary because the sdkMetadata can be set by the host SDK after the TelemetryCollector is instantiated.
   */
  #getSDKMetadata() {
    let sdkMetadata = {
      name: this.#metadata.sdk,
      version: this.#metadata.sdkVersion,
    };

    // @ts-expect-error -- The global window.Clerk type is declared in clerk-js, but we can't rely on that here
    if (typeof window !== 'undefined' && window.Clerk) {
      // @ts-expect-error -- The global window.Clerk type is declared in clerk-js, but we can't rely on that here
      sdkMetadata = { ...sdkMetadata, ...window.Clerk.constructor.sdkMetadata };
    }

    return sdkMetadata;
  }

  /**
   * Append relevant metadata from the Clerk singleton to the event payload.
   */
  #preparePayload(event: TelemetryEvent['event'], payload: TelemetryEvent['payload']): TelemetryEvent {
    const sdkMetadata = this.#getSDKMetadata();

    return {
      event,
      cv: this.#metadata.clerkVersion,
      it: this.#metadata.instanceType,
      sdk: sdkMetadata.name,
      sdkv: sdkMetadata.version,
      ...(this.#metadata.publishableKey ? { pk: this.#metadata.publishableKey } : {}),
      ...(this.#metadata.secretKey ? { sk: this.#metadata.secretKey } : {}),
      payload,
    };
  }
}
