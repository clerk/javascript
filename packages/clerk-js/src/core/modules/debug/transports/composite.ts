import type { DebugLogEntry, DebugLogFilter, DebugTransport } from '../types';

export interface CompositeLoggerOptions {
  transports: Array<{
    transport: DebugTransport;
    options?: Record<string, unknown>;
  }>;
  logLevel?: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  filters?: DebugLogFilter[];
}

export class CompositeTransport implements DebugTransport {
  private readonly transports: DebugTransport[];

  constructor(transports: DebugTransport[]) {
    this.transports = transports;
  }

  async send(entry: DebugLogEntry): Promise<void> {
    const promises = this.transports.map(transport =>
      transport.send(entry).catch(err => {
        console.error('Failed to send to transport:', err);
      }),
    );
    await Promise.allSettled(promises);
  }
}
