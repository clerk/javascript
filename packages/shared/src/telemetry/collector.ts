/**
 * The `TelemetryCollector` class handles collection of telemetry events from Clerk SDKs. Telemetry is opt-out and can be disabled by setting a CLERK_TELEMETRY_DISABLED environment variable.
 * The `ClerkProvider` also accepts a `telemetry` prop that will be passed to the collector during initialization:
 *
 * ```jsx
 * <ClerkProvider telemetry={false}>
 *    ...
 * </ClerkProvider>
 * ```
 *
 * For more information, please see the telemetry documentation page: https://clerk.com/docs/telemetry
 */
import type {
  InstanceType,
  TelemetryCollector as TelemetryCollectorInterface,
  TelemetryEvent,
  TelemetryEventRaw,
} from '@clerk/types';

import { parsePublishableKey } from '../keys';
import { isTruthy } from '../underscore';
import { TelemetryEventThrottler } from './throttler';
import type { TelemetryCollectorOptions } from './types';

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

const DEFAULT_CONFIG: Partial<TelemetryCollectorConfig> = {
  samplingRate: 1,
  maxBufferSize: 5,
  // Production endpoint: https://clerk-telemetry.com
  // Staging endpoint: https://staging.clerk-telemetry.com
  // Local: http://localhost:8787
  endpoint: 'https://clerk-telemetry.com',
};

export class TelemetryCollector implements TelemetryCollectorInterface {
  #config: Required<TelemetryCollectorConfig>;
  #eventThrottler: TelemetryEventThrottler;
  #metadata: TelemetryMetadata = {} as TelemetryMetadata;
  #buffer: TelemetryEvent[] = [];
  #pendingFlush: any;

  constructor(options: TelemetryCollectorOptions) {
    this.#config = {
      maxBufferSize: options.maxBufferSize ?? DEFAULT_CONFIG.maxBufferSize,
      samplingRate: options.samplingRate ?? DEFAULT_CONFIG.samplingRate,
      disabled: options.disabled ?? false,
      debug: options.debug ?? false,
      endpoint: DEFAULT_CONFIG.endpoint,
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

    this.#eventThrottler = new TelemetryEventThrottler();
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

    // navigator.webdriver is a property generally set by headless browsers that are running in an automated testing environment.
    // Data from these environments is not meaningful for us and has the potential to produce a large volume of events, so we disable
    // collection in this case. (ref: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/webdriver)
    if (typeof window !== 'undefined' && !!window?.navigator?.webdriver) {
      return false;
    }

    return true;
  }

  get isDebug(): boolean {
    return this.#config.debug || (typeof process !== 'undefined' && isTruthy(process.env.CLERK_TELEMETRY_DEBUG));
  }

  record(event: TelemetryEventRaw): void {
    const preparedPayload = this.#preparePayload(event.event, event.payload);

    this.#logEvent(preparedPayload.event, preparedPayload);

    if (!this.#shouldRecord(preparedPayload, event.eventSamplingRate)) {
      return;
    }

    this.#buffer.push(preparedPayload);

    this.#scheduleFlush();
  }

  #shouldRecord(preparedPayload: TelemetryEvent, eventSamplingRate?: number) {
    return this.isEnabled && !this.isDebug && this.#shouldBeSampled(preparedPayload, eventSamplingRate);
  }

  #shouldBeSampled(preparedPayload: TelemetryEvent, eventSamplingRate?: number) {
    const randomSeed = Math.random();

    const toBeSampled =
      randomSeed <= this.#config.samplingRate &&
      (typeof eventSamplingRate === 'undefined' || randomSeed <= eventSamplingRate);

    if (!toBeSampled) {
      return false;
    }

    return !this.#eventThrottler.isEventThrottled(preparedPayload);
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
    if (this.#pendingFlush) {
      return;
    }

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
      cv: this.#metadata.clerkVersion ?? '',
      it: this.#metadata.instanceType ?? '',
      sdk: sdkMetadata.name,
      sdkv: sdkMetadata.version,
      ...(this.#metadata.publishableKey ? { pk: this.#metadata.publishableKey } : {}),
      ...(this.#metadata.secretKey ? { sk: this.#metadata.secretKey } : {}),
      payload,
    };
  }
}
