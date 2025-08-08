import type { TelemetryCollector } from '@clerk/shared/telemetry';

import type { DebugLogEntry, DebugLogFilter, DebugLogLevel, DebugTransport } from '../types';

export interface TelemetryLoggerOptions {
  endpoint?: string;
  logLevel?: DebugLogLevel;
  filters?: DebugLogFilter[];
}

export class TelemetryTransport implements DebugTransport {
  private readonly collector?: TelemetryCollector;

  constructor(collector?: TelemetryCollector) {
    this.collector = collector;
  }

  async send(entry: DebugLogEntry): Promise<void> {
    if (!this.collector) {
      return;
    }

    this.collector.recordLog({
      context: entry.context,
      id: entry.id,
      level: entry.level,
      message: entry.message,
      organizationId: entry.organizationId,
      sessionId: entry.sessionId,
      source: entry.source,
      timestamp: entry.timestamp,
      userId: entry.userId,
    });
  }
}
