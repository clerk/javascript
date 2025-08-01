import type { DebugLogEntry, DebugTransport } from '../types';

export class ConsoleTransport implements DebugTransport {
  async send(entry: DebugLogEntry): Promise<void> {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = entry.level.toUpperCase();
    const source = entry.source ? `[${entry.source}]` : '';
    const context = entry.context ? ` ${JSON.stringify(entry.context)}` : '';

    const message = `[Clerk Debug] ${timestamp} ${level}${source}: ${entry.message}${context}`;

    switch (entry.level) {
      case 'error':
        console.error(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      case 'info':
        console.info(message);
        break;
      case 'debug':
        console.debug(message);
        break;
      case 'trace':
        console.trace(message);
        break;
      default:
        console.log(message);
    }
  }
}
