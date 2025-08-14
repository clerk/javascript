import type { InstanceType } from 'instance';

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

/**
 * Debug log entry interface for telemetry collector
 */
export interface TelemetryLogEntry {
  readonly context?: Record<string, unknown>;
  readonly level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  readonly message: string;
  readonly organizationId?: string;
  readonly sessionId?: string;
  readonly source?: string;
  readonly timestamp: number;
  readonly userId?: string;
}

export interface TelemetryCollector {
  isEnabled: boolean;
  isDebug: boolean;
  record(event: TelemetryEventRaw): void;
  recordLog(entry: TelemetryLogEntry): void;
}
