import type { Clerk, InstanceType } from '@clerk/types';

import { parsePublishableKey } from './keys';

declare global {
  interface Window {
    Clerk: Clerk;
  }
}

type TelemetryCollectorOptions = {
  /**
   * Sampling rate, 0-1
   */
  samplingRate?: number;
  /**
   * Determines whether or not events will be logged to the console.
   */
  verbose?: boolean;
  /**
   * The publishableKey to associate with the collected events.
   */
  publishableKey: string;
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

type TelemetryCollectorConfig = Pick<TelemetryCollectorOptions, 'samplingRate' | 'verbose'> & { endpoint: string };

type TelemetryMetadata = Required<
  Pick<TelemetryCollectorOptions, 'clerkVersion' | 'sdk' | 'sdkVersion' | 'publishableKey'>
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
  verbose: false,
};

// TODO: determine some type of throttle/dedupe heuristic to avoid sending excessive events for e.g. a component render
export class TelemetryCollector {
  #config: Required<TelemetryCollectorConfig>;
  #metadata: TelemetryMetadata = {} as TelemetryMetadata;

  constructor(options: TelemetryCollectorOptions) {
    this.#config = {
      ...DEFAULT_CONFIG,
      samplingRate: options.samplingRate,
      verbose: options.verbose,
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

    this.#metadata.publishableKey = options.publishableKey;

    const parsedKey = parsePublishableKey(options.publishableKey);
    if (parsedKey) {
      this.#metadata.instanceType = parsedKey.instanceType;
    }

    // TODO: determine FAPI endpoint from the publishable key
    // this.#config.endpoint = 'https://telemetry-service-staging.bryce-clerk.workers.dev';
    this.#config.endpoint = 'http://localhost:8787';
  }

  get isEnabled(): boolean {
    if (this.#metadata.instanceType !== 'development') {
      return false;
    }

    // TODO: check clerk environment / environment variable
    return true;
  }

  record(event: TelemetryEvent['event'], payload: TelemetryEvent['payload']) {
    if (!this.isEnabled) {
      return;
    }

    const preparedPayload = this.#preparePayload(event, payload);

    this.#logEvent(preparedPayload.event, preparedPayload);

    if (!this.#shouldRecord()) {
      return;
    }

    this.#sendEvent(preparedPayload);
  }

  #shouldRecord(): boolean {
    return Math.random() <= this.#config.samplingRate;
  }

  #sendEvent(event: TelemetryEvent): void {
    fetch(new URL('/v1/event', this.#config.endpoint), {
      method: 'POST',
      // TODO: We send an array here with that idea that we can eventually send multiple events.
      body: JSON.stringify({
        events: [event],
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(err => console.error(err));
  }

  /**
   * If running in verbose mode, log the event and its payload to the console.
   */
  #logEvent(event: TelemetryEvent['event'], payload: Record<string, any>) {
    if (!this.#config.verbose) {
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

    if (typeof window !== 'undefined' && window.Clerk) {
      sdkMetadata = { ...sdkMetadata, ...window.Clerk.sdkMetadata };
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
      payload,
    };
  }
}
