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
  'samplingRate' | 'disabled' | 'debug' | 'maxBufferSize' | 'perEventSampling'
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
  /** Service that generated the log. */
  sdk: string;
  /** The version of the SDK where the event originated from. */
  sdkv: string;
  /** The version of Clerk where the event originated from. */
  cv: string;
  /** Log level (info, warn, error, debug, etc.). */
  lvl: TelemetryLogEntry['level'];
  /** Log message. */
  msg: string;
  /** Instance ID - optional. */
  iid?: string;
  /** Timestamp when log was generated. */
  ts: string;
  /** Primary key. */
  pk: string | null;
  /** Additional payload for the log. */
  payload: Record<string, unknown> | null;
};

type TelemetryBufferItem = { kind: 'event'; value: TelemetryEvent } | { kind: 'log'; value: TelemetryLogData };

// Accepted log levels for runtime validation
const VALID_LOG_LEVELS = new Set<string>(['error', 'warn', 'info', 'debug', 'trace']);

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
  #buffer: TelemetryBufferItem[] = [];
  #pendingFlush: number | ReturnType<typeof setTimeout> | null = null;

  constructor(options: TelemetryCollectorOptions) {
    this.#config = {
      maxBufferSize: options.maxBufferSize ?? DEFAULT_CONFIG.maxBufferSize,
      samplingRate: options.samplingRate ?? DEFAULT_CONFIG.samplingRate,
      perEventSampling: options.perEventSampling ?? true,
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

    this.#buffer.push({ kind: 'event', value: preparedPayload });

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

    const levelIsValid = typeof entry?.level === 'string' && VALID_LOG_LEVELS.has(entry.level);
    const messageIsValid = typeof entry?.message === 'string' && entry.message.trim().length > 0;

    let normalizedTimestamp: Date | null = null;
    const timestampInput: unknown = (entry as unknown as { timestamp?: unknown })?.timestamp;
    if (typeof timestampInput === 'number' || typeof timestampInput === 'string') {
      const candidate = new Date(timestampInput);
      if (!Number.isNaN(candidate.getTime())) {
        normalizedTimestamp = candidate;
      }
    }

    if (!levelIsValid || !messageIsValid || normalizedTimestamp === null) {
      if (this.isDebug && typeof console !== 'undefined') {
        console.warn('[clerk/telemetry] Dropping invalid telemetry log entry', {
          levelIsValid,
          messageIsValid,
          timestampIsValid: normalizedTimestamp !== null,
        });
      }
      return;
    }

    const sdkMetadata = this.#getSDKMetadata();

    const logData: TelemetryLogData = {
      sdk: sdkMetadata.name,
      sdkv: sdkMetadata.version,
      cv: this.#metadata.clerkVersion ?? '',
      lvl: entry.level,
      msg: entry.message,
      ts: normalizedTimestamp.toISOString(),
      pk: this.#metadata.publishableKey || null,
      payload: this.#sanitizeContext(entry.context),
    };

    this.#buffer.push({ kind: 'log', value: logData });

    this.#scheduleFlush();
  }

  #shouldRecord(preparedPayload: TelemetryEvent, eventSamplingRate?: number) {
    return this.isEnabled && !this.isDebug && this.#shouldBeSampled(preparedPayload, eventSamplingRate);
  }

  #shouldRecordLog(_entry: TelemetryLogEntry): boolean {
    // Always allow logs from debug logger to be sent. Debug logger itself is already gated elsewhere.
    return true;
  }

  #shouldBeSampled(preparedPayload: TelemetryEvent, eventSamplingRate?: number) {
    const randomSeed = Math.random();

    const toBeSampled =
      randomSeed <= this.#config.samplingRate &&
      (this.#config.perEventSampling === false ||
        typeof eventSamplingRate === 'undefined' ||
        randomSeed <= eventSamplingRate);

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
        if (typeof cancelIdleCallback !== 'undefined') {
          cancelIdleCallback(Number(this.#pendingFlush));
        } else {
          clearTimeout(Number(this.#pendingFlush));
        }
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

  #flush(): void {
    // Capture the current buffer and clear it immediately to avoid closure references
    const itemsToSend = [...this.#buffer];
    this.#buffer = [];

    this.#pendingFlush = null;

    if (itemsToSend.length === 0) {
      return;
    }

    const eventsToSend = itemsToSend
      .filter(item => item.kind === 'event')
      .map(item => (item as { kind: 'event'; value: TelemetryEvent }).value);

    const logsToSend = itemsToSend
      .filter(item => item.kind === 'log')
      .map(item => (item as { kind: 'log'; value: TelemetryLogData }).value);

    if (eventsToSend.length > 0) {
      const eventsUrl = new URL('/v1/event', this.#config.endpoint);
      fetch(eventsUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
        keepalive: true,
        method: 'POST',
        // TODO: We send an array here with that idea that we can eventually send multiple events.
        body: JSON.stringify({ events: eventsToSend }),
      }).catch(() => void 0);
    }

    if (logsToSend.length > 0) {
      const logsUrl = new URL('/v1/logs', this.#config.endpoint);
      fetch(logsUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
        keepalive: true,
        method: 'POST',
        body: JSON.stringify({ logs: logsToSend }),
      }).catch(() => void 0);
    }
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

  /**
   * Best-effort sanitization of the context payload. Returns a plain object with JSON-serializable
   * values or null when the input is missing or not serializable. Arrays are not accepted.
   */
  #sanitizeContext(context: unknown): Record<string, unknown> | null {
    if (context === null || typeof context === 'undefined') {
      return null;
    }
    if (typeof context !== 'object') {
      return null;
    }
    try {
      const cleaned = JSON.parse(JSON.stringify(context));
      if (cleaned && typeof cleaned === 'object' && !Array.isArray(cleaned)) {
        return cleaned as Record<string, unknown>;
      }
      return null;
    } catch {
      return null;
    }
  }
}
