import type { InstanceType } from 'instance';

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
  payload: Payload;
};

export interface TelemetryCollector {
  isEnabled: boolean;
  isDebug: boolean;
  record(event: TelemetryEventRaw): void;
}
