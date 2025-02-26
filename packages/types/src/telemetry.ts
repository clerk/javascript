import type { InstanceType } from './instance';

type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

/**
 * @internal
 */
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
  payload: Record<string, JSONValue>;
};

/**
 * @internal
 */
export type TelemetryEventRaw<Payload = TelemetryEvent['payload']> = {
  event: TelemetryEvent['event'];
  eventSamplingRate?: number;
  payload: Payload;
};

export interface TelemetryCollector {
  isEnabled: boolean;
  isDebug: boolean;
  record(event: TelemetryEventRaw): void;
}
