import type { InstanceType } from '@clerk/types';

import type { TelemetryClientCache } from './clientCache';

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

export type TelemetryEvent = {
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

export type TelemetryEventRaw<Payload = TelemetryEvent['payload']> = {
  event: TelemetryEvent['event'];
  eventSamplingRate?: number;
  clientCache?: TelemetryClientCache;
  payload: Payload;
};

export type TelemetryClientCacheOptions = {
  /**
   * The unique identifier for the cache entry.
   */
  eventKey: string;
  /**
   * The time-to-live (TTL) for the cache entry, in milliseconds. If not specified, a default value will be used.
   */
  cacheTtl?: number;
};
