import type { DebugData, DebugLogEntry, DebugLogFilter, DebugLogLevel, DebugTransport } from '../types';

export interface TelemetryLoggerOptions {
  endpoint?: string;
  logLevel?: DebugLogLevel;
  filters?: DebugLogFilter[];
}

export class TelemetryTransport implements DebugTransport {
  private batchBuffer: DebugLogEntry[] = [];
  private readonly batchSize: number;
  private readonly flushInterval: number;
  private flushTimer?: number;
  private readonly endpoint: string;

  constructor(endpoint = 'https://telemetry.clerk.com/v1/debug', batchSize = 50, flushInterval = 10000) {
    this.batchSize = batchSize;
    this.endpoint = endpoint;

    this.flushInterval = flushInterval;
    this.startFlushTimer();
  }

  async send(entry: DebugLogEntry): Promise<void> {
    this.batchBuffer.push(entry);

    if (this.batchBuffer.length >= this.batchSize) {
      await this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.batchBuffer.length === 0) {
      return;
    }

    const entries = [...this.batchBuffer];
    this.batchBuffer = [];

    try {
      const debugDataArray: DebugData[] = entries.map(entry => ({
        eventType: 'custom_event',
        eventId: entry.id,
        timestamp: entry.timestamp,
        metadata: {
          level: entry.level,
          message: entry.message,
          context: entry.context,
          source: entry.source,
        },
        userId: entry.userId,
        sessionId: entry.sessionId,
        organizationId: entry.organizationId,
      }));

      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(debugDataArray),
      });
    } catch (error) {
      console.error('Failed to send telemetry data:', error);
    }
  }

  async destroy(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
    await this.flush();
  }

  private startFlushTimer(): void {
    this.flushTimer = window.setTimeout(() => {
      this.flush().catch(err => {
        console.error('Failed to flush telemetry data:', err);
      });
      this.startFlushTimer();
    }, this.flushInterval);
  }
}
