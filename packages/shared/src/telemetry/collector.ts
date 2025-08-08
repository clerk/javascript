/**
 * The `TelemetryCollector` class handles collection of telemetry events from Clerk SDKs. Telemetry is opt-out and can be disabled by setting a CLERK_TELEMETRY_DISABLED environment variable.
 * The `ClerkProvider` also accepts a `telemetry` prop that will be passed to the collector during initialization:.
 *
 * ```jsx
 * <ClerkProvider telemetry={false}>
 *    ...
 * </ClerkProvider>
 * ```
 *
 * For more information, please see the telemetry documentation page: https://clerk.com/docs/telemetry.
 */
import type {
  InstanceType,
  SDKMetadata,
  TelemetryCollector as TelemetryCollectorInterface,
  TelemetryEvent,
  TelemetryEventRaw,
  TelemetryLogEntry,
} from '@clerk/types';

import { parsePublishableKey } from '../keys';
import { isTruthy } from '../underscore';
import { TelemetryEventThrottler } from './throttler';
import type { TelemetryCollectorOptions } from './types';

/**
 * Local interface for window.Clerk to avoid global type pollution.
 * This is only used within this module and doesn't affect other packages.
 */
interface WindowWithClerk extends Window {
  Clerk?: {
    constructor?: {
      sdkMetadata?: SDKMetadata;
    };
  };
}

/**
 * Type guard to check if window.Clerk exists and has the expected structure.
 */
function isWindowClerkWithMetadata(clerk: unknown): clerk is { constructor: { sdkMetadata?: SDKMetadata } } {
  return (
    typeof clerk === 'object' && clerk !== null && 'constructor' in clerk && typeof clerk.constructor === 'function'
  );
}

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

/**
 * Structure of log data sent to the telemetry endpoint.
 */
type TelemetryLogData = {
  /** Service that generated the log */
  sdk: string;
  /** The version of the SDK where the event originated from */
  sdkv: string;
  /** The version of Clerk where the event originated from */
  cv: string;
  /** Log level (info, warn, error, debug, etc.) */
  lvl: string;
  /** Log message */
  msg: string;
  /** Instance ID */
  iid: string;
  /** Timestamp when log was generated */
  ts: string;
  /** Primary key */
  pk: string | null;
  /** Additional payload for the log */
  payload: Record<string, unknown> | null;
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
  #logBuffer: TelemetryLogData[] = [];
  #pendingFlush: any;
  #pendingLogFlush: any;

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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.#metadata.sdk = options.sdk!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
    if (
      this.#config.disabled ||
      (typeof process !== 'undefined' && process.env && isTruthy(process.env.CLERK_TELEMETRY_DISABLED))
    ) {
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
    return (
      this.#config.debug ||
      (typeof process !== 'undefined' && process.env && isTruthy(process.env.CLERK_TELEMETRY_DEBUG))
    );
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

  /**
   * Records a telemetry log entry if logging is enabled and not in debug mode.
   *
   * @param entry - The telemetry log entry to record.
   */
  recordLog(entry: TelemetryLogEntry): void {
    if (!this.#shouldRecordLog(entry)) {
      return;
    }

    const sdkMetadata = this.#getSDKMetadata();

    const logData: TelemetryLogData = {
      sdk: sdkMetadata.name,
      sdkv: sdkMetadata.version,
      cv: this.#metadata.clerkVersion ?? '',
      lvl: entry.level,
      msg: entry.message,
      iid: entry.id,
      ts: new Date(entry.timestamp).toISOString(),
      pk: this.#metadata.publishableKey || null,
      payload: entry.context || null,
    };

    this.#logBuffer.push(logData);

    this.#scheduleLogFlush();
  }

  #shouldRecord(preparedPayload: TelemetryEvent, eventSamplingRate?: number) {
    return this.isEnabled && !this.isDebug && this.#shouldBeSampled(preparedPayload, eventSamplingRate);
  }

  #shouldRecordLog(_entry: TelemetryLogEntry): boolean {
    return this.isEnabled && !this.isDebug;
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
        this.#pendingFlush = null;
      });
    } else {
      // This is not an ideal solution, but it at least waits until the next tick
      this.#pendingFlush = setTimeout(() => {
        this.#flush();
        this.#pendingFlush = null;
      }, 0);
    }
  }

  #scheduleLogFlush(): void {
    if (typeof window === 'undefined') {
      this.#flushLogs();
      return;
    }

    const isBufferFull = this.#logBuffer.length >= this.#config.maxBufferSize;
    if (isBufferFull) {
      if (this.#pendingLogFlush) {
        const cancel = typeof cancelIdleCallback !== 'undefined' ? cancelIdleCallback : clearTimeout;
        cancel(this.#pendingLogFlush);
      }
      this.#flushLogs();
      return;
    }

    if (this.#pendingLogFlush) {
      return;
    }

    if ('requestIdleCallback' in window) {
      this.#pendingLogFlush = requestIdleCallback(() => {
        this.#flushLogs();
        this.#pendingLogFlush = null;
      });
    } else {
      this.#pendingLogFlush = setTimeout(() => {
        this.#flushLogs();
        this.#pendingLogFlush = null;
      }, 0);
    }
  }

  #flush(): void {
    // Capture the current buffer and clear it immediately to avoid closure references
    const eventsToSend = [...this.#buffer];
    this.#buffer = [];

    this.#pendingFlush = null;

    if (eventsToSend.length === 0) {
      return;
    }

    fetch(new URL('/v1/event', this.#config.endpoint), {
      method: 'POST',
      // TODO: We send an array here with that idea that we can eventually send multiple events.
      body: JSON.stringify({
        events: eventsToSend,
      }),
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(() => void 0);
  }

  #flushLogs(): void {
    // Capture the current buffer and clear it immediately to avoid closure references
    const entriesToSend = [...this.#logBuffer];
    this.#logBuffer = [];

    this.#pendingLogFlush = null;

    if (entriesToSend.length === 0) {
      return;
    }

    fetch(new URL('/v1/logs', this.#config.endpoint), {
      method: 'POST',
      body: JSON.stringify(entriesToSend),
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(() => void 0);
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
    const sdkMetadata = {
      name: this.#metadata.sdk,
      version: this.#metadata.sdkVersion,
    };

    if (typeof window !== 'undefined') {
      const windowWithClerk = window as WindowWithClerk;

      if (windowWithClerk.Clerk) {
        const windowClerk = windowWithClerk.Clerk;

        if (isWindowClerkWithMetadata(windowClerk) && windowClerk.constructor.sdkMetadata) {
          const { name, version } = windowClerk.constructor.sdkMetadata;

          if (name !== undefined) {
            sdkMetadata.name = name;
          }
          if (version !== undefined) {
            sdkMetadata.version = version;
          }
        }
      }
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
