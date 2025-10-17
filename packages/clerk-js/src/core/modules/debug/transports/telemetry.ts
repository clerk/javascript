import type { TelemetryCollector } from '@clerk/shared/types';

import type { DebugLogEntry, DebugLogLevel, DebugTransport } from '../types';

/**
 * Options for configuring a telemetry-backed transport.
 *
 * @public
 */
export interface TelemetryLoggerOptions {
  endpoint?: string;
  logLevel?: DebugLogLevel;
}

/**
 * A transport that forwards debug logs to the shared telemetry collector
 * for aggregation and remote analysis.
 *
 * If no collector is provided, calls are no-ops.
 *
 * @public
 */
export class TelemetryTransport implements DebugTransport {
  private readonly collector?: TelemetryCollector;

  /**
   * Create a telemetry transport.
   *
   * @param collector - Optional telemetry collector instance
   */
  constructor(collector?: TelemetryCollector) {
    this.collector = collector;
  }

  /**
   * Record a log entry with the telemetry collector.
   * If the collector is absent, the call is ignored.
   *
   * @param entry - The debug log entry to record
   */
  async send(entry: DebugLogEntry): Promise<void> {
    if (!this.collector) {
      return;
    }

    await Promise.resolve(
      this.collector.recordLog({
        context: entry.context,
        level: entry.level,
        message: entry.message,
        organizationId: entry.organizationId,
        sessionId: entry.sessionId,
        source: entry.source,
        timestamp: entry.timestamp,
        userId: entry.userId,
      }),
    );
  }
}
